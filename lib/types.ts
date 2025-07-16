export interface UserResponse {
  id: number
  email: string
  username: string
  is_active: boolean
  created_at: string
  updated_at?: string | null
  role?: string
  store_id?: number | null
  phone?: string | null
  is_store_admin?: boolean
  is_admin?: boolean
  can_manage_stores?: boolean
  managed_store?: {
    id: number
    name: string
    city: string
    logo_url: string
    rating: number
  } | null
}

export interface Token {
  access_token: string
  token_type: "bearer"
}

// Old Agent types - might be deprecated or used internally by new chat system
export interface AgentMessage {
  message: string
}
export interface AgentResponse {
  response: string
}

// Store Types
export interface Store {
  id: number
  name: string
  slug: string
  description: string
  city: string
  logo_url: string
  website_url: string
  rating: number
  total_products: number
  created_at: string
  updated_at: string
}

// New Chat System Types
export interface Chat {
  id: number
  title: string
  user_id: number
  created_at: string
  updated_at?: string | null
}

export interface ChatWithMessages extends Chat {
  messages: ChatMessageResponse[]
}

export interface ChatMessageResponse {
  id: number
  content: string
  role: "user" | "assistant" // Ensure this matches your API's role strings
  chat_id: number
  created_at: string
}

export interface CreateChatPayload {
  title: string
}

export interface SendMessagePayload {
  message: string // Matches API spec
}

// UI-specific chat message type (can be same as ChatMessageResponse or adapted)
export interface UIMessage {
  id: string | number // Allow string for optimistic updates
  role: "user" | "assistant"
  content: string
  createdAt?: string // Optional, for display
}

// Wardrobe & Waitlist types (unchanged from previous)
export interface PhotoUpload {
  image_base64: string
}

export interface ClothingItemResponse {
  id: number
  user_id: number
  name: string
  image_url: string
  category?: string
  features?: Record<string, any>
}

export interface WaitListItemResponse {
  id: number
  user_id: number
  image_url: string
  status?: string
  created_at: string
}

export interface WaitListScreenshotUpload {
  image_base64: string
}
