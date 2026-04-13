import { getAppointmentsByOrg } from "@/features/appointments/repositories/appointments"

export async function getAppointmentsForCalendar(orgId: string) {
  const appointments = await getAppointmentsByOrg(orgId)
  const now = Date.now()
  
  const events = appointments.map((apt) => {
    const normalizedStatus = String(apt.status).toLowerCase().trim()
    const isCancelled = normalizedStatus === "cancelled" || normalizedStatus === "cancelado"
    const isCompleted = normalizedStatus === "realizado"
    const startMs = new Date(apt.startsAt).getTime()
    const endMs = new Date(apt.endsAt).getTime()
    const isInProgress = !isCancelled && !isCompleted && now >= startMs && now < endMs

    const visualStatus = isCancelled
      ? "Cancelado"
      : isCompleted
        ? "Realizado"
        : isInProgress
          ? "En curso"
          : "Confirmado"

    const statusColors: Record<string, { bg: string; border: string; text?: string }> = {
      Confirmado: { bg: "#dbeafe", border: "#2563eb", text: "#1e3a8a" },
      "En curso": { bg: "#fef3c7", border: "#d97706", text: "#92400e" },
      Realizado: { bg: "#dcfce7", border: "#16a34a", text: "#14532d" },
      Cancelado: { bg: "#f3f4f6", border: "#ef4444", text: "#7f1d1d" },
    }

    const colors = statusColors[visualStatus]

    return {
      id: apt.id,
      title: apt.contact.name,
      start: apt.startsAt,
      end: apt.endsAt,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      textColor: colors.text,
      extendedProps: {
        contactId: apt.contactId,
        contactName: apt.contact.name,
        serviceName: apt.service.name,
        serviceId: apt.serviceId,
        professionalId: apt.professionalId,
        professionalName: apt.professional.name,
        contactPhone: apt.contact.phone,
        status: apt.status,
        visualStatus,
        notes: apt.notes,
        additionalNotes: (apt as any).additionalNotes ?? [],
        price: (apt as any).price,
      },
    }
  })

  console.log("eventos:", JSON.stringify(events, null, 2))
  return events
}