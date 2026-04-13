import { useState } from "react"

interface EditForm {
  contactId: string
  serviceId: string
  professionalId: string
  startsAt: string
  notes: string
  price: string
}

interface SelectedAppointment {
  id: string
  title: string
  start: string
  end: string
  extendedProps: any
}

interface Toast {
  message: string
  type: "error" | "success" | "info"
}

export function useAppointments() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<Toast | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<SelectedAppointment | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<EditForm>({
    contactId: "",
    serviceId: "",
    professionalId: "",
    startsAt: "",
    notes: "",
    price: "",
  })

  async function fetchEvents() {
    setLoading(true)

    try {
      const res = await fetch("/api/appointments")
      if (!res.ok) {
        setEvents([])
        if (res.status === 401) {
          setToast({ message: "Sesión vencida. Cerrar sesión y volver a ingresar.", type: "error" })
        }
        return
      }

      const payload = await res.json()
      const nextEvents = Array.isArray(payload) ? payload : payload.events ?? []
      const shouldWarn =
        !Array.isArray(payload) &&
        Boolean(payload?.meta?.sessionOutdatedHint) &&
        nextEvents.length === 0

      setEvents(nextEvents)
      setToast(
        shouldWarn
          ? { message: "Sesión vencida. Cerrar sesión y volver a ingresar.", type: "error" }
          : null
      )
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAppointment(id: string) {
    const confirmed = window.confirm("¿Querés eliminar este turno?")
    if (!confirmed) return

    const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" })
    if (!res.ok) {
      if (res.status === 401) {
        setToast({ message: "Sesión vencida. Cerrar sesión y volver a ingresar.", type: "error" })
      } else {
        setToast({ message: "No se pudo eliminar el turno.", type: "error" })
      }
      return
    }

    await fetchEvents()
    setToast({ message: "Turno eliminado.", type: "success" })
  }

  async function handleSaveChanges() {
    if (!selectedAppointment) return
    setIsSaving(true)

    const res = await fetch(`/api/appointments/${selectedAppointment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    })

    setIsSaving(false)

    if (!res.ok) {
      if (res.status === 401) {
        setToast({ message: "Sesión vencida. Cerrar sesión y volver a ingresar.", type: "error" })
      } else {
        setToast({ message: "No se pudo guardar la modificación.", type: "error" })
      }
      return
    }

    const updatedAppointment = await res.json()

    setSelectedAppointment({
      ...selectedAppointment,
      extendedProps: {
        ...selectedAppointment.extendedProps,
        contactId: updatedAppointment.contactId,
        serviceId: updatedAppointment.serviceId,
        professionalId: updatedAppointment.professionalId,
        notes: updatedAppointment.notes,
        price: updatedAppointment.price,
      },
    })

    setIsEditing(false)
    await fetchEvents()
    setToast({ message: "Turno actualizado.", type: "success" })
  }

  async function handleCancelAppointment() {
    if (!selectedAppointment) return
    setIsSaving(true)

    const res = await fetch(`/api/appointments/${selectedAppointment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    })

    setIsSaving(false)

    if (!res.ok) {
      if (res.status === 401) {
        setToast({ message: "Sesión vencida. Cerrar sesión y volver a ingresar.", type: "error" })
      } else {
        setToast({ message: "No se pudo cancelar el turno.", type: "error" })
      }
      return
    }

    await fetchEvents()
    setToast({ message: "Turno cancelado.", type: "success" })
  }

  function startEditing() {
    if (!selectedAppointment) return

    setEditForm({
      contactId: selectedAppointment.extendedProps.contactId,
      serviceId: selectedAppointment.extendedProps.serviceId,
      professionalId: selectedAppointment.extendedProps.professionalId,
      startsAt: toInputDateTime(selectedAppointment.start),
      notes: selectedAppointment.extendedProps.notes ?? "",
      price: selectedAppointment.extendedProps.price ?? "",
    })
    setIsEditing(true)
  }

  return {
    events,
    setEvents,
    loading,
    toast,
    setToast,
    selectedAppointment,
    setSelectedAppointment,
    isEditing,
    setIsEditing,
    isSaving,
    editForm,
    setEditForm,
    fetchEvents,
    handleDeleteAppointment,
    handleSaveChanges,
    handleCancelAppointment,
    startEditing,
  }
}

function toInputDateTime(value: string | Date) {
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}
