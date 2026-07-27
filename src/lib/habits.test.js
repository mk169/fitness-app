import { describe, it, expect } from "vitest"
import { autoHabits, habitsAmTag, istErledigt, toggle, streak, tagesFortschritt } from "./habits"
import { programmStatus, aktiveProgramme, endeVon, typInfo } from "./programme"

const feldHabit = { id: "auto-ernaehrung", feld: "ernaehrung", auto: true }
const eigen = { id: "h1", name: "Wasser" }

describe("autoHabits", () => {
  it("enthält Ernährung immer, Training nur an Planungstagen", () => {
    // 2026-01-05 ist ein Montag
    const mit = autoHabits("2026-01-05", { wochenplan: { mo: [{ id: "x" }] }, fastenMethode: "16:8" })
    expect(mit.map((h) => h.id)).toContain("auto-training")
    expect(mit.map((h) => h.id)).toContain("auto-fasten")
    const ohne = autoHabits("2026-01-05", { wochenplan: {}, fastenMethode: "keins" })
    expect(ohne.map((h) => h.id)).toEqual(["auto-ernaehrung"])
  })
})

describe("habitsAmTag", () => {
  it("kombiniert automatische und eigene Habits", () => {
    const list = habitsAmTag("2026-01-05", { wochenplan: {}, fastenMethode: "keins" }, [eigen])
    expect(list.map((h) => h.id)).toEqual(["auto-ernaehrung", "h1"])
    expect(list.find((h) => h.id === "h1").auto).toBe(false)
  })
})

describe("toggle / istErledigt", () => {
  it("hakt eigenen Habit über checks[tag].habits ab", () => {
    let checks = {}
    checks = toggle(checks, "2026-01-05", eigen)
    expect(istErledigt(checks, "2026-01-05", eigen)).toBe(true)
    expect(checks["2026-01-05"].habits.h1).toBe(true)
    checks = toggle(checks, "2026-01-05", eigen)
    expect(istErledigt(checks, "2026-01-05", eigen)).toBe(false)
  })
  it("hakt Feld-Habit über checks[tag].feld ab (kompatibel zum Dashboard)", () => {
    const checks = toggle({}, "2026-01-05", feldHabit)
    expect(checks["2026-01-05"].ernaehrung).toBe(true)
    expect(istErledigt(checks, "2026-01-05", feldHabit)).toBe(true)
  })
})

describe("streak", () => {
  const checks = {
    "2026-01-03": { habits: { h1: true } },
    "2026-01-04": { habits: { h1: true } },
    "2026-01-05": { habits: { h1: true } },
  }
  it("zählt aufeinanderfolgende erledigte Tage bis heute", () => {
    expect(streak(checks, eigen, "2026-01-05")).toBe(3)
  })
  it("bricht bei einer Lücke ab", () => {
    const mitLuecke = { ...checks, "2026-01-04": { habits: { h1: false } } }
    expect(streak(mitLuecke, eigen, "2026-01-05")).toBe(1)
  })
  it("zählt bis gestern, wenn heute noch offen ist", () => {
    expect(streak(checks, eigen, "2026-01-06")).toBe(3)
  })
})

describe("tagesFortschritt", () => {
  it("zählt erledigte von gesamt", () => {
    const checks = { d: { habits: { h1: true } } }
    const habits = [eigen, { id: "h2" }]
    expect(tagesFortschritt(checks, "d", habits)).toEqual({ erledigt: 1, gesamt: 2 })
  })
})

describe("Programme", () => {
  const p = { id: 1, name: "Cut", typ: "diaet", start: "2026-01-10", tage: 14 }
  it("berechnet Status & aktiven Tag", () => {
    expect(programmStatus(p, "2026-01-09").status).toBe("kommend")
    expect(programmStatus(p, "2026-01-10")).toEqual({ status: "aktiv", tag: 1 })
    expect(programmStatus(p, "2026-01-23").status).toBe("aktiv")
    expect(programmStatus(p, "2026-01-24").status).toBe("beendet")
  })
  it("endeVon liefert den letzten Tag", () => {
    expect(endeVon(p)).toBe("2026-01-23")
  })
  it("aktiveProgramme filtert laufende", () => {
    const a = aktiveProgramme([p], "2026-01-12")
    expect(a).toHaveLength(1)
    expect(a[0].tag).toBe(3)
  })
  it("typInfo fällt auf Sonstiges zurück", () => {
    expect(typInfo("quatsch").name).toBe("Sonstiges")
  })
})
