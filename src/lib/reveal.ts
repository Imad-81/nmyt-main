/** Resolves when the intro loader has finished (or immediately if it already has). */
export function whenRevealed(cb: () => void) {
  if (typeof window === 'undefined') return () => {}
  const w = window as unknown as { __nmytRevealed?: boolean }
  if (w.__nmytRevealed) {
    cb()
    return () => {}
  }
  const h = () => cb()
  window.addEventListener('nmyt:revealed', h, { once: true })
  return () => window.removeEventListener('nmyt:revealed', h)
}
