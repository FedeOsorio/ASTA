"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface NewAppointmentModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  selectedDate?: Date | null
}

export function NewAppointmentModal({ open, onClose, onCreated, selectedDate }: NewAppointmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [professional, setProfessional] = useState<any[]>([])

  const [form, setForm] = useState({
    contactId: "",
    serviceId: "",
    professionalId: "",
    startsAt: "",
    notes: "",
    price: ""
  })

  useEffect(() => {
    if (open) {
      fetch("/api/contacts").then(r => r.json()).then(setContacts)
      fetch("/api/services").then(r => r.json()).then(setServices)
      fetch("/api/professional").then(r => r.json()).then(setProfessional)
    }
  }, [open])

  useEffect(() => {
    if (selectedDate) {
      const local = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
      setForm(f => ({ ...f, startsAt: local.toISOString().slice(0, 16) }))
    }
  }, [selectedDate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: form.price === "" ? undefined : Number(form.price),
      }),
    })

    if (res.ok) {
      onCreated()
      onClose()
      setForm({ contactId: "", serviceId: "", professionalId: "", startsAt: "", notes: "", price: "" })
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo turno</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select onValueChange={v => setForm(f => ({ ...f, contactId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná un cliente" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Servicio</Label>
            <Select onValueChange={v => setForm(f => ({ ...f, serviceId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná un servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.durationMinutes} min)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Costo</Label>
            <Input
              type="number"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="Costo del servicio"
            />
          </div>

          <div className="space-y-2">
            <Label>Profesional</Label>
            <Select onValueChange={v => setForm(f => ({ ...f, professionalId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná un recurso" />
              </SelectTrigger>
              <SelectContent>
                {professional.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha y hora</Label>
            <Input
              type="datetime-local"
              value={form.startsAt}
              onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              placeholder="Observaciones del turno..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar turno"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}