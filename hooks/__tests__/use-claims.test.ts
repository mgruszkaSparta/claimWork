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

test('maps damageType object to its code value', () => {
  const payload = transformFrontendClaimToApiPayload({
    damageType: { code: 'DT', name: 'Damage' } as any,
  } as any)

  assert.equal(payload.damageType, 'DT')
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

test('includes id field when provided', () => {
  const payload = transformFrontendClaimToApiPayload({ id: 'abc' } as any)
  assert.equal(payload.id, 'abc')
})

test('settlement ids are validated as GUIDs', () => {
  const validId = '123e4567-e89b-12d3-a456-426614174000'
  const payload = transformFrontendClaimToApiPayload({
    settlements: [
      { id: validId, settlementDate: '2024-01-01' },
      { id: 'not-a-guid', settlementDate: '2024-01-01' },
    ],
  } as any)

  const [valid, invalid] = (payload as any).settlements || []
  assert.equal(valid?.id, validId)
  assert.equal(invalid?.id, undefined)
})
