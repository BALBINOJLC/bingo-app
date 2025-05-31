const API_BASE_URL = "http://localhost:3025/api/v1"

type RegisterRequest = {}

type User = {}

interface AuthResponse {
  access_token: string
  user: User
}

interface BingoEvent {
  status: string
  // Define the structure of BingoEvent here
}

type CreateEventRequest = {}

type Carton = {}

type PurchaseRequest = {}

type Ticket = {}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    // Recuperar token del localStorage si existe
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: { [key: string]: string } = {
      "Content-Type": "application/json",
      ...(options.headers as { [key: string]: string }),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        this.logout() // Limpiar el token inválido
        throw new Error('Sesión expirada o token inválido')
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Autenticación
  async register(data: RegisterRequest): Promise<{ user: User }> {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const credentials = btoa(`${email}:${password}`)
    const response = await this.request<AuthResponse>("/auth/signin", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    })

    // Guardar token
    this.token = response.access_token
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.access_token)
      localStorage.setItem("user", JSON.stringify(response.user))
    }

    return response
  }

  logout() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("user")
    }
  }

  // Eventos
  async getEvents(params?: {
    search?: string
    status?: string
    user_id?: string
  }): Promise<BingoEvent[]> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.append("search", params.search)
    if (params?.status) searchParams.append("status", params.status)
    if (params?.user_id) searchParams.append("user_id", params.user_id)

    const query = searchParams.toString()
    return this.request(`/bingo${query ? `?${query}` : ""}`)
  }

  async getEvent(id: string): Promise<BingoEvent> {
    return this.request(`/bingo/${id}`)
  }

  async createEvent(data: CreateEventRequest): Promise<BingoEvent> {
    return this.request("/bingo", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateEventStatus(id: string, status: BingoEvent["status"]): Promise<BingoEvent> {
    return this.request(`/bingo/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  }

  // Cartones
  async getAvailableCartons(eventId: string): Promise<Carton[]> {
    return this.request(`/bingo/events/${eventId}/cartons/available`)
  }

  async purchaseCarton(data: PurchaseRequest): Promise<Ticket> {
    return this.request("/bingo/tickets/purchase", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Usuario
  async getProfile(): Promise<User> {
    return this.request("/users/profile")
  }

  async updateProfile(data: {
    first_name?: string
    last_name?: string
    display_name?: string
  }): Promise<User> {
    return this.request("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
