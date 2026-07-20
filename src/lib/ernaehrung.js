// Ernährung besteht aus zwei unabhängigen Ebenen:
//   1. KONZEPTE  – die Ernährungsweise (Standard, Ray Peat, Keto …)
//   2. FASTEN     – Methoden mit einem oder mehreren Essensfenstern.
// Beides lässt sich frei kombinieren.

export const KONZEPTE = [
  {
    id: "standard",
    name: "Ausgewogen",
    kurz: "Standard",
    farbe: "gray",
    idee: "Ausgewogene Mischkost nach deinen Makro-Zielen – kein Nahrungsmittel ist verboten.",
    prinzipien: [
      "Makro-Ziele aus dem Algorithmus als Rahmen",
      "Viel Gemüse, ausreichend Protein",
      "Vollkorn, gute Fette, wenig Zucker",
    ],
  },
  {
    id: "peat",
    name: "Ray Peat",
    kurz: "Pro-metabolisch",
    farbe: "amber",
    idee: "Stoffwechsel-orientiert nach Ray Peat: leicht verdauliche, sättigende Kost für Schilddrüse & Energie.",
    prinzipien: [
      "Fructose & Saccharose aus reifem Obst, Saft, Honig",
      "Milch, Käse, Gelatine als Protein",
      "Gesättigte Fette (Kokos, Butter), wenig PUFA",
      "Regelmäßig essen – Fasten wird eher gemieden",
    ],
  },
  {
    id: "keto",
    name: "Keto",
    kurz: "< 30 g Carbs",
    farbe: "emerald",
    idee: "Sehr kohlenhydratarm, fettbetont – Energie aus Ketonkörpern.",
    prinzipien: [
      "< 20–30 g Kohlenhydrate pro Tag",
      "Hoher Fettanteil, moderates Protein",
      "Elektrolyte beachten (Natrium, Kalium, Magnesium)",
    ],
  },
  {
    id: "highprotein",
    name: "High Protein",
    kurz: "proteinreich",
    farbe: "rose",
    idee: "Proteinbetont – ideal in Diät (Sättigung) und Aufbau (Muskelerhalt).",
    prinzipien: [
      "≥ 2 g Protein pro kg Körpergewicht",
      "Mageres Fleisch, Fisch, Eier, Quark, Hülsenfrüchte",
      "Protein auf alle Mahlzeiten verteilen",
    ],
  },
]

// Fasten-Methoden. fenster = Standard-Essensfenster (Stunden 0–24). Bei
// Methoden ohne feste Uhrzeit (z. B. 5:2) bleibt fenster leer und es zählt
// fastenTage / Beschreibung.
export const FASTEN_METHODEN = [
  { id: "keins", name: "Kein Fasten", kurz: "durchgehend", fenster: [], beschreibung: "Keine feste Fastenphase – iss nach deinem Konzept." },
  { id: "14:10", name: "14:10", kurz: "sanft", fenster: [{ start: 10, ende: 20 }], beschreibung: "14 h fasten, 10 h essen. Guter Einstieg." },
  { id: "16:8", name: "16:8", kurz: "klassisch", fenster: [{ start: 12, ende: 20 }], beschreibung: "16 h fasten, 8 h Essensfenster." },
  { id: "18:6", name: "18:6", kurz: "fortgeschritten", fenster: [{ start: 14, ende: 20 }], beschreibung: "18 h fasten, 6 h essen." },
  { id: "omad", name: "OMAD 20:4", kurz: "1 Mahlzeit", fenster: [{ start: 17, ende: 21 }], beschreibung: "Eine Mahlzeit pro Tag, ~20 h fasten." },
  { id: "5:2", name: "5:2", kurz: "2 Fastentage", fenster: [], beschreibung: "5 Tage normal, an 2 Tagen stark reduziert (~500–600 kcal)." },
  { id: "custom", name: "Eigene Fenster", kurz: "individuell", fenster: [{ start: 8, ende: 12 }, { start: 17, ende: 21 }], beschreibung: "Mehrere eigene Essensfenster frei definieren." },
]

export function konzeptVon(id) {
  return KONZEPTE.find((k) => k.id === id) ?? KONZEPTE[0]
}
export function methodeVon(id) {
  return FASTEN_METHODEN.find((m) => m.id === id) ?? FASTEN_METHODEN[0]
}

export const FASTEN_STANDARD = { methode: "16:8", fenster: [{ start: 12, ende: 20 }] }

// ---- Mehrtägige Fastenphasen (z. B. 48-h- oder 72-h-Fasten) ----
// Eine Phase: { id, start: "JJJJ-MM-TT", tage: Zahl }

function tagesDiff(vonKey, bisKey) {
  const von = new Date(`${vonKey}T00:00:00`)
  const bis = new Date(`${bisKey}T00:00:00`)
  return Math.round((bis - von) / (1000 * 60 * 60 * 24))
}

// Status einer Phase an einem Datum: kommend / aktiv (mit Tag x) / beendet.
export function phasenStatus(phase, datumKey) {
  const tag = tagesDiff(phase.start, datumKey)
  if (tag < 0) return { status: "kommend", inTagen: -tag }
  if (tag >= phase.tage) return { status: "beendet" }
  return { status: "aktiv", tag: tag + 1 }
}

// Die heute aktive Phase (oder null).
export function aktivePhase(phasen, datumKey) {
  for (const p of phasen ?? []) {
    const s = phasenStatus(p, datumKey)
    if (s.status === "aktiv") return { ...p, tag: s.tag }
  }
  return null
}

export const FARBEN = {
  gray: { chip: "bg-white/10 text-muted", rand: "border-white/20", punkt: "bg-slate-400" },
  amber: { chip: "bg-amber-500/15 text-amber-300", rand: "border-amber-400/50", punkt: "bg-amber-400" },
  sky: { chip: "bg-sky-500/15 text-sky-300", rand: "border-sky-400/50", punkt: "bg-sky-400" },
  rose: { chip: "bg-rose-500/15 text-rose-300", rand: "border-rose-400/50", punkt: "bg-rose-400" },
  emerald: { chip: "bg-emerald-500/15 text-emerald-300", rand: "border-emerald-400/50", punkt: "bg-emerald-400" },
}

// Aus einer Liste von Essensfenstern die aktuelle Fasten-Situation
// berechnen: ob gerade ein Fenster offen ist und wie lange bis zum
// nächsten Wechsel (in Stunden, dezimal).
export function fastenStatus(fenster, jetztStunde) {
  if (!fenster || fenster.length === 0) return null
  const offen = fenster.find((f) => jetztStunde >= f.start && jetztStunde < f.ende)
  if (offen) {
    return { imFenster: true, bis: offen.ende - jetztStunde, fenster: offen }
  }
  // Nächster Fensterbeginn (heute oder morgen).
  let minAbstand = Infinity
  let naechstes = null
  for (const f of fenster) {
    const abstand = (f.start - jetztStunde + 24) % 24
    if (abstand < minAbstand) {
      minAbstand = abstand
      naechstes = f
    }
  }
  return { imFenster: false, bis: minAbstand, fenster: naechstes }
}
