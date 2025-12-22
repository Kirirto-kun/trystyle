"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import type { UserResponse, Token } from "@/lib/types" // We'll define these types later
import { toast } from "sonner" // Using sonner for toasts

const API_BASE_URL = "https://closetmind.studio"

// Helper function to get cookie options based on protocol
// sameSite="none" requires secure=true, which only works on HTTPS
const getCookieOptions = () => {
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:"
  return isSecure 
    ? { expires: 365, secure: true, sameSite: "none" as const }
    : { expires: 365 }
}

interface AuthContextType {
  user: UserResponse | null
  token: string | null
  login: (email_or_username: string, password: string) => Promise<boolean>
  register: (email: string, username: string, password: string, verification_code: string) => Promise<boolean>
  sendVerificationCode: (email: string) => Promise<boolean>
  googleLogin: (id_token: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  // Initialize only once on mount
  useEffect(() => {
    const initAuth = async () => {
      const currentToken = Cookies.get("authToken")
      if (currentToken) {
        setToken(currentToken)
        // Try to get fresh user data from API
        try {
          if (!API_BASE_URL) {
            throw new Error("API_BASE_URL is not defined")
          }
          
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              "Authorization": `Bearer ${currentToken}`,
              "Content-Type": "application/json",
            },
          })
          
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
            Cookies.set("authUser", JSON.stringify(userData), getCookieOptions())
          } else if (response.status === 401) {
            // Token is invalid or expired, clear auth data
            Cookies.remove("authToken")
            Cookies.remove("authUser")
            setToken(null)
            setUser(null)
          }
          // Don't clear auth on other errors (network issues, etc.)
        } catch (error) {
          console.error("Error fetching user data:", error)
          // Don't clear auth data on network errors or API_BASE_URL issues
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.warn("Network error, using stored user data")
            // Fallback to stored user data on network errors
            const storedUser = Cookies.get("authUser")
            if (storedUser) {
              try {
                setUser(JSON.parse(storedUser))
              } catch (parseError) {
                console.error("Error parsing stored user:", parseError)
                // Don't remove cookie on parse error, just log it
              }
            }
          } else if (error instanceof Error && error.message.includes('API_BASE_URL')) {
            console.warn("API_BASE_URL not configured, using stored user data")
            // Fallback to stored user data
            const storedUser = Cookies.get("authUser")
            if (storedUser) {
              try {
                setUser(JSON.parse(storedUser))
              } catch (parseError) {
                console.error("Error parsing stored user:", parseError)
              }
            }
          } else {
            // For other errors (like 401), we already handled clearing auth above
            // But if we get here and there's a stored user, use it as fallback
            const storedUser = Cookies.get("authUser")
            if (storedUser) {
              try {
                setUser(JSON.parse(storedUser))
              } catch (parseError) {
                console.error("Error parsing stored user:", parseError)
              }
            }
          }
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, []) // Only on mount

  const sendVerificationCode = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-verification-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`Failed: ${errorData.detail || response.statusText}`);
        return false;
      }

      toast.success("Verification code sent to your email.");
      return true;
    } catch (error) {
      console.error("Send verification code error:", error);
      toast.error("Failed to send verification code. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email_or_username: string, password: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("username", email_or_username)
      params.append("password", password)

      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(`Login failed: ${errorData.detail || response.statusText}`)
        return false
      }

      const data: Token = await response.json()
      Cookies.set("authToken", data.access_token, getCookieOptions())
      setToken(data.access_token)

      // Get user data to determine role and redirect accordingly
      try {
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            "Authorization": `Bearer ${data.access_token}`,
            "Content-Type": "application/json",
          },
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData)
          Cookies.set("authUser", JSON.stringify(userData), getCookieOptions())

          toast.success("Login successful!")
          
          // Only redirect if not in widget (widget handles its own navigation)
          if (typeof window !== "undefined" && !window.location.pathname.includes("/widget")) {
            // Route based on user role
            if (userData.is_admin) {
              router.push("/admin")
            } else if (userData.is_store_admin) {
              router.push("/store-admin")
            } else {
              router.push("/dashboard/chat")
            }
          }
        } else {
          // Fallback to chat if we can't get user data, only if not in widget
          if (typeof window !== "undefined" && !window.location.pathname.includes("/widget")) {
            router.push("/dashboard/chat")
          }
        }
      } catch (userError) {
        console.error("Error fetching user data after login:", userError)
        // Fallback to chat
        router.push("/dashboard/chat")
      }

      return true
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Login failed. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, username: string, password: string, verification_code: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password, verification_code }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(`Registration failed: ${errorData.detail || "Unknown error"}`)
        return false
      }

      const data: UserResponse = await response.json()
      toast.success("Registration successful! Please log in.")
      router.push("/login")
      return true
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Registration failed. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const googleLogin = async (id_token: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_token }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(`Google login failed: ${errorData.detail || response.statusText}`)
        return false
      }

      const data: Token = await response.json()
      Cookies.set("authToken", data.access_token, getCookieOptions())
      setToken(data.access_token)

      // Get user data to determine role and redirect accordingly
      try {
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            "Authorization": `Bearer ${data.access_token}`,
            "Content-Type": "application/json",
          },
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData)
          Cookies.set("authUser", JSON.stringify(userData), getCookieOptions())

          toast.success("Google login successful!")
          
          // Only redirect if not in widget (widget handles its own navigation)
          if (typeof window !== "undefined" && !window.location.pathname.includes("/widget")) {
            // Route based on user role
            if (userData.is_admin) {
              router.push("/admin")
            } else if (userData.is_store_admin) {
              router.push("/store-admin")
            } else {
              router.push("/dashboard/chat")
            }
          }
        } else {
          // Fallback to chat if we can't get user data, only if not in widget
          if (typeof window !== "undefined" && !window.location.pathname.includes("/widget")) {
            router.push("/dashboard/chat")
          }
        }
      } catch (userError) {
        console.error("Error fetching user data after Google login:", userError)
        // Fallback to chat
        router.push("/dashboard/chat")
      }

      return true
    } catch (error) {
      console.error("Google login error:", error)
      toast.error("Google login failed. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Remove cookies (no special options needed for removal)
    Cookies.remove("authToken")
    Cookies.remove("authUser")
    setToken(null)
    setUser(null)
    
    // Only redirect if not in widget
    const isWidget = typeof window !== "undefined" && window.location.pathname.includes("/widget")
    if (!isWidget) {
      router.push("/login")
      toast.info("Logged out successfully.")
    } else {
      // In widget, just clear state and show message
      toast.info("Logged out successfully.")
      // Optionally reload the widget page to show login form
      if (typeof window !== "undefined") {
        window.location.reload()
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        token, 
        login, 
        register, 
        sendVerificationCode,
        googleLogin, 
        logout, 
        isLoading, 
        isAuthenticated: !!token 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
