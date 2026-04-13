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

function normalizeStatus(status: unknown) {
  if (typeof status !== "string") return undefined

  const normalized = status.trim().toLowerCase()
  if (normalized === "cancelled" || normalized === "cancelado") return "Cancelado"
  if (normalized === "realizado") return "Realizado"
  if (normalized === "confirmado") return "Confirmado"
  if (normalized === "nuevo" || normalized === "new") return "Nuevo"

  return status
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
  const { contactId, serviceId, professionalId, startsAt, patient, notes, status, price, additionalNote } = await req.json()
  const normalizedStatus = normalizeStatus(status)
  const normalizedPatient = typeof patient === "string" ? patient.trim() : ""

  const current = await prisma.appointment.findFirst({
    where: { id, orgId: orgValidation.orgId },
    select: { id: true, serviceId: true, contactId: true, status: true },
  })
  if (!current) return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 })

  const currentStatus = normalizeStatus(current.status)
  if (currentStatus === "Realizado") {
    const tryingToEditCoreFields =
      contactId !== undefined ||
      serviceId !== undefined ||
      professionalId !== undefined ||
      startsAt !== undefined ||
      patient !== undefined ||
      price !== undefined

    const tryingToChangeFinalStatus = normalizedStatus !== undefined && normalizedStatus !== "Realizado"

    const tryingToEditNotes = typeof notes === "string"
    const tryingToAddAdditionalNote = typeof additionalNote === "string" && additionalNote.trim() !== ""

    if (tryingToEditCoreFields || tryingToChangeFinalStatus || (!tryingToEditNotes && !tryingToAddAdditionalNote)) {
      return NextResponse.json(
        { error: "Un turno realizado solo permite agregar o editar notas" },
        { status: 409 }
      )
    }
  }

  const finalServiceId = serviceId ?? current.serviceId

  // Solo calculamos nuevos horarios si cambia startsAt o serviceId
  const needsTimeRecalc = !!(startsAt || serviceId)
  let nextStart: Date | undefined
  let nextEnd: Date | undefined

  if (needsTimeRecalc) {
    const service = await prisma.service.findFirst({
      where: { id: finalServiceId, orgId: orgValidation.orgId },
      select: { durationMinutes: true },
    })
    if (!service) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })

    nextStart = startsAt ? new Date(startsAt) : undefined
    nextEnd = nextStart
      ? new Date(nextStart.getTime() + service.durationMinutes * 60000)
      : undefined
  }
  const parsedPrice = Number(price)
  if (Number.isFinite(parsedPrice) && parsedPrice < 0) {
    return NextResponse.json({ error: "El costo no puede ser menor a 0" }, { status: 400 })
  }
  const nextPrice = Number.isFinite(parsedPrice) ? parsedPrice : undefined

  const updateData: any = {
    ...(contactId ? { contactId } : {}),
    ...(serviceId ? { serviceId } : {}),
    ...(professionalId ? { professionalId } : {}),
    ...(typeof patient === "string" ? { patient: normalizedPatient || null } : {}),
    ...(typeof notes === "string" ? { notes } : {}),
    ...(nextPrice !== undefined ? { price: nextPrice } : {}),
    ...(nextStart ? { startsAt: nextStart, endsAt: nextEnd } : {}),
    ...(normalizedStatus ? { status: normalizedStatus } : {}),
  }

  if (typeof additionalNote === "string" && additionalNote.trim() !== "") {
    const stamp = new Date().toLocaleString("es-AR")
    updateData.additionalNotes = {
      push: `[${stamp}] ${additionalNote.trim()}`,
    }
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: updateData,
  })

  if (typeof patient === "string" && normalizedPatient) {
    const targetContactId = contactId ?? current.contactId
    const contact = await prisma.contact.findFirst({
      where: { id: targetContactId, orgId: orgValidation.orgId },
      select: { id: true, patients: true } as any,
    }) as any

    if (contact && !contact.patients.includes(normalizedPatient)) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: { patients: { push: normalizedPatient } } as any,
      })
    }
  }

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
