// Trainingslog: jeder gespeicherte Satz ist ein flacher Eintrag
//   { id, datum: "JJJJ-MM-TT", uebungId, gewicht (kg, 0 = Körpergewicht), wdh }
// Daraus werden Verlauf, Bestwerte und Progressive-Overload-Vorschläge
// berechnet.

// Geschätztes 1-Rep-Max nach Epley. Bei Körpergewichtsübungen (gewicht 0)
// zählen die Wiederholungen selbst als Fortschrittsmaß.
export function e1rm(gewicht, wdh) {
  if (!gewicht) return wdh
  return Math.round(gewicht * (1 + wdh / 30) * 10) / 10
}

// Verlauf einer Übung: Sätze nach Trainingstag gruppiert, chronologisch,
// mit Bestwert (e1RM bzw. Wdh.) und Volumen pro Einheit.
export function verlaufVon(log, uebungId) {
  const nachTag = new Map()
  for (const s of log) {
    if (s.uebungId !== uebungId) continue
    if (!nachTag.has(s.datum)) nachTag.set(s.datum, [])
    nachTag.get(s.datum).push(s)
  }
  return [...nachTag.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([datum, saetze]) => ({
      datum,
      saetze,
      best: Math.max(...saetze.map((s) => e1rm(s.gewicht, s.wdh))),
      volumen: saetze.reduce((v, s) => v + (s.gewicht || 1) * s.wdh, 0),
    }))
}

// Progressiver Overload (doppelte Progression): erst Wiederholungen
// steigern, ab 12 Wdh. Gewicht +2,5 kg und zurück auf 8.
// vorDatum blendet die laufende Einheit aus, damit der Vorschlag sich
// auf die letzte abgeschlossene Einheit bezieht.
export function overloadVorschlag(log, uebungId, vorDatum = null) {
  const verlauf = verlaufVon(log, uebungId).filter(
    (v) => !vorDatum || v.datum < vorDatum
  )
  const letzte = verlauf[verlauf.length - 1]
  if (!letzte) return null

  const bester = letzte.saetze.reduce((a, b) =>
    e1rm(b.gewicht, b.wdh) > e1rm(a.gewicht, a.wdh) ? b : a
  )

  if (!bester.gewicht) {
    return {
      gewicht: 0,
      wdh: bester.wdh + 1,
      text: `Letzte Einheit: ${bester.wdh} Wdh. → heute ${bester.wdh + 1} anpeilen`,
    }
  }
  if (bester.wdh >= 12) {
    return {
      gewicht: bester.gewicht + 2.5,
      wdh: 8,
      text: `12+ Wdh. geschafft → heute ${bester.gewicht + 2.5} kg × 8 anpeilen`,
    }
  }
  return {
    gewicht: bester.gewicht,
    wdh: bester.wdh + 1,
    text: `Letzte Einheit: ${bester.gewicht} kg × ${bester.wdh} → heute ${bester.wdh + 1} Wdh. anpeilen`,
  }
}
