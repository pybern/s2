"use client"

import { useChat } from "@ai-sdk/react"
import { ChatMessages } from "@/components/chat-messages"
import { PromptForm } from "@/components/prompt-form"
import { EmptyScreen } from "@/components/empty-screen"
import { Header } from "@/components/header"

export function ChatPanel() {
  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat()

  return (
    <div className="flex flex-col h-[calc(100vh)]">
      <Header />
      <div className="flex-1 overflow-y-auto">
        {messages.length > 0 ? <ChatMessages messages={messages} /> : <EmptyScreen setInput={setInput} />}
      </div>
      <div className="w-full max-w-2xl mx-auto px-4 pb-4">
        <PromptForm input={input} handleInputChange={handleInputChange} handleSubmit={handleSubmit} />
      </div>
    </div>
  )
}
