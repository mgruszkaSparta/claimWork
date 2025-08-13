import { test } from 'node:test'
import assert from 'node:assert/strict'
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
    liquidator: 'Jan Kowalski',
  } as any)

  assert.equal(payload.riskType, 'RT')
  assert.equal(payload.damageType, 'DT')
  assert.equal(payload.insuranceCompanyId, 5)
  assert.equal(payload.clientId, 7)
  assert.equal(payload.handlerId, 9)
  assert.equal(payload.liquidator, 'Jan Kowalski')
})

test('maps damageType object to its code value', () => {
  const payload = transformFrontendClaimToApiPayload({
    damageType: { code: 'DT', name: 'Damage' } as any,
  } as any)

  assert.equal(payload.damageType, 'DT')
})

test('participant and driver ids include only GUID strings', () => {
  const guid = '123e4567-e89b-12d3-a456-426614174000'
  const payload = transformFrontendClaimToApiPayload({
    injuredParty: {
      id: guid,
      drivers: [{ id: guid }, { id: '456' }],
    },
    perpetrator: {
      id: '123',
      drivers: [{ id: guid }],
    },
  } as any)

  const [injured, perpetrator] = payload.participants || []
  const [validDriver, invalidDriver] = injured.drivers || []

  assert.equal(injured.id, guid)
  assert.equal(validDriver?.id, guid)
  assert.equal(invalidDriver?.id, undefined)
  assert.equal(perpetrator?.id, undefined)
  assert.equal(perpetrator?.drivers?.[0]?.id, guid)
})

test('settlement ids are validated and converted', () => {
  const payload = transformFrontendClaimToApiPayload({
    settlements: [
      {
        id: 'not-a-guid',
        settlementDate: '2024-01-01',
        settlementType: 'type',
        description: 'x',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        settlementDate: '2024-01-02',
        settlementType: 'type',
        description: 'y',
      },
    ],
  } as any)

  const first = payload.settlements?.[0]
  const second = payload.settlements?.[1]
  assert.ok(first && !('id' in first))
  assert.equal(second?.id, '550e8400-e29b-41d4-a716-446655440000')
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

test('omits decisions when none are provided', () => {
  const payload = transformFrontendClaimToApiPayload({ decisions: [] } as any)
  assert.ok(!('decisions' in payload))
})

test('omits appeals when undefined', () => {
  const payload = transformFrontendClaimToApiPayload({ appeals: undefined } as any)
  assert.ok(!('appeals' in payload))

})
