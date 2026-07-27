import { describe, it, expect } from "vitest"
import {
  wochenVolumen, intensitaet, bewertung, persoenlicheRekorde, konsistenz, tonnageVerlauf,
  VOLUMEN_OPT,
} from "./analytik"

// bankdruecken: muskeln [brust, trizeps], sekundaer [schultern]
// klimmzuege:  muskeln [ruecken, bizeps], sekundaer [unterarme]
const log = [
  { id: 1, datum: "2026-01-10", uebungId: "bankdruecken", gewicht: 60, wdh: 10 },
  { id: 2, datum: "2026-01-10", uebungId: "bankdruecken", gewicht: 62.5, wdh: 8 },
  { id: 3, datum: "2026-01-12", uebungId: "klimmzuege", gewicht: 0, wdh: 8 },
]

describe("wochenVolumen", () => {
  it("zählt Sätze je Muskel (primär ×1, sekundär ×0.5)", () => {
    const v = wochenVolumen(log, "2026-01-14", 1)
    expect(v.brust).toBe(2)
    expect(v.trizeps).toBe(2)
    expect(v.schultern).toBe(1) // 2 × 0.5
    expect(v.ruecken).toBe(1)
    expect(v.unterarme).toBe(0.5)
  })
  it("blendet Sätze außerhalb des Fensters aus", () => {
    const v = wochenVolumen(log, "2026-02-01", 1) // > 1 Woche später
    expect(Object.keys(v)).toHaveLength(0)
  })
})

describe("intensitaet / bewertung", () => {
  it("skaliert an der Zielspanne und deckelt bei 1", () => {
    const i = intensitaet({ brust: VOLUMEN_OPT, bizeps: VOLUMEN_OPT * 2 })
    expect(i.brust).toBeCloseTo(1)
    expect(i.bizeps).toBe(1)
  })
  it("bewertet Volumen", () => {
    expect(bewertung(4)).toBe("wenig")
    expect(bewertung(16)).toBe("optimal")
    expect(bewertung(30)).toBe("viel")
  })
})

describe("persoenlicheRekorde", () => {
  it("nimmt je Übung den besten e1RM, absteigend", () => {
    const prs = persoenlicheRekorde(log)
    expect(prs[0].name).toBe("Bankdrücken")
    // e1RM: 60×10 = 80.0 > 62.5×8 = 79.2 → bester Satz ist 60×10
    expect(prs[0].gewicht).toBe(60)
    expect(prs[0].wdh).toBe(10)
    expect(prs.find((r) => r.uebungId === "klimmzuege").koerpergewicht).toBe(true)
  })
})

describe("konsistenz", () => {
  it("zählt Trainingstage und Wochen-Serie", () => {
    const k = konsistenz(log, "2026-01-14")
    expect(k.tage7).toBe(2) // 10. + 12.
    expect(k.serie).toBeGreaterThanOrEqual(1)
  })
  it("bildet mehrwöchige Serien", () => {
    const l = [
      { datum: "2026-01-05", uebungId: "bankdruecken", gewicht: 50, wdh: 10 }, // Woche A
      { datum: "2026-01-13", uebungId: "bankdruecken", gewicht: 50, wdh: 10 }, // Woche B
    ]
    expect(konsistenz(l, "2026-01-14").serie).toBe(2)
  })
})

describe("tonnageVerlauf", () => {
  it("summiert Volumen je Woche", () => {
    // Ref 2026-01-14 (Mi) → aktuelle Woche ab Mo 2026-01-12.
    // 10.01. (Sa) liegt in der Vorwoche, 12.01. in der aktuellen.
    const reihen = tonnageVerlauf(log, 2, "2026-01-14")
    expect(reihen).toHaveLength(2)
    expect(reihen[0].tonnage).toBe(600 + 500) // Vorwoche: Bankdrücken
    expect(reihen[1].tonnage).toBe(8) // aktuelle Woche: Klimmzüge (Körpergewicht = 1)
  })
})
