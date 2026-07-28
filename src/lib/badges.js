// Erfolge / Badges: rein aus vorhandenen Daten abgeleitet (kein neuer
// Speicher). Jeder Badge kennt sein Ziel und den aktuellen Wert, sodass die
// Anzeige „erreicht" und einen Fortschritt (0..1) zeigen kann.

import { persoenlicheRekorde, konsistenz } from "./analytik"
import { streak } from "./habits"
import { heute } from "./datum"

// Ein einzelner Badge-Deskriptor aus Rohwert + Ziel.
function badge(id, icon, name, beschreibung, wert, ziel) {
  return {
    id,
    icon,
    name,
    beschreibung,
    wert,
    ziel,
    erreicht: wert >= ziel,
    fortschritt: ziel > 0 ? Math.min(1, wert / ziel) : 0,
  }
}

// Liefert die vollständige Badge-Liste (erreichte zuerst, dann nach
// Fortschritt) für die übergebenen Daten.
export function badgeListe({ log = [], checks = {}, mahlzeiten = [], refDatum } = {}) {
  const ref = refDatum ?? heute()
  const trainingsTage = new Set(log.map((s) => s.datum)).size
  const uebungenVerschieden = new Set(log.map((s) => s.uebungId)).size
  const prs = persoenlicheRekorde(log).length
  const tonnage = log.reduce((a, s) => a + (s.gewicht || 0) * (s.wdh || 0), 0)
  const serie = konsistenz(log, ref).serie
  const ernaehrungStreak = streak(checks, { feld: "ernaehrung" }, ref)
  const mahlzeitenGeloggt = mahlzeiten.length

  const liste = [
    badge("erste_einheit", "🎯", "Erste Einheit", "Absolviere dein erstes Training", trainingsTage, 1),
    badge("zehn_einheiten", "🔥", "Dranbleiber", "10 Trainingseinheiten absolviert", trainingsTage, 10),
    badge("fuenfzig_einheiten", "🏆", "Eisern", "50 Trainingseinheiten absolviert", trainingsTage, 50),
    badge("serie_4", "📅", "Verlässlich", "4 Wochen in Folge trainiert", serie, 4),
    badge("erster_pr", "💪", "Neuer Rekord", "Stelle deinen ersten persönlichen Rekord auf", prs, 1),
    badge("vielseitig", "🤸", "Vielseitig", "10 verschiedene Übungen ausprobiert", uebungenVerschieden, 10),
    badge("tonnage_10k", "🚚", "10 Tonnen", "Insgesamt 10.000 kg bewegt", tonnage, 10000),
    badge("tonnage_50k", "🐘", "50 Tonnen", "Insgesamt 50.000 kg bewegt", tonnage, 50000),
    badge("ernaehrung_7", "🥗", "Sauber gegessen", "7 Tage in Folge Ernährung eingehalten", ernaehrungStreak, 7),
    badge("protokoll", "📓", "Protokoll-Profi", "30 Mahlzeiten getrackt", mahlzeitenGeloggt, 30),
  ]

  return liste.sort((a, b) => {
    if (a.erreicht !== b.erreicht) return a.erreicht ? -1 : 1
    return b.fortschritt - a.fortschritt
  })
}

// Kompakte Zusammenfassung (erreicht / gesamt).
export function badgeStand(daten) {
  const liste = badgeListe(daten)
  return { erreicht: liste.filter((b) => b.erreicht).length, gesamt: liste.length }
}
