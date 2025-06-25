"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, MessageSquare, Trash2, Loader2 } from "lucide-react"
import type { Chat } from "@/lib/types"
import { cn } from "@/lib/utils"

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
  // State for create action not needed anymore

  const handleCreate = async () => {
    const createdChat = await onCreateChat("")
    if (createdChat) {
      onSelectChat(createdChat.id)
    }
  }

  const handleDelete = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const confirmed = window.confirm("Are you sure you want to delete this chat and all its messages?")
    if (confirmed) {
      await onDeleteChat(chatId)
    }
  }

  return (
    <div className="w-full border-r border-border flex flex-col bg-card h-full">
      <div className="p-3 md:p-4 border-b border-border flex justify-between items-center bg-background">
        <h2 className="text-base md:text-lg font-semibold">Conversations</h2>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={handleCreate} 
          disabled={isCreatingChat}
          className="hover:bg-primary/10 hover:text-primary transition-colors h-8 w-8 md:h-10 md:w-10"
        >
          {isCreatingChat ? (
            <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
          ) : (
            <PlusCircle className="h-4 w-4 md:h-5 md:w-5" />
          )}
          <span className="sr-only">New chat</span>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoadingChats && (
          <div className="p-4 text-center text-muted-foreground">
            <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading chats...</p>
          </div>
        )}

        {!isLoadingChats && chats.length === 0 && (
          <div className="p-4 text-center text-muted-foreground space-y-3">
            <div className="p-2 md:p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 w-fit mx-auto">
              <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div>
              <p className="mb-2 text-sm">No conversations yet</p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-primary text-sm" 
                onClick={handleCreate}
              >
                Create the first chat!
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
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
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
                    <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                  )}
                  <span className="sr-only">Delete Chat</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}