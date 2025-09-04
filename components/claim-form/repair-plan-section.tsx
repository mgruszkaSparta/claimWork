"use client"

import React from "react"
import { RepairScheduleSection } from "./repair-schedule-section"
import { RepairDetailsSection } from "./repair-details-section"

interface RepairPlanSectionProps {
  eventId: string
  autoShowRepairForm?: boolean
  onAutoShowRepairFormHandled?: () => void
}

export const RepairPlanSection: React.FC<RepairPlanSectionProps> = ({
  eventId,
  autoShowRepairForm,
  onAutoShowRepairFormHandled,
}) => {
  return (
    <div className="space-y-8">
      <RepairScheduleSection eventId={eventId} />
      <RepairDetailsSection
        eventId={eventId}
        autoShowForm={autoShowRepairForm}
        onAutoShowFormHandled={onAutoShowRepairFormHandled}
      />
    </div>
  )
}

export default RepairPlanSection
