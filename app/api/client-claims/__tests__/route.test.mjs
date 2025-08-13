import test from 'node:test'
import assert from 'node:assert/strict'

// Verify that notes sent in a POST request are returned on subsequent fetches

test('roundtrips claim notes through client-claims API', async () => {
  const { POST, GET } = await import('../route.ts')

  const fd = new FormData()
  fd.append('eventId', '1')
  fd.append('claimDate', '2024-01-01')
  fd.append('claimType', 'Type')
  fd.append('claimAmount', '100')
  fd.append('status', 'Pending')
  fd.append('claimNotes', 'Initial note')

  let storedNotes
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (_url, init) => {
    if (init && init.method === 'POST') {
      const body = init.body
      storedNotes = body.get('ClaimNotes')
      return new Response(JSON.stringify({ id: '1', claimNotes: storedNotes }), { status: 201 })
    }
    return new Response(JSON.stringify([{ id: '1', claimNotes: storedNotes }]), { status: 200 })
  }

  await POST(new Request('http://localhost/api/client-claims', { method: 'POST', body: fd }))
  const res = await GET(new Request('http://localhost/api/client-claims?eventId=1'))
  const data = await res.json()

  globalThis.fetch = originalFetch

  assert.equal(storedNotes, 'Initial note')
  assert.equal(Array.isArray(data), true)
  assert.equal(data[0].claimNotes, 'Initial note')
})

