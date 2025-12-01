const stripTrailingSlash = (value: string): string => value.replace(/\/+$/, '')

const ensureLeadingSlash = (value: string): string =>
  value.startsWith('/') ? value : `/${value}`

const hasProtocol = /^https?:\/\//i

const DEFAULT_DOMAIN = 'http://localhost:3000'
const DEFAULT_API_PREFIX = '/api'

const stripApiSuffix = (value: string): string =>
  value.replace(/\/+$/, '').replace(/\/api$/i, '')

const getRawApiBase = (): string | undefined => import.meta.env.VITE_API_BASE_URL?.trim()

export const getApiDomain = (): string => {
  const rawBase = getRawApiBase()
  if (!rawBase) return DEFAULT_DOMAIN

  const sanitized = stripTrailingSlash(rawBase)

  if (sanitized.toLowerCase().endsWith('/api')) {
    return stripApiSuffix(sanitized)
  }

  return sanitized
}

export const getApiPrefix = (): string => {
  const rawPrefix = import.meta.env.VITE_API_PREFIX?.trim()
  if (!rawPrefix) return DEFAULT_API_PREFIX
  return rawPrefix.startsWith('/') ? rawPrefix : `/${rawPrefix}`
}

export const getApiBaseUrl = (): string => `${getApiDomain()}${getApiPrefix()}`

export const getAssetBaseUrl = (): string => {
  const rawAssetBase = import.meta.env.VITE_ASSET_BASE_URL?.trim()
  if (rawAssetBase) {
    return stripTrailingSlash(rawAssetBase)
  }
  return getApiDomain()
}

export const resolveToAbsoluteUrl = (path?: string | null): string => {
  if (!path) return ''
  if (hasProtocol.test(path)) return path
  return `${getAssetBaseUrl()}${ensureLeadingSlash(path)}`
}


