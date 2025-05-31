"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Trophy, Search } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { apiClient } from "@/lib/api"
import type { BingoEvent } from "@/types/api"

export default function EventsPage() {
  const [events, setEvents] = useState<BingoEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<BingoEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await apiClient.getEvents()
        setEvents(eventsData)
        setFilteredEvents(eventsData)
      } catch (error) {
        console.error("Error loading events:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  useEffect(() => {
    let filtered = events

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => event.status === statusFilter)
    }

    setFilteredEvents(filtered)
  }, [events, searchTerm, statusFilter])

  const getStatusColor = (status: BingoEvent["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500"
      case "DRAFT":
        return "bg-yellow-500"
      case "FINISHED":
        return "bg-gray-500"
      case "CANCELLED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: BingoEvent["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "Activo"
      case "DRAFT":
        return "Borrador"
      case "FINISHED":
        return "Finalizado"
      case "CANCELLED":
        return "Cancelado"
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Eventos de Bingo</h1>
            <p className="text-gray-600">Descubre y participa en emocionantes eventos de bingo</p>
          </div>

          {/* Filtros */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activos</SelectItem>
                <SelectItem value="DRAFT">Borradores</SelectItem>
                <SelectItem value="FINISHED">Finalizados</SelectItem>
                <SelectItem value="CANCELLED">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de eventos */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando eventos...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl">{event.name}</CardTitle>
                      <Badge className={getStatusColor(event.status)}>{getStatusText(event.status)}</Badge>
                    </div>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.start_date).toLocaleDateString("es-ES")} -{" "}
                        {new Date(event.end_date).toLocaleDateString("es-ES")}
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {event.time_start} - {event.time_end}
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Trophy className="h-4 w-4 mr-2" />
                        Premio:{" "}
                        <span className="font-semibold text-green-600 ml-1">${event.prize_pool.toLocaleString()}</span>
                      </div>

                      <div className="text-sm text-gray-600">
                        Cartones disponibles: <span className="font-semibold">{event.total_cartons}</span>
                      </div>

                      <div className="pt-4">
                        <Link href={`/events/${event.id}`}>
                          <Button className="w-full" disabled={event.status !== "ACTIVE"}>
                            {event.status === "ACTIVE" ? "Ver Cartones" : "No Disponible"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron eventos</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Intenta ajustar tus filtros de búsqueda"
                  : "No hay eventos disponibles en este momento"}
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
