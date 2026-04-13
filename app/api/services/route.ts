import { auth } from "@/shared/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/shared/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const services = await prisma.service.findMany({
    where: { orgId: session.user.orgId, isActive: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(services)
}