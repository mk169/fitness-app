// Abgeleitete Statistiken für Streak, Heatmap und Wochen-Kennzahlen.
// Alles wird aus bereits gespeicherten Daten berechnet (trainingLog,
// checks, cardioLog) – hier wird nichts zusätzlich persistiert.

import { e1rm } from "./training"
import { uebungVon } from "./uebungen"

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// Montag der Woche eines Datums (Woche beginnt Montag – wie im Wochenplan).
export function montagVon(d) {
  const k = new Date(d)
  k.setHours(0, 0, 0, 0)
  k.setDate(k.getDate() - ((k.getDay() + 6) % 7))
  return k
}

// Alle Tage mit Trainings-Aktivität als Set von "JJJJ-MM-TT".
// Aktiv = geloggter Satz, abgehakte Übung oder ein Cardio-Eintrag.
export function trainingsTage(log = [], checks = {}, cardioLog = []) {
  const tage = new Set()
  for (const s of log) if (s.datum) tage.add(s.datum)
  for (const [tag, c] of Object.entries(checks)) {
    if (c?.uebungen && Object.values(c.uebungen).some(Boolean)) tage.add(tag)
  }
  for (const c of cardioLog) if (c.datum) tage.add(c.datum)
  return tage
}

// Wochen-Streak: wie viele zusammenhängende Wochen (bis einschließlich der
// aktuellen bzw. letzten aktiven) mindestens einen Trainingstag hatten.
export function wochenStreak(tageSet) {
  if (tageSet.size === 0) return 0
  const wochenMitTraining = new Set(
    [...tageSet].map((k) => dateKey(montagVon(new Date(`${k}T00:00:00`))))
  )
  let streak = 0
  const cursor = montagVon(new Date())
  // Aktuelle Woche darf noch leer sein, ohne den Streak zu brechen.
  if (!wochenMitTraining.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 7)
  while (wochenMitTraining.has(dateKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 7)
  }
  return streak
}

// Tages-Streak: zusammenhängende Tage mit Aktivität, bis heute/gestern.
export function tagesStreak(tageSet) {
  if (tageSet.size === 0) return 0
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  if (!tageSet.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (tageSet.has(dateKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// Heatmap-Daten: die letzten `wochen` Wochen als Spalten (Mo–So).
// Jede Zelle: { datum, intensitaet 0..3, zukunft }.
export function heatmapDaten(log = [], checks = {}, cardioLog = [], wochen = 26) {
  const tageSet = trainingsTage(log, checks, cardioLog)
  const saetzeProTag = {}
  for (const s of log) saetzeProTag[s.datum] = (saetzeProTag[s.datum] || 0) + 1

  const heuteK = dateKey(new Date())
  const start = montagVon(new Date())
  start.setDate(start.getDate() - (wochen - 1) * 7)

  const spalten = []
  for (let w = 0; w < wochen; w++) {
    const tage = []
    for (let d = 0; d < 7; d++) {
      const tag = new Date(start)
      tag.setDate(tag.getDate() + w * 7 + d)
      const key = dateKey(tag)
      const aktiv = tageSet.has(key)
      const n = saetzeProTag[key] || 0
      const intensitaet = !aktiv ? 0 : n >= 12 ? 3 : n >= 5 ? 2 : 1
      tage.push({ datum: key, intensitaet, zukunft: key > heuteK })
    }
    spalten.push(tage)
  }
  return spalten
}

// Kennzahlen der aktuellen Woche: Sätze, Wiederholungen, Volumen (kg) und
// die trainierten Muskelgruppen (für die Körperkarte „Diese Woche“).
export function wochenKennzahlen(log = []) {
  const montag = montagVon(new Date())
  const montagK = dateKey(montag)
  const woche = log.filter((s) => s.datum >= montagK)

  let reps = 0
  let volumen = 0
  const muskeln = new Set()
  for (const s of woche) {
    reps += s.wdh || 0
    volumen += (s.gewicht || 1) * (s.wdh || 0)
    const u = uebungVon(s.uebungId)
    if (u) {
      u.muskeln.forEach((m) => muskeln.add(m))
      ;(u.sekundaer ?? []).forEach((m) => muskeln.add(m))
    }
  }
  return { saetze: woche.length, reps, volumen: Math.round(volumen), muskeln }
}

// Bestwert (e1RM bzw. Wdh.) aller je gelogten Sätze – für „Total“-Kacheln.
export function gesamtKennzahlen(log = []) {
  let reps = 0
  let volumen = 0
  const tage = new Set()
  let pbs = 0
  const bestProUebung = {}
  for (const s of log) {
    reps += s.wdh || 0
    volumen += (s.gewicht || 1) * (s.wdh || 0)
    tage.add(s.datum)
    const wert = e1rm(s.gewicht, s.wdh)
    if (wert > (bestProUebung[s.uebungId] ?? 0)) {
      if (bestProUebung[s.uebungId] !== undefined) pbs++
      bestProUebung[s.uebungId] = wert
    }
  }
  return { reps, volumen: Math.round(volumen), einheiten: tage.size, pbs }
}
