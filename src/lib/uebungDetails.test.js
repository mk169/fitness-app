import { describe, it, expect } from "vitest"
import { UEBUNGEN } from "./uebungen"
import { uebungDetail } from "./uebungDetails"

describe("uebungDetail", () => {
  it("liefert für unbekannte IDs null", () => {
    expect(uebungDetail("gibtsnicht")).toBeNull()
  })

  it("liefert für eine kuratierte Übung Anleitung, Tipps und Fehler", () => {
    const d = uebungDetail("bankdruecken")
    expect(d.kuratiert).toBe(true)
    expect(d.anleitung.length).toBeGreaterThan(0)
    expect(d.tipps.length).toBeGreaterThan(0)
    expect(d.fehler.length).toBeGreaterThan(0)
  })

  it("erzeugt für nicht kuratierte Übungen eine generische, nicht-leere Anleitung", () => {
    const d = uebungDetail("seitheben")
    expect(d.kuratiert).toBe(false)
    expect(d.anleitung.length).toBeGreaterThan(0)
    expect(d.tipps.length).toBeGreaterThan(0)
  })

  it("liefert für JEDE Übung der Bibliothek nicht-leere Details", () => {
    for (const u of UEBUNGEN) {
      const d = uebungDetail(u.id)
      expect(d, u.id).not.toBeNull()
      expect(d.anleitung.length, u.id).toBeGreaterThan(0)
      expect(d.tipps.length, u.id).toBeGreaterThan(0)
      expect(d.fehler.length, u.id).toBeGreaterThan(0)
    }
  })

  it("markiert primäre Muskeln voll (1) und sekundäre halb (0.5) in der zielKarte", () => {
    const d = uebungDetail("bankdruecken") // muskeln: brust,trizeps · sekundaer: schultern
    expect(d.zielKarte.brust).toBe(1)
    expect(d.zielKarte.trizeps).toBe(1)
    expect(d.zielKarte.schultern).toBe(0.5)
  })
})
