import { auth } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { NextResponse } from "next/server"

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
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const orgValidation = await resolveValidatedOrg(session.user.id, session.user.orgId)
  if ("error" in orgValidation) {
    return NextResponse.json({ error: orgValidation.error }, { status: orgValidation.status })
  }

  let workingHours = await prisma.workingHours.findUnique({
    where: { orgId: orgValidation.orgId },
  })

  // Si no existe, crear con valores por defecto
  if (!workingHours) {
    workingHours = await prisma.workingHours.create({
      data: {
        orgId: orgValidation.orgId,
        startTime: "08:00",
        endTime: "19:00",
        slotDuration: 30,
      },
    })
  }

  return NextResponse.json(workingHours)
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const orgValidation = await resolveValidatedOrg(session.user.id, session.user.orgId)
  if ("error" in orgValidation) {
    return NextResponse.json({ error: orgValidation.error }, { status: orgValidation.status })
  }

  const { startTime, endTime, slotDuration } = await req.json()

  // Validar formato HH:mm
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return NextResponse.json(
      { error: "Formato de hora inválido. Use HH:mm" },
      { status: 400 }
    )
  }

  // Validar que startTime < endTime
  const [startH, startM] = startTime.split(":").map(Number)
  const [endH, endM] = endTime.split(":").map(Number)
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM

  if (startMinutes >= endMinutes) {
    return NextResponse.json(
      { error: "La hora de inicio debe ser menor a la de fin" },
      { status: 400 }
    )
  }

  if (slotDuration < 15 || slotDuration > 120) {
    return NextResponse.json(
      { error: "El espaciado debe estar entre 15 y 120 minutos" },
      { status: 400 }
    )
  }

  const workingHours = await prisma.workingHours.upsert({
    where: { orgId: orgValidation.orgId },
    create: {
      orgId: orgValidation.orgId,
      startTime,
      endTime,
      slotDuration,
    },
    update: {
      startTime,
      endTime,
      slotDuration,
    },
  })

  return NextResponse.json(workingHours)
}
