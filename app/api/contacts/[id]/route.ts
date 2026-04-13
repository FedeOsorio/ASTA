import { auth } from "@/shared/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/shared/lib/prisma"
import { parseRequestBody } from "@/shared/lib/api-validation"
import { updateContactSchema } from "@/shared/lib/api-schemas"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const parsed = await parseRequestBody(req, updateContactSchema)
  if (!parsed.success) return parsed.response

  const existing = await prisma.contact.findFirst({
    where: { id, orgId: session.user.orgId },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 })
  }

  const updated = await prisma.contact.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(updated)
}
