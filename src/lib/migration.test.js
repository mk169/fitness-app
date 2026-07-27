import { describe, it, expect } from "vitest"
import { migriereWert } from "./migration"

describe("migriereWert", () => {
  it("füllt Alt-Mahlzeiten (nur kcal) mit Makro-Defaults auf", () => {
    const alt = [{ id: 1, titel: "Apfel", kcal: 100, zeit: "12:00", datum: "2026-01-01" }]
    const neu = migriereWert("mahlzeiten", alt, [])
    expect(neu[0]).toMatchObject({ kcal: 100, protein: 0, fett: 0, kohlenhydrate: 0, menge: null })
  })

  it("erhält vorhandene Makros", () => {
    const v = [{ id: 1, titel: "Quark", kcal: 120, protein: 20 }]
    expect(migriereWert("mahlzeiten", v, [])[0].protein).toBe(20)
  })

  it("gibt Fallback bei Formfehler (Objekt statt Array)", () => {
    expect(migriereWert("favoriten", { x: 1 }, [])).toEqual([])
  })

  it("gibt Fallback bei String statt Objekt", () => {
    expect(migriereWert("profil", "kaputt", { a: 1 })).toEqual({ a: 1 })
  })

  it("gibt Fallback bei null/undefined", () => {
    expect(migriereWert("profil", null, { a: 1 })).toEqual({ a: 1 })
    expect(migriereWert("profil", undefined, { a: 1 })).toEqual({ a: 1 })
  })

  it("reicht unbekannte Schlüssel unverändert durch", () => {
    expect(migriereWert("stil", "tageslicht", "indigo")).toBe("tageslicht")
  })
})
