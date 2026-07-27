import { phasenStatus } from "./ernaehrung"

// Programme & Phasen über Zeiträume (Trainingsprogramme, Diät-Phasen,
// Fasten, Sonstiges). Ein Eintrag: { id, name, typ, start:"JJJJ-MM-TT",
// tage, notiz? }. Der Zeitraum-Status wird über phasenStatus (start + tage)
// aus lib/ernaehrung.js berechnet – dieselbe Logik wie bei Fastenphasen.

export const PROGRAMM_TYPEN = {
  programm: { name: "Trainingsprogramm", farbe: "indigo" },
  diaet: { name: "Diät-Phase", farbe: "emerald" },
  fasten: { name: "Fasten", farbe: "violet" },
  sonstiges: { name: "Sonstiges", farbe: "slate" },
}

export function typInfo(typ) {
  return PROGRAMM_TYPEN[typ] ?? PROGRAMM_TYPEN.sonstiges
}

// Enddatum-Schlüssel (exklusiv letzter Tag) für Anzeige.
export function endeVon(p) {
  const d = new Date(`${p.start}T00:00:00`)
  d.setDate(d.getDate() + Math.max(1, p.tage) - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// Status eines Programms an einem Tag.
export function programmStatus(p, dayKey) {
  return phasenStatus({ start: p.start, tage: p.tage }, dayKey)
}

// Alle an einem Tag aktiven Programme (inkl. aktuellem Tag x/y).
export function aktiveProgramme(programme, dayKey) {
  return (programme ?? [])
    .map((p) => ({ p, s: programmStatus(p, dayKey) }))
    .filter(({ s }) => s.status === "aktiv")
    .map(({ p, s }) => ({ ...p, tag: s.tag }))
}
