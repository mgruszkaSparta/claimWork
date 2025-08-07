import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { transformFrontendClaimToApiPayload } from '../use-claims'

// Basic test to ensure dropdown selections are mapped
// TODO: expand coverage for other fields if needed

test('includes dropdown selections in payload', () => {
  const payload = transformFrontendClaimToApiPayload({
    riskType: 'RT',
    damageType: { code: 'DT', name: 'Damage' } as any,
    insuranceCompanyId: '5',
    clientId: '7',
    handlerId: '9',
  } as any)

  assert.equal(payload.riskType, 'RT')
  assert.equal(payload.damageType, 'DT')
  assert.equal(payload.insuranceCompanyId, 5)
  assert.equal(payload.clientId, 7)
  assert.equal(payload.handlerId, 9)
})

test('participant and driver ids are numeric', () => {
  const payload = transformFrontendClaimToApiPayload({
    injuredParty: {
      id: '123',
      drivers: [{ id: '456' }],
    },
  } as any)

  const participant = payload.participants?.[0]
  const driver = participant?.drivers?.[0]
  assert.equal(participant?.id, 123)
  assert.equal(driver?.id, 456)
})
