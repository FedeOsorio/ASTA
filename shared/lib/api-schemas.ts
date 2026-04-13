import { z } from "zod"

const optionalTrimmedString = z.union([z.string(), z.null(), z.undefined()]).transform((value) => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
})

const nonNegativePrice = z.union([z.number(), z.string(), z.null(), z.undefined()]).transform((value) => {
  if (value === null || value === undefined || value === "") return undefined
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : NaN
}).refine((value) => value === undefined || (Number.isFinite(value) && value >= 0), {
  message: "El costo no puede ser menor a 0",
})

const startsAtSchema = z.string({ message: "La fecha y hora es obligatoria" }).min(1, "La fecha y hora es obligatoria").refine((value) => !Number.isNaN(new Date(value).getTime()), {
  message: "Fecha de inicio inválida",
})

const timeSchema = z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido. Use HH:mm")
const phoneSchema = z.string().trim().min(1, "El teléfono es obligatorio").refine((value) => {
  const digits = value.replace(/\D/g, "")
  return digits.length >= 6
}, {
  message: "El teléfono debe contener al menos 6 dígitos",
})

export const createContactSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  document: optionalTrimmedString,
  phone: phoneSchema,
  email: optionalTrimmedString,
  address: optionalTrimmedString,
  notes: optionalTrimmedString,
})

export const updateContactSchema = createContactSchema

export const createProfessionalSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: optionalTrimmedString,
  color: z.string().trim().min(1).default("#6366f1"),
})

export const updateProfessionalSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").optional(),
  description: optionalTrimmedString.optional(),
  color: z.string().trim().min(1).optional(),
  isActive: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "No hay cambios para guardar",
})

export const createServiceSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  durationMinutes: z.coerce.number().int("La duración debe ser un número entero").min(1, "La duración debe ser mayor a 0"),
  price: nonNegativePrice,
  color: z.string().trim().min(1).default("#8b5cf6"),
  description: optionalTrimmedString.optional(),
})

export const updateServiceSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").optional(),
  durationMinutes: z.coerce.number().int("La duración debe ser un número entero").min(1, "La duración debe ser mayor a 0").optional(),
  price: nonNegativePrice.optional(),
  color: z.string().trim().min(1).optional(),
  description: optionalTrimmedString.optional(),
  isActive: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "No hay cambios para guardar",
})

export const createAppointmentSchema = z.object({
  contactId: z.string().trim().min(1, "Debés seleccionar un cliente."),
  serviceId: z.string().trim().min(1, "Debés seleccionar un servicio."),
  professionalId: z.string().trim().min(1, "Debés seleccionar un profesional."),
  startsAt: startsAtSchema,
  patient: optionalTrimmedString,
  notes: optionalTrimmedString,
  price: nonNegativePrice,
})

export const updateAppointmentSchema = z.object({
  contactId: z.string().trim().min(1, "Debés seleccionar un cliente.").optional(),
  serviceId: z.string().trim().min(1, "Debés seleccionar un servicio.").optional(),
  professionalId: z.string().trim().min(1, "Debés seleccionar un profesional.").optional(),
  startsAt: startsAtSchema.optional(),
  patient: optionalTrimmedString.optional(),
  notes: optionalTrimmedString.optional(),
  status: z.enum(["Nuevo", "Cancelado", "Confirmado", "Realizado", "new", "nuevo", "cancelado", "cancelled", "confirmado", "realizado"]).optional(),
  price: nonNegativePrice.optional(),
  additionalNote: z.string().trim().min(1, "Escribí una nota adicional para guardar.").optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "No hay cambios para guardar",
})

export const updateWorkingHoursSchema = z.object({
  startTime: timeSchema,
  endTime: timeSchema,
  slotDuration: z.coerce.number().int("El espaciado debe ser un número entero").min(15, "El espaciado debe estar entre 15 y 120 minutos").max(120, "El espaciado debe estar entre 15 y 120 minutos"),
}).refine((value) => {
  const [startH, startM] = value.startTime.split(":").map(Number)
  const [endH, endM] = value.endTime.split(":").map(Number)
  return startH * 60 + startM < endH * 60 + endM
}, {
  message: "La hora de inicio debe ser menor a la de fin",
  path: ["endTime"],
})
