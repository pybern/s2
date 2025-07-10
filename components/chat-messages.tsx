import type { Message } from "ai/react"
import { Sparkles, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function ChatMessages({ messages }: { messages: Message[] }) {
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
            <p className="text-zinc-800 whitespace-pre-wrap">{m.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
