"use client"

import type { UseChatHelpers } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MessageCircle, Plus, Triangle } from "lucide-react"

const exampleMessages = [
  {
    heading: "Help me book a flight",
    message: "from San Francisco to London",
  },
  {
    heading: "What is the status",
    message: "of flight BA142 flying tmrw?",
  },
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, "setInput">) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-zinc-50 border-zinc-200 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-center space-x-4 p-4">
            <Triangle className="h-6 w-6" />
            <Plus className="h-6 w-6" />
            <MessageCircle className="h-6 w-6" />
          </CardHeader>
          <CardContent className="text-center text-zinc-600 text-sm p-4 pt-0">
            <p>
              This is an open source Chatbot template powered by the Google Gemini model built with Next.js and the AI
              SDK by Vercel. It uses the <code className="font-mono bg-zinc-200 rounded px-1">streamText</code> function
              in the server and the <code className="font-mono bg-zinc-200 rounded px-1">useChat</code> hook on the
              client to create a seamless chat experience.
            </p>
            <p className="mt-2">
              You can learn more about the AI SDK by visiting the{" "}
              <a href="https://sdk.vercel.ai/docs" className="text-purple-600 underline">
                Docs
              </a>
              .
            </p>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-4 mt-8">
          {exampleMessages.map((example, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-left whitespace-normal hover:bg-zinc-50 bg-transparent"
              onClick={() => setInput(`${example.heading} ${example.message}`)}
            >
              <p className="font-semibold text-zinc-800">{example.heading}</p>
              <p className="text-zinc-500">{example.message}</p>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
