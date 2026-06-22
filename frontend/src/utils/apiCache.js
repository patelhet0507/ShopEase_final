const cache = new Map()
const inFlight = new Map()
const DEFAULT_TTL = 60 * 1000 // 60 seconds

function cacheKey(config) {
  return `${config.method || 'get'}:${config.url}:${JSON.stringify(config.params || {})}`
}

export function getCachedResponse(config) {
  const key = cacheKey(config)
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < entry.ttl) {
    return entry.data
  }
  if (entry) cache.delete(key)
  return null
}

export function setCachedResponse(config, data, ttl = DEFAULT_TTL) {
  const key = cacheKey(config)
  cache.set(key, { data, timestamp: Date.now(), ttl })
}

export function getInFlightPromise(config) {
  const key = cacheKey(config)
  return inFlight.get(key) || null
}

export function setInFlightPromise(config, promise) {
  const key = cacheKey(config)
  inFlight.set(key, promise)
  promise.finally(() => {
    if (inFlight.get(key) === promise) inFlight.delete(key)
  })
}

export function invalidateCache(pattern) {
  if (!pattern) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key)
  }
}

export function clearCache() {
  cache.clear()
  for (const p of inFlight.values()) {
  }
  inFlight.clear()
}
