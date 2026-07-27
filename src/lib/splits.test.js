import { describe, it, expect } from "vitest"
import { standardTage, wendeSplitAn, tagesName, normEintrag, planTag } from "./splits"
import { uebungVon } from "./uebungen"

describe("standardTage", () => {
  it("verteilt Tage gleichmäßig", () => {
    expect(standardTage(4)).toEqual(["mo", "di", "do", "fr"])
    expect(standardTage(1)).toEqual(["mo"])
  })
  it("begrenzt auf 1..7", () => {
    expect(standardTage(0)).toEqual(["mo"])
    expect(standardTage(99)).toHaveLength(7)
  })
})

describe("normEintrag", () => {
  it("macht aus einer Id ein Objekt mit Zielvorgaben", () => {
    expect(normEintrag("bankdruecken")).toEqual({ id: "bankdruecken", saetze: 3, wdh: 10, gewicht: 0 })
  })
  it("füllt fehlende Felder auf", () => {
    expect(normEintrag({ id: "x", wdh: 8 })).toEqual({ id: "x", saetze: 3, wdh: 8, gewicht: 0 })
  })
})

describe("wendeSplitAn", () => {
  it("belegt genau die gewählten Tage", () => {
    const plan = wendeSplitAn("gk3", ["mo", "mi", "fr"], "gym")
    expect(Object.keys(plan)).toHaveLength(7)
    expect(plan.mo.length).toBeGreaterThan(0)
    expect(plan.di).toEqual([])
    expect(plan.fr.length).toBeGreaterThan(0)
  })
  it("nutzt im Heim-Modus nur Körpergewichtsübungen", () => {
    const plan = wendeSplitAn("gk3", ["mo"], "heim")
    for (const e of plan.mo) {
      expect(uebungVon(e.id).geraet).toBe("Körpergewicht")
    }
  })
  it("erzeugt Einträge mit Zielvorgaben", () => {
    const plan = wendeSplitAn("gk3", ["mo"], "gym")
    expect(planTag(plan, "mo")[0]).toMatchObject({ saetze: 3 })
  })
})

describe("tagesName", () => {
  it("liefert den Namen der Tagesvorlage", () => {
    expect(tagesName("oberUnter", ["mo", "di"], "mo")).toBe("Oberkörper")
    expect(tagesName("oberUnter", ["mo", "di"], "mi")).toBeNull()
  })
})
