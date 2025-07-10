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

  console.log('Collection ID:', selectedCollectionId)
  console.log('Table agent result:', tableAgentResult)
  console.log('Query agent result:', queryAgentResult)

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
