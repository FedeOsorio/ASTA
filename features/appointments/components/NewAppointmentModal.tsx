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

interface Contact {
  id: string
  name: string
  phone?: string | null
}

export function NewAppointmentModal({ open, onClose, onCreated, selectedDate }: NewAppointmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [services, setServices] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [showNewContact, setShowNewContact] = useState(false)
  const [newContactName, setNewContactName] = useState("")
  const [newContactPhone, setNewContactPhone] = useState("")
  const [creatingContact, setCreatingContact] = useState(false)

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
      fetch("/api/professionals").then(r => r.json()).then(setProfessionals)
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

    if (form.price !== "" && Number(form.price) < 0) {
      alert("El costo del servicio no puede ser menor a 0.")
      return
    }

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
      setNewContactName("")
      setNewContactPhone("")
      setShowNewContact(false)
    }

    setLoading(false)
  }

  async function handleQuickCreateContact() {
    if (newContactName.trim() === "") {
      alert("El nombre del cliente es obligatorio")
      return
    }

    setCreatingContact(true)

    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newContactName,
        phone: newContactPhone === "" ? undefined : newContactPhone,
      }),
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      alert(payload?.error ?? "No se pudo crear el cliente")
      setCreatingContact(false)
      return
    }

    const createdContact = await res.json()
    setContacts(prev => [createdContact, ...prev].sort((a, b) => a.name.localeCompare(b.name)))
    setForm(prev => ({ ...prev, contactId: createdContact.id }))
    setNewContactName("")
    setNewContactPhone("")
    setCreatingContact(false)
    setShowNewContact(false)
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
            {showNewContact ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newContactName}
                    onChange={e => setNewContactName(e.target.value)}
                    placeholder="Nombre *"
                    className="flex-1"
                  />
                  <Input
                    value={newContactPhone}
                    onChange={e => setNewContactPhone(e.target.value)}
                    placeholder="Teléfono"
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleQuickCreateContact}
                    disabled={creatingContact}
                  >
                    {creatingContact ? "Guardando..." : "Guardar cliente"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => { setShowNewContact(false); setNewContactName(""); setNewContactPhone("") }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Select value={form.contactId} onValueChange={v => setForm(f => ({ ...f, contactId: v }))}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccioná un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewContact(true)}
                >
                  + Cliente
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Servicio</Label>
            <Select
              value={form.serviceId}
              onValueChange={v => {
                const service = services.find(s => s.id === v)
                setForm(f => ({
                  ...f,
                  serviceId: v,
                  price: service?.price != null ? String(service.price) : f.price,
                }))
              }}
            >
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
              step="0.01"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="Costo del servicio"
            />
          </div>

          <div className="space-y-2">
            <Label>Profesional</Label>
            <Select value={form.professionalId} onValueChange={v => setForm(f => ({ ...f, professionalId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná un recurso" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map(r => (
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