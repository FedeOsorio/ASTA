import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Organización
  const org = await prisma.organization.create({
    data: {
      name: "Veterinaria San Martín",
      slug: "veterinaria-san-martin",
      industry: "veterinaria",
      isActive: true,
      plan: "trial",
    },
  })

  // Usuario admin
  const passwordHash = await bcrypt.hash("password123", 10)
  const user = await prisma.user.create({
    data: {
      orgId: org.id,
      name: "Admin",
      email: "admin@test.com",
      passwordHash,
      role: "admin",
      isActive: true,
    },
  })

  // Servicios
  const servicios = await Promise.all([
    prisma.service.create({
      data: {
        orgId: org.id,
        name: "Consulta general",
        durationMinutes: 30,
        color: "#378ADD",
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        orgId: org.id,
        name: "Vacunación",
        durationMinutes: 15,
        color: "#1D9E75",
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        orgId: org.id,
        name: "Cirugía",
        durationMinutes: 120,
        color: "#D85A30",
        isActive: true,
      },
    }),
  ])

  // Profesionales	
  const profesionales = await Promise.all([
    prisma.professional.create({
      data: {
        orgId: org.id,
        name: "Dr. Pérez",
        isActive: true,
      },
    }),
    prisma.professional.create({
      data: {
        orgId: org.id,
        name: "Dra. González",
        isActive: true,
      },
    }),
  ])

  // Contactos
  const contactos = await Promise.all([
    prisma.contact.create({
      data: {
        orgId: org.id,
        name: "Juan García",
        phone: "+5491112345678",
        email: "juan@gmail.com",
      },
    }),
    prisma.contact.create({
      data: {
        orgId: org.id,
        name: "Ana López",
        phone: "+5491187654321",
        email: "ana@gmail.com",
      },
    }),
    prisma.contact.create({
      data: {
        orgId: org.id,
        name: "Pedro Martínez",
        phone: "+5491198765432",
      },
    }),
  ])

  // Turno de prueba para hoy
  const hoy = new Date()
  hoy.setHours(10, 0, 0, 0)
  const fin = new Date(hoy.getTime() + 30 * 60000)

  await prisma.appointment.create({
    data: {
      orgId: org.id,
      contactId: contactos[0].id,
      serviceId: servicios[0].id,
      professionalId: profesionales[0].id,
      createdById: user.id,
      startsAt: hoy,
      endsAt: fin,
      status: "Confirmado",
      notes: "Primera consulta",
    },
  })

  console.log("✅ Seed completado")
  console.log("📧 Email: admin@test.com")
  console.log("🔑 Password: password123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())