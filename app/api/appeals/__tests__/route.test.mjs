import test from 'node:test'
import assert from 'node:assert/strict'

// Test to ensure formData fields are mapped to backend naming

test('maps appeal form data to backend casing', async () => {
  const { POST } = await import('../route.ts')
  const fd = new FormData()
  fd.append('claimId', '123')
  fd.append('filingDate', '2024-01-01')
  fd.append('responseDate', '2024-02-02')
  fd.append('status', 'Pending')
  fd.append('documentDescription', 'Desc')
  fd.append('extensionDate', '2024-03-03')
  const file = new File(['hello'], 'test.txt', { type: 'text/plain' })
  fd.append('documents', file)

  let sentBody
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (_url, init) => {
    sentBody = init && init.body
    return new Response('{}', { status: 200 })
  }

  await POST(new Request('http://example.com/api/appeals', { method: 'POST', body: fd }))

  globalThis.fetch = originalFetch

  assert.ok(sentBody)
  assert.equal(sentBody.get('EventId'), '123')
  assert.equal(sentBody.get('FilingDate'), '2024-01-01')
  assert.equal(sentBody.get('DecisionDate'), '2024-02-02')
  assert.equal(sentBody.get('Status'), 'Pending')
  assert.equal(sentBody.get('DocumentDescription'), 'Desc')
  assert.equal(sentBody.get('ExtensionDate'), '2024-03-03')
  assert.ok(sentBody.get('Document') instanceof File)
  assert.equal(sentBody.get('filingDate'), null)
})

