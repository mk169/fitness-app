import { describe, it, expect } from "vitest"
import { fastenStatus, phasenStatus, aktivePhase, konzeptVon, methodeVon } from "./ernaehrung"

describe("fastenStatus", () => {
  const fenster = [{ start: 12, ende: 20 }]
  it("gibt null ohne Fenster", () => {
    expect(fastenStatus([], 10)).toBeNull()
  })
  it("erkennt ein offenes Fenster", () => {
    const s = fastenStatus(fenster, 14)
    expect(s.imFenster).toBe(true)
    expect(s.bis).toBe(6) // 20 - 14
  })
  it("findet das nächste Fenster außerhalb", () => {
    const s = fastenStatus(fenster, 8)
    expect(s.imFenster).toBe(false)
    expect(s.bis).toBe(4) // 12 - 8
  })
})

describe("phasenStatus / aktivePhase", () => {
  const phase = { id: "p", start: "2026-01-10", tage: 3 }
  it("markiert kommende, aktive und beendete Phasen", () => {
    expect(phasenStatus(phase, "2026-01-08").status).toBe("kommend")
    expect(phasenStatus(phase, "2026-01-10")).toEqual({ status: "aktiv", tag: 1 })
    expect(phasenStatus(phase, "2026-01-12")).toEqual({ status: "aktiv", tag: 3 })
    expect(phasenStatus(phase, "2026-01-13").status).toBe("beendet")
  })
  it("aktivePhase liefert die laufende Phase mit Tag", () => {
    expect(aktivePhase([phase], "2026-01-11")).toMatchObject({ id: "p", tag: 2 })
    expect(aktivePhase([phase], "2026-02-01")).toBeNull()
  })
})

describe("Lookups mit Fallback", () => {
  it("konzeptVon/methodeVon fallen auf Standard zurück", () => {
    expect(konzeptVon("gibtsnicht").id).toBe("standard")
    expect(methodeVon("gibtsnicht").id).toBe("keins")
    expect(konzeptVon("keto").id).toBe("keto")
  })
})
