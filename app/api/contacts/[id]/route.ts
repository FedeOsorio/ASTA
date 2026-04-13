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
  const { name, document, phone, email, address, notes } = await req.json()

  if (!name || String(name).trim() === "") {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
  }

  if (!phone || String(phone).trim() === "") {
    return NextResponse.json({ error: "El teléfono es obligatorio" }, { status: 400 })
  }

  const existing = await prisma.contact.findFirst({
    where: { id, orgId: session.user.orgId },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 })
  }

  const updated = await prisma.contact.update({
    where: { id },
    data: {
      name: String(name).trim(),
      document: document ? String(document).trim() : null,
      phone: String(phone).trim(),
      email: email ? String(email).trim() : null,
      address: address ? String(address).trim() : null,
      notes: notes ? String(notes).trim() : null,
    },
  })

  return NextResponse.json(updated)
}
