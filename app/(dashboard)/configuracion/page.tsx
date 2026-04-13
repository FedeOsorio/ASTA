import { WorkingHoursConfig } from "@/features/appointments/components/WorkingHoursConfig"

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-gray-600 mt-2">Administra los ajustes de tu organización</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WorkingHoursConfig />
      </div>
    </div>
  )
}
