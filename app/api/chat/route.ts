import { streamText, tool, smoothStream } from "ai"
import { z } from "zod"
import { myProvider } from '@/lib/ai/providers';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { supabase } from '@/lib/db/supabase';

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, selectedCollectionId = 'all' } = await req.json()

  console.log('🧠 Starting SQL Assistant with Tools')
  console.log('📝 User Query:', messages[messages.length - 1].content)
  console.log('🗂️ Selected Collection:', selectedCollectionId)

  const result = streamText({
    model: myProvider.languageModel('azure-lm-model'),
    system: `You are an expert SQL assistant. Help users create SQL queries by analyzing their database and finding relevant patterns.

Your process:
1. **First**, use find_relevant_tables to search for relevant database tables and understand the schema
2. **Then**, use find_relevant_queries to find similar historical query patterns
3. **Finally**, generate a comprehensive SQL query based on the insights from both tools

Important rules:
- Always use both tools before generating SQL
- Do not include database names in queries
- ALWAYS replace 'custid' with 'customer_id' in your final queries
- Explain your reasoning and show how you used the tool results
- Format SQL code properly with syntax highlighting
- Show your thinking process step by step`,
    messages,
    tools: {
      find_relevant_tables: tool({
        description: "Search for relevant database tables and their column structures using semantic similarity",
        parameters: z.object({
          query: z.string().describe("The search query to find relevant tables (describe what data you're looking for)"),
          limit: z.number().optional().default(5).describe("Maximum number of tables to return"),
          table_name: z.string().optional().describe("Optional specific table name to filter results"),
        }),
        execute: async ({ query, limit = 5, table_name }) => {
          try {
            console.log(`�️ Searching tables for: "${query}"`)
            console.log(`🔍 Limit: ${limit}, Table Name: ${table_name || 'Any'}`)
            
            const queryEmbedding = await generateEmbedding(query)
            const { data: results, error } = await supabase.rpc("match_table_embeddings", {
              query_embedding: queryEmbedding,
              match_threshold: 0.3,
              match_count: limit,
              filter_db_id: selectedCollectionId === 'all' ? null : selectedCollectionId,
              filter_table_name: table_name || null,
            })

            if (error) {
              console.error("Table search error:", error)
              return {
                error: "Failed to search for table embeddings",
                tables: [],
              }
            }

            // Group results by table for better organization
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

            const tables = Object.values(tableGroups)
            console.log(`✅ Found ${tables.length} relevant tables`)

            return {
              tables,
              searchQuery: query,
              resultsCount: results?.length || 0,
              selectedCollection: selectedCollectionId,
            }
          } catch (error) {
            console.error("Table search error:", error)
            return {
              error: "Failed to search for table embeddings",
              tables: [],
            }
          }
        },
      }),
      
      find_relevant_queries: tool({
        description: "Search for similar SQL queries from historical query logs using semantic similarity",
        parameters: z.object({
          query: z.string().describe("The search query to find relevant SQL queries (describe what you want to do)"),
          limit: z.number().optional().default(5).describe("Maximum number of queries to return"),
          query_type: z.string().optional().describe("Optional filter by query type (SELECT, INSERT, UPDATE, DELETE)"),
          category: z.string().optional().describe("Optional filter by semantic category"),
        }),
        execute: async ({ query, limit = 5, query_type, category }) => {
          try {
            console.log(`📝 Searching queries for: "${query}"`)
            
            const queryEmbedding = await generateEmbedding(query)
            const { data: results, error } = await supabase.rpc("match_query_embeddings", {
              query_embedding: queryEmbedding,
              match_threshold: 0.3,
              match_count: limit,
              filter_db_id: selectedCollectionId === 'all' ? null : selectedCollectionId,
              filter_query_type: query_type || null,
              filter_category: category || null,
            })

            if (error) {
              console.error("Query search error:", error)
              return {
                error: "Failed to search for query embeddings",
                queries: [],
              }
            }

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

            console.log(`✅ Found ${formattedQueries.length} similar queries`)

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
            console.error("Query search error:", error)
            return {
              error: "Failed to search for query embeddings",
              queries: [],
            }
          }
        },
      }),
    },
    experimental_transform: smoothStream({ chunking: 'word' }),
    maxSteps: 5, // Allow up to 5 steps for tool usage
  })

  return result.toTextStreamResponse()
}
