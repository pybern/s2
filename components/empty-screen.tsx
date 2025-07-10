"use client"

import type { UseChatHelpers } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MessageCircle, Plus, Triangle } from "lucide-react"

const exampleMessages = [
  {
    heading: "List the top 10",
    message: "savings accounts.",
  },
  {
    heading: "Which account",
    message: "has above average checking balance?",
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
              This is a Chatbot that turns texts to insight using LLMs and Generative UI. 
              It uses the <code className="font-mono bg-zinc-200 rounded px-1">ai-sdk</code> as the ochestrator
              for agentic workflows and <code className="font-mono bg-zinc-200 rounded px-1">NextJS</code> as the server.
              Now loaded<code className="font-mono bg-zinc-200 rounded px-1">azure-ai</code> for LLMs.
            </p>
            <p className="mt-2">
              You can learn more about the Squeel by visiting the{" "}
              <a href="https://github.com/pybern/squeel" className="text-purple-600 underline">
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
