import { useState, useEffect } from "react"

interface WorkingHours {
  id: string
  orgId: string
  startTime: string
  endTime: string
  slotDuration: number
}

export function useWorkingHours() {
  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWorkingHours()
  }, [])

  async function fetchWorkingHours() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/working-hours")
      if (!res.ok) {
        throw new Error("No se pudieron obtener los horarios de trabajo")
      }

      const data = await res.json()
      setWorkingHours(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      // Usar valores por defecto en caso de error
      setWorkingHours({
        id: "",
        orgId: "",
        startTime: "08:00",
        endTime: "19:00",
        slotDuration: 30,
      })
    } finally {
      setLoading(false)
    }
  }

  return { workingHours, loading, error, refetch: fetchWorkingHours }
}
