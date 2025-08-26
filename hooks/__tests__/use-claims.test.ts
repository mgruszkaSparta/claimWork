import { test } from 'node:test'
import assert from 'node:assert/strict'
import { transformFrontendClaimToApiPayload } from '../use-claims'

// Basic test to ensure dropdown selections are mapped
// TODO: expand coverage for other fields if needed

test('includes dropdown selections in payload', () => {
  const payload = transformFrontendClaimToApiPayload({
    riskType: '5',
    damageType: { code: 'DT', name: 'Damage' } as any,
    insuranceCompanyId: '5',
    clientId: '7',
    handlerId: '9',
  } as any)

  assert.equal(payload.riskType, '5')
  assert.equal(payload.damageType, 'DT')
  assert.equal(payload.insuranceCompanyId, 5)
  assert.equal(payload.clientId, 7)
  assert.equal(payload.handlerId, 9)
})

test('maps transportDamage fields', () => {
  const payload = transformFrontendClaimToApiPayload({
    transportDamage: {
      transportType: 'LAND',
      transportTypeId: '1',
      cargoDescription: 'desc',
      losses: ['a', 'b'],
      carrier: 'carrier',
      policyNumber: 'PN',
      inspectionContactName: 'John',
      inspectionContactPhone: '123',
      inspectionContactEmail: 'john@example.com',
    },
  } as any)

  assert.equal(payload.cargoDescription, 'desc')
  assert.equal(payload.losses, 'a,b')
  assert.equal(payload.carrier, 'carrier')
  assert.equal(payload.carrierPolicyNumber, 'PN')
  assert.equal(payload.inspectionContactName, 'John')
  assert.equal(payload.inspectionContactPhone, '123')
  assert.equal(payload.inspectionContactEmail, 'john@example.com')
  assert.equal(payload.transportType, 'LAND')
  assert.equal(payload.transportTypeId, 1)
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

test('maps registration numbers from participants', () => {
  const payload = transformFrontendClaimToApiPayload({
    injuredParty: { vehicleRegistration: 'ABC123' },
    perpetrator: { vehicleRegistration: 'DEF456' },
  } as any)

  assert.equal(payload.victimRegistrationNumber, 'ABC123')
  assert.equal(payload.perpetratorRegistrationNumber, 'DEF456')
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

test('defaults isDraft to false', () => {
  const payload = transformFrontendClaimToApiPayload({} as any)
  assert.equal(payload.isDraft, false)
})
