import { auth } from "@/shared/lib/auth"
import { getAppointmentsForCalendar } from "@/features/appointments/services/appointments"
import { NextResponse } from "next/server"
import { prisma } from "@/shared/lib/prisma"

async function resolveValidatedOrg(sessionUserId: string, sessionOrgId: string) {
  const user = await prisma.user.findUnique({
    where: { id: sessionUserId },
    select: { orgId: true },
  })

  if (!user) return { error: "Usuario no encontrado", status: 401 as const }
  if (user.orgId !== sessionOrgId) {
    return { error: "Sesión desactualizada", status: 401 as const }
  }

  return { orgId: user.orgId }
}

export async function GET() {
  console.log("GET /api/appointments llamado")
  const session = await auth()
  console.log("orgId en sesión:", session?.user?.orgId)
  
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const orgValidation = await resolveValidatedOrg(session.user.id, session.user.orgId)
  if ("error" in orgValidation) {
    return NextResponse.json({ error: orgValidation.error }, { status: orgValidation.status })
  }

  const appointments = await getAppointmentsForCalendar(orgValidation.orgId)

  return NextResponse.json({
    events: appointments,
    meta: { sessionOutdatedHint: false },
  })
}


export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const orgValidation = await resolveValidatedOrg(session.user.id, session.user.orgId)
  if ("error" in orgValidation) {
    return NextResponse.json({ error: orgValidation.error }, { status: orgValidation.status })
  }

  const { contactId, serviceId, professionalId, price, startsAt, patient, notes } = await req.json()
  const normalizedPatient = typeof patient === "string" ? patient.trim() : ""

  if (!contactId || !serviceId || !professionalId || !startsAt) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios para crear el turno" },
      { status: 400 }
    )
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, orgId: orgValidation.orgId },
  })
  if (!service) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })

  const professional = await prisma.professional.findFirst({
    where: { id: professionalId, orgId: orgValidation.orgId, isActive: true },
    select: { id: true },
  })
  if (!professional) return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 })

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, orgId: orgValidation.orgId },
    select: { id: true },
  })
  if (!contact) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })

  const start = new Date(startsAt)
  if (Number.isNaN(start.getTime())) {
    return NextResponse.json({ error: "Fecha de inicio inválida" }, { status: 400 })
  }

  const end = new Date(start.getTime() + service.durationMinutes * 60000)
  const parsedPrice = Number(price)
  if (Number.isFinite(parsedPrice) && parsedPrice < 0) {
    return NextResponse.json({ error: "El costo no puede ser menor a 0" }, { status: 400 })
  }
  const appointmentPrice = Number.isFinite(parsedPrice) ? parsedPrice : service.price

  const appointmentData = {
    orgId: orgValidation.orgId,
    contactId,
    serviceId,
    professionalId,
    price: appointmentPrice,
    createdById: session.user.id,
    startsAt: start,
    endsAt: end,
    patient: normalizedPatient || null,
    notes,
    additionalNotes: [],
    status: "Confirmado",
  }

  const appointment = await prisma.appointment.create({
    data: appointmentData as any,
  })

  if (normalizedPatient) {
    const contactWithPatients = await prisma.contact.findFirst({
      where: { id: contactId, orgId: orgValidation.orgId },
      select: { id: true, patients: true } as any,
    }) as any

    if (contactWithPatients && !contactWithPatients.patients.includes(normalizedPatient)) {
      await prisma.contact.update({
        where: { id: contactWithPatients.id },
        data: { patients: { push: normalizedPatient } } as any,
      })
    }
  }

  return NextResponse.json(appointment, { status: 201 })
}