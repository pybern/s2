"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { ChatMessages } from "@/components/chat-messages"
import { PromptForm } from "@/components/prompt-form"
import { EmptyScreen } from "@/components/empty-screen"
import { Header } from "@/components/header"

export function ChatPanel() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat({
    api: '/api/chat',
    body: {
      selectedCollectionId
    },
    onResponse: () => {
      setIsLoading(false)
    },
    onFinish: () => {
      setIsLoading(false)
    },
    onError: () => {
      setIsLoading(false)
    }
  })

  const handleCollectionChange = (collectionId: string) => {
    setSelectedCollectionId(collectionId)
  }

  const handleFormSubmit = (e?: { preventDefault?: () => void }) => {
    if (input.trim()) {
      setIsLoading(true)
    }
    handleSubmit(e)
  }

  return (
    <div className="flex flex-col h-[calc(100vh)]">
      <Header 
        selectedCollectionId={selectedCollectionId}
        onCollectionChange={handleCollectionChange}
      />
      <div className="flex-1 overflow-y-auto">
        {messages.length > 0 ? <ChatMessages messages={messages} isLoading={isLoading} /> : <EmptyScreen setInput={setInput} />}
      </div>
      <div className="w-full max-w-2xl mx-auto px-4 pb-4">
        <PromptForm input={input} handleInputChange={handleInputChange} handleSubmit={handleFormSubmit} />
      </div>
    </div>
  )
}
