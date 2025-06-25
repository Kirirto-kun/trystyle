// Types for structured agent responses according to API documentation

export interface Product {
  name: string
  price: string
  description: string
  link: string
}

export interface SearchAgentResult {
  products: Product[]
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