"use client"
import type { UseChatHelpers } from "ai/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUp } from "lucide-react"

export function PromptForm({
  input,
  handleInputChange,
  handleSubmit,
}: Pick<UseChatHelpers, "input" | "handleInputChange" | "handleSubmit">) {

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center p-2 border rounded-2xl bg-white shadow-sm"
      style={{ borderColor: "#c084fc" }}
    >
      <Textarea
        value={input}
        onChange={handleInputChange}
        placeholder="Send a message..."
        className="flex-1 resize-none border-0 focus-visible:ring-0 shadow-none py-2 pl-3 pr-2"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            ;(e.target as HTMLTextAreaElement).form?.requestSubmit()
          }
        }}
      />
      <Button
        type="submit"
        size="icon"
        className="flex-shrink-0 rounded-full bg-purple-500 hover:bg-purple-600"
        disabled={!input.trim()}
      >
        <ArrowUp className="h-5 w-5" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  )
}
