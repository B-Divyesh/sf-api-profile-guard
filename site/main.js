import './style.css'
import { inspectRequest } from './policy.js'

const $ = (selector) => document.querySelector(selector)

const form = $('#preflight-form')
const profile = $('#profile')
const acknowledgement = $('#acknowledgement')
const acknowledgementField = $('#acknowledgement-field')
const result = $('#preflight-result')
const resultStamp = $('#result-stamp')
const resultTitle = $('#result-title')
const resultDetails = $('#result-details')
const resultReasons = $('#result-reasons')
const submit = $('#inspect-button')

function syncProductionField() {
  const production = profile.value === 'production'
  acknowledgementField.hidden = !production
  acknowledgement.required = production
  if (!production) acknowledgement.value = ''
}

profile.addEventListener('change', syncProductionField)
syncProductionField()

form.addEventListener('submit', (event) => {
  event.preventDefault()
  submit.disabled = true
  submit.textContent = 'Inspecting…'
  result.dataset.state = 'loading'
  resultTitle.textContent = 'Resolving profile and policy…'
  resultDetails.textContent = 'No network connection is opened by this simulation.'
  resultReasons.replaceChildren()

  window.setTimeout(() => {
    const outcome = inspectRequest({
      profileName: profile.value,
      method: $('#method').value,
      requestUrl: $('#request-url').value,
      acknowledgement: acknowledgement.value
    })
    paintResult(outcome)
    submit.disabled = false
    submit.textContent = 'Inspect request'
  }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180)
})

function paintResult(outcome) {
  result.dataset.state = outcome.state
  result.setAttribute('aria-live', outcome.state === 'blocked' || outcome.state === 'error' ? 'assertive' : 'polite')
  resultStamp.textContent = outcome.state === 'allowed' ? '✓ ALLOWED' : outcome.state === 'error' ? '! INPUT ERROR' : '✕ BLOCKED'
  resultTitle.textContent =
    outcome.state === 'allowed'
      ? 'Policy passed. The client may start.'
      : outcome.state === 'error'
        ? 'The request could not be inspected.'
        : 'Stopped before any connection.'
  resultDetails.textContent = outcome.method
    ? `${outcome.profile} · ${outcome.fingerprint} · ${outcome.method} ${outcome.host}${outcome.path} · ${outcome.credentialClass} credential class`
    : 'Correct the input and inspect again.'
  resultReasons.replaceChildren(
    ...outcome.reasons.map((message) => {
      const item = document.createElement('li')
      item.textContent = message
      return item
    })
  )
}

for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    const target = document.querySelector(button.dataset.copy)
    try {
      await navigator.clipboard.writeText(target.textContent.trim())
      const original = button.textContent
      button.textContent = 'Copied'
      window.setTimeout(() => (button.textContent = original), 2000)
    } catch {
      button.textContent = 'Select and copy'
      const selection = window.getSelection()
      selection.removeAllRanges()
      const range = document.createRange()
      range.selectNodeContents(target)
      selection.addRange(range)
    }
  })
}

const networkStatus = $('#network-status')
function paintNetworkStatus() {
  const offline = !navigator.onLine
  networkStatus.hidden = !offline
  networkStatus.textContent = offline
    ? 'Offline mode — the docs and policy simulator still work locally.'
    : ''
}
window.addEventListener('online', paintNetworkStatus)
window.addEventListener('offline', paintNetworkStatus)
paintNetworkStatus()

if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}
