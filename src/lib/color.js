// Blend two hex colors: t = 0 gives a, t = 1 gives b.
export function mix(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`
}
