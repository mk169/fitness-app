import { uebungVon } from "./uebungen"
import { e1rm } from "./training"

// Trainings-Analytik: leitet aus dem flachen Trainingslog
//   { datum, uebungId, gewicht, wdh }
// Wochenvolumen je Muskel, Rekorde, Konsistenz und Tonnage-Verlauf ab.

const TAG = 86400000
const toDate = (key) => new Date(`${key}T00:00:00`)

// Zielspanne Sätze/Woche pro Muskel (grobe, gängige Heuristik).
export const VOLUMEN_MIN = 10
export const VOLUMEN_OPT = 18

// Sätze je Muskelgruppe in den letzten `wochen` Wochen (primär ×1, sekundär ×0.5).
export function wochenVolumen(log, refDatum, wochen = 1) {
  const grenze = toDate(refDatum).getTime() - wochen * 7 * TAG
  const vol = {}
  for (const s of log ?? []) {
    if (toDate(s.datum).getTime() < grenze) continue
    const u = uebungVon(s.uebungId)
    if (!u) continue
    for (const m of u.muskeln ?? []) vol[m] = (vol[m] ?? 0) + 1
    for (const m of u.sekundaer ?? []) vol[m] = (vol[m] ?? 0) + 0.5
  }
  for (const k in vol) vol[k] = Math.round(vol[k] * 2) / 2
  return vol
}

// Intensität 0..1 je Muskel (für die Heatmap-Deckkraft), skaliert an VOLUMEN_OPT.
export function intensitaet(volumen) {
  const out = {}
  for (const k in volumen) out[k] = Math.max(0, Math.min(1, volumen[k] / VOLUMEN_OPT))
  return out
}

// Bewertung eines Wochenvolumens.
export function bewertung(saetze) {
  if (saetze < VOLUMEN_MIN) return "wenig"
  if (saetze <= VOLUMEN_OPT + 6) return "optimal"
  return "viel"
}

// Persönliche Rekorde: je Übung bester e1RM (+ Datum), absteigend sortiert.
export function persoenlicheRekorde(log) {
  const best = new Map()
  for (const s of log ?? []) {
    const wert = e1rm(s.gewicht, s.wdh)
    const cur = best.get(s.uebungId)
    if (!cur || wert > cur.wert) {
      best.set(s.uebungId, { uebungId: s.uebungId, wert, datum: s.datum, gewicht: s.gewicht, wdh: s.wdh })
    }
  }
  return [...best.values()]
    .map((r) => {
      const u = uebungVon(r.uebungId)
      return { ...r, name: u?.name ?? r.uebungId, koerpergewicht: u?.geraet === "Körpergewicht" }
    })
    .sort((a, b) => b.wert - a.wert)
}

// Beginn der ISO-Woche (Montag, lokal) zu einem Zeitstempel.
function wochenStart(ms) {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d.getTime()
}

// Konsistenz: eindeutige Trainingstage in Fenstern + aktuelle Wochen-Serie.
export function konsistenz(log, refDatum) {
  const tage = [...new Set((log ?? []).map((s) => s.datum))]
  const ref = toDate(refDatum).getTime()
  const zaehle = (n) => tage.filter((d) => toDate(d).getTime() >= ref - n * TAG).length

  let serie = 0
  let woche = wochenStart(ref)
  while (tage.some((d) => {
    const t = toDate(d).getTime()
    return t >= woche && t < woche + 7 * TAG
  })) {
    serie++
    woche -= 7 * TAG
  }
  return { tage7: zaehle(7), tage28: zaehle(28), serie }
}

// Tonnage (Gesamt-Trainingsvolumen kg×Wdh) je Woche, älteste zuerst.
export function tonnageVerlauf(log, wochen = 8, refDatum) {
  const montag = wochenStart(refDatum ? toDate(refDatum).getTime() : Date.now())
  const reihen = []
  for (let i = wochen - 1; i >= 0; i--) {
    const von = montag - i * 7 * TAG
    const bis = von + 7 * TAG
    let summe = 0
    for (const s of log ?? []) {
      const t = toDate(s.datum).getTime()
      if (t >= von && t < bis) summe += (s.gewicht || 1) * s.wdh
    }
    reihen.push({ von, tonnage: Math.round(summe) })
  }
  return reihen
}
