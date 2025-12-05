"use client"
import OutfitDisplay from "./outfit-display"
import GeneralResponse from "./general-response"
import OutfitShowcase from "./outfit-showcase"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { 
  isSearchAgentResult, 
  isOutfitAgentResult, 
  isGeneralAgentResult,
  hasSuggestedOutfits,
  normalizeSearchResult,
  type AgentResponse,
  type SearchAgentResult
} from "@/lib/chat-types"

interface AgentMessageRendererProps {
  content: string
  onSetInput?: (text: string) => void
  isFirstAssistantMessage?: boolean
}

// Function to check if text contains greeting "Доброго времени суток"
function hasGreeting(text: string): boolean {
  const greeting = "Доброго времени суток"
  return text.toLowerCase().includes(greeting.toLowerCase())
}

export default function AgentMessageRenderer({ content, onSetInput, isFirstAssistantMessage }: AgentMessageRendererProps) {
  try {
    const parsed: AgentResponse = JSON.parse(content)
    
    if (!parsed.result) {
      throw new Error("Invalid response format: missing 'result' field")
    }

    let result = parsed.result

    // Search Agent - Outfits or Search Description
    if (isSearchAgentResult(result)) {
      // Normalize the result (convert outfits → suggested_outfits)
      const normalizedResult = normalizeSearchResult(result) as SearchAgentResult
      
      // Check if we have suggested outfits (new format)
      if (hasSuggestedOutfits(normalizedResult)) {
        return (
          <div className="w-full max-w-full overflow-hidden">
            <OutfitShowcase 
              outfits={normalizedResult.suggested_outfits || normalizedResult.outfits || []}
              searchDescription={normalizedResult.search_description || undefined}
              uploadedImageUrl={normalizedResult.uploaded_image_url || undefined}
              nextSteps={normalizedResult.next_steps || undefined}
              onSetInput={onSetInput}
            />
          </div>
        )
      }
      
      // Fallback: Show search description and clarifying question if no outfits
      // This handles cases where API returns description but empty outfits array
      if (normalizedResult.search_description || normalizedResult.general_answer || normalizedResult.clarifying_question || normalizedResult.next_steps) {
        return (
          <div className="w-full">
            {/* Show search description */}
            {normalizedResult.search_description && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {normalizedResult.search_description}
                </p>
              </div>
            )}

            {/* Show general answer before clarifying question */}
            {normalizedResult.general_answer && normalizedResult.general_answer.trim() && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                  {normalizedResult.general_answer}
                </p>
              </div>
            )}

            {/* Show clarifying question if needs clarification */}
            {normalizedResult.needs_clarification && normalizedResult.clarifying_question && (() => {
              const questionText = normalizedResult.clarifying_question
              const shouldAddGreeting = isFirstAssistantMessage && !hasGreeting(questionText)
              const displayText = shouldAddGreeting ? `Доброго времени суток. ${questionText}` : questionText
              
              return (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                        Уточняющий вопрос:
                      </h4>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                        {displayText}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Show next steps as CTA buttons */}
            {normalizedResult.next_steps && normalizedResult.next_steps.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {normalizedResult.next_steps.map((step, index) => (
                    <button
                      key={index}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                      onClick={() => {
                        if (onSetInput) {
                          onSetInput(step)
                        } else {
                          console.log("Next step clicked:", step)
                        }
                      }}
                    >
                      {step}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      }
      
      // No outfits, no description, no clarifying question - invalid response
      throw new Error("Search response has no outfits, description, or clarifying question")
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