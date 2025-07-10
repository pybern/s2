import { streamText, generateText,   smoothStream } from "ai"
import { myProvider } from '@/lib/ai/providers';
import tableAgent from '@/lib/ai/agents/table-agent';
import queryAgent from '@/lib/ai/agents/query-agent';

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const [tableAgentResult, queryAgentResult] = await Promise.all([
    tableAgent(
      messages[messages.length - 1].content,
      messages,
      messages[messages.length - 1].selectedCollectionId || 'all'),
    queryAgent(
      messages[messages.length - 1].content,
      messages,
      messages[messages.length - 1].selectedCollectionId || 'all')
  ])

  const result = streamText({
    model: myProvider.languageModel('azure-sm-model'),
    system: `You are a helpful assistant. Create an SQL query based on the provided table description provided by the table agent and query agent.
  
TABLE AGENT RESPONSE:
${tableAgentResult}

QUERY AGENT RESPONSE:
${queryAgentResult}
    
    `,
    messages,
                experimental_transform: smoothStream({ chunking: 'word' }),
  })

  return result.toDataStreamResponse()
}
