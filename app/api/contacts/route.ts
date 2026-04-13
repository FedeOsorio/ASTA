import { auth } from "@/shared/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/shared/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const contacts = await prisma.contact.findMany({
    where: { orgId: session.user.orgId },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(contacts)
}