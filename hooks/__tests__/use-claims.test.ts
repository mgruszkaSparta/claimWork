import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { transformFrontendClaimToApiPayload } from '../use-claims'

// Basic test to ensure dropdown selections are mapped
// TODO: expand coverage for other fields if needed

test('includes dropdown selections in payload', () => {
  const payload = transformFrontendClaimToApiPayload({
    riskType: 'RT',
    damageType: 'DT',
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
