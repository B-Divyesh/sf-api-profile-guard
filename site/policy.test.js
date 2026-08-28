import assert from 'node:assert/strict'
import test from 'node:test'
import { globMatch, inspectRequest } from './policy.js'

test('production requires the exact confirmation phrase', () => {
  const result = inspectRequest({
    profileName: 'production',
    method: 'GET',
    requestUrl: '/v1/health',
    acknowledgement: ''
  })
  assert.equal(result.state, 'blocked')
  assert.match(result.reasons.join(' '), /production confirmation phrase/)
})

test('production blocks forbidden hosts and non-allowlisted operations', () => {
  for (const requestUrl of ['https://evil.example/v1/health', 'https://api.example.com.evil.test/v1/health']) {
    const result = inspectRequest({
      profileName: 'production',
      method: 'GET',
      requestUrl,
      acknowledgement: 'production'
    })
    assert.equal(result.state, 'blocked')
    assert.match(result.reasons.join(' '), /not allowed/)
  }
  assert.equal(
    inspectRequest({
      profileName: 'production',
      method: 'DELETE',
      requestUrl: '/v1/orders/42',
      acknowledgement: 'production'
    }).state,
    'blocked'
  )
})

test('an explicitly allowed production request passes', () => {
  const result = inspectRequest({
    profileName: 'production',
    method: 'POST',
    requestUrl: '/v1/orders?token=never-shown',
    acknowledgement: 'production'
  })
  assert.equal(result.state, 'allowed')
  assert.equal(result.path, '/v1/orders')
  assert.doesNotMatch(JSON.stringify(result), /never-shown/)
})

test('glob matching is anchored', () => {
  assert.equal(globMatch('/v1/*', '/v1/orders/42'), true)
  assert.equal(globMatch('/v1/orders', '/v1/orders/42'), false)
})
