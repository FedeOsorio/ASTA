"use client"

import { WorkingHoursConfig } from "@/features/appointments/components/WorkingHoursConfig"
import { ServicesTab } from "./ServicesTab"
import { ProfessionalsTab } from "./ProfessionalsTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


interface ConfigViewProps {
  orgId: string
}

export function ConfigView({ orgId }: ConfigViewProps) {
  return (
    <Tabs defaultValue="services">
      <TabsList className="mb-6">
        <TabsTrigger value="services">Servicios</TabsTrigger>
        <TabsTrigger value="professionals">Profesionales</TabsTrigger>
        <TabsTrigger value="business">Mi negocio</TabsTrigger>
      </TabsList>
      <TabsContent value="services">
        <ServicesTab orgId={orgId} />
      </TabsContent>
      <TabsContent value="professionals">
        <ProfessionalsTab orgId={orgId} />
      </TabsContent>
      <TabsContent value="business">
        <WorkingHoursConfig />
      </TabsContent>
    </Tabs>
  )
}