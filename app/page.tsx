import { ChatPanel } from "@/components/chat-panel"

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col">
        <ChatPanel />
      </main>
    </div>
  )
}
