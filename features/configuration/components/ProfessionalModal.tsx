"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Professional {
  id: string
  name: string
  description: string | null
  color: string
  isActive: boolean
}

interface ProfessionalModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  professional: Professional | null
}

export function ProfessionalModal({ open, onClose, onSaved, professional }: ProfessionalModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#6366f1",
  })

  useEffect(() => {
    if (professional) {
      setForm({
        name: professional.name,
        description: professional.description ?? "",
        color: professional.color,
      })
    } else {
      setForm({ name: "", description: "", color: "#6366f1" })
    }
  }, [professional, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const body = {
      name: form.name,
      description: form.description || null,
      color: form.color,
    }

    const url = professional ? `/api/professionals/${professional.id}` : "/api/professionals"
    const method = professional ? "PATCH" : "POST"

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
          <DialogTitle>{professional ? "Editar profesional" : "Nuevo profesional"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Dr. Pérez"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Opcional"
              rows={2}
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