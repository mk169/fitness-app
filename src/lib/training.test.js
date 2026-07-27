import { describe, it, expect } from "vitest"
import { e1rm, verlaufVon, overloadVorschlag } from "./training"

describe("e1rm", () => {
  it("schätzt 1RM nach Epley", () => {
    // 100 * (1 + 10/30) = 133.33 → 133.3
    expect(e1rm(100, 10)).toBe(133.3)
  })
  it("nimmt bei Körpergewicht die Wiederholungen", () => {
    expect(e1rm(0, 12)).toBe(12)
  })
})

const log = [
  { id: 1, datum: "2026-01-01", uebungId: "bank", gewicht: 60, wdh: 10 },
  { id: 2, datum: "2026-01-01", uebungId: "bank", gewicht: 60, wdh: 9 },
  { id: 3, datum: "2026-01-03", uebungId: "bank", gewicht: 60, wdh: 11 },
  { id: 4, datum: "2026-01-01", uebungId: "klimm", gewicht: 0, wdh: 8 },
]

describe("verlaufVon", () => {
  it("gruppiert nach Tag mit Bestwert und Volumen", () => {
    const v = verlaufVon(log, "bank")
    expect(v).toHaveLength(2)
    expect(v[0].datum).toBe("2026-01-01")
    expect(v[0].volumen).toBe(60 * 10 + 60 * 9)
    expect(v[1].best).toBe(e1rm(60, 11))
  })
})

describe("overloadVorschlag", () => {
  it("steigert Wiederholungen unter 12", () => {
    const v = overloadVorschlag(log, "bank")
    expect(v.gewicht).toBe(60)
    expect(v.wdh).toBe(12) // aus 11 → 12
  })
  it("erhöht Gewicht ab 12 Wdh. und setzt Wdh zurück", () => {
    const l = [{ id: 1, datum: "2026-01-01", uebungId: "x", gewicht: 60, wdh: 12 }]
    const v = overloadVorschlag(l, "x")
    expect(v.gewicht).toBe(62.5)
    expect(v.wdh).toBe(8)
  })
  it("steigert bei Körpergewicht die Wiederholungen", () => {
    const v = overloadVorschlag(log, "klimm")
    expect(v.gewicht).toBe(0)
    expect(v.wdh).toBe(9)
  })
  it("blendet die laufende Einheit via vorDatum aus", () => {
    // ohne die Einheit vom 03.01. ist die letzte der 01.01. (best 60x10)
    const v = overloadVorschlag(log, "bank", "2026-01-03")
    expect(v.wdh).toBe(11)
  })
  it("gibt null ohne Log", () => {
    expect(overloadVorschlag([], "bank")).toBeNull()
  })
})
