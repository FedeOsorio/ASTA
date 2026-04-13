"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface AppointmentDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedAppointment: any
  isEditing: boolean
  onStartEditing: () => void
  isSaving: boolean
  isAddingNotesOnly: boolean
  editForm: any
  onEditFormChange: (form: any) => void
  onSaveChanges: () => void
  onCancelEditing: () => void
  onCancelAppointment: () => void
  onCompleteAppointment: () => void
  onSendConfirmation: () => void
  onSendReminder: () => void
}

export function AppointmentDetailsDialog({
  open,
  onOpenChange,
  selectedAppointment,
  isEditing,
  onStartEditing,
  isSaving,
  isAddingNotesOnly,
  editForm,
  onEditFormChange,
  onSaveChanges,
  onCancelEditing,
  onCancelAppointment,
  onCompleteAppointment,
  onSendConfirmation,
  onSendReminder,
}: AppointmentDetailsDialogProps) {
  const [contacts, setContacts] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (open && !isEditing) {
      loadDropdownData()
    }
  }, [open, isEditing])

  useEffect(() => {
    if (!open) return

    setNow(new Date())
    const nowMs = Date.now()
    const startMs = selectedAppointment?.start ? new Date(selectedAppointment.start).getTime() : NaN
    const endMs = selectedAppointment?.end ? new Date(selectedAppointment.end).getTime() : NaN

    const nextBoundary = [startMs, endMs]
      .filter((time) => Number.isFinite(time) && time > nowMs)
      .sort((a, b) => a - b)[0]

    if (!nextBoundary) return

    const delay = Math.max(250, nextBoundary - nowMs + 250)
    const timer = window.setTimeout(() => {
      setNow(new Date())
    }, delay)

    return () => window.clearTimeout(timer)
  }, [open, selectedAppointment?.start, selectedAppointment?.end])

  async function loadDropdownData() {
    const [contactsRes, servicesRes, professionalsRes] = await Promise.all([
      fetch("/api/contacts"),
      fetch("/api/services"),
      fetch("/api/professionals"),
    ])

    if (contactsRes.ok) setContacts(await contactsRes.json())
    if (servicesRes.ok) setServices(await servicesRes.json())
    if (professionalsRes.ok) setProfessionals(await professionalsRes.json())
  }

  if (!selectedAppointment) return null

  const rawStatus = String(selectedAppointment.extendedProps.status ?? "")
  const normalizedStatus = rawStatus.trim().toLowerCase()
  const isCanceled = normalizedStatus === "cancelado" || normalizedStatus === "cancelled"
  const isCompleted = normalizedStatus === "realizado"
  const startsAt = selectedAppointment.start ? new Date(selectedAppointment.start) : null
  const endsAt = selectedAppointment.end ? new Date(selectedAppointment.end) : null
  const isInProgress =
    !isCanceled &&
    !isCompleted &&
    !!startsAt &&
    !!endsAt &&
    now >= startsAt &&
    now < endsAt

  const displayStatus = isCompleted
    ? "Realizado"
    : isCanceled
      ? "Cancelado"
      : isInProgress
        ? "En curso"
        : "Confirmado"

  const additionalNotes = Array.isArray(selectedAppointment.extendedProps.additionalNotes)
    ? selectedAppointment.extendedProps.additionalNotes
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex-row items-center justify-between pr-10">
          <DialogTitle>Detalle del turno</DialogTitle>
          {!isEditing && !isCompleted && (
            <Button size="sm" variant="outline" onClick={onStartEditing}>
              Modificar
            </Button>
          )}
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Cliente</Label>
            {isEditing && !isCompleted ? (
              <Select
                value={editForm.contactId}
                onValueChange={(v) => onEditFormChange({ ...editForm, contactId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-700">{selectedAppointment.extendedProps.contactName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Servicio</Label>
            {isEditing && !isCompleted ? (
              <Select
                value={editForm.serviceId}
                onValueChange={(v) => onEditFormChange({ ...editForm, serviceId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-700">{selectedAppointment.extendedProps.serviceName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Profesional</Label>
            {isEditing && !isCompleted ? (
              <Select
                value={editForm.professionalId}
                onValueChange={(v) => onEditFormChange({ ...editForm, professionalId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná un profesional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-700">{selectedAppointment.extendedProps.professionalName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Fecha y hora</Label>
            {isEditing && !isCompleted ? (
              <Input
                type="datetime-local"
                value={editForm.startsAt}
                onChange={(e) => onEditFormChange({ ...editForm, startsAt: e.target.value })}
              />
            ) : (
              <p className="text-sm text-gray-700">
                {new Date(selectedAppointment.start).toLocaleString("es-AR")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Costo del servicio</Label>
            {isEditing && !isCompleted ? (
              <Input
                type="number"
                step="0.01"
                value={editForm.price}
                onChange={(e) => onEditFormChange({ ...editForm, price: e.target.value })}
              />
            ) : (
              <p className="text-sm text-gray-700">${selectedAppointment.extendedProps.price || "-"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <p className="text-sm text-gray-700">{displayStatus}</p>
          </div>

          <div className="space-y-2">
            <Label>Nota principal</Label>
            {isEditing && !isAddingNotesOnly ? (
              <Textarea
                value={editForm.notes}
                onChange={(e) => onEditFormChange({ ...editForm, notes: e.target.value })}
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-700">{selectedAppointment.extendedProps.notes || "-"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Notas adicionales</Label>
            {isEditing && isAddingNotesOnly ? (
              <Textarea
                value={editForm.notes}
                onChange={(e) => onEditFormChange({ ...editForm, notes: e.target.value })}
                placeholder="Agregá una nota adicional del turno..."
                rows={3}
              />
            ) : additionalNotes.length > 0 ? (
              <div className="space-y-1 rounded-md border border-gray-200 bg-gray-50 p-2">
                {additionalNotes.map((note: string, index: number) => (
                  <p key={`${index}-${note.slice(0, 20)}`} className="text-sm text-gray-700">
                    {index + 1}. {note}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sin notas adicionales.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {isEditing ? (
              <>
                <Button size="sm" onClick={onSaveChanges} disabled={isSaving}>
                  {isSaving ? "Guardando..." : isAddingNotesOnly ? "Guardar nota" : "Guardar"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCancelEditing}
                  disabled={isSaving}
                >
                  Cancelar modificación
                </Button>
              </>
            ) : (
              <>
                {isCompleted ? (
                  <Button size="sm" variant="outline" onClick={onStartEditing}>
                    Agregar notas adicionales
                  </Button>
                ) : isInProgress ? (
                  <>
                    <Button size="sm" onClick={onCompleteAppointment} disabled={isSaving}>
                      Finalizar turno
                    </Button>
                    <Button size="sm" variant="destructive" onClick={onCancelAppointment} disabled={isSaving}>
                      Cancelar turno
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={onSendConfirmation}>
                      Enviar confirmación
                    </Button>
                    <Button size="sm" variant="outline" onClick={onSendReminder}>
                      Enviar recordatorio
                    </Button>
                    <Button size="sm" variant="destructive" onClick={onCancelAppointment} disabled={isSaving}>
                      Cancelar turno
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
