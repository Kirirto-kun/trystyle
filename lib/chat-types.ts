// Types for structured agent responses according to API documentation

export interface Product {
  id?: number // Optional for backward compatibility with old format
  name: string
  price: string
  original_price?: string // For discount display
  description: string
  image_urls?: string[] // Array of product images
  store_name?: string // Store name
  store_city?: string // Store city
  sizes?: string[] // Available sizes
  colors?: string[] // Available colors
  in_stock?: boolean // Stock status
  link: string // Can be external link or internal path like /products/5
}

export interface SearchAgentResult {
  products: Product[]
  search_query?: string // What user searched for
  total_found?: number // Total results found
  agent_type?: string // Should be "search"
  processing_time_ms?: number // Processing time in milliseconds
}

export interface OutfitItem {
  name: string
  category: string
  image_url: string
}

export interface OutfitAgentResult {
  outfit_description: string
  items: OutfitItem[]
  reasoning: string
}

export interface GeneralAgentResult {
  response: string
}

export interface AgentResponse {
  result: SearchAgentResult | OutfitAgentResult | GeneralAgentResult
}

// Type guards for agent responses
export function isSearchAgentResult(result: any): result is SearchAgentResult {
  return result && Array.isArray(result.products)
}

export function isOutfitAgentResult(result: any): result is OutfitAgentResult {
  return result && 
         typeof result.outfit_description === 'string' &&
         Array.isArray(result.items) &&
         typeof result.reasoning === 'string'
}

export function isGeneralAgentResult(result: any): result is GeneralAgentResult {
  return result && typeof result.response === 'string'
} 