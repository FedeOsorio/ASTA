type WhatsappMessageKind = "confirmation" | "reminder"

interface WhatsappAppointmentLike {
  title: string
  start: string
  extendedProps: {
    contactPhone?: string | null
    patient?: string | null
  }
}

export function normalizeWhatsappPhone(phone?: string | null) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 8 ? digits : null
}

export function buildAppointmentWhatsappMessage(
  appointment: WhatsappAppointmentLike,
  kind: WhatsappMessageKind
) {
  const startDate = new Date(appointment.start)
  const date = startDate.toLocaleDateString("es-AR")
  const hour = startDate.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const patient = appointment.extendedProps.patient?.trim()
  const subject = patient
    ? `el turno de ${patient}`
    : "su turno"

  if (kind === "confirmation") {
    return `Hola ${appointment.title}, ${subject} para el día ${date} a las ${hour} hs ya fue confirmado.`
  }

  return `Hola ${appointment.title}, le recordamos ${subject} para el día ${date} a las ${hour} hs.`
}

export function buildAppointmentWhatsappUrl(
  appointment: WhatsappAppointmentLike,
  kind: WhatsappMessageKind
) {
  const phone = normalizeWhatsappPhone(appointment.extendedProps.contactPhone)
  if (!phone) return null

  const message = buildAppointmentWhatsappMessage(appointment, kind)
  return `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
}
