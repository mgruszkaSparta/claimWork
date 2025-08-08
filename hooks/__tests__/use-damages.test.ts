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
