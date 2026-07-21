import { UEBUNGEN } from "./uebungen"

// Wissenschaftlich fundierte Trainings-Splits. Jeder Split beschreibt
// seinen Wochenzyklus als Tagesvorlagen (Kategorie + Anzahl Übungen).
// wendeSplitAn() erzeugt daraus einen konkreten Wochenplan – wahlweise
// fürs Gym oder komplett ohne Geräte (Calisthenics).

export const WOCHEN_KEYS = ["mo", "di", "mi", "do", "fr", "sa", "so"]

export const SPLITS = {
  gk2: {
    name: "Ganzkörper 2×",
    empfohleneTage: 2,
    kurz: "minimalistisch",
    wissenschaft:
      "Schon 2 Einheiten pro Woche liefern einen Großteil der möglichen " +
      "Zuwächse (Minimal-Dose-Forschung, z. B. Androulakis-Korakakis 2020). " +
      "Ideal bei wenig Zeit.",
    zyklus: [
      { name: "Ganzkörper", bloecke: [["Beine", 2], ["Push", 2], ["Pull", 2]] },
    ],
  },
  gk3: {
    name: "Ganzkörper 3×",
    empfohleneTage: 3,
    kurz: "Einsteiger-Standard",
    wissenschaft:
      "Jede Muskelgruppe 2–3× pro Woche zu treffen ist laut Meta-Analysen " +
      "(Schoenfeld et al. 2016) mindestens gleichwertig, oft leicht besser " +
      "als 1×. Bester Start für die ersten 1–2 Trainingsjahre.",
    zyklus: [
      { name: "Ganzkörper", bloecke: [["Beine", 2], ["Push", 2], ["Pull", 2], ["Core", 1]] },
    ],
  },
  oberUnter: {
    name: "Ober- / Unterkörper",
    empfohleneTage: 4,
    kurz: "4 Tage, Frequenz 2×",
    wissenschaft:
      "Trifft jeden Muskel 2× pro Woche und verteilt das Volumen auf 4 " +
      "Einheiten – gut belegter Sweet-Spot aus Frequenz, Volumen und " +
      "Regeneration für Fortgeschrittene.",
    zyklus: [
      { name: "Oberkörper", bloecke: [["Push", 3], ["Pull", 3]] },
      { name: "Unterkörper", bloecke: [["Beine", 4], ["Core", 2]] },
    ],
  },
  ppl: {
    name: "Push / Pull / Legs",
    empfohleneTage: 6,
    kurz: "hohes Volumen",
    wissenschaft:
      "Bei 6 Tagen wird jeder Muskel 2× pro Woche mit viel Volumen " +
      "trainiert. Sinnvoll für Fortgeschrittene mit viel Zeit – bei nur 3 " +
      "Tagen sinkt die Frequenz auf 1×, dann ist Ganzkörper meist besser.",
    zyklus: [
      { name: "Push", bloecke: [["Push", 4], ["Core", 1]] },
      { name: "Pull", bloecke: [["Pull", 4], ["Core", 1]] },
      { name: "Beine", bloecke: [["Beine", 4], ["Core", 1]] },
    ],
  },
  gk4: {
    name: "Ganzkörper 4×",
    empfohleneTage: 4,
    kurz: "hohe Frequenz",
    wissenschaft:
      "Vier Ganzkörper-Einheiten treffen jeden Muskel bis zu 4× pro Woche " +
      "bei moderatem Volumen pro Einheit. Die hohe Frequenz hält die " +
      "Proteinsynthese durchgehend aktiv und verteilt die Belastung – gut " +
      "für Fortgeschrittene, die die Woche flexibel halten wollen.",
    zyklus: [
      { name: "Ganzkörper A", bloecke: [["Beine", 2], ["Push", 2], ["Pull", 2]] },
      { name: "Ganzkörper B", bloecke: [["Pull", 2], ["Push", 2], ["Beine", 1], ["Core", 1]] },
    ],
  },
  phul: {
    name: "Power / Hypertrophie U/L",
    empfohleneTage: 4,
    kurz: "Kraft + Muskel",
    wissenschaft:
      "PHUL kombiniert zwei schwere Kraft-Tage (niedrige Wdh., Grundübungen) " +
      "mit zwei Hypertrophie-Tagen (höhere Wdh., mehr Isolation). So werden " +
      "Maximalkraft und Muskelwachstum parallel entwickelt – jeder Muskel " +
      "wird 2× pro Woche getroffen.",
    zyklus: [
      { name: "Oberkörper Kraft", bloecke: [["Push", 3], ["Pull", 3]] },
      { name: "Unterkörper Kraft", bloecke: [["Beine", 4], ["Core", 1]] },
      { name: "Oberkörper Hypertrophie", bloecke: [["Push", 3], ["Pull", 3]] },
      { name: "Unterkörper Hypertrophie", bloecke: [["Beine", 4], ["Core", 2]] },
    ],
  },
  bro: {
    name: "5er-Split",
    empfohleneTage: 5,
    kurz: "je Muskel 1 Tag",
    wissenschaft:
      "Der klassische „Bro-Split“ widmet jeder Muskelgruppe einen eigenen " +
      "Tag mit sehr hohem Volumen. Die Frequenz von 1× pro Woche ist " +
      "suboptimal, das enorme Volumen pro Einheit gleicht das für erfahrene " +
      "Bodybuilder aber teilweise aus – beliebt und motivierend.",
    zyklus: [
      { name: "Brust & Trizeps", bloecke: [["Push", 5]] },
      { name: "Rücken & Bizeps", bloecke: [["Pull", 5]] },
      { name: "Beine", bloecke: [["Beine", 5], ["Core", 1]] },
      { name: "Schultern", bloecke: [["Push", 4], ["Core", 1]] },
      { name: "Arme & Core", bloecke: [["Pull", 3], ["Core", 2]] },
    ],
  },
  arnold: {
    name: "Arnold-Split",
    empfohleneTage: 6,
    kurz: "Antagonisten, 6 Tage",
    wissenschaft:
      "Der von Arnold Schwarzenegger populär gemachte Split kombiniert " +
      "gegenspielende Muskelgruppen (Brust/Rücken) und trifft jeden Muskel " +
      "2× pro Woche bei sehr hohem Volumen. Nur bei guter Regeneration und " +
      "Trainingserfahrung sinnvoll.",
    zyklus: [
      { name: "Brust & Rücken", bloecke: [["Push", 3], ["Pull", 3]] },
      { name: "Schultern & Arme", bloecke: [["Push", 3], ["Pull", 3]] },
      { name: "Beine", bloecke: [["Beine", 5], ["Core", 1]] },
    ],
  },
}

// Gleichmäßige Standard-Verteilung von n Trainingstagen über die Woche.
export function standardTage(n) {
  const muster = {
    1: ["mo"], 2: ["mo", "do"], 3: ["mo", "mi", "fr"], 4: ["mo", "di", "do", "fr"],
    5: ["mo", "di", "mi", "fr", "sa"], 6: ["mo", "di", "mi", "do", "fr", "sa"],
    7: [...WOCHEN_KEYS],
  }
  return muster[Math.min(7, Math.max(1, n))] ?? muster[3]
}

// Übungspool je Ausstattung: "heim" = nur Körpergewicht (Calisthenics).
export function uebungsPool(equipment) {
  return equipment === "heim"
    ? UEBUNGEN.filter((u) => u.geraet === "Körpergewicht")
    : UEBUNGEN
}

// Ein Planeintrag trägt Zielvorgaben: { id, saetze, wdh, gewicht }.
// Ältere Pläne speicherten nur die Übungs-Id als String – norm() macht
// daraus einheitliche Objekte (gewicht 0 = Körpergewicht / noch offen).
export function normEintrag(e) {
  if (typeof e === "string") return { id: e, saetze: 3, wdh: 10, gewicht: 0 }
  return { saetze: 3, wdh: 10, gewicht: 0, ...e }
}

// Alle Einträge eines Wochentags, normalisiert.
export function planTag(plan, tagKey) {
  return (plan?.[tagKey] ?? []).map(normEintrag)
}

// Erzeugt aus Split + Tagen + Ausstattung + Lieblingsübungen einen
// vollständigen Wochenplan (wochentag -> [übungsIds]).
// equipment ist entweder "gym"/"heim" für alle Tage oder eine Map je Tag
// ({ mo: "gym", mi: "heim", … }) – so lassen sich Gym- und
// Calisthenics-Sessions im selben Plan kombinieren.
export function wendeSplitAn(splitId, tageKeys, equipment, favoriten = []) {
  const split = SPLITS[splitId] ?? SPLITS.gk3

  const plan = { mo: [], di: [], mi: [], do: [], fr: [], sa: [], so: [] }
  const sortiert = WOCHEN_KEYS.filter((k) => tageKeys.includes(k))

  sortiert.forEach((tagKey, i) => {
    const eq = typeof equipment === "string" ? equipment : (equipment?.[tagKey] ?? "gym")
    const pool = uebungsPool(eq)

    // Lieblingsübungen zuerst, Rest dahinter – so landet Persönliches im Plan.
    const nachKategorie = (kat) => {
      const inKat = pool.filter((u) => u.kategorie === kat)
      return [
        ...inKat.filter((u) => favoriten.includes(u.id)),
        ...inKat.filter((u) => !favoriten.includes(u.id)),
      ]
    }

    const vorlage = split.zyklus[i % split.zyklus.length]
    const eintraege = []
    for (const [kat, anzahl] of vorlage.bloecke) {
      const kandidaten = nachKategorie(kat)
        .filter((u) => !eintraege.some((e) => e.id === u.id))
        .slice(0, anzahl)
      // Zielvorgaben: 3 Sätze, 10 Wdh. (Core 15), Gewicht trägt man selbst ein.
      eintraege.push(
        ...kandidaten.map((u) => ({
          id: u.id,
          saetze: 3,
          wdh: kat === "Core" ? 15 : 10,
          gewicht: 0,
        }))
      )
    }
    plan[tagKey] = eintraege
  })
  return plan
}

// Name der Tagesvorlage für einen Wochentag (z. B. "Push") – für Anzeige.
export function tagesName(splitId, tageKeys, tagKey) {
  const split = SPLITS[splitId] ?? SPLITS.gk3
  const sortiert = WOCHEN_KEYS.filter((k) => tageKeys.includes(k))
  const i = sortiert.indexOf(tagKey)
  if (i === -1) return null
  return split.zyklus[i % split.zyklus.length].name
}
