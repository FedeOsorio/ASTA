import { auth } from "@/shared/lib/auth"
import { AppointmentsView } from "@/features/appointments/components/AppointmentsView"

export default async function TurnosPage() {
  const session = await auth()

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <h1 className="text-base font-medium text-gray-900">Turnos</h1>
        <p className="text-xs text-gray-400 mt-0.5">Gestión de agenda</p>
      </div>
      <div className="flex-1 p-6">
        <AppointmentsView orgId={session!.user.orgId} />
      </div>
    </div>
  )
}