import { prisma } from "@/shared/lib/prisma"

export async function getAppointmentsByOrg(orgId: string) {
  console.log("orgId recibido:", orgId)
  
  const all = await prisma.appointment.findMany()
  console.log("todos los turnos:", all.length)

  return prisma.appointment.findMany({
    where: { orgId },
    include: {
      contact: true,
      service: true,
      professional: true,
    },
    orderBy: { startsAt: "asc" },
  })
}