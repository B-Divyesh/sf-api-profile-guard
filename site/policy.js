export const PROFILES = Object.freeze({
  development: {
    label: 'development',
    baseUrl: 'http://api.localhost',
    allowedHosts: ['api.localhost'],
    production: false,
    allow: [],
    deny: ['* /v1/admin/*']
  },
  staging: {
    label: 'staging',
    baseUrl: 'https://staging.api.example.com',
    allowedHosts: ['staging.api.example.com'],
    production: false,
    allow: [],
    deny: ['* /v1/admin/*']
  },
  production: {
    label: 'production',
    baseUrl: 'https://api.example.com',
    allowedHosts: ['api.example.com'],
    production: true,
    acknowledgement: 'production',
    allow: ['GET /v1/*', 'POST /v1/orders'],
    deny: ['* /v1/admin/*']
  }
})

export function globMatch(pattern, value) {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replaceAll('*', '.*')
  return new RegExp(`^${escaped}$`).test(value)
}

function operationMatches(rule, method, path) {
  const [ruleMethod, rulePath] = rule.split(/\s+/, 2)
  return (ruleMethod === '*' || ruleMethod === method) && globMatch(rulePath, path)
}

export function inspectRequest({ profileName, method, requestUrl, acknowledgement = '' }) {
  const profile = PROFILES[profileName]
  if (!profile) return { state: 'error', reasons: ['Choose a known profile.'] }

  const normalizedMethod = method.trim().toUpperCase()
  if (!/^[A-Z][A-Z0-9-]*$/.test(normalizedMethod)) {
    return { state: 'error', reasons: ['Enter a valid HTTP method.'] }
  }

  let resolved
  try {
    resolved = new URL(requestUrl.trim(), profile.baseUrl)
  } catch {
    return { state: 'error', reasons: ['Enter an absolute URL or a path such as /v1/orders.'] }
  }
  if (!['http:', 'https:'].includes(resolved.protocol)) {
    return { state: 'error', reasons: ['Only HTTP and HTTPS request URLs are supported.'] }
  }

  const reasons = []
  if (!profile.allowedHosts.includes(resolved.hostname.toLowerCase())) {
    reasons.push(`Host ${resolved.hostname} is not allowed for ${profile.label}.`)
  }
  if (profile.deny.some((rule) => operationMatches(rule, normalizedMethod, resolved.pathname))) {
    reasons.push(`${normalizedMethod} ${resolved.pathname} matches an explicit deny rule.`)
  } else if (
    profile.allow.length > 0 &&
    !profile.allow.some((rule) => operationMatches(rule, normalizedMethod, resolved.pathname))
  ) {
    reasons.push(`${normalizedMethod} ${resolved.pathname} is not on the production allowlist.`)
  }
  if (profile.production && acknowledgement !== profile.acknowledgement) {
    reasons.push('Type “production” to acknowledge the resolved production profile.')
  }

  return {
    state: reasons.length ? 'blocked' : 'allowed',
    reasons,
    method: normalizedMethod,
    host: resolved.hostname,
    path: resolved.pathname,
    profile: profile.label,
    credentialClass: profile.production ? 'live' : 'test',
    fingerprint: profile.production ? '8C31–F2A0' : profileName === 'staging' ? 'A05E–17D4' : '2B7D–9C10'
  }
}
