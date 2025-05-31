"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ticket, Calendar, Trophy } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import type { User } from "@/types/api"

// Datos de ejemplo para tickets (en una implementación real, estos vendrían de la API)
const mockTickets = [
  {
    id: "1",
    event_name: "Bingo de Año Nuevo",
    carton_id: 123,
    status: "SOLD" as const,
    purchase_date: "2024-01-15",
    amount_paid: 10000,
    event_date: "2024-01-31",
    prize_pool: 500000,
  },
  {
    id: "2",
    event_name: "Bingo de San Valentín",
    carton_id: 456,
    status: "PROCESSING_SOLD" as const,
    purchase_date: "2024-01-20",
    amount_paid: 15000,
    event_date: "2024-02-14",
    prize_pool: 750000,
  },
]

export default function MyTicketsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [tickets] = useState(mockTickets)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SOLD":
        return "bg-green-500"
      case "PROCESSING_SOLD":
        return "bg-yellow-500"
      case "INVALID":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "SOLD":
        return "Confirmado"
      case "PROCESSING_SOLD":
        return "Procesando"
      case "INVALID":
        return "Inválido"
      default:
        return status
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Tickets</h1>
            <p className="text-gray-600">Aquí puedes ver todos los tickets que has comprado</p>
          </div>

          {tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{ticket.event_name}</CardTitle>
                      <Badge className={getStatusColor(ticket.status)}>{getStatusText(ticket.status)}</Badge>
                    </div>
                    <CardDescription>Cartón #{ticket.carton_id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Evento: {new Date(ticket.event_date).toLocaleDateString("es-ES")}
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Ticket className="h-4 w-4 mr-2" />
                        Comprado: {new Date(ticket.purchase_date).toLocaleDateString("es-ES")}
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Trophy className="h-4 w-4 mr-2" />
                        Premio del evento:{" "}
                        <span className="font-semibold text-green-600 ml-1">${ticket.prize_pool.toLocaleString()}</span>
                      </div>

                      <div className="pt-3 border-t">
                        <p className="text-lg font-bold text-blue-600">
                          Pagado: ${ticket.amount_paid.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes tickets</h3>
              <p className="text-gray-600">Compra tu primer ticket en uno de nuestros eventos activos</p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
