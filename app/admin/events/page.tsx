"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Calendar, Trophy } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { apiClient } from "@/lib/api"
import type { BingoEvent, CreateEventRequest } from "@/types/api"

export default function AdminEventsPage() {
  const [events, setEvents] = useState<BingoEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState<CreateEventRequest>({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    time_start: "",
    time_end: "",
    status: "DRAFT",
    prize_pool: 0,
    commission: 0,
    total_cartons: 0,
  })

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const eventsData = await apiClient.getEvents()
      setEvents(eventsData)
    } catch (error) {
      console.error("Error loading events:", error)
      setError("Error al cargar los eventos")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError("")

    try {
      await apiClient.createEvent(formData)
      setSuccess("Evento creado exitosamente")
      setShowCreateForm(false)
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        time_start: "",
        time_end: "",
        status: "DRAFT",
        prize_pool: 0,
        commission: 0,
        total_cartons: 0,
      })
      await loadEvents()
    } catch (error) {
      setError("Error al crear el evento")
    } finally {
      setCreating(false)
    }
  }

  const handleStatusChange = async (eventId: string, newStatus: BingoEvent["status"]) => {
    try {
      await apiClient.updateEventStatus(eventId, newStatus)
      setSuccess("Estado del evento actualizado")
      await loadEvents()
    } catch (error) {
      setError("Error al actualizar el estado del evento")
    }
  }

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
    <AuthGuard requiredRole={["SUPER_ADMIN", "ADMIN"]}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Administración de Eventos</h1>
                <p className="text-gray-600">Gestiona los eventos de bingo</p>
              </div>
              <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Evento
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Formulario de creación */}
          {showCreateForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Crear Nuevo Evento</CardTitle>
                <CardDescription>Completa la información para crear un nuevo evento de bingo</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre del Evento</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Bingo de Año Nuevo"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="prize_pool">Premio Total</Label>
                      <Input
                        id="prize_pool"
                        type="number"
                        value={formData.prize_pool}
                        onChange={(e) => setFormData((prev) => ({ ...prev, prize_pool: Number(e.target.value) }))}
                        placeholder="100000"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="start_date">Fecha de Inicio</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="end_date">Fecha de Fin</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="time_start">Hora de Inicio</Label>
                      <Input
                        id="time_start"
                        type="time"
                        value={formData.time_start}
                        onChange={(e) => setFormData((prev) => ({ ...prev, time_start: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="time_end">Hora de Fin</Label>
                      <Input
                        id="time_end"
                        type="time"
                        value={formData.time_end}
                        onChange={(e) => setFormData((prev) => ({ ...prev, time_end: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="total_cartons">Total de Cartones</Label>
                      <Input
                        id="total_cartons"
                        type="number"
                        value={formData.total_cartons}
                        onChange={(e) => setFormData((prev) => ({ ...prev, total_cartons: Number(e.target.value) }))}
                        placeholder="100"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="commission">Comisión (%)</Label>
                      <Input
                        id="commission"
                        type="number"
                        step="0.01"
                        value={formData.commission}
                        onChange={(e) => setFormData((prev) => ({ ...prev, commission: Number(e.target.value) }))}
                        placeholder="10.5"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción del evento..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={creating}>
                      {creating ? "Creando..." : "Crear Evento"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de eventos */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando eventos...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{event.name}</CardTitle>
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
                        <Trophy className="h-4 w-4 mr-2" />${event.prize_pool.toLocaleString()}
                      </div>

                      <div className="text-sm text-gray-600">Cartones: {event.total_cartons}</div>

                      <div className="pt-4 space-y-2">
                        <Select
                          value={event.status}
                          onValueChange={(value) => handleStatusChange(event.id, value as BingoEvent["status"])}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DRAFT">Borrador</SelectItem>
                            <SelectItem value="ACTIVE">Activo</SelectItem>
                            <SelectItem value="FINISHED">Finalizado</SelectItem>
                            <SelectItem value="CANCELLED">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay eventos</h3>
              <p className="text-gray-600">Crea tu primer evento de bingo</p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
