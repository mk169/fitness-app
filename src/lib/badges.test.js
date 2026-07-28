import { describe, it, expect } from "vitest"
import { badgeListe, badgeStand } from "./badges"

const REF = "2026-07-28"

describe("badgeListe", () => {
  it("liefert ohne Daten lauter unerreichte Badges mit Fortschritt 0", () => {
    const liste = badgeListe({ refDatum: REF })
    expect(liste.length).toBeGreaterThan(0)
    expect(liste.every((b) => !b.erreicht)).toBe(true)
    expect(liste.every((b) => b.fortschritt === 0)).toBe(true)
  })

  it("schaltet Erste Einheit nach dem ersten Training frei", () => {
    const log = [{ datum: REF, uebungId: "bankdruecken", gewicht: 60, wdh: 10 }]
    const b = badgeListe({ log, refDatum: REF }).find((x) => x.id === "erste_einheit")
    expect(b.erreicht).toBe(true)
  })

  it("sortiert erreichte Badges nach vorne", () => {
    const log = [{ datum: REF, uebungId: "bankdruecken", gewicht: 60, wdh: 10 }]
    const liste = badgeListe({ log, refDatum: REF })
    const ersterUnerreichtIndex = liste.findIndex((b) => !b.erreicht)
    const letzterErreichtIndex = [...liste].map((b) => b.erreicht).lastIndexOf(true)
    expect(letzterErreichtIndex).toBeLessThan(ersterUnerreichtIndex)
  })

  it("rechnet Tonnage-Fortschritt korrekt (Teilfortschritt < 1)", () => {
    const log = [{ datum: REF, uebungId: "kniebeugen", gewicht: 100, wdh: 10 }] // 1000 kg
    const b = badgeListe({ log, refDatum: REF }).find((x) => x.id === "tonnage_10k")
    expect(b.erreicht).toBe(false)
    expect(b.fortschritt).toBeCloseTo(0.1, 5)
  })

  it("badgeStand zählt erreichte und gesamte Badges", () => {
    const stand = badgeStand({ refDatum: REF })
    expect(stand.gesamt).toBeGreaterThan(0)
    expect(stand.erreicht).toBe(0)
  })
})
