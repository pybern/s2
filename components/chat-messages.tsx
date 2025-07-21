import type { Message } from "ai/react"
import { Sparkles, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { memo, useEffect, useRef } from "react"

// Memoize individual message component to prevent unnecessary re-renders
const MessageItem = memo(({ message, index }: { message: Message; index: number }) => (
  <div className="flex items-start space-x-4">
    <div
      className={cn(
        "flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full",
        message.role === "user" ? "bg-zinc-200" : "bg-purple-100",
      )}
    >
      {message.role === "user" ? (
        <User className="h-5 w-5 text-zinc-600" />
      ) : (
        <Sparkles className="h-5 w-5 text-purple-600" />
      )}
    </div>
    <div className="flex-1 pt-1">
      
      <div className="prose prose-zinc max-w-none prose-p:mb-4 prose-headings:mb-4 prose-headings:mt-6 prose-ul:mb-4 prose-ol:mb-4 prose-blockquote:mb-4 prose-pre:mb-4 prose-pre:bg-zinc-100 prose-pre:text-zinc-800">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children, ...props }) => (
              <p className="mb-4 last:mb-0" {...props}>
                {children}
              </p>
            ),
            h1: ({ children, ...props }) => (
              <h1 className="text-2xl font-bold mt-6 mb-4 first:mt-0" {...props}>
                {children}
              </h1>
            ),
            h2: ({ children, ...props }) => (
              <h2 className="text-xl font-bold mt-6 mb-4 first:mt-0" {...props}>
                {children}
              </h2>
            ),
            h3: ({ children, ...props }) => (
              <h3 className="text-lg font-bold mt-5 mb-3 first:mt-0" {...props}>
                {children}
              </h3>
            ),
            ul: ({ children, ...props }) => (
              <ul className="mb-4 space-y-1 list-disc pl-6" {...props}>
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol className="mb-4 space-y-1 list-decimal pl-6" {...props}>
                {children}
              </ol>
            ),
            li: ({ children, ...props }) => (
              <li className="leading-relaxed" {...props}>
                {children}
              </li>
            ),
            blockquote: ({ children, ...props }) => (
              <blockquote className="border-l-4 border-zinc-300 pl-4 py-2 mb-4 italic text-zinc-600" {...props}>
                {children}
              </blockquote>
            ),
            code: ({ className, children, ...props }) => {
              const isInline = !className
              const match = /language-(\w+)/.exec(className || '')
              const language = match ? match[1] : ''
              
              if (isInline) {
                return (
                  <code className="bg-zinc-100 px-1 py-0.5 rounded text-sm font-mono text-zinc-800" {...props}>
                    {children}
                  </code>
                )
              }
              
              return (
                <SyntaxHighlighter
                  style={oneDark}
                  language={language}
                  PreTag="div"
                  className="mb-4 rounded-lg overflow-hidden"
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    fontSize: '14px',
                  }}
                  codeTagProps={{
                    style: {
                      fontSize: 'inherit',
                    }
                  }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              )
            },
            pre: ({ children, ...props }) => {
              // Skip pre wrapper when using SyntaxHighlighter
              return <>{children}</>
            },
            table: ({ children, ...props }) => (
              <div className="mb-4 overflow-x-auto">
                <table className="min-w-full border-collapse border border-zinc-300" {...props}>
                  {children}
                </table>
              </div>
            ),
            th: ({ children, ...props }) => (
              <th className="border border-zinc-300 bg-zinc-50 px-3 py-2 text-left font-semibold" {...props}>
                {children}
              </th>
            ),
            td: ({ children, ...props }) => (
              <td className="border border-zinc-300 px-3 py-2" {...props}>
                {children}
              </td>
            ),
            hr: ({ ...props }) => (
              <hr className="my-6 border-t border-zinc-300" {...props} />
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  </div>
))

MessageItem.displayName = 'MessageItem'

export function ChatMessages({ messages, isLoading }: { messages: Message[], isLoading?: boolean }) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change or when loading
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 50)
    
    return () => clearTimeout(timeoutId)
  }, [messages, isLoading])

  return (
    <div ref={containerRef} className="space-y-6 px-4 py-6 max-w-2xl mx-auto">
      {messages.map((m, i) => (
        <MessageItem key={`${m.id || i}-${m.role}`} message={m} index={i} />
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
      {/* Invisible element at the bottom to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  )
}
