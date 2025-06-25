"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Loader2, User, Bot, Info, Sparkles } from "lucide-react"
import type { UIMessage, Chat } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import AgentMessageRenderer from "./agent-message-renderer"

interface ChatMessageAreaProps {
  selectedChat: Chat | null
  messages: UIMessage[]
  onSendMessage: (chatId: number, messageContent: string) => Promise<void>
  isLoadingMessages: boolean
  isSendingMessage: boolean
}

export default function ChatMessageArea({
  selectedChat,
  messages,
  onSendMessage,
  isLoadingMessages,
  isSendingMessage,
}: ChatMessageAreaProps) {
  const [input, setInput] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector("div[data-radix-scroll-area-viewport]")
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoadingMessages])

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()
    if (!input.trim() || !selectedChat) return

    const messageContent = input
    setInput("")
    await onSendMessage(selectedChat.id, messageContent)
  }

  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center bg-gradient-to-br from-muted/30 to-background h-full">
        <div className="p-4 md:p-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mb-4 md:mb-6">
          <Sparkles className="h-8 w-8 md:h-12 md:w-12 text-primary" />
        </div>
        <div className="space-y-2 md:space-y-3 max-w-md">
          <h2 className="text-lg md:text-xl font-semibold">Welcome to ClosetMind</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Select an existing conversation or create a new one to start chatting with your AI stylist.
          </p>
        </div>
        <div className="mt-6 md:mt-8 grid grid-cols-1 gap-3 md:gap-4 max-w-lg w-full">
          <div className="p-3 md:p-4 rounded-lg border border-border/50 bg-card">
            <div className="text-xl md:text-2xl mb-2">🛍️</div>
            <h3 className="font-medium text-sm md:text-base">Product Search</h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Find clothes in online stores
            </p>
          </div>
          <div className="p-3 md:p-4 rounded-lg border border-border/50 bg-card">
            <div className="text-xl md:text-2xl mb-2">👗</div>
            <h3 className="font-medium text-sm md:text-base">Stylish Outfits</h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Outfit suggestions from your wardrobe
            </p>
          </div>
          <div className="p-3 md:p-4 rounded-lg border border-border/50 bg-card">
            <div className="text-xl md:text-2xl mb-2">💬</div>
            <h3 className="font-medium text-sm md:text-base">Fashion Advice</h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              General questions about style
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-full">
      <header className="flex-shrink-0 p-3 md:p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
            <div className="p-1.5 md:p-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base md:text-lg font-semibold truncate" title={selectedChat.title}>
                {selectedChat.title}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                ClosetMind AI Assistant
              </p>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 p-3 md:p-4" ref={scrollAreaRef}>
        {isLoadingMessages && (
          <div className="flex flex-col justify-center items-center h-full space-y-4">
            <div className="p-3 md:p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
              <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm md:text-base">Loading messages...</p>
              <p className="text-xs text-muted-foreground/60 mt-1">This will only take a second</p>
            </div>
          </div>
        )}

        {!isLoadingMessages && messages.length === 0 && (
          <div className="flex flex-col justify-center items-center h-full text-center space-y-4 md:space-y-6">
            <div className="p-4 md:p-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
              <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base md:text-lg font-semibold">Hi! I'm your AI stylist</h3>
              <p className="text-sm md:text-base text-muted-foreground max-w-md">
                I can help you find clothes, put together an outfit, or just chat about fashion. 
                Ask any question!
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 max-w-lg w-full">
              <div className="p-2 md:p-3 rounded-lg border border-border/50 bg-muted/30">
                <h4 className="font-medium text-xs md:text-sm mb-1">🛍️ Product Search</h4>
                <p className="text-xs text-muted-foreground">
                  "Find black jeans"
                </p>
              </div>
              <div className="p-2 md:p-3 rounded-lg border border-border/50 bg-muted/30">
                <h4 className="font-medium text-xs md:text-sm mb-1">👗 Outfits</h4>
                <p className="text-xs text-muted-foreground">
                  "What to wear to work?"
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoadingMessages && messages.length > 0 && (
          <div className="space-y-4 md:space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start space-x-2 md:space-x-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <Avatar className="h-7 w-7 md:h-9 md:w-9 border-2 border-primary/20 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                      <Sparkles size={16} className="text-primary md:w-5 md:h-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`flex-1 max-w-full ${msg.role === "user" ? "flex justify-end" : ""}`}>
                  {msg.role === "user" ? (
                    <div className="bg-primary text-primary-foreground p-3 md:p-4 rounded-2xl rounded-tr-md max-w-[85%] md:max-w-lg shadow-sm">
                      <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                    </div>
                  ) : (
                    <div className="w-full max-w-[95%] md:max-w-full">
                      <AgentMessageRenderer content={msg.content} />
                    </div>
                  )}
                </div>
                
                {msg.role === "user" && (
                  <Avatar className="h-7 w-7 md:h-9 md:w-9 border-2 border-muted flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-muted to-background">
                      {user?.username?.[0]?.toUpperCase() || <User size={16} className="md:w-5 md:h-5" />}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isSendingMessage && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-start space-x-2 md:space-x-3">
                <Avatar className="h-7 w-7 md:h-9 md:w-9 border-2 border-primary/20 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                    <Sparkles size={16} className="text-primary md:w-5 md:h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 md:p-4 rounded-2xl rounded-tl-md shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin text-primary" />
                    <span className="text-xs md:text-sm text-muted-foreground">Processing your request...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <footer className="flex-shrink-0 p-3 md:p-4 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2 md:space-x-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Ask about products, outfits, or just chat..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSendingMessage || isLoadingMessages}
              className="min-h-[2.75rem] md:min-h-[2.5rem] px-3 md:px-4 py-2 md:py-3 pr-12 md:pr-12 rounded-2xl border-2 focus:border-primary/50 transition-all duration-200 text-base"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {input.length}/500
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isSendingMessage || isLoadingMessages || !input.trim()}
            className="h-11 w-11 md:h-10 md:w-10 rounded-full p-0 shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0"
            size="sm"
          >
            {isSendingMessage ? (
              <Loader2 className="h-4 w-4 md:h-4 md:w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4 md:h-4 md:h-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
        
        {messages.length === 0 && !isLoadingMessages && (
          <div className="mt-3 md:mt-4 space-y-2">
            <p className="text-xs text-muted-foreground">Try asking:</p>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {[
                "Find me a black t-shirt",
                "What to wear on a date?",
                "Put together an outfit for work",
                "Show me winter jackets"
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 md:h-7 rounded-full px-2 md:px-3"
                  onClick={() => setInput(suggestion)}
                  disabled={isSendingMessage || isLoadingMessages}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </footer>
    </div>
  )
}