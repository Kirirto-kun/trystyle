"use client"
import { useState, useEffect, useCallback } from "react"
import { apiCall } from "@/lib/api"
import type {
  Chat,
  ChatWithMessages,
  ChatMessageResponse,
  UIMessage,
  SendMessagePayload,
} from "@/lib/types"
import ChatList from "@/components/dashboard/chat/chat-list"
import ChatMessageArea from "@/components/dashboard/chat/chat-message-area"
import { toast } from "sonner"
import { useRealViewportHeight } from "@/hooks/use-real-vp-height"

export default function ChatPage() {
  useRealViewportHeight();
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [showChatList, setShowChatList] = useState(true)

  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [isDeletingChat, setIsDeletingChat] = useState<Set<number>>(new Set())
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  const fetchChats = useCallback(async () => {
    setIsLoadingChats(true)
    try {
      const fetchedChats = await apiCall<Chat[]>("/api/v1/chats/")
      setChats(
        fetchedChats.sort(
          (a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime(),
        ),
      )
    } catch (error) {
      toast.error("Failed to load conversations.")
      console.error("Fetch chats error:", error)
    } finally {
      setIsLoadingChats(false)
    }
  }, [])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  const handleSelectChat = useCallback(
    async (chatId: number) => {
      const chat = chats.find((c) => c.id === chatId)
      if (!chat) {
        console.warn(`Chat with ID ${chatId} not found in local list.`)
        return
      }

      setSelectedChat(chat)
      setShowChatList(false) // Hide chat list on mobile when chat is selected
      setIsLoadingMessages(true)
      setMessages([])
      try {
        console.log(`Fetching messages for chat ID: ${chatId}`)
        const chatDetails = await apiCall<ChatWithMessages>(`/api/v1/chats/${chatId}`)
        console.log("Fetched chat details with messages:", chatDetails)
        const uiMessages: UIMessage[] = (chatDetails.messages || [])
          .map((msg) => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
            createdAt: msg.created_at,
          }))
          .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
        setMessages(uiMessages)
      } catch (error) {
        toast.error(`Failed to load messages for "${chat.title}".`)
        console.error(`Fetch messages error for chat ${chatId}:`, error)
        setSelectedChat(null)
        setShowChatList(true)
      } finally {
        setIsLoadingMessages(false)
      }
    },
    [chats],
  )

  const handleCreateChat = async (_unused: string): Promise<Chat | null> => {
    setIsCreatingChat(true)
    const draftId = -Date.now()
    const draftChat: Chat = {
      id: draftId,
      title: "New Chat",
      user_id: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setChats((prev) => [draftChat, ...prev])
    setSelectedChat(draftChat)
    setMessages([])
    setShowChatList(false)
    setIsCreatingChat(false)
    return draftChat
  }

  const handleDeleteChat = async (chatId: number): Promise<boolean> => {
    setIsDeletingChat((prev) => new Set(prev).add(chatId))
    try {
      console.log(`Deleting chat ID: ${chatId}`)
      await apiCall<{ message: string }>(`/api/v1/chats/${chatId}`, {
        method: "DELETE",
      })
      console.log(`Chat ID: ${chatId} deleted successfully from API.`)
      setChats((prev) => prev.filter((c) => c.id !== chatId))
      if (selectedChat?.id === chatId) {
        setSelectedChat(null)
        setMessages([])
        setShowChatList(true) // Show chat list when current chat is deleted
      }
      toast.success("Chat deleted successfully.")
      return true
    } catch (error) {
      toast.error("Failed to delete chat.")
      console.error(`Delete chat error for ID ${chatId}:`, error)
      return false
    } finally {
      setIsDeletingChat((prev) => {
        const newSet = new Set(prev)
        newSet.delete(chatId)
        return newSet
      })
    }
  }

  const handleSendMessage = async (chatId: number, messageContent: string) => {
    if (!selectedChat) return;

    const optimisticUserMessage: UIMessage = {
      id: `optimistic-${Date.now()}`,
      role: "user",
      content: messageContent,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticUserMessage])
    setIsSendingMessage(true)

    // If chat is draft (negative id), use init endpoint
    const isDraft = selectedChat.id < 0

    try {
      if (isDraft) {
        const endpoint = `/api/v1/chats/init`
        const payload: SendMessagePayload = { message: messageContent }
        const chatWithMessages = await apiCall<any>(endpoint, {
          method: "POST",
          body: JSON.stringify(payload),
        })

        const { id, title, user_id, created_at, updated_at, messages: serverMessages } = chatWithMessages

        // Convert server messages to UIMessage[]
        const uiMsgs: UIMessage[] = serverMessages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.created_at,
        }))

        const newChat: Chat = { id, title, user_id, created_at, updated_at }

        // Replace draft chat in list
        setChats((prev) => {
          const withoutDraft = prev.filter((c) => c.id !== selectedChat.id)
          return [newChat, ...withoutDraft]
        })
        setSelectedChat(newChat)
        setMessages(uiMsgs)
      } else {
        // Existing chat
        const endpoint = `/api/v1/chats/${chatId}/messages`
        const payload: SendMessagePayload = { message: messageContent }
        const assistantResponse = await apiCall<ChatMessageResponse>(endpoint, {
          method: "POST",
          body: JSON.stringify(payload),
        })

        const newAssistantMessage: UIMessage = {
          id: assistantResponse.id,
          role: assistantResponse.role,
          content: assistantResponse.content,
          createdAt: assistantResponse.created_at,
        }

        setMessages((prevMessages) => [...prevMessages, newAssistantMessage])

        // Update chats order
        setChats((prevChats) =>
          prevChats
            .map((c) => (c.id === chatId ? { ...c, updated_at: newAssistantMessage.createdAt || new Date().toISOString() } : c))
            .sort(
              (a, b) =>
                new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime(),
            ),
        )
      }
    } catch (error) {
      console.error("Send message error:", error)
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMessage.id))
    } finally {
      setIsSendingMessage(false)
    }
  }

  useEffect(() => {
    if (!selectedChat && chats.length > 0 && !isLoadingChats && !isLoadingMessages) {
      if (chats[0] && selectedChat?.id !== chats[0].id) {
        handleSelectChat(chats[0].id)
      }
    }
  }, [chats, selectedChat, isLoadingChats, isLoadingMessages, handleSelectChat])

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden h-[calc(var(--vh,1vh)*100-3.5rem)]">
        {showChatList ? (
          <div className="h-full">
            <ChatList
              chats={chats}
              selectedChatId={selectedChat?.id || null}
              onSelectChat={handleSelectChat}
              onCreateChat={handleCreateChat}
              onDeleteChat={handleDeleteChat}
              isLoadingChats={isLoadingChats}
              isCreatingChat={isCreatingChat}
              isDeletingChat={isDeletingChat}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Mobile chat header with back button */}
            <div className="flex items-center p-3 border-b bg-background">
              <button
                onClick={() => setShowChatList(true)}
                className="mr-3 p-1 hover:bg-muted rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold truncate">
                {selectedChat?.title || "Chat"}
              </h1>
            </div>
            <div className="flex-1 min-h-0">
              {selectedChat && (
                <ChatMessageArea
                  selectedChat={selectedChat}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoadingMessages={isLoadingMessages}
                  isSendingMessage={isSendingMessage}
                  showTitle={false}
                />
              )}
              {!selectedChat && !isLoadingMessages && (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  No chat selected
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-[320px_1fr] h-[calc(100vh-3.5rem)]">
        {/* Desktop - Chat List */}
        <div className="border-r h-full overflow-y-auto">
        <ChatList
          chats={chats}
          selectedChatId={selectedChat?.id || null}
          onSelectChat={handleSelectChat}
          onCreateChat={handleCreateChat}
          onDeleteChat={handleDeleteChat}
          isLoadingChats={isLoadingChats}
          isCreatingChat={isCreatingChat}
          isDeletingChat={isDeletingChat}
        />
        </div>

        {/* Desktop - Chat Area */}
        <div className="flex flex-col h-full min-h-0">
        <ChatMessageArea
          selectedChat={selectedChat}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoadingMessages={isLoadingMessages}
          isSendingMessage={isSendingMessage}
        />
        </div>
      </div>
    </>
  )
}