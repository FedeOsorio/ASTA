import { auth } from "@/shared/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/shared/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const all = searchParams.get("all")

  const services = await prisma.service.findMany({
    where: {
      orgId: session.user.orgId,
      ...(all ? {} : { isActive: true }),
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(services)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { name, durationMinutes, price, color } = await req.json()

  if (price !== null && price !== undefined && Number(price) < 0) {
    return NextResponse.json({ error: "El costo no puede ser menor a 0" }, { status: 400 })
  }

  const service = await prisma.service.create({
    data: {
      orgId: session.user.orgId,
      name,
      durationMinutes,
      price,
      color,
    },
  })

  return NextResponse.json(service, { status: 201 })
}