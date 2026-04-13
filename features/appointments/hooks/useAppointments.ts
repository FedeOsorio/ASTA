import { useState } from "react"

interface EditForm {
  contactId: string
  serviceId: string
  professionalId: string
  startsAt: string
  patient: string
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
  const [isAddingNotesOnly, setIsAddingNotesOnly] = useState(false)
  const [editForm, setEditForm] = useState<EditForm>({
    contactId: "",
    serviceId: "",
    professionalId: "",
    startsAt: "",
    patient: "",
    notes: "",
    price: "",
  })

  async function fetchEvents(options?: { silent?: boolean }) {
    const silent = options?.silent === true
    if (!silent) setLoading(true)

    try {
      const res = await fetch("/api/appointments")
      if (!res.ok) {
        setEvents([])
        if (res.status === 401) {
          setToast({ message: "Sesión vencida. Cierre sesión y vuelva a ingresar.", type: "error" })
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
      if (!silent) setLoading(false)
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

    await fetchEvents({ silent: true })
    setToast({ message: "Turno eliminado.", type: "success" })
  }

  async function handleSaveChanges() {
    if (!selectedAppointment) return

    if (!isAddingNotesOnly && editForm.price !== "" && Number(editForm.price) < 0) {
      setToast({ message: "El costo no puede ser menor a 0.", type: "error" })
      return
    }

    let payload: Record<string, unknown> = { ...editForm }

    if (isAddingNotesOnly) {
      const newNote = editForm.notes.trim()
      if (!newNote) {
        setToast({ message: "Escribí una nota adicional para guardar.", type: "error" })
        return
      }

      payload = {
        additionalNote: newNote,
      }
    }

    setIsSaving(true)

    const res = await fetch(`/api/appointments/${selectedAppointment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
        patient: (updatedAppointment as any).patient,
        notes: updatedAppointment.notes,
        additionalNotes: (updatedAppointment as any).additionalNotes ?? selectedAppointment.extendedProps.additionalNotes,
        price: updatedAppointment.price,
      },
    })

    setIsEditing(false)
    setIsAddingNotesOnly(false)
    await fetchEvents({ silent: true })
    setToast({ message: "Turno actualizado.", type: "success" })
  }

  async function handleCancelAppointment(onSuccess?: () => void) {
    if (!selectedAppointment) return

    const confirmed = window.confirm("¿Querés cancelar este turno?")
    if (!confirmed) return

    setIsSaving(true)

    const res = await fetch(`/api/appointments/${selectedAppointment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Cancelado" }),
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

    onSuccess?.()
    setIsAddingNotesOnly(false)
    setSelectedAppointment(null)
    await fetchEvents({ silent: true })
    setToast({ message: "Turno cancelado.", type: "success" })
  }

  async function handleCompleteAppointment(onSuccess?: () => void) {
    if (!selectedAppointment) return

    const confirmed = window.confirm("¿Querés marcar este turno como realizado?")
    if (!confirmed) return

    setIsSaving(true)

    const res = await fetch(`/api/appointments/${selectedAppointment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Realizado" }),
    })

    setIsSaving(false)

    if (!res.ok) {
      if (res.status === 401) {
        setToast({ message: "Sesión vencida. Cerrar sesión y volver a ingresar.", type: "error" })
      } else {
        setToast({ message: "No se pudo finalizar el turno.", type: "error" })
      }
      return
    }

    onSuccess?.()
    setIsAddingNotesOnly(false)
    setSelectedAppointment(null)
    await fetchEvents({ silent: true })
    setToast({ message: "Turno marcado como realizado.", type: "success" })
  }

  function cancelEditing() {
    setIsEditing(false)
    setIsAddingNotesOnly(false)

    if (!selectedAppointment) return

    setEditForm({
      contactId: selectedAppointment.extendedProps.contactId,
      serviceId: selectedAppointment.extendedProps.serviceId,
      professionalId: selectedAppointment.extendedProps.professionalId,
      startsAt: toInputDateTime(selectedAppointment.start),
      patient: selectedAppointment.extendedProps.patient ?? "",
      notes: selectedAppointment.extendedProps.notes ?? "",
      price: selectedAppointment.extendedProps.price ?? "",
    })
  }

  function startEditing() {
    if (!selectedAppointment) return

    const normalizedStatus = String(selectedAppointment.extendedProps.status ?? "").trim().toLowerCase()
    const completed = normalizedStatus === "realizado"

    setEditForm({
      contactId: selectedAppointment.extendedProps.contactId,
      serviceId: selectedAppointment.extendedProps.serviceId,
      professionalId: selectedAppointment.extendedProps.professionalId,
      startsAt: toInputDateTime(selectedAppointment.start),
      patient: selectedAppointment.extendedProps.patient ?? "",
      notes: completed ? "" : (selectedAppointment.extendedProps.notes ?? ""),
      price: selectedAppointment.extendedProps.price ?? "",
    })
    setIsAddingNotesOnly(completed)
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
    isAddingNotesOnly,
    editForm,
    setEditForm,
    fetchEvents,
    handleDeleteAppointment,
    handleSaveChanges,
    handleCancelAppointment,
    handleCompleteAppointment,
    cancelEditing,
    startEditing,
  }
}

function toInputDateTime(value: string | Date) {
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}
