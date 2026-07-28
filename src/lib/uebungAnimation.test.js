import { describe, it, expect } from "vitest"
import { UEBUNGEN } from "./uebungen"
import { MUSTER, musterVon } from "./uebungAnimation"

describe("musterVon", () => {
  it("liefert für jede Übung ein definiertes Bewegungsmuster mit zwei Posen", () => {
    for (const u of UEBUNGEN) {
      const key = musterVon(u)
      expect(MUSTER[key], u.id).toBeTruthy()
      expect(MUSTER[key].a, u.id).toBeTruthy()
      expect(MUSTER[key].b, u.id).toBeTruthy()
    }
  })

  it("ordnet typische Übungen dem erwarteten Muster zu", () => {
    expect(musterVon({ id: "kniebeugen", kategorie: "Beine" })).toBe("kniebeuge")
    expect(musterVon({ id: "kreuzheben", kategorie: "Pull" })).toBe("hinge")
    expect(musterVon({ id: "klimmzuege", kategorie: "Pull" })).toBe("zug_vertikal")
    expect(musterVon({ id: "rudern", kategorie: "Pull" })).toBe("zug_horizontal")
    expect(musterVon({ id: "schulterdruecken", kategorie: "Push" })).toBe("druck_vertikal")
    expect(musterVon({ id: "bizepscurls", kategorie: "Pull" })).toBe("curl")
    expect(musterVon({ id: "bankdruecken", kategorie: "Push" })).toBe("druck_horizontal")
    expect(musterVon({ id: "wadenheben", kategorie: "Beine" })).toBe("waden")
    expect(musterVon({ id: "planke", kategorie: "Core" })).toBe("plank")
    expect(musterVon({ id: "crunches", kategorie: "Core" })).toBe("core")
  })

  it("nutzt die Kategorie als Fallback bei unbekannter Id", () => {
    expect(musterVon({ id: "xxx", kategorie: "Beine" })).toBe("kniebeuge")
    expect(musterVon({ id: "xxx", kategorie: "Core" })).toBe("core")
    expect(musterVon(null)).toBe("curl")
  })
})
