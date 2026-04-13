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

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { name, phone, email, notes } = await req.json()

  if (!name || String(name).trim() === "") {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
  }

  const contact = await prisma.contact.create({
    data: {
      orgId: session.user.orgId,
      name: String(name).trim(),
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim() : null,
      notes: notes ? String(notes).trim() : null,
    },
  })

  return NextResponse.json(contact, { status: 201 })
}