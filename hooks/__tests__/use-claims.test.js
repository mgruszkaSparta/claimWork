import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { filterClaims } from '../filter-claims.js'

test('filters claims by multiple criteria', () => {
  const claims = [
    { id: '1', status: 'NOWA SZKODA', client: 'Acme', liquidator: 'Jan', vehicleNumber: '', claimNumber: '', spartaNumber: '', brand: '' },
    { id: '2', status: 'W TRAKCIE', client: 'Acme', liquidator: 'Jan', vehicleNumber: '', claimNumber: '', spartaNumber: '', brand: '' },
    { id: '3', status: 'NOWA SZKODA', client: 'Acme', liquidator: 'Anna', vehicleNumber: '', claimNumber: '', spartaNumber: '', brand: '' }
  ]

  const result = filterClaims(claims, '', { statuses: ['NOWA SZKODA'], client: 'acme', handler: 'jan' })
  assert.equal(result.length, 1)
  assert.equal(result[0].id, '1')
})
