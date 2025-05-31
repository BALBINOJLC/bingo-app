"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  Clock,
  Trophy,
  CreditCard,
  ArrowLeft,
  Copy,
  CheckCircle,
  Phone,
  Hash,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { apiClient } from "@/lib/api"
import type { BingoEvent, Carton, User, PurchaseRequest } from "@/types/api"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<BingoEvent | null>(null)
  const [cartons, setCartons] = useState<Carton[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [selectedCarton, setSelectedCarton] = useState<Carton | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [paymentData, setPaymentData] = useState({
    amount_payment: 0,
    reference_payment: "",
    number_payment: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Datos de transferencia (estos podrían venir de una configuración o API)
  const transferData = {
    bankName: "Banco de Venezuela",
    accountType: "Cuenta Corriente",
    accountNumber: "0102-0000-1234567890",
    accountHolder: "BINGO APP C.A.",
    rif: "J-12345678-9",
    phone: "0424-1234567",
  }

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    const loadEventData = async () => {
      try {
        const eventId = params.id as string
        const [eventData, cartonsData] = await Promise.all([
          apiClient.getEvent(eventId),
          apiClient.getAvailableCartons(eventId),
        ])

        setEvent(eventData)
        setCartons(cartonsData)
      } catch (error) {
        console.error("Error loading event data:", error)
        setError("Error al cargar los datos del evento")
      } finally {
        setLoading(false)
      }
    }

    loadEventData()
  }, [params.id])

  const handlePurchase = async () => {
    if (!selectedCarton || !user) return

    setPurchasing(true)
    setError("")

    try {
      const purchaseRequest: PurchaseRequest = {
        user_id: user.id,
        carton_id: selectedCarton.id,
        amount_payment: paymentData.amount_payment,
        reference_payment: paymentData.reference_payment,
        number_payment: paymentData.number_payment,
      }

      await apiClient.purchaseCarton(purchaseRequest)
      setSuccess("¡Cartón comprado exitosamente!")
      setIsModalOpen(false)
      setSelectedCarton(null)
      setPaymentData({
        amount_payment: 0,
        reference_payment: "",
        number_payment: "",
      })

      // Recargar cartones disponibles
      const eventId = params.id as string
      const updatedCartons = await apiClient.getAvailableCartons(eventId)
      setCartons(updatedCartons)
    } catch (error) {
      setError("Error al procesar la compra. Verifica los datos de pago.")
    } finally {
      setPurchasing(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Error copying to clipboard:", err)
    }
  }

  const openPurchaseModal = (carton: Carton) => {
    setSelectedCarton(carton)
    setPaymentData({
      amount_payment: carton.price,
      reference_payment: "",
      number_payment: "",
    })
    setIsModalOpen(true)
  }

  const renderCartonNumbers = (numbers: number[][]) => {
    return (
      <div className="grid grid-cols-5 gap-1 text-xs">
        {numbers.map((column, colIndex) =>
          Array.isArray(column) ? column.map((number, rowIndex) => (
            <div
              key={`${colIndex}-${rowIndex}`}
              className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-center font-mono text-xs"
            >
              {number || ""}
            </div>
          )) : null
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando evento...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!event) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Evento no encontrado</h2>
              <Link href="/events">
                <Button>Volver a Eventos</Button>
              </Link>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/events">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Eventos
              </Button>
            </Link>
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

          {/* Información del evento */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl mb-2">{event.name}</CardTitle>
                  <CardDescription className="text-lg">{event.description}</CardDescription>
                </div>
                <Badge className={event.status === "ACTIVE" ? "bg-green-500" : "bg-gray-500"}>
                  {event.status === "ACTIVE" ? "Activo" : event.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <p className="font-semibold">Fechas</p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.start_date).toLocaleDateString("es-ES")} -{" "}
                      {new Date(event.end_date).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <p className="font-semibold">Horario</p>
                    <p className="text-sm text-gray-600">
                      {event.time_start} - {event.time_end}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Trophy className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <p className="font-semibold">Premio</p>
                    <p className="text-lg font-bold text-green-600">${event.prize_pool.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <p className="font-semibold">Cartones</p>
                    <p className="text-sm text-gray-600">{cartons.length} disponibles</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cartones disponibles */}
          <Card>
            <CardHeader>
              <CardTitle>Cartones Disponibles</CardTitle>
              <CardDescription>Selecciona y compra tus cartones para participar en el evento</CardDescription>
            </CardHeader>
            <CardContent>
              {cartons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {cartons.map((carton) => (
                    <Card key={carton.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm">#{carton.id}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            ${(carton.price || 10000).toLocaleString()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="mb-3">{renderCartonNumbers(carton.numbers)}</div>

                        <Dialog
                          open={isModalOpen && selectedCarton?.id === carton.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setIsModalOpen(false)
                              setSelectedCarton(null)
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => openPurchaseModal(carton)}
                              disabled={event.status !== "ACTIVE"}
                            >
                              {event.status === "ACTIVE" ? "Comprar" : "No Disponible"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Comprar Cartón #{carton.id}</DialogTitle>
                              <DialogDescription>
                                Completa los datos de pago para adquirir este cartón
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                              {/* Datos de transferencia */}
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Datos para Transferencia
                                </h3>

                                <div className="space-y-3 text-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="text-blue-700">Banco:</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{transferData.bankName}</span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(transferData.bankName, "bank")}
                                      >
                                        {copiedField === "bank" ? (
                                          <CheckCircle className="h-3 w-3 text-green-600" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-center">
                                    <span className="text-blue-700">Tipo:</span>
                                    <span className="font-medium">{transferData.accountType}</span>
                                  </div>

                                  <div className="flex justify-between items-center">
                                    <span className="text-blue-700">Cuenta:</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium font-mono">{transferData.accountNumber}</span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(transferData.accountNumber, "account")}
                                      >
                                        {copiedField === "account" ? (
                                          <CheckCircle className="h-3 w-3 text-green-600" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-center">
                                    <span className="text-blue-700">Titular:</span>
                                    <span className="font-medium">{transferData.accountHolder}</span>
                                  </div>

                                  <div className="flex justify-between items-center">
                                    <span className="text-blue-700">RIF:</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{transferData.rif}</span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(transferData.rif, "rif")}
                                      >
                                        {copiedField === "rif" ? (
                                          <CheckCircle className="h-3 w-3 text-green-600" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-center">
                                    <span className="text-blue-700">Teléfono:</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{transferData.phone}</span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(transferData.phone, "phone")}
                                      >
                                        {copiedField === "phone" ? (
                                          <CheckCircle className="h-3 w-3 text-green-600" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Información del cartón */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Cartón Seleccionado</h3>
                                <div className="mb-3">{renderCartonNumbers(carton.numbers)}</div>
                                <p className="text-lg font-bold text-green-600">
                                  Precio: ${(carton.price || 10000).toLocaleString()}
                                </p>
                              </div>

                              {/* Formulario de pago */}
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="amount" className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Monto Transferido
                                  </Label>
                                  <Input
                                    id="amount"
                                    type="text"
                                    value={paymentData.amount_payment}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/[^0-9]/g, '')
                                      setPaymentData((prev) => ({
                                        ...prev,
                                        amount_payment: value ? parseInt(value) : 0,
                                      }))
                                    }}
                                    placeholder="10000"
                                    required
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="reference" className="flex items-center">
                                    <Hash className="h-4 w-4 mr-1" />
                                    Referencia de Pago
                                  </Label>
                                  <Input
                                    id="reference"
                                    type="text"
                                    value={paymentData.reference_payment}
                                    onChange={(e) =>
                                      setPaymentData((prev) => ({
                                        ...prev,
                                        reference_payment: e.target.value,
                                      }))
                                    }
                                    placeholder="Ej: 123456789"
                                    required
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="number" className="flex items-center">
                                    <Phone className="h-4 w-4 mr-1" />
                                    Número de Teléfono
                                  </Label>
                                  <Input
                                    id="number"
                                    type="text"
                                    value={paymentData.number_payment}
                                    onChange={(e) =>
                                      setPaymentData((prev) => ({
                                        ...prev,
                                        number_payment: e.target.value,
                                      }))
                                    }
                                    placeholder="Ej: 04247317562"
                                    required
                                  />
                                </div>

                                <div className="flex gap-3 pt-4">
                                  <Button
                                    onClick={handlePurchase}
                                    disabled={
                                      purchasing ||
                                      !paymentData.amount_payment ||
                                      !paymentData.reference_payment ||
                                      !paymentData.number_payment
                                    }
                                    className="flex-1"
                                  >
                                    {purchasing ? "Procesando..." : "Confirmar Compra"}
                                  </Button>
                                  <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={purchasing}>
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay cartones disponibles</h3>
                  <p>Este evento no tiene cartones disponibles en este momento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
