import Cookies from "js-cookie"
import { toast } from "sonner"

const API_BASE_URL = "https://www.closetmind.studio"

interface ApiCallOptions extends RequestInit {
  isFormData?: boolean
}

export async function apiCall<T>(endpoint: string, options: ApiCallOptions = {}): Promise<T> {
  const token = Cookies.get("authToken")
  const headers: { [key: string]: string } = options.isFormData
    ? {}
    : {
        "Content-Type": "application/json",
        ...(options.headers as { [key: string]: string }),
      }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const fullUrl = `${API_BASE_URL}${endpoint}`
  console.log(`API Call: ${options.method || "GET"} ${fullUrl}`, { headers: options.headers, body: options.body })

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid or expired
        toast.error("Your session has expired. Please log in again.");
        Cookies.remove("authToken");
        Cookies.remove("authUser");
        // Force a reload to the login page to reset app state
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        // Throw an error to prevent further processing
        throw new Error("Unauthorized");
      }

      let errorData
      try {
        errorData = await response.json()
        console.error(`API Error Response (${response.status}) for ${fullUrl}:`, errorData)
      } catch (e) {
        const textError = await response.text()
        console.error(`API Error Response (${response.status}) for ${fullUrl} (not JSON):`, textError)
        errorData = { detail: textError || `Request failed with status ${response.status}` }
      }
      toast.error(`Error: ${errorData?.detail || errorData?.message || response.statusText || "Request failed"}`)
      throw new Error(errorData?.detail || `Request failed with status ${response.status}`)
    }

    if (response.headers.get("content-type")?.includes("application/zip")) {
      return response.blob() as unknown as T // For file downloads
    }

    // Handle cases where response is OK but no content (e.g., 204)
    const contentLength = response.headers.get("content-length")
    if (response.status === 204 || (contentLength && Number.parseInt(contentLength, 10) === 0)) {
      return undefined as unknown as T // No content
    }

    // If content-type is not JSON but response is OK (e.g. plain text)
    if (!response.headers.get("content-type")?.includes("application/json")) {
      const textData = await response.text()
      console.warn(`API Warning: Response for ${fullUrl} was not JSON. Returning text.`, textData)
      return textData as unknown as T
    }

    return response.json() as Promise<T>
  } catch (error: any) {
    // This catches network errors (Failed to fetch) or errors thrown above
    console.error(`Network or other error during API call to ${fullUrl}:`, error)
    // Avoid double-toasting if already toasted above
    if (!error.message.startsWith("Request failed with status")) {
      toast.error(`Network error: ${error.message || "Failed to connect to server."}`)
    }
    throw error // Re-throw the error to be caught by the calling function
  }
}

// Waitlist Types
export interface WaitlistItem {
  id: number;
  user_id: number;
  image_url: string;
  try_on_url?: string;
  status: 'pending' | 'processed';
  created_at: string;
}

export interface WaitlistUploadResponse {
  itemId: string;
  message: string;
}

export interface TryOnRequest {
  image_base64: string;
  waitlist_item_id: number;
}

export interface TryOnResponse {
  id: number;
  image_url: string;
  try_on_url: string;
  status: 'pending' | 'processed';
  user_id: number;
  created_at: string;
}

export interface WaitlistUploadRequest {
  image_base64: string;
}

// Waitlist API Functions
export async function addItemToWaitlist(imageUrl: string): Promise<WaitlistUploadResponse> {
  return apiCall<WaitlistUploadResponse>('/waitlist/items', {
    method: 'POST',
    body: JSON.stringify({ imageUrl }),
  });
}

export async function uploadScreenshotToWaitlist(data: WaitlistUploadRequest): Promise<WaitlistUploadResponse> {
  return apiCall<WaitlistUploadResponse>('/waitlist/upload-screenshot', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function tryOnWaitlistItem(data: TryOnRequest): Promise<TryOnResponse> {
  return apiCall<TryOnResponse>(`/waitlist/try-on/${data.waitlist_item_id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getWaitlistItems(): Promise<WaitlistItem[]> {
  return apiCall<WaitlistItem[]>('/waitlist/items', {
    method: 'GET',
  });
}
