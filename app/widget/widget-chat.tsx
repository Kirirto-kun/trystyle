"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import ChatMessageArea from "@/components/dashboard/chat/chat-message-area"
import { apiCall } from "@/lib/api"
import type { Chat, UIMessage, ChatMessageResponse } from "@/lib/types"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2, Sparkles } from "lucide-react"
import { useTranslations } from "@/contexts/language-context"

export default function WidgetChat() {
  const t = useTranslations('dashboard')
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [isLoadingChat, setIsLoadingChat] = useState(true)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false)
  const [isNewChatMode, setIsNewChatMode] = useState(false)

  // Загрузка или создание чата при монтировании
  const initializeChat = useCallback(async () => {
    setIsLoadingChat(true)
    try {
      // Пытаемся получить список чатов
      const chats = await apiCall<Chat[]>('/api/v1/chats/')
      
      if (chats && chats.length > 0) {
        // Используем последний чат
        const lastChat = chats[0]
        setCurrentChat(lastChat)
        await loadMessages(lastChat.id)
      } else {
        // Нет чатов, переходим в режим нового чата
        setIsNewChatMode(true)
        setCurrentChat({
          id: 0,
          title: "New Chat",
          user_id: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error initializing chat:', error)
      // При ошибке переходим в режим нового чата
      setIsNewChatMode(true)
      setCurrentChat({
        id: 0,
        title: "New Chat",
        user_id: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    } finally {
      setIsLoadingChat(false)
    }
  }, [])

  // Загрузка сообщений
  const loadMessages = useCallback(async (chatId: number) => {
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
    }
  }, [])

  // Создание нового чата
  const handleCreateNewChat = useCallback(async () => {
    setIsCreatingNewChat(true)
    setMessages([])
    setIsNewChatMode(true)
    setCurrentChat({
      id: 0,
      title: "New Chat",
      user_id: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    setIsCreatingNewChat(false)
  }, [])

  // Отправка сообщения
  const handleSendMessage = useCallback(async (chatId: number, messageContent: string, imageFile?: File) => {
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
      if (isNewChatMode || !chatId || chatId === 0) {
        const formData = new FormData()
        formData.append('message', messageContent)
        if (imageFile) {
          formData.append('image', imageFile)
        }
        
        const response = await apiCall<any>('/api/v1/chats/init', {
          method: 'POST',
          body: formData,
          isFormData: true
        })
        
        // Создаем новый чат
        const newChat: Chat = {
          id: response.id,
          title: response.title,
          user_id: response.user_id,
          created_at: response.created_at,
          updated_at: response.updated_at
        }
        
        setCurrentChat(newChat)
        setIsNewChatMode(false)
        actualChatId = newChat.id
        
        // Добавляем сообщения из ответа API
        if (response.messages && Array.isArray(response.messages)) {
          const uiMessages: UIMessage[] = response.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.created_at
          }))
          setMessages(uiMessages)
        } else {
          await loadMessages(newChat.id)
        }
        toast.success('New chat created')
      } else {
        // Обычная отправка сообщения в существующий чат
        const formData = new FormData()
        formData.append('message', messageContent)
        if (imageFile) {
          formData.append('image', imageFile)
        }
        
        const response = await apiCall<ChatMessageResponse>(`/api/v1/chats/${actualChatId}/messages`, {
          method: 'POST',
          body: formData,
          isFormData: true
        })
        
        // Добавляем ответ агента
        const agentMessage: UIMessage = {
          id: response.id,
          role: 'assistant',
          content: response.content,
          createdAt: response.created_at
        }
        setMessages(prev => [...prev, agentMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      // Удаляем оптимистичное сообщение при ошибке
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
    } finally {
      setIsSendingMessage(false)
    }
  }, [isNewChatMode, loadMessages])

  // Обертка для handleSendMessage
  const wrappedHandleSendMessage = useCallback(async (chatId: number, messageContent: string, imageFile?: File) => {
    const actualChatId = isNewChatMode ? 0 : chatId
    await handleSendMessage(actualChatId, messageContent, imageFile)
  }, [isNewChatMode, handleSendMessage])

  // Инициализация при монтировании
  useEffect(() => {
    // Небольшая задержка, чтобы убедиться, что токен сохранен после логина
    const timer = setTimeout(() => {
      initializeChat()
    }, 200)
    
    return () => clearTimeout(timer)
  }, [initializeChat])

  if (isLoadingChat) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-screen bg-white">
      {/* Кнопка нового чата - абсолютное позиционирование */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCreateNewChat}
        disabled={isCreatingNewChat}
        className="absolute top-2 right-2 z-20 h-8 px-3 text-xs bg-white hover:bg-gray-100 !backdrop-blur-none"
      >
        {isCreatingNewChat ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <PlusCircle className="h-3 w-3 mr-1" />
            Новый чат
          </>
        )}
      </Button>

      {/* Область сообщений */}
      <div className="flex-1 overflow-hidden">
        <ChatMessageArea
          selectedChat={currentChat}
          messages={messages}
          onSendMessage={wrappedHandleSendMessage}
          isLoadingMessages={false}
          isSendingMessage={isSendingMessage}
          showTitle={false}
          showSuggestions={false}
        />
      </div>
    </div>
  )
}

