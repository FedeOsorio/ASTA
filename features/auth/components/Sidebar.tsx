"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const links = [
    { href: "/turnos", label: "Turnos", icon: CalendarIcon },
    { href: "/contactos", label: "Contactos", icon: ContactsIcon },
    { href: "/configuracion", label: "Configuración", icon: SettingsIcon },
  ]

  return (
    <aside className="w-52 min-w-52 bg-white border-r border-gray-100 flex flex-col">
      <div className="px-4 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold tracking-[0.08em] text-gray-900">A.S.T.A.</p>
        <p className="text-xs text-gray-500 mt-0.5">Agenda de Servicios y Tareas Administrativas</p>
      </div>

      <nav className="flex-1 py-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
              pathname === href
                ? "bg-gray-50 text-gray-900 font-medium border-l-2 border-gray-900"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Icon />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-700">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-xs text-gray-400 hover:text-gray-600 text-left transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="11" rx="2"/>
      <path d="M5 2v2M11 2v2M2 7h12"/>
    </svg>
  )
}

function ContactsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="6" r="3"/>
      <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"/>
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2.5"/>
      <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.5 3.5l1 1M11.5 11.5l1 1M12.5 3.5l-1 1M4.5 11.5l-1 1"/>
    </svg>
  )
}