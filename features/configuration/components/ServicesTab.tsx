"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ServiceModal } from "./ServiceModal"

interface Service {
  id: string
  name: string
  durationMinutes: number
  price: number | null
  color: string
  isActive: boolean
}

interface ServicesTabProps {
  orgId: string
}

export function ServicesTab({ orgId }: ServicesTabProps) {
  const [services, setServices] = useState<Service[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Service | null>(null)

  function fetchServices() {
    fetch("/api/services?all=true")
      .then(r => r.json())
      .then(setServices)
  }

  useEffect(() => {
    fetchServices()
  }, [orgId])

  function handleEdit(service: Service) {
    setSelected(service)
    setModalOpen(true)
  }

  function handleNew() {
    setSelected(null)
    setModalOpen(true)
  }

  async function handleToggle(service: Service) {
    await fetch(`/api/services/${service.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !service.isActive }),
    })
    fetchServices()
  }

  async function handleDelete(service: Service) {
    const confirmed = window.confirm(`Eliminar el servicio \"${service.name}\"?`)
    if (!confirmed) return

    const res = await fetch(`/api/services/${service.id}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      alert(payload?.error ?? "No se pudo eliminar el servicio")
      return
    }

    fetchServices()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleNew}>+ Nuevo servicio</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map(service => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: service.color }}
                    />
                    {service.name}
                  </div>
                </TableCell>
                <TableCell>{service.durationMinutes} min</TableCell>
                <TableCell>
                  {service.price ? `$${service.price}` : "—"}
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    service.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {service.isActive ? "Activo" : "Inactivo"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(service)}
                    >
                      {service.isActive ? "Desactivar" : "Activar"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(service)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {services.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-gray-400 py-8">
                  No hay servicios. Creá el primero.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchServices}
        service={selected}
      />
    </div>
  )
}