import { auth } from "@/shared/lib/auth"
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const orgValidation = await resolveValidatedOrg(session.user.id, session.user.orgId)
  if ("error" in orgValidation) {
    return NextResponse.json({ error: orgValidation.error }, { status: orgValidation.status })
  }

  const { id } = await params
  const { contactId, serviceId, professionalId, startsAt, notes, status, price } = await req.json()

  const current = await prisma.appointment.findFirst({
    where: { id, orgId: orgValidation.orgId },
    select: { id: true, serviceId: true },
  })
  if (!current) return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 })

  const finalServiceId = serviceId ?? current.serviceId
  const service = await prisma.service.findFirst({
    where: { id: finalServiceId, orgId: orgValidation.orgId },
    select: { durationMinutes: true },
  })
  if (!service) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })

  const nextStart = startsAt ? new Date(startsAt) : undefined
  const nextEnd = nextStart
    ? new Date(nextStart.getTime() + service.durationMinutes * 60000)
    : undefined
  const parsedPrice = Number(price)
  const nextPrice = Number.isFinite(parsedPrice) ? parsedPrice : undefined

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      ...(contactId ? { contactId } : {}),
      ...(serviceId ? { serviceId } : {}),
      ...(professionalId ? { professionalId } : {}),
      ...(typeof notes === "string" ? { notes } : {}),
      ...(nextPrice !== undefined ? { price: nextPrice } : {}),
      ...(nextStart ? { startsAt: nextStart, endsAt: nextEnd } : {}),
      ...(status ? { status } : {}),
    },
  })

  return NextResponse.json(appointment)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const orgValidation = await resolveValidatedOrg(session.user.id, session.user.orgId)
  if ("error" in orgValidation) {
    return NextResponse.json({ error: orgValidation.error }, { status: orgValidation.status })
  }

  const { id } = await params
  const appointment = await prisma.appointment.findFirst({
    where: { id, orgId: orgValidation.orgId },
    select: { id: true },
  })
  if (!appointment) return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 })

  await prisma.appointment.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
