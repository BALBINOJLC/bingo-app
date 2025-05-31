"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, CreditCard, Shield } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { apiClient } from "@/lib/api"
import type { User as UserType } from "@/types/api"

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    display_name: "",
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = localStorage.getItem("user")
        if (userData) {
          const parsedUser = JSON.parse(userData) as UserType
          setUser(parsedUser)
          setFormData({
            first_name: parsedUser.first_name,
            last_name: parsedUser.last_name,
            display_name: parsedUser.display_name || "",
          })
        }

        // Obtener datos actualizados del servidor
        const profileData = await apiClient.getProfile()
        setUser(profileData)
        setFormData({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          display_name: profileData.display_name || "",
        })
      } catch (error) {
        console.error("Error loading profile:", error)
        setError("Error al cargar el perfil")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setError("")

    try {
      const updatedUser = await apiClient.updateProfile(formData)
      setUser(updatedUser)

      // Actualizar datos en localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser))

      setSuccess("Perfil actualizado exitosamente")
    } catch (error) {
      setError("Error al actualizar el perfil")
    } finally {
      setUpdating(false)
    }
  }

  const getRoleText = (role: UserType["role"]) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Administrador"
      case "ADMIN":
        return "Administrador"
      case "CLIENT":
        return "Cliente"
      default:
        return role
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando perfil...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!user) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar perfil</h2>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
            <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información de la cuenta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información de Cuenta
                </CardTitle>
                <CardDescription>Datos básicos de tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">DNI</p>
                    <p className="text-sm text-gray-600">{user.dni}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Rol</p>
                    <p className="text-sm text-gray-600">{getRoleText(user.role)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email verificado</span>
                    <span className={`text-sm ${user.email_verify ? "text-green-600" : "text-red-600"}`}>
                      {user.email_verify ? "Sí" : "No"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium">Cuenta activa</span>
                    <span className={`text-sm ${user.is_active ? "text-green-600" : "text-red-600"}`}>
                      {user.is_active ? "Sí" : "No"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulario de edición */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Editar Perfil</CardTitle>
                <CardDescription>Actualiza tu información personal</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">Nombre</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                        placeholder="Tu nombre"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="last_name">Apellido</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Tu apellido"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="display_name">Nombre para mostrar</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Nombre que aparecerá en la aplicación"
                    />
                    <p className="text-sm text-gray-500 mt-1">Si no se especifica, se usará tu nombre completo</p>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={updating}>
                      {updating ? "Actualizando..." : "Guardar Cambios"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setFormData({
                          first_name: user.first_name,
                          last_name: user.last_name,
                          display_name: user.display_name || "",
                        })
                      }
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
