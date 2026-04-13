import { auth } from "@/shared/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/shared/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const includeAll = searchParams.get("all") === "true"

  const professionals = await prisma.professional.findMany({
    where: includeAll
      ? { orgId: session.user.orgId }
      : { orgId: session.user.orgId, isActive: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(professionals)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { name, description, color } = await req.json()

  if (!name || String(name).trim() === "") {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
  }

  const professional = await prisma.professional.create({
    data: {
      orgId: session.user.orgId,
      name: String(name).trim(),
      description: description ? String(description).trim() : null,
      color: color ? String(color) : "#6366f1",
      isActive: true,
    },
  })

  return NextResponse.json(professional, { status: 201 })
}