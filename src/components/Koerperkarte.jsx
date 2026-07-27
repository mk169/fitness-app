import { MUSKELGRUPPEN } from "../lib/uebungen"

// Körperkarte (Vorder- & Rückseite). Anatomisch geformte Silhouette aus
// weichen Bézier-Kurven (Catmull-Rom), mit Volumen durch ein Licht-von-oben-
// Overlay und farblich hervorgehobenen Muskeln. Neutrale Töne kommen aus den
// Theme-Variablen – die Figur passt sich also jedem Stil (hell/dunkel) an.

const ACHSE_V = 118
const ACHSE_H = 342

// --- Catmull-Rom → geschlossener, glatter Pfad ---------------------------
function glatt(pts) {
  const n = pts.length
  let d = `M ${pts[0][0]} ${pts[0][1]} `
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += `C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0]} ${p2[1]} `
  }
  return d + "Z"
}

// Symmetrischer Umriss: rechte Randpunkte (Pole bei x=0 an Anfang & Ende)
// werden an der Achse gespiegelt und zu einem geschlossenen Pfad geglättet.
function sym(rechts) {
  const mitte = rechts.slice(1, -1).map(([x, y]) => [-x, y]).reverse()
  return glatt([...rechts, ...mitte])
}

// Rumpf-Umriss (Schultern → Lat-Taille → Hüfte). Landmarken-Y bleiben
// bewusst wie zuvor, damit die Muskeln passgenau sitzen.
const RUMPF = sym([
  [0, 58], [24, 60], [44, 70], [41, 92], [36, 108],
  [30, 128], [25, 150], [29, 168], [33, 182], [27, 197], [0, 200],
])

// Arm (rechts) – eigene geschlossene Form, wird gespiegelt.
const ARM = glatt([
  [37, 66], [50, 66], [57, 100], [58, 135], [60, 175],
  [61, 200], [55, 211], [49, 201], [50, 175], [49, 138], [46, 104], [41, 80],
])

// Bein (rechts) – Oberschenkel, Knie, Wade, Fuß.
const BEIN = glatt([
  [4, 187], [33, 185], [31, 220], [27, 255], [24, 272],
  [23, 300], [21, 326], [19, 352], [19, 365], [8, 367],
  [10, 352], [12, 326], [13, 300], [13, 272], [11, 255], [8, 220],
])

// Hals als kurzer Trapez-Übergang zu den Schultern.
const HALS = glatt([
  [-8, 44], [8, 44], [12, 60], [20, 64], [-20, 64], [-12, 60],
])

// Muskelformen relativ zur Körperachse (x = 0). paar -> gespiegeltes Paar.
const VORNE = [
  { key: "schultern", paar: { dx: 35, cy: 77, rx: 11, ry: 9, rot: -20 } },
  { key: "brust", paar: { dx: 15, cy: 95, rx: 15.5, ry: 12, rot: -8 } },
  { key: "bizeps", paar: { dx: 45, cy: 112, rx: 8, ry: 16, rot: 14 } },
  { key: "unterarme", paar: { dx: 54, cy: 158, rx: 6.5, ry: 19, rot: 11 } },
  { key: "bauch", rect: { x: -14, y: 112, w: 28, h: 54, rx: 9 }, sixpack: true },
  { key: "quadrizeps", paar: { dx: 15, cy: 228, rx: 12, ry: 38, rot: 2 } },
  { key: "waden", paar: { dx: 14, cy: 318, rx: 8, ry: 25, rot: 2 } },
]

const HINTEN = [
  { key: "trapez", pfad: "M -19 63 Q 0 54 19 63 L 9 98 Q 0 106 -9 98 Z" },
  { key: "schultern", paar: { dx: 35, cy: 77, rx: 10, ry: 9, rot: -20 } },
  { key: "ruecken", paar: { dx: 18, cy: 120, rx: 12.5, ry: 24, rot: -7 } },
  { key: "trizeps", paar: { dx: 45, cy: 112, rx: 8, ry: 16, rot: 14 } },
  { key: "unterarme", paar: { dx: 54, cy: 158, rx: 6.5, ry: 19, rot: 11 } },
  { key: "unterer_ruecken", rect: { x: -12, y: 148, w: 24, h: 20, rx: 6 } },
  { key: "gesaess", paar: { dx: 12, cy: 184, rx: 12, ry: 13, rot: 0 } },
  { key: "beinbizeps", paar: { dx: 15, cy: 234, rx: 11, ry: 34, rot: 2 } },
  { key: "waden", paar: { dx: 14, cy: 316, rx: 9, ry: 26, rot: 2 } },
]

// Ein Körperteil: Grundfläche (Theme-Farbe) + Licht-Overlay für Volumen.
function Teil({ d, spiegel }) {
  const g = spiegel ? "scale(-1 1)" : undefined
  return (
    <g transform={g}>
      <path d={d} style={{ fill: "var(--color-surface-2)", stroke: "var(--color-hair)", strokeWidth: 1.1 }} />
      <path d={d} fill="url(#kkShade)" pointerEvents="none" />
    </g>
  )
}

function Silhouette() {
  return (
    <g>
      {/* Bodenschatten */}
      <ellipse cx={0} cy={374} rx={50} ry={7} fill="#000" opacity={0.28} />
      <Teil d={BEIN} />
      <Teil d={BEIN} spiegel />
      <Teil d={ARM} />
      <Teil d={ARM} spiegel />
      <Teil d={RUMPF} />
      <Teil d={HALS} />
      {/* Kopf */}
      <g>
        <ellipse cx={0} cy={29} rx={14.5} ry={18.5}
          style={{ fill: "var(--color-surface-2)", stroke: "var(--color-hair)", strokeWidth: 1.1 }} />
        <ellipse cx={0} cy={29} rx={14.5} ry={18.5} fill="url(#kkShade)" pointerEvents="none" />
      </g>
    </g>
  )
}

function Muskel({ form, aktiv, onMuskel }) {
  const stil = {
    style: {
      fill: aktiv ? "var(--kk-akzent)" : "var(--color-hair)",
      stroke: aktiv ? "var(--kk-akzent)" : "transparent",
      strokeWidth: 1,
      transition: "fill .18s ease, stroke .18s ease",
      cursor: onMuskel ? "pointer" : "default",
    },
    filter: aktiv ? "url(#kkTiefe)" : undefined,
    onClick: onMuskel ? () => onMuskel(form.key) : undefined,
  }
  const glanz = { fill: "url(#kkGlanz)", pointerEvents: "none" }
  const linien = aktiv ? "rgba(255,255,255,.55)" : "var(--color-faint)"

  const el = []
  if (form.paar) {
    const p = form.paar
    for (const s of [-1, 1]) {
      const t = p.rot ? `rotate(${s * p.rot} ${s * p.dx} ${p.cy})` : undefined
      el.push(
        <g key={s} transform={t}>
          <ellipse cx={s * p.dx} cy={p.cy} rx={p.rx} ry={p.ry} {...stil} />
          <ellipse cx={s * p.dx} cy={p.cy - p.ry * 0.28} rx={p.rx * 0.8} ry={p.ry * 0.58} {...glanz} />
        </g>
      )
    }
  }
  if (form.rect) {
    const r = form.rect
    el.push(
      <g key="r">
        <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={r.rx} {...stil} />
        <rect x={r.x + 2} y={r.y + 2} width={r.w - 4} height={r.h * 0.38} rx={r.rx} {...glanz} />
        {form.sixpack && (
          <g stroke={linien} strokeWidth={1} strokeLinecap="round" opacity={0.8} pointerEvents="none" fill="none">
            <line x1={0} y1={r.y + 5} x2={0} y2={r.y + r.h - 5} />
            <line x1={r.x + 4} y1={r.y + r.h / 3} x2={r.x + r.w - 4} y2={r.y + r.h / 3} />
            <line x1={r.x + 4} y1={r.y + (r.h * 2) / 3} x2={r.x + r.w - 4} y2={r.y + (r.h * 2) / 3} />
          </g>
        )}
      </g>
    )
  }
  if (form.pfad) {
    el.push(<path key="p" d={form.pfad} {...stil} />)
    el.push(<path key="pg" d={form.pfad} {...glanz} />)
  }

  return (
    <g>
      <title>{MUSKELGRUPPEN[form.key]?.name}</title>
      {el}
    </g>
  )
}

function Figur({ achse, formen, aktivSet, onMuskel }) {
  return (
    <g transform={`translate(${achse} 0)`}>
      <Silhouette />
      {formen.map((f, i) => (
        <Muskel key={`${f.key}-${i}`} form={f} aktiv={aktivSet.has(f.key)} onMuskel={onMuskel} />
      ))}
    </g>
  )
}

export default function Koerperkarte({ aktiv, onMuskel, farbe, labels = true }) {
  const aktivSet = aktiv instanceof Set ? aktiv : new Set(aktiv ?? [])

  return (
    <svg
      viewBox="0 0 460 428"
      className="w-full"
      role="img"
      aria-label="Körperkarte der trainierten Muskeln"
      style={{ "--kk-akzent": farbe ?? "var(--color-accent)" }}
    >
      <defs>
        {/* Licht von oben, Schatten unten – gibt der ganzen Figur Volumen. */}
        <linearGradient id="kkShade" gradientUnits="userSpaceOnUse" x1="0" y1="8" x2="0" y2="384">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="0.42" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>
        {/* Glanzlicht auf jedem Muskel. */}
        <linearGradient id="kkGlanz" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* Weicher Schatten unter aktiven Muskeln (hebt sie an). */}
        <filter id="kkTiefe" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1.6" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      <Figur achse={ACHSE_V} formen={VORNE} aktivSet={aktivSet} onMuskel={onMuskel} />
      <Figur achse={ACHSE_H} formen={HINTEN} aktivSet={aktivSet} onMuskel={onMuskel} />

      {labels && (
        <g fill="var(--color-muted)" style={{ fontSize: 11 }} textAnchor="middle">
          <text x={ACHSE_V} y={414}>Vorderseite</text>
          <text x={ACHSE_H} y={414}>Rückseite</text>
        </g>
      )}
    </svg>
  )
}
