
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface Message {
  role: 'user' | 'assistant'
  content: string[]
}

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)

  useEffect(() => {
    // Initialize thread
    const initThread = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('openai-chat', {
          body: { messages: [] },
        })
        if (error) throw error
        setThreadId(data.threadId)
      } catch (error: any) {
        toast.error("Error initializing chat: " + error.message)
      }
    }
    initThread()
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || !threadId) return

    setIsLoading(true)
    const newMessage = { role: 'user' as const, content: [input] }
    setMessages(prev => [...prev, newMessage])
    setInput("")

    try {
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          threadId,
          messages: [...messages, newMessage],
        },
      })

      if (error) throw error

      const assistantMessages = data.messages
        .filter((msg: any) => msg.role === 'assistant')
        .map((msg: any) => ({
          role: 'assistant' as const,
          content: msg.content.map((c: any) => c.text.value),
        }))

      setMessages(prev => {
        const userMessages = prev.filter(m => m.role === 'user')
        return [...userMessages, ...assistantMessages]
      })
    } catch (error: any) {
      toast.error("Error sending message: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-2rem)] w-96">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-muted mr-4'
                }`}
              >
                {message.content.map((text, j) => (
                  <p key={j} className="text-sm">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            className="min-h-[2.5rem] max-h-32"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
