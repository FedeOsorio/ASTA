import { NextResponse } from "next/server"
import { z } from "zod"

export async function parseRequestBody<T>(req: Request, schema: z.ZodType<T>) {
  const payload = await req.json().catch(() => null)
  const result = schema.safeParse(payload)

  if (!result.success) {
    const issue = result.error.issues[0]
    return {
      success: false as const,
      response: NextResponse.json(
        {
          error: issue?.message ?? "Datos inválidos",
          issues: result.error.flatten(),
        },
        { status: 400 }
      ),
    }
  }

  return {
    success: true as const,
    data: result.data,
  }
}

export const cuidLikeIdSchema = z.string().trim().min(1, "Identificador inválido")
