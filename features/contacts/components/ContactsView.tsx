"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Contact {
  id: string
  name: string
  document?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
}
export function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    document: "",
    phone: "",
    email: "",
    address: "",
  })

  useEffect(() => {
    fetch("/api/contacts")
      .then((r) => r.json())
      .then((data) => setContacts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  function openEdit(contact: Contact) {
    setEditing(contact)
    setError("")
    setForm({
      name: contact.name ?? "",
      document: contact.document ?? "",
      phone: contact.phone ?? "",
      email: contact.email ?? "",
      address: contact.address ?? "",
    })
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return

    setError("")
    if (!form.name.trim()) {
      setError("El nombre es obligatorio")
      return
    }
    if (!form.phone.trim()) {
      setError("El teléfono es obligatorio")
      return
    }

    setSaving(true)
    const res = await fetch(`/api/contacts/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      setError(payload?.error ?? "No se pudo guardar el contacto")
      setSaving(false)
      return
    }

    const updated = await res.json()
    setContacts((prev) =>
      prev
        .map((c) => (c.id === updated.id ? updated : c))
        .sort((a, b) => a.name.localeCompare(b.name))
    )
    setSaving(false)
    setEditing(null)
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Telefono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Direccion</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-gray-400 py-8">
                  Cargando contactos...
                </TableCell>
              </TableRow>
            )}
            {!loading && contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>{contact.document || "-"}</TableCell>
                <TableCell>{contact.phone || "-"}</TableCell>
                <TableCell>{contact.email || "-"}</TableCell>
                <TableCell>{contact.address || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => openEdit(contact)}>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && contacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-gray-400 py-8">
                  No hay contactos cargados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={() => setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar contacto</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEdit} className="space-y-4 mt-2">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Documento</Label>
              <Input value={form.document} onChange={(e) => setForm((f) => ({ ...f, document: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Telefono</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Direccion</Label>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
