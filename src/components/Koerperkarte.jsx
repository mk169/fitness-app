import { MUSKELGRUPPEN } from "../lib/uebungen"

// Körperkarte (Vorder- & Rückseite) als klare, exakt symmetrische
// Linienzeichnung mit dezentem 3D-Effekt: Verläufe auf Körper und
// Muskeln, Glanzlicht von oben und ein weicher Schatten unter aktiven
// Muskeln. Muskeln sind als gespiegelte Paare um die Körperachse
// definiert – dadurch sind beide Seiten garantiert identisch.

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

// Körper-Silhouette: Rumpf als Pfad, Gliedmaßen als runde Striche –
// dadurch wirken Arme und Beine wie weiche Kapseln.
function Silhouette() {
  const koerper = { fill: "url(#kkKoerper)", stroke: "#d3dae3", strokeWidth: 1.4 }
  const glied = {
    stroke: "url(#kkKoerper)",
    strokeLinecap: "round",
    fill: "none",
  }
  const kontur = { stroke: "#d3dae3", strokeWidth: 1.2, strokeLinecap: "round", fill: "none", opacity: 0.9 }

  return (
    <g>
      {/* Bodenschatten für Tiefe */}
      <ellipse cx={0} cy={372} rx={52} ry={7} fill="#0f172a" opacity={0.07} />

      {/* Beine */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M ${s * 14} 170 L ${s * 16} 268 L ${s * 14} 356`} {...glied} strokeWidth={24} />
          <path d={`M ${s * 14} 170 L ${s * 16} 268 L ${s * 14} 356`} {...kontur} strokeWidth={25} stroke="#d3dae3" opacity={0.35} />
          <ellipse cx={s * 17} cy={364} rx={11} ry={5.5} {...koerper} />
        </g>
      ))}

      {/* Arme */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M ${s * 37} 74 L ${s * 50} 132 L ${s * 58} 190`} {...glied} strokeWidth={16} />
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
    fill: aktiv ? farbe : "#ffffff",
    stroke: aktiv ? farbe : "#c6cfda",
    strokeWidth: 1.3,
    cursor: onMuskel ? "pointer" : "default",
    filter: aktiv ? "url(#kkTiefe)" : undefined,
    style: { transition: "fill .15s, stroke .15s" },
    onClick: onMuskel ? () => onMuskel(form.key) : undefined,
  }
  // Glanzlicht von oben – gibt jeder Form eine leichte Wölbung.
  const glanz = { fill: "url(#kkGlanz)", pointerEvents: "none" }

  const elemente = []
  if (form.paar) {
    const p = form.paar
    for (const s of [-1, 1]) {
      const t = p.rot ? `rotate(${s * p.rot} ${s * p.dx} ${p.cy})` : undefined
      elemente.push(
        <g key={s} transform={t}>
          <ellipse cx={s * p.dx} cy={p.cy} rx={p.rx} ry={p.ry} {...stil} />
          <ellipse cx={s * p.dx} cy={p.cy - p.ry * 0.25} rx={p.rx * 0.8} ry={p.ry * 0.6} {...glanz} />
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
          <g stroke={aktiv ? "#ffffff" : "#e2e8f0"} strokeWidth={1.1} opacity={0.75} pointerEvents="none">
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

export default function Koerperkarte({ aktiv, onMuskel, farbe = "#3b82f6", labels = true }) {
  const aktivSet = aktiv instanceof Set ? aktiv : new Set(aktiv ?? [])

  return (
    <svg viewBox="0 0 460 428" className="w-full" role="img" aria-label="Körperkarte der trainierten Muskeln">
      <defs>
        {/* Körper: sanfter Verlauf von hell nach etwas dunkler = Volumen */}
        <linearGradient id="kkKoerper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbfcfe" />
          <stop offset="100%" stopColor="#e8edf3" />
        </linearGradient>
        {/* Glanzlicht von oben auf jedem Muskel */}
        <linearGradient id="kkGlanz" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* Weicher Schatten unter aktiven Muskeln */}
        <filter id="kkTiefe" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1.4" stdDeviation="1.6" floodColor="#1e3a8a" floodOpacity="0.35" />
        </filter>
      </defs>

      <Figur achse={ACHSE_V} formen={VORNE} aktivSet={aktivSet} farbe={farbe} onMuskel={onMuskel} />
      <Figur achse={ACHSE_H} formen={HINTEN} aktivSet={aktivSet} farbe={farbe} onMuskel={onMuskel} />

      {labels && (
        <g className="fill-gray-400" style={{ fontSize: 11 }} textAnchor="middle">
          <text x={ACHSE_V} y={412}>Vorderseite</text>
          <text x={ACHSE_H} y={412}>Rückseite</text>
        </g>
      )}
    </svg>
  )
}
