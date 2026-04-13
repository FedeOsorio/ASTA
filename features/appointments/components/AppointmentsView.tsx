"use client"

import { useEffect, useRef } from "react"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import { NewAppointmentModal } from "./NewAppointmentModal"
import { AppointmentDetailsDialog } from "./AppointmentDetailsDialog"
import { AppointmentTooltip } from "./AppointmentTooltip"
import { Button } from "@/components/ui/button"
import { useAppointments } from "../hooks/useAppointments"
import { useAppointmentModals } from "../hooks/useAppointmentModals"
import { useWorkingHours } from "../hooks/useWorkingHours"

interface AppointmentsViewProps {
  orgId: string
}

export function AppointmentsView({ orgId }: AppointmentsViewProps) {
  const calendarRef = useRef<any>(null)
  const appointments = useAppointments()
  const modals = useAppointmentModals()
  const { workingHours, loading: whLoading } = useWorkingHours()

  useEffect(() => {
    appointments.fetchEvents()
  }, [orgId])

  useEffect(() => {
    const now = Date.now()
    const boundaryTimes = (appointments.events as Array<{ start?: string; end?: string }>)
      .flatMap((event) => [event.start, event.end])
      .map((value) => (value ? new Date(value).getTime() : NaN))
      .filter((time) => Number.isFinite(time) && time > now)
      .sort((a, b) => a - b)

    if (boundaryTimes.length === 0) return

    const nextBoundary = boundaryTimes[0]
    const delay = Math.max(250, nextBoundary - now + 250)

    const timer = window.setTimeout(() => {
      appointments.fetchEvents({ silent: true })
    }, delay)

    return () => window.clearTimeout(timer)
  }, [appointments.events, orgId])

  useEffect(() => {
    if (appointments.toast) {
      const timer = setTimeout(() => appointments.setToast(null), 4500)
      return () => clearTimeout(timer)
    }
  }, [appointments.toast])

  async function handleOpenDetailsModal() {
    modals.setTooltipOpen(false)
    modals.setDetailsOpen(true)
    appointments.setIsEditing(false)

    const [contactsRes, servicesRes, professionalsRes] = await Promise.all([
      fetch("/api/contacts"),
      fetch("/api/services"),
      fetch("/api/professionals"),
    ])

    if (contactsRes.ok) {
      const contacts = await contactsRes.json()
    }
    if (servicesRes.ok) {
      const services = await servicesRes.json()
    }
    if (professionalsRes.ok) {
      const professionals = await professionalsRes.json()
    }
  }

  // Convertir HH:mm a HH:00:00 para FullCalendar
  const slotMinTime = workingHours?.startTime ? `${workingHours.startTime}:00` : "08:00:00"
  const slotMaxTime = workingHours?.endTime ? `${workingHours.endTime}:00` : "19:00:00"
  const slotDuration = workingHours?.slotDuration ? `00:${String(workingHours.slotDuration).padStart(2, "0")}:00` : "00:30:00"

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 h-full flex flex-col gap-3">
      <style>{`
        .fc .fc-timegrid-slot {
          height: 4em !important;
        }
        .fc .fc-col-time-text {
          font-size: 0.85em;
        }
        .fc .fc-daygrid-day,
        .fc .fc-timegrid-slot {
          border-color: #f0f0f0;
        }
        .fc .fc-timegrid-event-harness .fc-timegrid-event {
          min-height: 38px;
        }
        .fc .fc-timegrid-event .fc-event-main {
          height: 100%;
          overflow: hidden;
        }
        .fc .fc-event {
          transition: transform 140ms ease, box-shadow 140ms ease, filter 140ms ease;
          cursor: pointer;
        }
        .fc .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(15, 23, 42, 0.14);
          filter: saturate(1.08);
        }
      `}</style>
      {appointments.toast && (
        <div className={`fixed bottom-4 right-4 z-[9999] max-w-sm rounded-md border px-4 py-3 text-sm shadow-lg ${
          appointments.toast.type === "error" 
            ? "border-red-300 bg-red-50 text-red-900"
            : appointments.toast.type === "success"
            ? "border-amber-300 bg-amber-50 text-amber-900"
            : "border-blue-300 bg-blue-50 text-blue-900"
        }`}>
          {appointments.toast.message}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => {
            modals.setSelectedDate(new Date())
            modals.setModalOpen(true)
          }}
        >
          + Nuevo turno
        </Button>
      </div>

      {appointments.loading || whLoading ? (
        <div className="flex items-center justify-center flex-1">
          <p className="text-sm text-gray-400">Cargando turnWos...</p>
        </div>
      ) : (
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={esLocale}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          slotMinTime={slotMinTime}
          slotMaxTime={slotMaxTime}
          allDaySlot={false}
          height="100%"
          slotDuration={slotDuration}
          slotLabelInterval="01:00:00"
          slotLabelFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: false,
          }}
          scrollTimeReset={false}
          eventMinHeight={38}
          events={appointments.events}
          editable={false}
          selectable={true}
          selectMirror={true}
          select={(info) => {
            modals.setSelectedDate(info.start)
            modals.setModalOpen(true)
          }}
          eventClick={(info) => {
            const event = info.event
            const rect = info.el.getBoundingClientRect()
            const left = Math.max(8, Math.min(rect.left + rect.width / 2, window.innerWidth - 8))
            const top = Math.max(8, rect.top)

            appointments.setSelectedAppointment({
              id: event.id,
              title: event.title,
              start: event.start?.toISOString() ?? "",
              end: event.end?.toISOString() ?? "",
              extendedProps: event.extendedProps,
            })
            modals.setTooltipPos({ top, left })
            appointments.setIsEditing(false)
            modals.setTooltipOpen(true)
          }}
          eventContent={(eventInfo) => (
            <div className="px-1 py-0.5 overflow-hidden">
              <p className="text-xs font-medium truncate">
                {eventInfo.event.title}
              </p>
              <p className="text-xs opacity-80 truncate">
                {eventInfo.event.extendedProps.serviceName}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-85 truncate">
                {eventInfo.event.extendedProps.visualStatus ?? eventInfo.event.extendedProps.status}
              </p>
            </div>
          )}
        />
      )}

      <NewAppointmentModal
        open={modals.modalOpen}
        onClose={() => modals.setModalOpen(false)}
        onCreated={() => {
          void appointments.fetchEvents({ silent: true })
        }}
        selectedDate={modals.selectedDate}
      />

      <AppointmentTooltip
        open={modals.tooltipOpen}
        onOpenChange={modals.setTooltipOpen}
        tooltipPos={modals.tooltipPos}
        selectedAppointment={appointments.selectedAppointment}
        onViewDetails={handleOpenDetailsModal}
        onDelete={async () => {
          if (appointments.selectedAppointment) {
            await appointments.handleDeleteAppointment(appointments.selectedAppointment.id)
            modals.setTooltipOpen(false)
            appointments.setSelectedAppointment(null)
          }
        }}
      />

      <AppointmentDetailsDialog
        open={modals.detailsOpen}
        onOpenChange={(open) => {
          modals.setDetailsOpen(open)
          if (!open) appointments.setIsEditing(false)
        }}
        selectedAppointment={appointments.selectedAppointment}
        isEditing={appointments.isEditing}
        onStartEditing={appointments.startEditing}
        isSaving={appointments.isSaving}
        isAddingNotesOnly={appointments.isAddingNotesOnly}
        editForm={appointments.editForm}
        onEditFormChange={appointments.setEditForm}
        onSaveChanges={appointments.handleSaveChanges}
        onCancelEditing={appointments.cancelEditing}
        onCancelAppointment={() =>
          appointments.handleCancelAppointment(() => modals.setDetailsOpen(false))
        }
        onCompleteAppointment={() =>
          appointments.handleCompleteAppointment(() => modals.setDetailsOpen(false))
        }
        onSendConfirmation={() =>
          appointments.setToast({ message: "Próximamente: confirmación de turno por WhatsApp.", type: "info" })
        }
        onSendReminder={() =>
          appointments.setToast({ message: "Próximamente: envío de recordatorios por WhatsApp.", type: "info" })
        }
      />
    </div>
  )
}
