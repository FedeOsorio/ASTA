"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProfessionalModal } from "./ProfessionalModal"

interface Professional {
  id: string
  name: string
  description: string | null
  color: string
  isActive: boolean
}

interface ProfessionalsTabProps {
  orgId: string
}

export function ProfessionalsTab({ orgId }: ProfessionalsTabProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<Professional | null>(null)

  function fetchProfessionals() {
    fetch("/api/professionals?all=true")
      .then(r => r.json())
      .then(setProfessionals)
  }

  useEffect(() => {
    fetchProfessionals()
  }, [orgId])

  function handleEdit(professional: Professional) {
    setSelected(professional)
    setModalOpen(true)
  }

  function handleNew() {
    setSelected(null)
    setModalOpen(true)
  }

  async function handleToggle(professional: Professional) {
    await fetch(`/api/professionals/${professional.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !professional.isActive }),
    })
    fetchProfessionals()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleNew}>+ Nuevo profesional</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professionals.map(professional => (
              <TableRow key={professional.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: professional.color }}
                    />
                    {professional.name}
                  </div>
                </TableCell>
                <TableCell className="text-gray-500">
                  {professional.description ?? "—"}
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    professional.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {professional.isActive ? "Activo" : "Inactivo"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(professional)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(professional)}
                    >
                      {professional.isActive ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {professionals.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-gray-400 py-8">
                  No hay profesionales. Creá el primero.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ProfessionalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchProfessionals}
        professional={selected}
      />
    </div>
  )
}