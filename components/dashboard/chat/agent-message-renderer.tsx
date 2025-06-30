"use client"
import ProductCard from "./product-card"
import OutfitDisplay from "./outfit-display"
import GeneralResponse from "./general-response"
import SearchMetadata from "./search-metadata"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { 
  isSearchAgentResult, 
  isOutfitAgentResult, 
  isGeneralAgentResult,
  type AgentResponse
} from "@/lib/chat-types"

interface AgentMessageRendererProps {
  content: string
}

export default function AgentMessageRenderer({ content }: AgentMessageRendererProps) {
  try {
    const parsed: AgentResponse = JSON.parse(content)
    
    if (!parsed.result) {
      throw new Error("Invalid response format: missing 'result' field")
    }

    const result = parsed.result

    // Search Agent - Products
    if (isSearchAgentResult(result)) {
      return (
        <div className="w-full">
          {/* Show metadata if available */}
          <SearchMetadata 
            searchQuery={result.search_query}
            totalFound={result.total_found}
            processingTimeMs={result.processing_time_ms}
          />
          
          {/* Product grid - Improved mobile layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {result.products.map((product, index) => (
              <ProductCard key={product.id || index} product={product} />
            ))}
          </div>
        </div>
      )
    }

    // Outfit Agent - Outfit recommendations
    if (isOutfitAgentResult(result)) {
      return (
        <OutfitDisplay outfit={result} />
      )
    }

    // General Agent - Text response
    if (isGeneralAgentResult(result)) {
      return (
        <GeneralResponse result={result} />
      )
    }

    // Unknown format
    throw new Error("Unknown response format")

  } catch (error) {
    console.error("Failed to parse agent response:", error)
    console.error("Content:", content)
    
    return (
      <Card className="w-full max-w-2xl border-red-500/50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-sm text-red-600 dark:text-red-400 mb-2">
                Error processing response
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Could not process the response from the agent. Try rephrasing your question.
              </p>
              <details className="mt-2">
                <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                  Error details
                </summary>
                <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 overflow-auto text-gray-900 dark:text-white">
                  {content}
                </pre>
              </details>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
} 