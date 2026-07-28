// Übungs-Detailbibliothek: Anleitung, Coaching-Hinweise und typische Fehler
// je Übung. Für die wichtigsten Übungen kuratiert, für den Rest sinnvoll aus
// Kategorie, Gerät und Zielmuskeln erzeugt – so hat jede Übung eine
// verständliche, nicht zu technische Erklärung.

import { uebungVon, MUSKELGRUPPEN } from "./uebungen"

// Kuratierte Anleitungen für die Kern- und Beliebtheits-Übungen.
const KURIERT = {
  bankdruecken: {
    anleitung: [
      "Flach auf die Bank, Füße fest am Boden, leichtes Hohlkreuz.",
      "Stange etwas breiter als schulterbreit greifen, Schulterblätter zusammen und nach unten.",
      "Kontrolliert zur unteren Brust senken, Ellbogen ~45° zum Körper.",
      "Aus der Brust kraftvoll nach oben drücken, ohne die Schultern nach vorn zu ziehen.",
    ],
    tipps: ["Schulterblätter die ganze Zeit fixiert lassen", "Kraft aus den Beinen in die Bank leiten"],
    fehler: ["Ellbogen zu weit abgespreizt (90°)", "Gesäß hebt von der Bank ab"],
  },
  kniebeugen: {
    anleitung: [
      "Stange auf dem oberen Rücken (Trapez), Stand schulterbreit, Zehen leicht nach außen.",
      "Bauch anspannen, Brust raus, Blick nach vorn.",
      "Hüfte nach hinten und unten, Knie folgen der Fußrichtung.",
      "Mindestens bis Oberschenkel parallel, dann aus den Fersen nach oben drücken.",
    ],
    tipps: ["Knie nach außen denken", "Rumpf die ganze Bewegung fest halten"],
    fehler: ["Knie fallen nach innen", "Fersen heben sich", "Rücken rundet unten aus"],
  },
  kreuzheben: {
    anleitung: [
      "Mittelfuß unter der Stange, Stand hüftbreit.",
      "Hüfte beugen, Stange schulterbreit greifen, Schienbeine berühren die Stange.",
      "Brust raus, Rücken gerade, Lat anspannen („Stange in die Achseln ziehen“).",
      "Mit Beinen und Hüfte gleichzeitig hochdrücken, Stange dicht am Körper führen.",
    ],
    tipps: ["Rücken bleibt neutral – niemals rund", "Bewegung startet aus den Beinen, nicht dem Rücken"],
    fehler: ["Hüfte schießt zu früh hoch", "Stange wandert vom Körper weg"],
  },
  klimmzuege: {
    anleitung: [
      "Stange etwas breiter als schulterbreit im Obergriff fassen.",
      "Aus dem toten Hang starten, Schulterblätter zuerst nach unten ziehen.",
      "Ellbogen zur Hüfte ziehen, bis das Kinn über der Stange ist.",
      "Kontrolliert bis zur vollen Streckung ablassen.",
    ],
    tipps: ["Brust zur Stange führen statt nur Arme beugen", "Kein Schwung aus der Hüfte"],
    fehler: ["Nur halbe Bewegung (kein voller Hang)", "Reißen mit Schwung"],
  },
  schulterdruecken: {
    anleitung: [
      "Aufrecht sitzen oder stehen, Rumpf fest, Kurzhanteln auf Schulterhöhe.",
      "Handrücken zeigen nach vorn, Ellbogen leicht vor der Körperlinie.",
      "Gerade nach oben drücken, bis die Arme fast gestreckt sind.",
      "Kontrolliert auf Schulterhöhe zurückführen.",
    ],
    tipps: ["Nicht ins Hohlkreuz ausweichen – Bauch anspannen", "Gesäß und Beine mitspannen im Stand"],
    fehler: ["Übermäßiges Zurücklehnen", "Ellbogen zu weit hinten"],
  },
  rudern: {
    anleitung: [
      "Hüfte beugen bis Oberkörper ~45°, Rücken gerade, Knie leicht gebeugt.",
      "Stange hängen lassen, schulterbreit greifen.",
      "Stange zum unteren Bauch ziehen, Ellbogen dicht am Körper.",
      "Schulterblätter zusammenziehen, dann kontrolliert ablassen.",
    ],
    tipps: ["Zug kommt aus dem Rücken, nicht aus den Armen", "Oberkörper-Winkel konstant halten"],
    fehler: ["Aufrichten mit Schwung", "Rücken rundet ein"],
  },
  bizepscurls: {
    anleitung: [
      "Aufrecht stehen, Kurzhanteln seitlich, Handflächen nach vorn.",
      "Ellbogen fixiert am Körper, nur den Unterarm bewegen.",
      "Gewicht bis auf Schulterhöhe curlen, oben kurz anspannen.",
      "Langsam und kontrolliert ablassen (Negativphase betonen).",
    ],
    tipps: ["Ellbogen bleiben am Körper", "Nicht mit dem Rücken schwingen"],
    fehler: ["Schwung aus der Hüfte", "Ellbogen wandern nach vorn"],
  },
  liegestuetze: {
    anleitung: [
      "Hände etwas breiter als schulterbreit, Körper bildet eine gerade Linie.",
      "Bauch und Gesäß anspannen, Blick leicht nach vorn.",
      "Bis kurz über den Boden absenken, Ellbogen ~45°.",
      "Kraftvoll hochdrücken, ohne die Hüfte durchhängen zu lassen.",
    ],
    tipps: ["Körper bleibt ein Brett", "Ellbogen nicht senkrecht abspreizen"],
    fehler: ["Hüfte hängt durch", "Nur halbe Bewegungsamplitude"],
  },
  planke: {
    anleitung: [
      "Unterarme unter den Schultern, Ellbogen 90°.",
      "Körper in einer geraden Linie, Bauch fest angespannt.",
      "Gesäß mitanspannen, Becken leicht einrollen.",
      "Ruhig weiteratmen, Position halten.",
    ],
    tipps: ["Nicht ins Hohlkreuz sacken", "Nacken lang, Blick zum Boden"],
    fehler: ["Hüfte zu hoch oder zu tief", "Luft anhalten"],
  },
  dips: {
    anleitung: [
      "An parallelen Holmen abstützen, Arme gestreckt, Körper leicht nach vorn geneigt.",
      "Kontrolliert absenken, bis die Schultern etwa auf Ellbogenhöhe sind.",
      "Ellbogen nach hinten, nicht auseinander.",
      "Kraftvoll bis zur Streckung nach oben drücken.",
    ],
    tipps: ["Leichte Vorlage betont die Brust, aufrecht die Trizeps", "Schultern unten und weg von den Ohren"],
    fehler: ["Zu tief für die Schulter", "Auf- und Abwippen mit Schwung"],
  },
}

// Verständliche Gerätenamen für generische Hinweise.
function muskelName(key) {
  return MUSKELGRUPPEN[key]?.name ?? key
}

// Erzeugt für nicht kuratierte Übungen eine sinnvolle, knappe Anleitung.
function generisch(u) {
  const primaer = (u.muskeln ?? []).map(muskelName)
  const primListe = primaer.join(" & ")
  const koerper = u.geraet === "Körpergewicht"

  const anleitung = [
    koerper
      ? "Stabile Ausgangsposition einnehmen, Rumpf anspannen."
      : `${u.geraet} bereitlegen, sichere Ausgangsposition einnehmen, Rumpf anspannen.`,
    `Bewegung kontrolliert einleiten – Fokus auf ${primListe}.`,
    "In der Endposition den Zielmuskel bewusst anspannen.",
    "Langsam und kontrolliert zurückführen, volle Bewegungsamplitude nutzen.",
  ]
  const tipps = [
    "Sauberer, kontrollierter Bewegungsablauf schlägt schweres Gewicht",
    `Spannung gezielt in ${primaer[0] ?? "den Zielmuskel"} legen`,
  ]
  const fehler = ["Zu viel Schwung", "Zu kurze Bewegungsamplitude"]
  return { anleitung, tipps, fehler }
}

// Öffentlich: liefert Detail-Infos zu einer Übung (kuratiert oder generisch).
export function uebungDetail(id) {
  const u = uebungVon(id)
  if (!u) return null
  const extra = KURIERT[id] ?? generisch(u)
  const zielKarte = {}
  ;(u.muskeln ?? []).forEach((m) => (zielKarte[m] = 1))
  ;(u.sekundaer ?? []).forEach((m) => {
    if (!zielKarte[m]) zielKarte[m] = 0.5
  })
  return {
    ...u,
    ...extra,
    // Map für die Körperkarte: primär voll, sekundär halb eingefärbt.
    zielKarte,
    kuratiert: Boolean(KURIERT[id]),
  }
}
