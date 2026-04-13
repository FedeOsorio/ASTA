import { ConfigView } from "@/features/configuration/components/ConfigView"
import { auth } from "@/shared/lib/auth"

export default async function ConfiguracionPage() {
  const session = await auth()

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <h1 className="text-base font-medium text-gray-900">Configuración</h1>
        <p className="text-xs text-gray-400 mt-0.5">Administrá tu organización</p>
      </div>
      <div className="flex-1 p-6">
        <ConfigView orgId={session!.user.orgId} />
      </div>
    </div>
  )
}