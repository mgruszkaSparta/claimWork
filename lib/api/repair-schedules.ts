export interface RepairSchedulePayload {
  eventId: string
  branchId?: string
  companyName: string
  vehicleFleetNumber: string
  expertWaitingDate?: string
  additionalInspections?: string
  repairStartDate?: string
  repairEndDate?: string
  whyNotOperational?: string
  alternativeVehiclesAvailable?: boolean
  alternativeVehiclesDescription?: string
  contactDispatcher?: string
  contactManager?: string
  status: "draft" | "submitted" | "approved" | "completed"
}

function ensureRequired(data: { vehicleFleetNumber?: string }) {
  if (!data.vehicleFleetNumber) {
    throw new Error('vehicleFleetNumber is required')
  }
}

import { API_BASE_URL } from "../api";

const REPAIR_SCHEDULES_URL = `${API_BASE_URL}/repair-schedules`;

export async function getRepairSchedules(eventId: string) {
  const url = eventId
    ? `${REPAIR_SCHEDULES_URL}?eventId=${eventId}`
    : REPAIR_SCHEDULES_URL
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'omit',
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error('Failed to fetch repair schedules')
  }
  return response.json()
}

export async function createRepairSchedule(data: RepairSchedulePayload) {
  ensureRequired(data)
  const response = await fetch(REPAIR_SCHEDULES_URL, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to create repair schedule')
  }
  return response.json()
}

export async function updateRepairSchedule(id: string, data: Partial<RepairSchedulePayload>) {
  if ('vehicleFleetNumber' in data && !data.vehicleFleetNumber) {
    throw new Error('vehicleFleetNumber is required')
  }
  const response = await fetch(`${REPAIR_SCHEDULES_URL}/${id}`, {
    method: 'PUT',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update repair schedule')
  }
  return response.json()
}

export async function deleteRepairSchedule(id: string) {
  const response = await fetch(`${REPAIR_SCHEDULES_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'omit',
  })
  if (!response.ok) {
    throw new Error('Failed to delete repair schedule')
  }
  return response.json().catch(() => undefined)
}
