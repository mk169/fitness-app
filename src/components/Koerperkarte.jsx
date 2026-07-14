import { MUSKELGRUPPEN } from "../lib/uebungen"

// Körperkarte (Vorder- & Rückseite) als holografisches HUD-Display:
// dunkles Panel mit feinem Raster und Scan-Linien, neon leuchtende
// Silhouette und plastische Muskeln mit Faser-Definition. Aktive Muskeln
// glühen. Muskeln sind als gespiegelte Paare um die Körperachse definiert –
// dadurch sind beide Seiten garantiert exakt identisch.

const ACHSE_V = 118
const ACHSE_H = 342

// Muskelformen relativ zur Körperachse (x = 0).
// paar  -> wird links (-dx) und rechts (+dx) gespiegelt, rot negiert.
// rect / pfad -> zentrale Form.
const VORNE = [
  { key: "schultern", paar: { dx: 35, cy: 77, rx: 11, ry: 9, rot: -20 } },
  { key: "brust", paar: { dx: 16, cy: 95, rx: 15.5, ry: 12, rot: -8 } },
  { key: "bizeps", paar: { dx: 45, cy: 112, rx: 8, ry: 16, rot: 14 } },
  { key: "unterarme", paar: { dx: 54, cy: 157, rx: 6.5, ry: 19, rot: 11 } },
  { key: "bauch", rect: { x: -14, y: 112, w: 28, h: 54, rx: 9 }, sixpack: true },
  { key: "quadrizeps", paar: { dx: 15, cy: 228, rx: 12, ry: 38, rot: 2 } },
  { key: "waden", paar: { dx: 14, cy: 318, rx: 8, ry: 25, rot: 2 } },
]

const HINTEN = [
  { key: "trapez", pfad: "M -19 63 Q 0 54 19 63 L 9 98 Q 0 106 -9 98 Z" },
  { key: "schultern", paar: { dx: 35, cy: 77, rx: 10, ry: 9, rot: -20 } },
  { key: "ruecken", paar: { dx: 18, cy: 120, rx: 12.5, ry: 24, rot: -7 } },
  { key: "trizeps", paar: { dx: 45, cy: 112, rx: 8, ry: 16, rot: 14 } },
  { key: "unterarme", paar: { dx: 54, cy: 157, rx: 6.5, ry: 19, rot: 11 } },
  { key: "unterer_ruecken", rect: { x: -12, y: 148, w: 24, h: 20, rx: 6 } },
  { key: "gesaess", paar: { dx: 12, cy: 184, rx: 12, ry: 13, rot: 0 } },
  { key: "beinbizeps", paar: { dx: 15, cy: 234, rx: 11, ry: 34, rot: 2 } },
  { key: "waden", paar: { dx: 14, cy: 316, rx: 9, ry: 26, rot: 2 } },
]

// Farben des Hologramm-Looks.
const NEON = "#38bdf8"
const KONTUR = "#3fd0ff"
const MUSKEL_INAKTIV = "#18263f"
const MUSKEL_KONTUR = "#2f4e6d"

// Körper-Silhouette: Rumpf als Pfad, Gliedmaßen als runde Striche –
// dadurch wirken Arme und Beine wie weiche Kapseln. Kontur leuchtet neon.
function Silhouette() {
  const koerper = { fill: "url(#kkKoerper)", stroke: KONTUR, strokeWidth: 1.3, strokeOpacity: 0.85 }
  const glied = {
    stroke: "url(#kkGlied)",
    strokeLinecap: "round",
    fill: "none",
  }
  const kontur = { stroke: KONTUR, strokeWidth: 1.1, strokeLinecap: "round", fill: "none", opacity: 0.5 }

  return (
    <g filter="url(#kkKontur)">
      {/* Cyan „Reflexions"-Glow unter der Figur statt Bodenschatten */}
      <ellipse cx={0} cy={372} rx={52} ry={7} fill={NEON} opacity={0.12} />

      {/* Beine */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M ${s * 14} 170 L ${s * 16} 268 L ${s * 14} 356`} {...glied} strokeWidth={24} />
          <path d={`M ${s * 14} 170 L ${s * 16} 268 L ${s * 14} 356`} {...kontur} strokeWidth={25} />
          <ellipse cx={s * 17} cy={364} rx={11} ry={5.5} {...koerper} />
        </g>
      ))}

      {/* Arme */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M ${s * 37} 74 L ${s * 50} 132 L ${s * 58} 190`} {...glied} strokeWidth={16} />
          <path d={`M ${s * 37} 74 L ${s * 50} 132 L ${s * 58} 190`} {...kontur} strokeWidth={17} />
          <circle cx={s * 60} cy={200} r={7.5} {...koerper} />
        </g>
      ))}

      {/* Rumpf */}
      <path
        d="M -37 66
           C -41 92 -31 142 -25 170
           L 25 170
           C 31 142 41 92 37 66
           C 22 57 -22 57 -37 66 Z"
        {...koerper}
      />

      {/* Hals & Kopf */}
      <rect x={-7.5} y={42} width={15} height={20} rx={5} {...koerper} />
      <ellipse cx={0} cy={29} rx={16} ry={19} {...koerper} />
    </g>
  )
}

function Muskel({ form, aktiv, farbe, onMuskel }) {
  const stil = {
    fill: aktiv ? "url(#kkAktiv)" : MUSKEL_INAKTIV,
    stroke: aktiv ? farbe : MUSKEL_KONTUR,
    strokeWidth: 1.2,
    fillOpacity: aktiv ? 1 : 0.55,
    cursor: onMuskel ? "pointer" : "default",
    filter: aktiv ? "url(#kkGlow)" : undefined,
    className: aktiv ? "kk-aktiv" : undefined,
    style: { transition: "fill .18s, stroke .18s, fill-opacity .18s" },
    onClick: onMuskel ? () => onMuskel(form.key) : undefined,
  }
  // Rim-Light von oben – gibt jeder Form eine leichte Wölbung.
  const glanz = { fill: "url(#kkGlanz)", pointerEvents: "none" }
  // Faser-/Striations-Linien für anatomische Definition.
  const faser = {
    stroke: aktiv ? "#e0f7ff" : "#3f5f86",
    strokeWidth: 0.8,
    strokeLinecap: "round",
    fill: "none",
    opacity: aktiv ? 0.7 : 0.5,
    pointerEvents: "none",
  }

  const elemente = []
  if (form.paar) {
    const p = form.paar
    for (const s of [-1, 1]) {
      const t = p.rot ? `rotate(${s * p.rot} ${s * p.dx} ${p.cy})` : undefined
      const cx = s * p.dx
      elemente.push(
        <g key={s} transform={t}>
          <ellipse cx={cx} cy={p.cy} rx={p.rx} ry={p.ry} {...stil} />
          <ellipse cx={cx} cy={p.cy - p.ry * 0.25} rx={p.rx * 0.8} ry={p.ry * 0.6} {...glanz} />
          {/* zwei gebogene Muskelfasern entlang der Längsachse */}
          <path
            d={`M ${cx} ${p.cy - p.ry * 0.7} Q ${cx - p.rx * 0.45} ${p.cy} ${cx} ${p.cy + p.ry * 0.7}`}
            {...faser}
          />
          <path
            d={`M ${cx} ${p.cy - p.ry * 0.7} Q ${cx + p.rx * 0.45} ${p.cy} ${cx} ${p.cy + p.ry * 0.7}`}
            {...faser}
          />
        </g>
      )
    }
  }
  if (form.rect) {
    const r = form.rect
    elemente.push(
      <g key="r">
        <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={r.rx} {...stil} />
        <rect x={r.x + 2} y={r.y + 2} width={r.w - 4} height={r.h * 0.4} rx={r.rx} {...glanz} />
        {form.sixpack && (
          <g stroke={aktiv ? "#e0f7ff" : "#3f5f86"} strokeWidth={1} opacity={0.7} pointerEvents="none">
            <line x1={0} y1={r.y + 4} x2={0} y2={r.y + r.h - 4} />
            <line x1={r.x + 4} y1={r.y + r.h / 3} x2={r.x + r.w - 4} y2={r.y + r.h / 3} />
            <line x1={r.x + 4} y1={r.y + (r.h * 2) / 3} x2={r.x + r.w - 4} y2={r.y + (r.h * 2) / 3} />
          </g>
        )}
      </g>
    )
  }
  if (form.pfad) {
    elemente.push(<path key="p" d={form.pfad} {...stil} />)
  }

  return (
    <g>
      <title>{MUSKELGRUPPEN[form.key]?.name}</title>
      {elemente}
    </g>
  )
}

function Figur({ achse, formen, aktivSet, farbe, onMuskel }) {
  return (
    <g transform={`translate(${achse} 0)`}>
      <Silhouette />
      {formen.map((f, i) => (
        <Muskel
          key={`${f.key}-${i}`}
          form={f}
          aktiv={aktivSet.has(f.key)}
          farbe={farbe}
          onMuskel={onMuskel}
        />
      ))}
    </g>
  )
}

export default function Koerperkarte({ aktiv, onMuskel, farbe = "#38bdf8", labels = true }) {
  const aktivSet = aktiv instanceof Set ? aktiv : new Set(aktiv ?? [])

  return (
    <svg viewBox="0 0 460 428" className="w-full" role="img" aria-label="Körperkarte der trainierten Muskeln">
      <defs>
        {/* Dunkles Panel: Sci-Fi-Display-Hintergrund */}
        <radialGradient id="kkPanel" cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#122036" />
          <stop offset="100%" stopColor="#0a1120" />
        </radialGradient>
        {/* Körper: dunkel-translucent = gläsernes Volumen */}
        <linearGradient id="kkKoerper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b3050" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0e1c31" stopOpacity="0.55" />
        </linearGradient>
        {/* Gliedmaßen leuchten neon */}
        <linearGradient id="kkGlied" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#274a72" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#132844" stopOpacity="0.6" />
        </linearGradient>
        {/* Aktive Muskeln: heller Kern -> sattere Kante */}
        <radialGradient id="kkAktiv" cx="50%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="60%" stopColor={farbe} />
          <stop offset="100%" stopColor="#0284c7" />
        </radialGradient>
        {/* Kühles Rim-Light von oben */}
        <linearGradient id="kkGlanz" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eaf9ff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#eaf9ff" stopOpacity="0" />
        </linearGradient>
        {/* Feines Raster */}
        <pattern id="kkGrid" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M 18 0 L 0 0 0 18" fill="none" stroke="#3fd0ff" strokeWidth="0.5" strokeOpacity="0.12" />
        </pattern>
        {/* Scan-Linien */}
        <pattern id="kkScan" width="4" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="4" y2="0" stroke="#7fe4ff" strokeWidth="0.5" strokeOpacity="0.06" />
        </pattern>
        {/* Neon-Glow für aktive Muskeln */}
        <filter id="kkGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.6" result="blur" />
          <feFlood floodColor={farbe} floodOpacity="0.9" result="col" />
          <feComposite in="col" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Weiches Leuchten der Körperkontur */}
        <filter id="kkKontur" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.4" floodColor="#3fd0ff" floodOpacity="0.45" />
        </filter>
        {/* Panel-Form als Clip für Raster & Scan-Linien */}
        <clipPath id="kkPanelClip">
          <rect x="6" y="6" width="448" height="416" rx="18" />
        </clipPath>
      </defs>

      {/* Panel-Hintergrund */}
      <rect x="6" y="6" width="448" height="416" rx="18" fill="url(#kkPanel)" />
      <g clipPath="url(#kkPanelClip)">
        <rect x="6" y="6" width="448" height="416" fill="url(#kkGrid)" />
        <rect x="6" y="6" width="448" height="416" fill="url(#kkScan)" />
      </g>
      <rect
        x="6"
        y="6"
        width="448"
        height="416"
        rx="18"
        fill="none"
        stroke="#3fd0ff"
        strokeWidth="1"
        strokeOpacity="0.3"
      />

      <Figur achse={ACHSE_V} formen={VORNE} aktivSet={aktivSet} farbe={farbe} onMuskel={onMuskel} />
      <Figur achse={ACHSE_H} formen={HINTEN} aktivSet={aktivSet} farbe={farbe} onMuskel={onMuskel} />

      {labels && (
        <g fill="#7fe4ff" opacity={0.75} style={{ fontSize: 11, letterSpacing: "0.05em" }} textAnchor="middle">
          <text x={ACHSE_V} y={412}>Vorderseite</text>
          <text x={ACHSE_H} y={412}>Rückseite</text>
        </g>
      )}

      <style>{`
        @keyframes kkPuls { 0%,100% { opacity: 1 } 50% { opacity: .82 } }
        .kk-aktiv { animation: kkPuls 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .kk-aktiv { animation: none; } }
      `}</style>
    </svg>
  )
}
