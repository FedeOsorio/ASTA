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

  const { contactId, serviceId, professionalId, price, startsAt, notes } = await req.json()

  const service = await prisma.service.findFirst({
    where: { id: serviceId, orgId: orgValidation.orgId },
  })
  if (!service) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })

  const start = new Date(startsAt)
  const end = new Date(start.getTime() + service.durationMinutes * 60000)
  const parsedPrice = Number(price)
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
    notes,
    status: "Confirmado",
  }

  const appointment = await prisma.appointment.create({
    data: appointmentData as any,
  })

  return NextResponse.json(appointment, { status: 201 })
}