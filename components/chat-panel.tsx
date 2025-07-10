"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { ChatMessages } from "@/components/chat-messages"
import { PromptForm } from "@/components/prompt-form"
import { EmptyScreen } from "@/components/empty-screen"
import { Header } from "@/components/header"

export function ChatPanel() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all')
  
  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat({
    api: '/api/chat',
    body: {
      selectedCollectionId
    }
  })

  const handleCollectionChange = (collectionId: string) => {
    setSelectedCollectionId(collectionId)
  }

  return (
    <div className="flex flex-col h-[calc(100vh)]">
      <Header 
        selectedCollectionId={selectedCollectionId}
        onCollectionChange={handleCollectionChange}
      />
      <div className="flex-1 overflow-y-auto">
        {messages.length > 0 ? <ChatMessages messages={messages} /> : <EmptyScreen setInput={setInput} />}
      </div>
      <div className="w-full max-w-2xl mx-auto px-4 pb-4">
        <PromptForm input={input} handleInputChange={handleInputChange} handleSubmit={handleSubmit} />
      </div>
    </div>
  )
}
