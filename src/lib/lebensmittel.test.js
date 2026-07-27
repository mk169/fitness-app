import { describe, it, expect } from "vitest"
import { LEBENSMITTEL, lebensmittelVon, makrosFuer } from "./lebensmittel"

describe("lebensmittel", () => {
  it("hat eindeutige Ids und plausible Makros", () => {
    const ids = LEBENSMITTEL.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const l of LEBENSMITTEL) {
      expect(l.kcal).toBeGreaterThanOrEqual(0)
      expect(l.protein).toBeGreaterThanOrEqual(0)
    }
  })

  it("lebensmittelVon findet per Id", () => {
    expect(lebensmittelVon("haehnchenbrust").name).toBe("Hähnchenbrust")
    expect(lebensmittelVon("gibtsnicht")).toBeNull()
  })

  it("makrosFuer skaliert auf die Menge", () => {
    const h = lebensmittelVon("haehnchenbrust") // 165 kcal, 31 P /100g
    expect(makrosFuer(h, 200)).toEqual({ kcal: 330, protein: 62, fett: 7, kohlenhydrate: 0 })
    expect(makrosFuer(h, 0)).toEqual({ kcal: 0, protein: 0, fett: 0, kohlenhydrate: 0 })
  })
})
