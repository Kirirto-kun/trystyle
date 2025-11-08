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

export interface SuggestedOutfitItem {
  id?: number // Optional ID for product reference
  name: string
  image_url: string
  link: string
  price: string
}

export interface SuggestedOutfit {
  outfit_description: string
  items: SuggestedOutfitItem[]
}

export interface SearchAgentResult {
  products?: Product[] // Optional - may be missing or empty
  search_query?: string // What user searched for
  search_description?: string | null // Description of search results
  total_found?: number // Total results found
  // reasoning field removed - no longer used by API
  suggested_outfits?: SuggestedOutfit[] // Suggested outfit combinations
  outfits?: SuggestedOutfit[] // Alternative field name from API (normalized to suggested_outfits)
  needs_clarification?: boolean // Whether clarification is needed
  clarifying_question?: string | null // Clarifying question if needed
  uploaded_image_url?: string | null // URL of uploaded image
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
  agent_type?: string // Agent type (e.g., "search")
  processing_time_ms?: number // Processing time in milliseconds
  input_tokens?: number // Input tokens used
  output_tokens?: number // Output tokens used
  total_tokens?: number // Total tokens used
}

// Type guards for agent responses
export function isSearchAgentResult(result: any): result is SearchAgentResult {
  return result && (
    Array.isArray(result.products) || 
    Array.isArray(result.suggested_outfits) || 
    Array.isArray(result.outfits) ||
    result.search_query !== undefined ||
    result.needs_clarification !== undefined ||
    result.clarifying_question !== undefined
  )
}

export function hasSuggestedOutfits(result: SearchAgentResult): result is SearchAgentResult & { suggested_outfits: SuggestedOutfit[] } {
  return (result.suggested_outfits && result.suggested_outfits.length > 0) ||
         (result.outfits && result.outfits.length > 0)
}

// Normalize API response to standard format
export function normalizeSearchResult(result: any): SearchAgentResult {
  // Create a copy to avoid mutating the original
  const normalized = { ...result }
  
  // Convert outfits → suggested_outfits if needed
  if (normalized.outfits && !normalized.suggested_outfits) {
    normalized.suggested_outfits = normalized.outfits
  }
  // Ensure products is an array
  if (!normalized.products) {
    normalized.products = []
  }
  return normalized as SearchAgentResult
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