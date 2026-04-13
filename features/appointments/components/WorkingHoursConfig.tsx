"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export function WorkingHoursConfig() {
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("19:00")
  const [slotDuration, setSlotDuration] = useState(30)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchWorkingHours()
  }, [])

  async function fetchWorkingHours() {
    try {
      const res = await fetch("/api/working-hours")
      if (res.ok) {
        const data = await res.json()
        setStartTime(data.startTime)
        setEndTime(data.endTime)
        setSlotDuration(data.slotDuration)
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error al cargar los horarios" })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/working-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime,
          endTime,
          slotDuration: Number(slotDuration),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Error al guardar")
      }

      setMessage({ type: "success", text: "Horarios guardados correctamente" })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error desconocido",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-gray-500">Cargando...</p>
  }

  return (
    <Card className="p-6 max-w-md">
      <h3 className="text-lg font-semibold mb-4">Horarios de trabajo</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Hora de inicio</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">Hora de fin</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slotDuration">Espaciado entre horarios (minutos)</Label>
          <Input
            id="slotDuration"
            type="number"
            min="15"
            max="120"
            step="15"
            value={slotDuration}
            onChange={(e) => setSlotDuration(Number(e.target.value))}
          />
          <p className="text-xs text-gray-500">Entre 15 y 120 minutos</p>
        </div>

        {message && (
          <div
            className={`p-3 rounded text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </Card>
  )
}
