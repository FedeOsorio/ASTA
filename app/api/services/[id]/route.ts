import { auth } from "@/shared/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/shared/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const data = await req.json()
  const { id } = await params

  const service = await prisma.service.update({
    where: { id, orgId: session.user.orgId },
    data,
  })

  return NextResponse.json(service)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const service = await prisma.service.findFirst({
    where: { id, orgId: session.user.orgId },
    select: { id: true },
  })

  if (!service) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
  }

  const linkedAppointments = await prisma.appointment.count({
    where: { serviceId: id, orgId: session.user.orgId },
  })

  if (linkedAppointments > 0) {
    return NextResponse.json(
      { error: "No puede eliminarse este servicio ya que posee turnos asociados" },
      { status: 409 }
    )
  }

  await prisma.service.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}