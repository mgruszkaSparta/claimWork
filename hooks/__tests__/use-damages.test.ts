
// @ts-ignore
import { strict as assert } from 'node:assert'
// @ts-ignore
import { test } from 'node:test'
import { useDamages } from '../use-damages'

test('createDamage throws when eventId is missing', async () => {
  const { createDamage } = useDamages()

  await assert.rejects(
    () => createDamage({ description: 'desc' }),
    /Brak identyfikatora zdarzenia/,
  )
})

test('createDamage throws on failed response', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => ({ ok: false, text: async () => 'fail' }) as any

  try {
    const { createDamage } = useDamages('123')
    await assert.rejects(
      () => createDamage({ description: 'desc' }),
      /Nie udało się zapisać szkody|fail/,
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('createDamage returns data on success', async () => {
  const originalFetch = globalThis.fetch
  const data = { id: '1', eventId: '123', description: 'desc' }
  globalThis.fetch = async () => ({ ok: true, json: async () => data }) as any

  try {
    const { createDamage } = useDamages('123')
    const result = await createDamage({ description: 'desc' })
    assert.deepEqual(result, data)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('initDamages throws on failed response', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => ({ ok: false, text: async () => 'bad' }) as any

  try {
    const { initDamages } = useDamages('123')
    await assert.rejects(() => initDamages(), /Nie udało się pobrać szkód|bad/)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('initDamages returns data on success', async () => {
  const originalFetch = globalThis.fetch
  const damages = [{ id: '1', eventId: '123', description: 'desc' }]
  globalThis.fetch = async () => ({ ok: true, json: async () => damages }) as any

  try {
    const { initDamages } = useDamages('123')
    const result = await initDamages()
    assert.deepEqual(result, damages)
  } finally {
    globalThis.fetch = originalFetch
  }
})

=======
import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { useDamages } from '../use-damages'
import { API_ENDPOINTS } from '@/lib/constants'

test('initDamages fetches initial damages', async () => {
  const originalFetch = global.fetch
  const mockDamages = [{ description: 'Damage 1' }]

  global.fetch = async (url: any) => {
    assert.equal(url, API_ENDPOINTS.DAMAGES_INIT)
    return {
      ok: true,
      json: async () => mockDamages,
    } as any
  }

  let hook: ReturnType<typeof useDamages>
  function Wrapper() {
    hook = useDamages()
    return null
  }
  renderToString(React.createElement(Wrapper))

  const result = await hook!.initDamages()
  assert.deepEqual(result, mockDamages)
  global.fetch = originalFetch
})

test('deleteDamage issues DELETE request', async () => {
  const originalFetch = global.fetch
  const id = '123'
  let calledWith: any

  global.fetch = async (url: any, options?: any) => {
    calledWith = { url, options }
    return { ok: true } as any
  }

  let hook: ReturnType<typeof useDamages>
  function Wrapper() {
    hook = useDamages()
    return null
  }
  renderToString(React.createElement(Wrapper))

  await hook!.deleteDamage(id)
  assert.equal(calledWith.url, `${API_ENDPOINTS.DAMAGES}/${id}`)
  assert.equal(calledWith.options?.method, 'DELETE')
  global.fetch = originalFetch
})

