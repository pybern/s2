import { Loader2, Search, Database, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ToolInvocation } from "ai"

type ThinkingStepProps = {
  toolName: string
  state: string
  args?: any
  result?: any
}

const getToolIcon = (toolName: string) => {
  switch (toolName) {
    case 'find_relevant_tables':
      return <Database className="h-4 w-4" />
    case 'find_relevant_queries':
      return <Search className="h-4 w-4" />
    default:
      return <Sparkles className="h-4 w-4" />
  }
}

const getToolDisplayName = (toolName: string) => {
  switch (toolName) {
    case 'find_relevant_tables':
      return 'Analyzing Database Schema'
    case 'find_relevant_queries':
      return 'Finding Similar Queries'
    default:
      return 'Processing'
  }
}

const getToolDescription = (toolName: string, args?: any) => {
  switch (toolName) {
    case 'find_relevant_tables':
      return `Searching for tables related to: "${args?.query}"`
    case 'find_relevant_queries':
      return `Looking for query patterns matching: "${args?.query}"`
    default:
      return 'Processing your request...'
  }
}

const getResultSummary = (toolName: string, result?: any) => {
  switch (toolName) {
    case 'find_relevant_tables':
      const tableCount = result?.tables?.length || 0
      return `Found ${tableCount} relevant table${tableCount !== 1 ? 's' : ''}`
    case 'find_relevant_queries':
      const queryCount = result?.queries?.length || 0
      return `Found ${queryCount} similar quer${queryCount !== 1 ? 'ies' : 'y'}`
    default:
      return 'Completed'
  }
}

export function ThinkingStep({ toolName, state, args, result }: ThinkingStepProps) {
  const isComplete = state === 'result'
  const isInProgress = state === 'call' || state === 'partial-call'
  
  return (
    <div className={cn(
      "flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300",
      isComplete ? "bg-green-50 border-green-200" : 
      isInProgress ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
    )}>
      <div className={cn(
        "flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full",
        isComplete ? "bg-green-100 text-green-600" : 
        isInProgress ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
      )}>
        {isComplete ? getToolIcon(toolName) : 
         isInProgress ? <Loader2 className="h-4 w-4 animate-spin" /> : 
         getToolIcon(toolName)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className={cn(
            "text-sm font-medium",
            isComplete ? "text-green-800" : 
            isInProgress ? "text-blue-800" : "text-gray-800"
          )}>
            {getToolDisplayName(toolName)}
          </h4>
          {isComplete && (
            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              ✓ Complete
            </span>
          )}
          {isInProgress && (
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
              ⏳ Processing
            </span>
          )}
        </div>
        
        <p className={cn(
          "text-xs mt-1",
          isComplete ? "text-green-700" : 
          isInProgress ? "text-blue-700" : "text-gray-700"
        )}>
          {isComplete ? getResultSummary(toolName, result) : getToolDescription(toolName, args)}
        </p>
        
        {isComplete && result && (
          <details className="mt-2">
            <summary className="text-xs text-green-600 cursor-pointer hover:text-green-800">
              View details
            </summary>
            <div className="mt-2 p-2 bg-white rounded border text-xs">
              <pre className="whitespace-pre-wrap text-green-800 overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

type ThinkingProcessProps = {
  toolInvocations: ToolInvocation[]
}

export function ThinkingProcess({ toolInvocations }: ThinkingProcessProps) {
  if (!toolInvocations || toolInvocations.length === 0) {
    return null
  }

  return (
    <div className="my-4 space-y-2">
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <h3 className="text-sm font-medium text-purple-800">Thinking Process</h3>
      </div>
      
      <div className="space-y-2">
        {toolInvocations.map((invocation, index) => {
          // Extract properties safely from the invocation object
          let toolCallId: string
          let toolName: string  
          let args: any
          let result: any
          
          if ('toolCallId' in invocation) {
            toolCallId = invocation.toolCallId
            toolName = invocation.toolName
            args = 'args' in invocation ? invocation.args : undefined
            result = 'result' in invocation ? invocation.result : undefined
          } else {
            // Fallback for other invocation types
            toolCallId = `invocation-${index}`
            toolName = (invocation as any).toolName || 'unknown'
            args = (invocation as any).args
            result = (invocation as any).result
          }
          
          return (
            <ThinkingStep
              key={toolCallId}
              toolName={toolName}
              state={invocation.state}
              args={args}
              result={result}
            />
          )
        })}
      </div>
    </div>
  )
}
