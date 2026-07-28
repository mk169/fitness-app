import { useEffect, useRef, useState } from "react"
import { MUSTER } from "../lib/uebungAnimation"

// Animierte Strichfigur, die ein Bewegungsmuster vormacht. Interpoliert
// zwischen zwei Posen und lässt die Bewegung sanft pendeln (Loop). Respektiert
// „prefers-reduced-motion" (dann statische Mittel-Pose).

const SEGMENTE = [
  ["S", "H"], // Rumpf
  ["S", "E"], ["E", "W"], // Arm
  ["H", "K"], ["K", "F"], // Bein
]

const lerp = (a, b, t) => a + (b - a) * t
const easeInOut = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t)

function reduziert() {
  return typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}

export default function UebungAnimation({ muster, size = 220 }) {
  const daten = MUSTER[muster] ?? MUSTER.curl
  const [t, setT] = useState(0.5)
  const raf = useRef(0)

  useEffect(() => {
    if (reduziert()) {
      setT(0.5)
      return
    }
    let start = null
    const tick = (ts) => {
      if (start == null) start = ts
      const phase = ((ts - start) % daten.dauer) / daten.dauer // 0..1
      const dreieck = phase < 0.5 ? phase * 2 : (1 - phase) * 2 // 0→1→0
      setT(easeInOut(dreieck))
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [daten])

  // Aktuelle Gelenkpositionen interpolieren.
  const p = {}
  for (const key of Object.keys(daten.a)) {
    const a = daten.a[key]
    const b = daten.b[key] ?? a
    p[key] = [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]
  }

  return (
    <svg viewBox="0 0 100 120" width={size} height={size} className="mx-auto block">
      {/* Boden */}
      <line x1="8" y1="116" x2="92" y2="116" style={{ stroke: "var(--ov-10)" }} strokeWidth="2" strokeLinecap="round" />

      <g style={{ stroke: "var(--color-accent)" }} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {SEGMENTE.map(([von, bis], i) => {
          const A = p[von]
          const B = p[bis]
          if (!A || !B) return null
          return <line key={i} x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} />
        })}
      </g>

      {/* Kopf */}
      {p.head && (
        <circle cx={p.head[0]} cy={p.head[1]} r="8.5" style={{ fill: "var(--color-accent)" }} />
      )}
    </svg>
  )
}
