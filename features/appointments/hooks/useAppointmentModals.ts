import { useState } from "react"

export function useAppointmentModals() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
  const [detailsOpen, setDetailsOpen] = useState(false)

  return {
    modalOpen,
    setModalOpen,
    selectedDate,
    setSelectedDate,
    tooltipOpen,
    setTooltipOpen,
    tooltipPos,
    setTooltipPos,
    detailsOpen,
    setDetailsOpen,
  }
}
