// Wochenrückblick („Wrapped"): verdichtet die letzten 7 Tage zu wenigen
// Highlight-Kennzahlen. Reine Funktion – die Anzeige nutzt nur das Ergebnis.

import { MUSKELGRUPPEN } from "./uebungen"
import { persoenlicheRekorde, konsistenz, wochenVolumen } from "./analytik"
import { heute } from "./datum"

const TAG = 86400000
const toDate = (key) => new Date(`${key}T00:00:00`)
const zuKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

// Die 7 Tageschlüssel des Fensters (ältester zuerst), endend an refDatum.
function fensterTage(ref) {
  const bis = toDate(ref)
  const tage = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(bis.getTime() - i * TAG)
    tage.push(zuKey(d))
  }
  return tage
}

export function wochenReport(daten = {}, refDatum) {
  const { log = [], checks = {}, mahlzeiten = [] } = daten
  const ref = refDatum ?? heute()
  const tage = fensterTage(ref)
  const tageSet = new Set(tage)

  const imFenster = log.filter((s) => tageSet.has(s.datum))
  const einheiten = new Set(imFenster.map((s) => s.datum)).size
  const tonnage = imFenster.reduce((a, s) => a + (s.gewicht || 0) * (s.wdh || 0), 0)
  const saetze = imFenster.length

  const grenze = toDate(ref).getTime() - 7 * TAG
  const neuePRs = persoenlicheRekorde(log).filter(
    (pr) => toDate(pr.datum).getTime() >= grenze
  ).length

  const vol = wochenVolumen(log, ref, 1)
  let topMuskel = null
  let topWert = 0
  for (const [k, v] of Object.entries(vol)) {
    if (v > topWert) {
      topWert = v
      topMuskel = k
    }
  }

  const ernaehrungTage = tage.filter((t) => checks?.[t]?.ernaehrung).length

  const mahlzeitenImFenster = mahlzeiten.filter((m) => tageSet.has(m.datum))
  const kcalTage = new Set(mahlzeitenImFenster.map((m) => m.datum)).size
  const kcalGesamt = mahlzeitenImFenster.reduce((a, m) => a + (m.kcal || 0), 0)
  const kcalSchnitt = kcalTage > 0 ? Math.round(kcalGesamt / kcalTage) : 0

  return {
    von: tage[0],
    bis: tage[tage.length - 1],
    einheiten,
    saetze,
    tonnage: Math.round(tonnage),
    neuePRs,
    topMuskel: topMuskel ? (MUSKELGRUPPEN[topMuskel]?.name ?? topMuskel) : null,
    serie: konsistenz(log, ref).serie,
    ernaehrungTage,
    kcalSchnitt,
    leer: einheiten === 0 && ernaehrungTage === 0 && mahlzeitenImFenster.length === 0,
  }
}

// Text-Zusammenfassung zum Teilen (Clipboard / Web-Share).
export function wrappedText(r) {
  const zeilen = [
    "🏋️ Meine Trainingswoche (Mogged)",
    `• ${r.einheiten} Einheiten · ${r.saetze} Sätze`,
    `• ${r.tonnage.toLocaleString("de-DE")} kg bewegt`,
  ]
  if (r.neuePRs > 0) zeilen.push(`• ${r.neuePRs} neue${r.neuePRs === 1 ? "r" : ""} Rekord${r.neuePRs === 1 ? "" : "e"} 💪`)
  if (r.topMuskel) zeilen.push(`• Fokus: ${r.topMuskel}`)
  if (r.serie > 0) zeilen.push(`• ${r.serie}-Wochen-Serie 🔥`)
  return zeilen.join("\n")
}
