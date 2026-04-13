"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Service {
  id: string
  name: string
  durationMinutes: number
  price: number | null
  color: string
  isActive: boolean
}

interface ServiceModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  service: Service | null
}

export function ServiceModal({ open, onClose, onSaved, service }: ServiceModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    durationMinutes: "30",
    price: "",
    color: "#378ADD",
  })

  useEffect(() => {
    if (service) {
      setForm({
        name: service.name,
        durationMinutes: String(service.durationMinutes),
        price: service.price ? String(service.price) : "",
        color: service.color,
      })
    } else {
      setForm({ name: "", durationMinutes: "30", price: "", color: "#378ADD" })
    }
  }, [service, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (form.price !== "" && Number(form.price) < 0) {
      alert("El costo no puede ser menor a 0")
      return
    }

    setLoading(true)

    const body = {
      name: form.name,
      durationMinutes: Number(form.durationMinutes),
      price: form.price === "" ? null : Number(form.price),
      color: form.color,
    }

    const url = service ? `/api/services/${service.id}` : "/api/services"
    const method = service ? "PATCH" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      onSaved()
      onClose()
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{service ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Consulta general"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Duración (minutos)</Label>
            <Input
              type="number"
              value={form.durationMinutes}
              onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))}
              min="5"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Precio</Label>
            <Input
              type="number"
              min="0"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="Opcional"
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                className="w-10 h-10 rounded cursor-pointer border border-gray-200"
              />
              <span className="text-sm text-gray-500">{form.color}</span>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}