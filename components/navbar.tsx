"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, Calendar, Ticket } from "lucide-react"
import { apiClient } from "@/lib/api"
import type { User as UserType } from "@/types/api"

export function Navbar() {
  const [user, setUser] = useState<UserType | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    apiClient.logout()
    setUser(null)
    router.push("/auth/login")
  }

  if (!user) {
    return null
  }

  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN"

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/dashboard" className="font-bold text-xl">
          Bingo App
        </Link>

        <div className="ml-auto flex items-center space-x-4">
          <Link href="/events">
            <Button variant="ghost" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Eventos
            </Button>
          </Link>

          {isAdmin && (
            <Link href="/admin/events">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Administrar
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                {user.display_name || user.first_name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/my-tickets">
                  <Ticket className="h-4 w-4 mr-2" />
                  Mis Tickets
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
