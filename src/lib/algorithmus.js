// Der "Algorithmus": leitet aus Ziel + Körperdaten konkrete Vorgaben für
// Ernährung (Kalorien, Makros) und Training (Split, Wiederholungen, Cardio)
// ab. Alles ist rein rechnerisch und kann jederzeit neu eingestellt werden.

// Ziel-Modi. jeder Modus bestimmt Kalorien-Offset, Protein-Bedarf und den
// Trainingsfokus. defizit/ueberschuss in kcal relativ zum Erhaltungsbedarf.
export const ZIEL_MODI = {
  abnehmen: {
    name: "Abnehmen",
    kurz: "moderates Defizit",
    farbe: "sky",
    kcalOffset: -400,
    proteinProKg: 2.0,
    fokus: "Muskeln halten, Fett verlieren",
    wiederholungen: "8–12",
    cardio: "2–3× / Woche 20–30 min",
  },
  schneller_cut: {
    name: "Schneller Cut",
    kurz: "starkes Defizit",
    farbe: "rose",
    kcalOffset: -650,
    proteinProKg: 2.2,
    fokus: "Definition, aggressiver Fettabbau",
    wiederholungen: "10–15",
    cardio: "4–5× / Woche 25–40 min",
  },
  halten: {
    name: "Gewicht halten",
    kurz: "Erhaltung",
    farbe: "gray",
    kcalOffset: 0,
    proteinProKg: 1.8,
    fokus: "Form & Leistung stabilisieren",
    wiederholungen: "6–12",
    cardio: "nach Bedarf",
  },
  zunehmen: {
    name: "Zunehmen",
    kurz: "Überschuss",
    farbe: "amber",
    kcalOffset: 350,
    proteinProKg: 1.8,
    fokus: "Masse & Kraft aufbauen",
    wiederholungen: "5–10",
    cardio: "wenig, nur Erhaltung",
  },
  muskeln: {
    name: "Muskeln aufbauen",
    kurz: "Lean Bulk",
    farbe: "emerald",
    kcalOffset: 250,
    proteinProKg: 2.0,
    fokus: "Hypertrophie mit wenig Fettaufbau",
    wiederholungen: "8–12",
    cardio: "1–2× / Woche leicht",
  },
}

// Aktivitätsfaktoren für den Gesamtumsatz (TDEE).
export const AKTIVITAET = {
  sitzend: { name: "Sitzend (kaum Bewegung)", faktor: 1.2 },
  leicht: { name: "Leicht aktiv (1–2× Sport)", faktor: 1.375 },
  moderat: { name: "Moderat (3–4× Sport)", faktor: 1.55 },
  aktiv: { name: "Sehr aktiv (5–6× Sport)", faktor: 1.725 },
  extrem: { name: "Extrem (Sport + körperl. Arbeit)", faktor: 1.9 },
}

// Grundumsatz: Ist der Körperfettanteil bekannt, wird nach Katch-McArdle
// über die fettfreie Masse gerechnet (genauer). Sonst Mifflin-St Jeor.
export function bmr({ geschlecht, gewicht, groesse, alter, kfa }) {
  if (kfa > 0 && kfa < 70) {
    const magermasse = gewicht * (1 - kfa / 100)
    return Math.round(370 + 21.6 * magermasse)
  }
  const basis = 10 * gewicht + 6.25 * groesse - 5 * alter
  return Math.round(geschlecht === "w" ? basis - 161 : basis + 5)
}

// Empfohlener Split abhängig von den Trainingstagen pro Woche.
export function empfohlenerSplit(tageProWoche) {
  if (tageProWoche <= 2) return { key: "ganzkoerper", name: "Ganzkörper" }
  if (tageProWoche === 3) return { key: "ganzkoerper", name: "Ganzkörper 3×" }
  if (tageProWoche === 4) return { key: "oberUnter", name: "Ober- / Unterkörper" }
  return { key: "ppl", name: "Push / Pull / Legs" }
}

// Zentrale Berechnung. profil enthält Körperdaten + Ziel + Trainingsdaten.
// Gibt Kalorien, Makros, Trainingsempfehlung und Deadline-Info zurück.
export function berechnePlan(profil) {
  if (!profil?.gewicht || !profil?.groesse || !profil?.alter) return null

  const modus = ZIEL_MODI[profil.modus] ?? ZIEL_MODI.halten
  const grund = bmr(profil)
  const faktor = (AKTIVITAET[profil.aktivitaet] ?? AKTIVITAET.moderat).faktor
  const erhaltung = Math.round(grund * faktor)
  const kalorien = erhaltung + modus.kcalOffset

  const mitKfa = profil.kfa > 0 && profil.kfa < 70
  const magermasse = mitKfa
    ? Math.round(profil.gewicht * (1 - profil.kfa / 100) * 10) / 10
    : null

  const protein = Math.round(profil.gewicht * modus.proteinProKg)
  const fett = Math.round(profil.gewicht * 0.9)
  const restKcal = kalorien - protein * 4 - fett * 9
  const kohlenhydrate = Math.max(0, Math.round(restKcal / 4))

  const split = empfohlenerSplit(profil.trainingsTage ?? 3)

  return {
    modus: profil.modus,
    modusInfo: modus,
    grundumsatz: grund,
    erhaltung,
    kalorien,
    formel: mitKfa ? "Katch-McArdle" : "Mifflin-St Jeor",
    magermasse,
    makros: { protein, fett, kohlenhydrate },
    training: {
      split,
      tageProWoche: profil.trainingsTage ?? 3,
      wiederholungen: modus.wiederholungen,
      cardio: modus.cardio,
      fokus: modus.fokus,
      zeitProEinheit: profil.zeitProEinheit ?? 60,
    },
    deadline: deadlineInfo(profil, modus),
  }
}

// Deadline-Bewertung: nötige Gewichtsänderung pro Woche und ob das Tempo
// realistisch ist (Faustregel: max ~1 % Körpergewicht pro Woche).
function deadlineInfo(profil, modus) {
  if (!profil.deadline || !profil.zielGewicht) return null
  const heute = new Date()
  heute.setHours(0, 0, 0, 0)
  const ziel = new Date(profil.deadline)
  const wochen = Math.max(1, Math.round((ziel - heute) / (1000 * 60 * 60 * 24 * 7)))
  const differenz = profil.zielGewicht - profil.gewicht
  const proWoche = differenz / wochen
  const grenze = profil.gewicht * 0.01
  const realistisch = Math.abs(proWoche) <= grenze

  return {
    datum: profil.deadline,
    wochen,
    differenz: Math.round(differenz * 10) / 10,
    proWoche: Math.round(proWoche * 100) / 100,
    realistisch,
    richtung: modus.kcalOffset < 0 ? "abnehmen" : modus.kcalOffset > 0 ? "zunehmen" : "halten",
  }
}
