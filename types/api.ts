// Tipos basados en la documentación de la API
export interface User {
  id: string
  email: string
  display_name: string
  user_name?: string
  first_name: string
  last_name: string
  dni: string
  role: "SUPER_ADMIN" | "ADMIN" | "CLIENT"
  email_verify: boolean
  is_active: boolean
}

export interface AuthResponse {
  user: User
  access_token: string
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  dni: string
  role: "CLIENT"
}

export interface BingoEvent {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  time_start: string
  time_end: string
  status: "DRAFT" | "ACTIVE" | "FINISHED" | "CANCELLED"
  prize_pool: number
  commission: number
  total_cartons: number
}

export interface CreateEventRequest {
  name: string
  description: string
  start_date: string
  end_date: string
  time_start: string
  time_end: string
  status: "DRAFT"
  prize_pool: number
  commission: number
  total_cartons: number
}

export interface Carton {
  id: number
  event_id: string
  numbers: number[][]
  status: "AVAILABLE" | "PROCESSING_SOLD" | "SOLD"
  price: number
}

export interface PurchaseRequest {
  user_id: string
  carton_id: number
  amount_payment: number
  reference_payment: string
  number_payment: string
}

export interface Ticket {
  id: string
  user_id: string
  event_id: string
  carton_id: number
  status: "PROCESSING_SOLD" | "SOLD" | "INVALID"
  purchase_date: string
  amount_paid: number
}
