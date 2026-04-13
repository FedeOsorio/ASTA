import { auth } from "@/shared/lib/auth"
import { ContactsView } from "@/features/contacts/components/ContactsView"

export default async function ContactosPage() {
  const session = await auth()

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <h1 className="text-base font-medium text-gray-900">Contactos</h1>
        <p className="text-xs text-gray-400 mt-0.5">Clientes cargados en el sistema</p>
      </div>
      <div className="flex-1 p-6">
        <ContactsView />
      </div>
    </div>
  )
}
