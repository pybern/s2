import { Menu, Sparkles, Triangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <span className="font-semibold">/</span>
          <span className="font-semibold">Next.js Gemini Chatbot</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="default" className="bg-black text-white">
          <Triangle className="h-4 w-4 mr-2 fill-white" />
          Deploy with Vercel
        </Button>
        <Button variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
          Login
        </Button>
      </div>
    </header>
  )
}
