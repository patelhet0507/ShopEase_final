export function throttle(fn, limit = 150) {
  let waiting = false
  return function (...args) {
    if (!waiting) {
      fn.apply(this, args)
      waiting = true
      setTimeout(() => { waiting = false }, limit)
    }
  }
}
