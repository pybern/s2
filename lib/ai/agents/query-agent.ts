import { azure } from "@ai-sdk/azure"
import { generateText, tool } from "ai"
import { z } from "zod"
import { generateEmbedding } from "../embeddings"
import { supabase } from "@/lib/db/supabase"

export default async function suggestQueryLogs(userMessage: string, messages: any[], selectedCollectionId = 'all') {

  const allToolCalls: any[] = [];
  const allToolResults: any[] = [];

  const {
    text: result,
    toolCalls,
    toolResults,
  } = await generateText({
    model: azure("gpt-4o"),
    system: `You are a SQL query expert. Your job is to help users find relevant SQL queries from historical query logs.

When the user asks about SQL queries, database operations, or data analysis, you MUST:
1. ALWAYS use the find_relevant_queries tool first to search for similar queries
2. After getting the results, provide a clear, helpful response that explains:
   - Which historical queries are most relevant to their question
   - What patterns or approaches were used in similar queries
   - Show actual SQL code examples from the query logs when available
   - How these queries could be adapted for their specific needs
   - Explain the complexity and semantic category of the queries
   - Compare different SQL approaches found in the logs
   - Suggest modifications or improvements based on the historical patterns

You MUST call the find_relevant_queries tool before providing any response. Do not provide a response without using the tool first.

The query logs contain both descriptive text (query_text) and actual SQL code (sql_query). Use both to provide comprehensive examples and explanations.

User's context:
- Question: "${userMessage}"`,
    messages: messages,
    tools: {
      find_relevant_queries: tool({
        description: "Search for relevant SQL queries from query logs using embedding similarity",
        parameters: z.object({
          query: z.string().describe("The search query to find relevant SQL queries"),
          limit: z.number().optional().default(5).describe("Maximum number of queries to return"),
          query_type: z.string().optional().describe("Optional filter by query type (e.g., SELECT, INSERT, UPDATE, DELETE)"),
          category: z.string().optional().describe("Optional filter by semantic category"),
        }),
        execute: async ({ query, limit = 5, query_type, category }) => {
          try {
            // Generate embedding for the search query
            const queryEmbedding = await generateEmbedding(query)

            // Search for similar queries in Supabase using vector similarity with optional filters
            const { data: results, error } = await supabase.rpc("match_query_embeddings", {
              query_embedding: queryEmbedding,
              match_threshold: 0.3,
              match_count: limit,
              filter_db_id: selectedCollectionId === 'all' ? null : selectedCollectionId,
              filter_query_type: query_type || null,
              filter_category: category || null,
            })

            if (error) {
              console.error("Supabase query search error:", error)
              return {
                error: "Failed to search for query embeddings",
                results: [],
              }
            }

            // Format the results for better readability
            const formattedQueries = (results || []).map((row: any) => ({
              id: row.id,
              query_text: row.query_text,
              query_type: row.query_type,
              sql_query: row.sql_query,
              db_id: row.db_id,
              table_names: row.table_names,
              complexity_score: row.complexity_score,
              semantic_category: row.semantic_category,
              similarity: row.similarity,
              metadata: row.metadata,
            }))

            return {
              queries: formattedQueries,
              searchQuery: query,
              resultsCount: results?.length || 0,
              selectedCollection: selectedCollectionId,
              filters: {
                query_type: query_type || "all",
                category: category || "all",
              },
            }
          } catch (error) {
            console.error("Query log search error:", error)
            return {
              error: "Failed to search for query embeddings",
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
