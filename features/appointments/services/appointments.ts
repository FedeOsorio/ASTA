import { getAppointmentsByOrg } from "@/features/appointments/repositories/appointments"

export async function getAppointmentsForCalendar(orgId: string) {
  const appointments = await getAppointmentsByOrg(orgId)
  
  const events = appointments.map((apt) => ({
    id: apt.id,
    title: apt.contact.name,
    start: apt.startsAt,
    end: apt.endsAt,
    backgroundColor: apt.service.color,
    borderColor: apt.service.color,
    extendedProps: {
      contactId: apt.contactId,
      contactName: apt.contact.name,
      serviceName: apt.service.name,
      serviceId: apt.serviceId,
      professionalId: apt.professionalId,
      professionalName: apt.professional.name,
      contactPhone: apt.contact.phone,
      status: apt.status,
      notes: apt.notes,
      price: (apt as any).price,
    },
  }))

  console.log("eventos:", JSON.stringify(events, null, 2))
  return events
}