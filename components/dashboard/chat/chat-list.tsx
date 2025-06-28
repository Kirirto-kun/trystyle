"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, MessageSquare, Trash2, Loader2 } from "lucide-react"
import type { Chat } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/contexts/language-context"

interface ChatListProps {
  chats: Chat[]
  selectedChatId: number | null
  onSelectChat: (chatId: number) => void
  onCreateChat: (title: string) => Promise<Chat | null>
  onDeleteChat: (chatId: number) => Promise<boolean>
  isLoadingChats: boolean
  isCreatingChat: boolean
  isDeletingChat: Set<number>
}

export default function ChatList({
  chats,
  selectedChatId,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  isLoadingChats,
  isCreatingChat,
  isDeletingChat,
}: ChatListProps) {
  const t = useTranslations('dashboard')

  const handleCreate = async () => {
    const createdChat = await onCreateChat("")
    if (createdChat) {
      onSelectChat(createdChat.id)
    }
  }

  const handleDelete = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const confirmed = window.confirm(t('chat.deleteConfirm'))
    if (confirmed) {
      await onDeleteChat(chatId)
    }
  }

  return (
    <div className="w-full border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 h-full">
      <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-900">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{t('chat.conversations')}</h2>
        <Button 
          size="sm" 
          onClick={handleCreate} 
          disabled={isCreatingChat}
          className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl px-3 py-2 md:px-4 md:py-2 h-10 md:h-auto font-medium text-sm"
        >
          {isCreatingChat ? (
            <>
              <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin mr-1 md:mr-2" />
              <span className="text-xs md:text-sm">{t('chat.creating')}</span>
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm">{t('chat.newChat')}</span>
            </>
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoadingChats && (
          <div className="p-4 text-center text-gray-600 dark:text-gray-300">
            <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm">{t('chat.loadingChats')}</p>
          </div>
        )}

        {!isLoadingChats && chats.length === 0 && (
          <div className="p-4 text-center text-gray-600 dark:text-gray-300 space-y-4">
            <div className="p-3 md:p-4 rounded-full bg-gradient-to-br from-black/10 to-black/5 dark:from-white/10 dark:to-white/5 w-fit mx-auto">
              <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">{t('chat.noConversations')}</p>
              <Button 
                size="lg"
                onClick={handleCreate}
                disabled={isCreatingChat}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl px-6 py-3 font-medium"
              >
                {isCreatingChat ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {t('chat.creating')}
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-5 w-5 mr-2" />
                    {t('chat.createFirst')}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {!isLoadingChats && chats.length > 0 && (
          <div className="p-2 space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "w-full h-auto py-2 md:py-3 px-2 md:px-3 text-left rounded-md cursor-pointer transition-colors flex items-center justify-between gap-2",
                  selectedChatId === chat.id
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                )}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex items-center min-w-0">
                  <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate text-sm md:text-base flex-1 md:flex-none md:max-w-[200px]">{chat.title}</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 md:h-7 md:w-7 ml-2"
                  onClick={(e) => handleDelete(chat.id, e)}
                  disabled={isDeletingChat.has(chat.id)}
                >
                  {isDeletingChat.has(chat.id) ? (
                    <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className="sr-only">{t('chat.deleteButton')}</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}