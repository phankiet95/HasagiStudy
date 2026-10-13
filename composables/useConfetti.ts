/**
 * A tiny stand-in for `canvas-confetti`, kept in-repo on purpose: this app is an offline
 * PWA and the flashcard games only need a burst of paper, not the whole library. The
 * option names match canvas-confetti so the game code reads the same as in HasagiAI.
 */

export interface ConfettiOptions {
  particleCount?: number
  /** Spread of the cone, in degrees. */
  spread?: number
  /** Direction of the cone, in degrees — 90 is straight up. */
  angle?: number
  startVelocity?: number
  /** Size multiplier. */
  scalar?: number
  /** Where the burst comes from, as a 0..1 fraction of the viewport. */
  origin?: { x?: number; y?: number }
  colors?: string[]
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  spin: number
  tilt: number
  life: number
}

const DEFAULT_COLORS = ['#4CA771', '#C0E6BA', '#fbbf24', '#60a5fa', '#f472b6', '#a78bfa']

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let frame: number | null = null

const resize = () => {
  if (!canvas || !ctx) return
  const dpr = window.devicePixelRatio || 1
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

const teardown = () => {
  if (frame !== null) {
    cancelAnimationFrame(frame)
    frame = null
  }
  window.removeEventListener('resize', resize)
  canvas?.remove()
  canvas = null
  ctx = null
  particles = []
}

const ensureCanvas = () => {
  if (canvas) return
  canvas = document.createElement('canvas')
  // Sits above every overlay in the app, but never eats a tap
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2147483647'
  document.body.appendChild(canvas)
  ctx = canvas.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
}

const step = () => {
  if (!canvas || !ctx) return

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

  particles = particles.filter((p) => {
    p.vy += 0.28 // gravity
    p.vx *= 0.99 // drag
    p.vy *= 0.99
    p.x += p.vx
    p.y += p.vy
    p.tilt += p.spin
    p.life -= 0.012
    return p.life > 0 && p.y < window.innerHeight + 40
  })

  for (const p of particles) {
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.tilt)
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life))
    ctx.fillStyle = p.color
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
    ctx.restore()
  }

  if (particles.length === 0) {
    // Nothing left to draw — drop the canvas so it isn't sitting over the page
    teardown()
    return
  }

  frame = requestAnimationFrame(step)
}

/** Fires one burst. Safe to call repeatedly — bursts share a single canvas. */
export const confetti = (options: ConfettiOptions = {}) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const count = options.particleCount ?? 60
  const spread = options.spread ?? 60
  const angle = options.angle ?? 90
  const startVelocity = options.startVelocity ?? 32
  const scalar = options.scalar ?? 1
  const colors = options.colors ?? DEFAULT_COLORS
  const originX = (options.origin?.x ?? 0.5) * window.innerWidth
  const originY = (options.origin?.y ?? 0.5) * window.innerHeight

  ensureCanvas()
  if (!ctx) return

  for (let i = 0; i < count; i++) {
    const deg = angle + (Math.random() - 0.5) * spread
    const rad = (deg * Math.PI) / 180
    const velocity = startVelocity * (0.55 + Math.random() * 0.6) * 0.5

    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(rad) * velocity,
      vy: -Math.sin(rad) * velocity,
      size: (6 + Math.random() * 6) * scalar,
      color: colors[Math.floor(Math.random() * colors.length)],
      spin: (Math.random() - 0.5) * 0.35,
      tilt: Math.random() * Math.PI,
      life: 1,
    })
  }

  // Too much paper on a phone is just jank — keep the pile bounded
  if (particles.length > 500) particles = particles.slice(-500)

  if (frame === null) frame = requestAnimationFrame(step)
}

/** Clears anything still falling — used when a game screen unmounts. */
export const stopConfetti = () => {
  if (canvas) teardown()
}
