import { azure } from "@ai-sdk/azure"
import { generateText, tool } from "ai" // Import the tool helper
import { z } from "zod"
import { generateEmbedding } from "../embeddings"
import { supabase } from "@/lib/db/supabase"


export default async function tableAgent(userMessage: string, messages: any[], selectedCollectionId = 'all') {

  const allToolCalls: any[] = [];
  const allToolResults: any[] = [];

  const {
    text: result,
    toolCalls,
    toolResults,
  } = await generateText({
    model: azure("gpt-4o"),
    system: `You are a database schema expert. Your job is to help the ochestration agent find relevant database tables and columns.

When the user asks about database tables, you MUST:
1. Use the find_relevant_tables tool first to search for relevant tables
2. After getting the results, provide a clear, helpful response that explains:
   - Which tables are most relevant to their question
   - What columns are available in those tables
   - How the tables could be used to answer their question
   - Suggest potential SQL queries if appropriate

You MUST use the find_relevant_tables tool to search for tables before providing any response.

User's context:
- Question: "${userMessage}"`,
    messages: messages,
    tools: {
      find_relevant_tables: tool({
        description: "Search for relevant database tables using embedding similarity",
        parameters: z.object({
          query: z.string().describe("The search query to find relevant tables"),
          limit: z.number().optional().default(5).describe("Maximum number of tables to return"),
          table_name: z.string().optional().describe("Optional specific table name to filter results"),
        }),
        execute: async ({ query, limit = 5, table_name }) => {
          try {
            // Generate embedding for the search query
            const queryEmbedding = await generateEmbedding(query)

            // Search for similar tables in Supabase using vector similarity with optional collection filtering
            const { data: results, error } = await supabase.rpc("match_table_embeddings", {
              query_embedding: queryEmbedding,
              match_threshold: 0.3,
              match_count: limit,
              filter_db_id: selectedCollectionId === 'all' ? null : selectedCollectionId,
              filter_table_name: table_name || null,
            })

            if (error) {
              console.error("Supabase search error:", error)
              return {
                error: "Failed to search for table embeddings",
                results: [],
              }
            }

            // Group results by table_name for better organization
            const tableGroups = (results || []).reduce((acc: any, row: any) => {
              const tableName = row.table_name
              if (!acc[tableName]) {
                acc[tableName] = {
                  table_name: tableName,
                  db_id: row.db_id,
                  columns: [],
                  similarity: row.similarity,
                }
              }
              acc[tableName].columns.push({
                column_name: row.column_name,
                column_type: row.column_type,
                text_content: row.text_content,
                similarity: row.similarity,
              })
              return acc
            }, {})


            return {
              tables: Object.values(tableGroups),
              searchQuery: query,
              resultsCount: results?.length || 0,
              selectedCollection: selectedCollectionId,
            }
          } catch (error) {
            
            return {
              error: "Failed to search for table embeddings",
              results: [],
            }
          }
        },
      }),
    },
    maxSteps: 2, // Allow for tool call and response
    onStepFinish: ({ text, toolCalls, toolResults, finishReason, usage }) => {

      // Accumulate tool calls and results
      if (toolCalls) allToolCalls.push(...toolCalls);
      if (toolResults) allToolResults.push(...toolResults);
    }
  })

  return result
}
