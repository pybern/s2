"use client"

import type { Message } from "ai/react"
import { Loader2 } from "lucide-react"
import { MemoizedMarkdown } from "./memoized-markdown"
import { useEffect, useRef } from "react"


export function ChatMessages({
  messages,
  isLoading,
}: {
  messages: Message[]
  isLoading?: boolean
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Auto-scroll when messages change or when loading state changes
  useEffect(() => {
    // Only auto-scroll if user is near the bottom or if it's the first message
    if (messages.length === 1 || isNearBottom()) {
      scrollToBottom()
    }
  }, [messages, isLoading])

  // Check if user has scrolled up and only auto-scroll if they're near the bottom
  const isNearBottom = () => {
    if (!containerRef.current) return true
    const container = containerRef.current.parentElement // The scrollable container
    if (!container) return true
    
    const { scrollTop, scrollHeight, clientHeight } = container
    return scrollHeight - scrollTop - clientHeight < 100 // 100px threshold
  }

  return (
    <div ref={containerRef} className="space-y-6 px-4 py-6 max-w-2xl mx-auto">

      {messages.map((message) => (
        <div key={message.id} className="flex items-start space-x-4">
          {/* Avatar */}
          <div className={`flex-shrink-0 h-8 w-8 rounded-full ${message.role === "user" ? "bg-gray-800" : "bg-gray-200"
            }`}>
          </div>

          {/* Message Content */}
          <div className="flex-1 pt-1 space-y-3">
            {/* Tool Invocations */}
            {message.parts?.map((part, index) => {
              switch (part.type) {
                case 'tool-invocation': {
                  return (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-full">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-gray-700 break-words">
                            Thinking... Using {part.toolInvocation.toolName}
                          </span>
                        </div>
                      </div>
                      <details className="group">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 select-none">
                          View details
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-3 rounded border overflow-x-auto whitespace-pre-wrap break-words max-w-full">
                          {JSON.stringify(part.toolInvocation, null, 2)}
                        </pre>
                      </details>
                    </div>
                  );
                }
                default:
                  return null;
              }
            })}
            
            {/* Regular Content */}
            {message.content && (
              <MemoizedMarkdown content={message.content} id={message.id} />
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-400">
          </div>
          <div className="flex-1 pt-1">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              <span className="text-gray-500">Thinking...</span>
            </div>
          </div>
        </div>
      )}
      {/* Invisible element at the bottom to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  )
}
