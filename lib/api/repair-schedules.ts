export interface RepairSchedulePayload {
  eventId: string
  vehicleFleetNumber: string
  vehicleRegistration: string
  damageDate: string
  [key: string]: any
}

function ensureRequired(data: { vehicleFleetNumber?: string; vehicleRegistration?: string; damageDate?: string }) {
  if (!data.vehicleFleetNumber || !data.vehicleRegistration || !data.damageDate) {
    throw new Error('vehicleFleetNumber, vehicleRegistration and damageDate are required')
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
    credentials: 'include',
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
    credentials: 'include',
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
  if ('vehicleRegistration' in data && !data.vehicleRegistration) {
    throw new Error('vehicleRegistration is required')
  }
  if ('damageDate' in data && !data.damageDate) {
    throw new Error('damageDate is required')
  }
  const response = await fetch(`${REPAIR_SCHEDULES_URL}/${id}`, {
    method: 'PUT',
    credentials: 'include',
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
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Failed to delete repair schedule')
  }
  return response.json().catch(() => undefined)
}
