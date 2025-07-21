"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { ChatMessages } from "@/components/chat-messages"
import { PromptForm } from "@/components/prompt-form"
import { EmptyScreen } from "@/components/empty-screen"
import { Header } from "@/components/header"
import { SqlResultsDrawer } from "@/components/sql-results-drawer"
import { extractSqlWithRemark } from "@/lib/utils/extract-sql-blocks"

export function ChatPanel() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('small_bank_1')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [sqlQueries, setSqlQueries] = useState<string[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  
  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat({
    api: '/api/chat',
    body: {
      selectedCollectionId
    },
    onResponse: () => {
      setIsLoading(false)
    },
    onError: () => {
      setIsLoading(false)
    },
    onFinish: (message) => {
      setIsLoading(false)
      const sqlBlocks = extractSqlWithRemark(message.content)
      if (sqlBlocks.length > 0) {
        console.log("Extracted SQL blocks:", sqlBlocks)
        setSqlQueries(sqlBlocks)
        setIsDrawerOpen(true)
      } else {
        console.log("No SQL blocks found in the response.")
      }
    }
  })

  console.log("Chat messages:", messages)

  const handleCollectionChange = (collectionId: string) => {
    setSelectedCollectionId(collectionId)
  }

  const handleFormSubmit = (e?: { preventDefault?: () => void }) => {
    if (input.trim()) {
      setIsLoading(true)
      // Reset SQL queries when a new query is submitted
      setSqlQueries([])
      setIsDrawerOpen(false)
    }
    handleSubmit(e)
  }

  return (
    <div className="flex flex-col h-[calc(100vh)] w-[1024px] mx-auto">
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
      
      {sqlQueries.length > 0 && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 text-sm font-medium z-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c0-2.21-1.79-4-4-4H4V7z" />
          </svg>
          SQL Results ({sqlQueries.length})
        </button>
      )}
      
      <SqlResultsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sqlQueries={sqlQueries}
      />
    </div>
  )
}
