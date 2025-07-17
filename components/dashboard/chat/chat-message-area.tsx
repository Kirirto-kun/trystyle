"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Loader2, User, Info, Sparkles, ArrowLeft } from "lucide-react"
import type { UIMessage, Chat } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import AgentMessageRenderer from "./agent-message-renderer"
import { useTranslations } from "@/contexts/language-context"

interface ChatMessageAreaProps {
  selectedChat: Chat | null
  messages: UIMessage[]
  onSendMessage: (chatId: number, messageContent: string) => Promise<void>
  isLoadingMessages: boolean
  isSendingMessage: boolean
  showTitle?: boolean
  onBackToList?: () => void
  showBackButton?: boolean
}

export default function ChatMessageArea({
  selectedChat,
  messages,
  onSendMessage,
  isLoadingMessages,
  isSendingMessage,
  showTitle = true,
  onBackToList,
  showBackButton = false,
}: ChatMessageAreaProps) {
  const [input, setInput] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const t = useTranslations('dashboard')

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
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center bg-gray-50 dark:bg-gray-800 h-full">
        <div className="p-4 md:p-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mb-4 md:mb-6">
          <Sparkles className="h-8 w-8 md:h-12 md:w-12 text-primary" />
        </div>
        <div className="space-y-2 md:space-y-3 max-w-md">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">{t('chat.welcomeToTryStyle')}</h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            {t('chat.selectMessage')}
          </p>
        </div>
        <div className="mt-6 md:mt-8 grid grid-cols-1 gap-3 md:gap-4 max-w-lg w-full">
          <div className="p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="text-xl md:text-2xl mb-2">🛍️</div>
            <h3 className="font-medium text-sm md:text-base text-gray-900 dark:text-white">Поиск товаров</h3>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">
              Найти одежду в интернет-магазинах
            </p>
          </div>
          <div className="p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="text-xl md:text-2xl mb-2">👗</div>
            <h3 className="font-medium text-sm md:text-base text-gray-900 dark:text-white">Стильные наряды</h3>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">
              Предложения нарядов из вашего гардероба
            </p>
          </div>
          <div className="p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="text-xl md:text-2xl mb-2">💬</div>
            <h3 className="font-medium text-sm md:text-base text-gray-900 dark:text-white">Модные советы</h3>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">
              Общие вопросы о стиле
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {showTitle && (
        <header className="flex-shrink-0 p-2 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop-blur sticky top-0 lg:top-0 z-10">
          <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 md:space-x-3 min-w-0">
              {showBackButton && onBackToList && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onBackToList}
                  className="md:hidden h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                  <span className="sr-only">Назад к чатам</span>
                </Button>
              )}
                              <div className="p-1 md:p-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
                              <div className="min-w-0">
                  <h2 className="text-sm md:text-lg font-semibold truncate text-gray-900 dark:text-white" title={selectedChat.title}>
                    {selectedChat.title}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                    TryStyle AI Assistant
                  </p>
                </div>
            </div>
          </div>
        </header>
      )}

      <ScrollArea className="flex-1 p-2 md:p-4 overflow-y-auto" ref={scrollAreaRef}>
        {isLoadingMessages && (
          <div className="flex justify-center items-center py-12 h-full">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">{t('chat.loadingMessages')}</p>
            </div>
          </div>
        )}

        {!isLoadingMessages && messages.length === 0 && (
          <div className="text-center p-8 md:p-12">
            <div className="max-w-md mx-auto space-y-6">
              <div className="relative">
                <img src="/logo.jpeg" alt="TryStyle Logo" className="h-16 w-16 md:h-20 md:w-20 rounded-xl object-cover mx-auto" />
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 md:h-8 md:w-8 text-primary/60 animate-bounce" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {t('chat.welcomeTitle')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                  {t('chat.selectMessage')}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoadingMessages && messages.length > 0 && (
          <div className="space-y-3 md:space-y-6">
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
                    <div className="bg-black dark:bg-white text-white dark:text-black p-2.5 md:p-4 rounded-2xl rounded-tr-md max-w-[90%] md:max-w-lg shadow-sm">
                      <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                    </div>
                  ) : (
                    <div className="w-full max-w-[98%] md:max-w-full">
                      <AgentMessageRenderer content={msg.content} />
                    </div>
                  )}
                </div>
                
                {msg.role === "user" && (
                  <Avatar className="h-7 w-7 md:h-9 md:w-9 border-2 border-gray-300 dark:border-gray-600 flex-shrink-0">
                    <AvatarFallback className="bg-gray-100 dark:bg-gray-700">
                      {user?.username?.[0]?.toUpperCase() || <User size={16} className="md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />}
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
                <div className="bg-gray-100 dark:bg-gray-700 p-3 md:p-4 rounded-2xl rounded-tl-md shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin text-primary" />
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Обрабатываем ваш запрос...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <footer className="flex-shrink-0 p-2 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop-blur sticky bottom-0 z-10">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2 md:space-x-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Спросите о товарах, нарядах или просто общайтесь..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSendingMessage || isLoadingMessages}
              className="min-h-[2.5rem] md:min-h-[2.5rem] px-3 md:px-4 py-2 md:py-3 pr-12 md:pr-12 rounded-2xl border-2 focus:border-black/50 dark:focus:border-white/50 transition-all duration-200 text-sm md:text-base bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
              {input.length}/500
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isSendingMessage || isLoadingMessages || !input.trim()}
            className="h-10 w-10 md:h-10 md:w-10 rounded-full p-0 shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
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
          <div className="mt-2 md:mt-4 space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-300">Попробуйте спросить:</p>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {[
                "Найди мне черную футболку",
                "Что надеть на свидание?",
                "Собери наряд для работы",
                "Покажи зимние куртки"
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 md:h-7 rounded-full px-2 md:px-3 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
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