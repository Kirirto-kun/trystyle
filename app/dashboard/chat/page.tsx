"use client"

import React, { useState, useEffect } from "react"
import ChatList from "@/components/dashboard/chat/chat-list"
import ChatMessageArea from "@/components/dashboard/chat/chat-message-area"
import { apiCall } from "@/lib/api"
import type { Chat, UIMessage, ChatMessageResponse } from "@/lib/types"
import { toast } from "sonner"
import { useTranslations } from "@/contexts/language-context"

export default function ChatPage() {
  const t = useTranslations('dashboard')
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null)
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isDeletingChat, setIsDeletingChat] = useState<Set<number>>(new Set())
  const [isNewChatMode, setIsNewChatMode] = useState(false)
  // Мобильное состояние для переключения между списком чатов и областью сообщений
  const [showChatList, setShowChatList] = useState(true)

  // Загрузка списка чатов
  const fetchChats = async () => {
    setIsLoadingChats(true)
    try {
      const data = await apiCall<Chat[]>('/api/v1/chats/')
      setChats(data)
    } catch (error) {
      console.error('Error fetching chats:', error)
      toast.error('Failed to load chats')
    } finally {
      setIsLoadingChats(false)
    }
  }

  // Загрузка сообщений для выбранного чата
  const fetchMessages = async (chatId: number) => {
    setIsLoadingMessages(true)
    try {
      const data = await apiCall<ChatMessageResponse[]>(`/api/v1/chats/${chatId}/messages`)
      const uiMessages: UIMessage[] = data.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.created_at
      }))
      setMessages(uiMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Переключение в режим нового чата
  const handleCreateChat = async (title: string): Promise<Chat | null> => {
    setSelectedChatId(null)
    setMessages([])
    setIsNewChatMode(true)
    setShowChatList(false) // Переключаемся на область сообщений на мобильных
    return null // Чат создается только при отправке первого сообщения
  }

  // Отправка сообщения
  const handleSendMessage = async (chatId: number | null, messageContent: string) => {
    if (!messageContent.trim()) return
    
    // Оптимистичное обновление UI
    const optimisticMessage: UIMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageContent,
      createdAt: new Date().toISOString()
    }
    setMessages(prev => [...prev, optimisticMessage])
    
    setIsSendingMessage(true)
    try {
      let actualChatId = chatId
      
      // Если это новый чат, создаем его с первым сообщением
      if (isNewChatMode || !chatId) {
        const payload = { message: messageContent }
        const response = await apiCall<any>('/api/v1/chats/init', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        
        // Создаем новый чат в списке
        const newChat: Chat = {
          id: response.id,
          title: response.title,
          user_id: response.user_id,
          created_at: response.created_at,
          updated_at: response.updated_at
        }
        
        setChats(prev => [newChat, ...prev])
        setSelectedChatId(newChat.id)
        setIsNewChatMode(false)
        actualChatId = newChat.id
        
        // Загружаем сообщения из ответа API
        await fetchMessages(newChat.id)
        toast.success('New chat created')
      } else {
        // Обычная отправка сообщения в существующий чат
        const payload = { message: messageContent }
        const response = await apiCall<ChatMessageResponse>(`/api/v1/chats/${actualChatId}/messages`, {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        
        // Перезагружаем сообщения для получения ответа
        await fetchMessages(actualChatId!)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      // Удаляем оптимистичное сообщение при ошибке
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
    } finally {
      setIsSendingMessage(false)
    }
  }

  // Удаление чата
  const handleDeleteChat = async (chatId: number): Promise<boolean> => {
    setIsDeletingChat(prev => new Set(prev.add(chatId)))
    try {
      await apiCall(`/api/v1/chats/${chatId}`, {
        method: 'DELETE'
      })
      setChats(prev => prev.filter(chat => chat.id !== chatId))
      if (selectedChatId === chatId) {
        setSelectedChatId(null)
        setMessages([])
      }
      toast.success('Chat deleted')
      return true
    } catch (error) {
      console.error('Error deleting chat:', error)
      toast.error('Failed to delete chat')
      return false
    } finally {
      setIsDeletingChat(prev => {
        const newSet = new Set(prev)
        newSet.delete(chatId)
        return newSet
      })
    }
  }

  // Выбор чата
  const handleSelectChat = (chatId: number) => {
    setSelectedChatId(chatId)
    setIsNewChatMode(false)
    setShowChatList(false) // Переключаемся на область сообщений на мобильных
    fetchMessages(chatId)
  }

  // Возврат к списку чатов (для мобильных)
  const handleBackToChatList = () => {
    setShowChatList(true)
  }

  // Загрузка чатов при монтировании
  useEffect(() => {
    fetchChats()
  }, [])

  const selectedChat = chats.find(chat => chat.id === selectedChatId) || null
  
  // Создаем псевдо-чат для режима нового чата
  const displayChat = isNewChatMode ? {
    id: 0,
    title: "New Chat",
    user_id: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } : selectedChat

  // Обертка для handleSendMessage, передающая правильный chatId
  const wrappedHandleSendMessage = async (chatId: number, messageContent: string) => {
    const actualChatId = isNewChatMode ? null : chatId
    await handleSendMessage(actualChatId, messageContent)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
      {/* Боковая панель со списком чатов */}
      <div className="hidden md:flex md:w-80 lg:w-96">
        <ChatList
          chats={chats}
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
          onCreateChat={handleCreateChat}
          onDeleteChat={handleDeleteChat}
          isLoadingChats={isLoadingChats}
          isCreatingChat={isCreatingChat}
          isDeletingChat={isDeletingChat}
        />
      </div>
      
      {/* Основная область чата - только для десктопа */}
      <div className="hidden md:flex md:flex-1 md:flex-col">
        <ChatMessageArea
          selectedChat={displayChat}
          messages={messages}
          onSendMessage={wrappedHandleSendMessage}
          isLoadingMessages={isLoadingMessages}
          isSendingMessage={isSendingMessage}
        />
      </div>
      
      {/* Мобильная версия - переключение между списком чатов и областью сообщений */}
      <div className="md:hidden w-full h-full">
        {showChatList ? (
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
            onCreateChat={handleCreateChat}
            onDeleteChat={handleDeleteChat}
            isLoadingChats={isLoadingChats}
            isCreatingChat={isCreatingChat}
            isDeletingChat={isDeletingChat}
          />
        ) : (
          <ChatMessageArea
            selectedChat={displayChat}
            messages={messages}
            onSendMessage={wrappedHandleSendMessage}
            isLoadingMessages={isLoadingMessages}
            isSendingMessage={isSendingMessage}
            onBackToList={handleBackToChatList}
            showBackButton={true}
          />
        )}
      </div>
    </div>
  )
} 