import './style.css'

const routeFocusKey = 'apg:route-focus'
const heading = document.querySelector('h1')
const status = document.querySelector('#route-status')
sessionStorage.removeItem('demo:api-profile-guard:sample-v1')

if (sessionStorage.getItem(routeFocusKey) === '1') {
  sessionStorage.removeItem(routeFocusKey)
  requestAnimationFrame(() => {
    heading?.focus()
    if (status && heading) status.textContent = heading.textContent
  })
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]')
  if (!link) return
  const target = new URL(link.href, location.href)
  if (target.origin === location.origin && target.pathname !== location.pathname) {
    sessionStorage.setItem(routeFocusKey, '1')
  }
})

window.addEventListener('pageshow', (event) => {
  const navigation = performance.getEntriesByType('navigation')[0]
  if (!event.persisted && navigation?.type !== 'back_forward') return
  requestAnimationFrame(() => {
    heading?.focus()
    if (status && heading) status.textContent = heading.textContent
  })
})

if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}
