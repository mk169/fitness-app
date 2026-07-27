import { describe, it, expect } from "vitest"
import { bmr, empfohlenerSplit, berechnePlan } from "./algorithmus"

describe("bmr", () => {
  it("rechnet Mifflin-St Jeor für Männer", () => {
    // 10*80 + 6.25*180 - 5*25 + 5 = 1805
    expect(bmr({ geschlecht: "m", gewicht: 80, groesse: 180, alter: 25, kfa: 0 })).toBe(1805)
  })

  it("zieht bei Frauen 161 ab", () => {
    const m = bmr({ geschlecht: "m", gewicht: 70, groesse: 170, alter: 30, kfa: 0 })
    const w = bmr({ geschlecht: "w", gewicht: 70, groesse: 170, alter: 30, kfa: 0 })
    expect(m - w).toBe(166) // +5 (m) vs -161 (w)
  })

  it("nutzt Katch-McArdle wenn KFA bekannt ist", () => {
    // magermasse = 80 * 0.8 = 64; 370 + 21.6*64 = 1752.4 → 1752
    expect(bmr({ geschlecht: "m", gewicht: 80, groesse: 180, alter: 25, kfa: 20 })).toBe(1752)
  })
})

describe("empfohlenerSplit", () => {
  it("wählt Split nach Trainingstagen", () => {
    expect(empfohlenerSplit(2).key).toBe("ganzkoerper")
    expect(empfohlenerSplit(4).key).toBe("oberUnter")
    expect(empfohlenerSplit(6).key).toBe("ppl")
  })
})

describe("berechnePlan", () => {
  const basis = {
    modus: "muskeln", geschlecht: "m", alter: 25, groesse: 180, gewicht: 80,
    zielGewicht: 82, kfa: 0, aktivitaet: "moderat", trainingsTage: 4,
    zeitProEinheit: 60, deadline: "",
  }

  it("gibt null ohne Körperdaten", () => {
    expect(berechnePlan({ ...basis, gewicht: 0 })).toBeNull()
    expect(berechnePlan(null)).toBeNull()
  })

  it("berechnet Kalorien inkl. Ziel-Offset und plausible Makros", () => {
    const plan = berechnePlan(basis)
    // erhaltung = round(1805 * 1.55) = 2798; + Offset 250 (muskeln) = 3048
    expect(plan.erhaltung).toBe(2798)
    expect(plan.kalorien).toBe(3048)
    expect(plan.makros.protein).toBe(160) // 80 * 2.0
    expect(plan.makros.fett).toBe(72) // 80 * 0.9
    expect(plan.makros.kohlenhydrate).toBeGreaterThan(0)
  })

  it("bewertet eine ambitionierte Deadline als unrealistisch", () => {
    const bald = new Date()
    bald.setDate(bald.getDate() + 14)
    const plan = berechnePlan({
      ...basis, modus: "abnehmen", zielGewicht: 72,
      deadline: bald.toISOString().slice(0, 10),
    })
    expect(plan.deadline).not.toBeNull()
    expect(plan.deadline.realistisch).toBe(false)
  })
})
