import { streamText, generateText,   smoothStream } from "ai"
import { myProvider } from '@/lib/ai/providers';
import tableAgent from '@/lib/ai/agents/table-agent';
import queryAgent from '@/lib/ai/agents/query-agent';

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, selectedCollectionId = 'all' } = await req.json()

  const [tableAgentResult, queryAgentResult] = await Promise.all([
    tableAgent(
      messages[messages.length - 1].content,
      messages,
      selectedCollectionId),
    queryAgent(
      messages[messages.length - 1].content,
      messages,
      selectedCollectionId)
  ])

  const result = streamText({
    model: myProvider.languageModel('azure-sm-model'),
    system: `You are a helpful assistant. Create an SQL query based on the provided table description provided by the table agent and query agent.

Instructions:
1. Use the table agent's response to understand the structure and relationships of the tables.
2. Use the query agent's response to understand the specific query requirements.
3. Generate a valid SQL query that meets the requirements specified in the query agent's response.
4. Do not include the database name in the query.
5. ALWAYS replace custid with customer_id in the query, as the table agent will return custid but the query agent will expect customer_id.

TABLE AGENT RESPONSE:
${tableAgentResult}

QUERY AGENT RESPONSE:
${queryAgentResult}

    
    `,
    messages,
                experimental_transform: smoothStream({ chunking: 'word' }),
  })

  return result.toTextStreamResponse()
}
