import { auth } from "@/shared/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/shared/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const existing = await prisma.professional.findFirst({
    where: { id, orgId: session.user.orgId },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 })
  }

  const data: {
    name?: string
    description?: string | null
    color?: string
    isActive?: boolean
  } = {}

  if (typeof body.name === "string") {
    const trimmed = body.name.trim()
    if (!trimmed) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
    }
    data.name = trimmed
  }

  if (body.description !== undefined) {
    data.description = body.description ? String(body.description).trim() : null
  }

  if (typeof body.color === "string" && body.color.trim() !== "") {
    data.color = body.color
  }

  if (typeof body.isActive === "boolean") {
    data.isActive = body.isActive
  }

  const updated = await prisma.professional.update({
    where: { id },
    data,
  })

  return NextResponse.json(updated)
}
