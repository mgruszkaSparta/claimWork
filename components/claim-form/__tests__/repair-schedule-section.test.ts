import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { deleteRepairSchedule } from '@/lib/api/repair-schedules'

type Schedule = { id: string }

async function testHandleDelete() {
  let fetchCalled = false
  let schedules: Schedule[] = [{ id: '1' }]

  globalThis.fetch = async (_url: string, _opts?: any) => {
    if (_opts?.method === 'DELETE') {
      fetchCalled = true
      return { ok: true, json: async () => ({}) } as any
    }
    return { ok: true, json: async () => schedules } as any
  }

  const setSchedules = (updater: (prev: Schedule[]) => Schedule[]) => {
    schedules = updater(schedules)
  }

  const toast = (_: any) => {}

  const handleDelete = async (scheduleId: string) => {
    try {
      await deleteRepairSchedule(scheduleId)
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId))
      toast({})
    } catch (error) {
      console.error('Error deleting repair schedule:', error)
      toast({})
    }
  }

  await handleDelete('1')
  return { fetchCalled, schedules }
}

test('deletes schedule', async () => {
  const { fetchCalled, schedules } = await testHandleDelete()
  assert.equal(fetchCalled, true)
  assert.equal(schedules.length, 0)
})
