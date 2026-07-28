import { describe, it, expect } from "vitest"
import { wochenReport, wrappedText } from "./wrapped"

const REF = "2026-07-28" // Dienstag

describe("wochenReport", () => {
  it("markiert eine leere Woche als leer", () => {
    const r = wochenReport({}, REF)
    expect(r.leer).toBe(true)
    expect(r.einheiten).toBe(0)
  })

  it("zählt Einheiten, Sätze und Tonnage im 7-Tage-Fenster", () => {
    const log = [
      { datum: "2026-07-28", uebungId: "kniebeugen", gewicht: 100, wdh: 5 }, // 500
      { datum: "2026-07-28", uebungId: "kniebeugen", gewicht: 100, wdh: 5 }, // 500
      { datum: "2026-07-26", uebungId: "bankdruecken", gewicht: 60, wdh: 10 }, // 600
    ]
    const r = wochenReport({ log }, REF)
    expect(r.einheiten).toBe(2)
    expect(r.saetze).toBe(3)
    expect(r.tonnage).toBe(1600)
  })

  it("ignoriert Einträge außerhalb des Fensters", () => {
    const log = [
      { datum: "2026-07-28", uebungId: "kniebeugen", gewicht: 100, wdh: 5 },
      { datum: "2026-07-01", uebungId: "kniebeugen", gewicht: 100, wdh: 5 }, // alt
    ]
    const r = wochenReport({ log }, REF)
    expect(r.einheiten).toBe(1)
  })

  it("ermittelt die Top-Muskelgruppe und mittlere Kalorien", () => {
    const log = [{ datum: "2026-07-28", uebungId: "kniebeugen", gewicht: 100, wdh: 5 }]
    const mahlzeiten = [
      { datum: "2026-07-28", kcal: 800 },
      { datum: "2026-07-27", kcal: 1200 },
    ]
    const r = wochenReport({ log, mahlzeiten }, REF)
    expect(r.topMuskel).toBeTruthy()
    expect(r.kcalSchnitt).toBe(1000)
  })

  it("wrappedText enthält Einheiten und Tonnage", () => {
    const r = wochenReport(
      { log: [{ datum: "2026-07-28", uebungId: "kniebeugen", gewicht: 100, wdh: 5 }] },
      REF
    )
    const text = wrappedText(r)
    expect(text).toContain("Einheiten")
    expect(text).toContain("kg bewegt")
  })
})
