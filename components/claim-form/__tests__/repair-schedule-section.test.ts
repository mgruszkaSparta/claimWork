import { strict as assert } from 'node:assert'
import { test } from 'node:test'

type Schedule = { id: string }

async function testHandleDelete(confirmResult: boolean) {
  let fetchCalled = false
  let schedules: Schedule[] = [{ id: '1' }]

  globalThis.confirm = () => confirmResult
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
    if (!confirm('Czy na pewno chcesz usunąć harmonogram?')) return
    try {
      const response = await fetch(`/api/repair-schedules/${scheduleId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete repair schedule')
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

test('rejecting confirmation aborts deletion', async () => {
  const { fetchCalled, schedules } = await testHandleDelete(false)
  assert.equal(fetchCalled, false)
  assert.equal(schedules.length, 1)
})

test('accepting confirmation deletes schedule', async () => {
  const { fetchCalled, schedules } = await testHandleDelete(true)
  assert.equal(fetchCalled, true)
  assert.equal(schedules.length, 0)
})
