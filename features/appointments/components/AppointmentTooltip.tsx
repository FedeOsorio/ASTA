"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Eye, Trash2 } from "lucide-react"

interface AppointmentTooltipProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tooltipPos: { top: number; left: number }
  selectedAppointment: any
  onViewDetails: () => void
  onDelete: () => void
}

export function AppointmentTooltip({
  open,
  onOpenChange,
  tooltipPos,
  selectedAppointment,
  onViewDetails,
  onDelete,
}: AppointmentTooltipProps) {
  return (
    <Popover open={open && !!selectedAppointment} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <button
          type="button"
          aria-hidden
          className="fixed h-0 w-0 opacity-0 pointer-events-none"
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
        />
      </PopoverAnchor>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={10}
        avoidCollisions={false}
        className="w-auto rounded-xl border border-gray-200/80 bg-white/95 p-2 shadow-2xl backdrop-blur"
      >
        <div className="mb-2 rounded-lg border border-gray-100 bg-gray-50/80 px-2 py-1.5">
          <p className="truncate text-xs font-semibold text-gray-900">
            {selectedAppointment?.extendedProps?.contactName || selectedAppointment?.title}
          </p>
          <p className="truncate text-[11px] text-gray-600">
            {selectedAppointment?.extendedProps?.serviceName}
          </p>
          <p className="text-[11px] text-gray-500">
            {selectedAppointment?.start
              ? new Date(selectedAppointment.start).toLocaleString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-9 rounded-lg border-gray-200 bg-white hover:bg-gray-50"
            onClick={onViewDetails}
          >
            <Eye className="size-4" />
            Ver turno
          </Button>
          <Button size="sm" variant="destructive" className="h-9 rounded-lg" onClick={onDelete}>
            <Trash2 className="size-4" />
            Eliminar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
