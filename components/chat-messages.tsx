import type { Message } from "ai/react"
import { Sparkles, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export function ChatMessages({ messages, isLoading }: { messages: Message[], isLoading?: boolean }) {
  return (
    <div className="space-y-6 px-4 py-6 max-w-2xl mx-auto">
      {messages.map((m, i) => (
        <div key={i} className="flex items-start space-x-4">
          <div
            className={cn(
              "flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full",
              m.role === "user" ? "bg-zinc-200" : "bg-purple-100",
            )}
          >
            {m.role === "user" ? (
              <User className="h-5 w-5 text-zinc-600" />
            ) : (
              <Sparkles className="h-5 w-5 text-purple-600" />
            )}
          </div>
          <div className="flex-1 pt-1">
            <div className="prose prose-zinc max-w-none prose-pre:bg-zinc-100 prose-pre:text-zinc-800">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({ className, children, ...props }) => {
                    const isInline = !className
                    if (isInline) {
                      return (
                        <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono text-zinc-800" {...props}>
                          {children}
                        </code>
                      )
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                  pre: ({ children, ...props }) => (
                    <pre className="bg-zinc-100 p-4 rounded-lg overflow-x-auto" {...props}>
                      {children}
                    </pre>
                  ),
                }}
              >
                {m.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-purple-100">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1 pt-1">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
              <span className="text-zinc-500">Thinking...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
