import './style.css'
import { inspectRequest } from './policy.js'

const $ = (selector) => document.querySelector(selector)
const demoMode = new URLSearchParams(location.search).get('demo') === '1' || /^\/demo\/?$/.test(location.pathname)
const demoKey = 'demo:api-profile-guard:sample-v1'
const routeFocusKey = 'apg:route-focus'

const form = $('#preflight-form')
const profile = $('#profile')
const method = $('#method')
const requestUrl = $('#request-url')
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

function currentInput() {
  return {
    profileName: profile.value,
    method: method.value,
    requestUrl: requestUrl.value,
    acknowledgement: acknowledgement.value
  }
}

function paintResult(outcome) {
  result.dataset.state = outcome.state
  result.setAttribute('aria-live', outcome.state === 'blocked' || outcome.state === 'error' ? 'assertive' : 'polite')
  resultStamp.textContent = outcome.state === 'allowed' ? '✓ ALLOWED' : outcome.state === 'error' ? '! INPUT ERROR' : '✕ BLOCKED'
  resultTitle.textContent =
    outcome.state === 'allowed'
      ? 'Policy passed. The client may start.'
      : outcome.state === 'error'
        ? 'The request could not be checked.'
        : 'Blocked before the client starts.'
  resultDetails.textContent = outcome.method
    ? `${outcome.profile} · ${outcome.fingerprint} · ${outcome.method} ${outcome.host}${outcome.path} · ${outcome.credentialClass} credentials`
    : 'Correct the input. Then check the request again.'
  resultReasons.replaceChildren(
    ...outcome.reasons.map((message) => {
      const item = document.createElement('li')
      item.textContent = message
      return item
    })
  )
}

function checkRequest({ delay = true } = {}) {
  submit.disabled = true
  submit.textContent = 'Checking…'
  result.dataset.state = 'loading'
  resultTitle.textContent = 'Reading the environment and policy…'
  resultDetails.textContent = 'The browser sample does not open a network connection.'
  resultReasons.replaceChildren()

  const finish = () => {
    const input = currentInput()
    paintResult(inspectRequest(input))
    if (demoMode) sessionStorage.setItem(demoKey, JSON.stringify(input))
    submit.disabled = false
    submit.textContent = 'Check request'
  }
  if (delay && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) window.setTimeout(finish, 180)
  else finish()
}

profile.addEventListener('change', syncProductionField)
syncProductionField()
form.addEventListener('submit', (event) => {
  event.preventDefault()
  checkRequest()
})

for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    const target = document.querySelector(button.dataset.copy)
    try {
      await navigator.clipboard.writeText(target.textContent.trim())
      const original = button.textContent
      button.textContent = 'Install command copied'
      window.setTimeout(() => (button.textContent = original), 2000)
    } catch {
      button.textContent = 'Select the install command'
      const selection = window.getSelection()
      selection.removeAllRanges()
      const range = document.createRange()
      range.selectNodeContents(target)
      selection.addRange(range)
    }
  })
}

function setDemoSample(input = {}) {
  profile.value = input.profileName || 'production'
  method.value = input.method || 'POST'
  requestUrl.value = input.requestUrl || 'https://wrong.example/v1/orders'
  acknowledgement.value = input.acknowledgement || 'production'
  syncProductionField()
  checkRequest({ delay: false })
}

function restoreDemoSample() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(demoKey))
    if (saved && typeof saved === 'object') return setDemoSample(saved)
  } catch {
    sessionStorage.removeItem(demoKey)
  }
  setDemoSample()
}

function isDemoUrl(url) {
  return url.origin === location.origin &&
    (new URLSearchParams(url.search).get('demo') === '1' || /^\/demo\/?$/.test(url.pathname))
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]')
  if (!link) return
  const target = new URL(link.href, location.href)
  if (demoMode && !isDemoUrl(target)) sessionStorage.removeItem(demoKey)
  if (!isDemoUrl(target) && target.origin === location.origin &&
      (target.pathname !== location.pathname || target.search !== location.search)) {
    sessionStorage.setItem(routeFocusKey, '1')
  }
})

if (demoMode) {
  document.body.classList.add('demo-mode')
  $('#demo-banner').hidden = false
  document.title = 'Demo — API Profile Guard'
  document.querySelector('link[rel="canonical"]').href = 'https://api-profile-guard.sociobot.in/demo/'
  document.querySelector('meta[property="og:title"]').content = 'Demo — API Profile Guard'
  document.querySelector('meta[property="og:url"]').content = 'https://api-profile-guard.sociobot.in/demo/'
  document.querySelector('meta[name="twitter:title"]').content = 'Demo — API Profile Guard'
  restoreDemoSample()
  $('#reset-demo').addEventListener('click', () => {
    sessionStorage.removeItem(demoKey)
    setDemoSample()
    $('#reset-demo').textContent = 'Demo reset'
    window.setTimeout(() => ($('#reset-demo').textContent = 'Reset demo'), 2000)
    $('#simulator').scrollIntoView({ behavior: 'instant' })
    $('#simulator-title').focus({ preventScroll: true })
  })

  const openDemoTarget = () => {
    const demoTarget = location.hash === '#cli-demo' ? $('#cli-demo') : $('#simulator')
    const demoHeading = demoTarget.querySelector('h2')
    demoTarget.scrollIntoView({ behavior: 'instant' })
    demoHeading.focus({ preventScroll: true })
  }
  if (document.readyState === 'complete') openDemoTarget()
  else window.addEventListener('load', openDemoTarget, { once: true })
}

if (!demoMode) {
  sessionStorage.removeItem(demoKey)
  if (sessionStorage.getItem(routeFocusKey) === '1') {
    sessionStorage.removeItem(routeFocusKey)
    requestAnimationFrame(() => {
      $('#hero-title').focus()
      $('#route-status').textContent = $('#hero-title').textContent
    })
  }
}

window.addEventListener('pageshow', (event) => {
  const navigation = performance.getEntriesByType('navigation')[0]
  if (!event.persisted && navigation?.type !== 'back_forward') return
  if (demoMode) restoreDemoSample()
  const pageHeading = demoMode ? $('#simulator-title') : $('#hero-title')
  requestAnimationFrame(() => {
    pageHeading.focus()
    $('#route-status').textContent = pageHeading.textContent
  })
})

const networkStatus = $('#network-status')
function paintNetworkStatus() {
  networkStatus.hidden = navigator.onLine
  networkStatus.textContent = navigator.onLine ? '' : 'Offline — this guide and its sample still work.'
}
window.addEventListener('online', paintNetworkStatus)
window.addEventListener('offline', paintNetworkStatus)
paintNetworkStatus()

window.addEventListener('popstate', () => {
  const target = location.hash ? document.querySelector(location.hash) : $('#hero-title')
  const heading = target?.matches('h1, h2') ? target : target?.querySelector('h1, h2') || $('#hero-title')
  heading.focus()
  $('#route-status').textContent = heading.textContent
})

if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}
