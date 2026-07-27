// Kuratierter Lebensmittel-Datenbestand (Makros je 100 g), offline nutzbar.
// Feld kh = Kohlenhydrate. makrosFuer() rechnet auf eine Menge in Gramm um.

export const LEBENSMITTEL = [
  // Protein
  { id: "haehnchenbrust", name: "Hähnchenbrust", kcal: 165, protein: 31, fett: 3.6, kh: 0 },
  { id: "rinderhack", name: "Rinderhack (mager)", kcal: 187, protein: 21, fett: 11, kh: 0 },
  { id: "lachs", name: "Lachs", kcal: 208, protein: 20, fett: 13, kh: 0 },
  { id: "thunfisch", name: "Thunfisch (Dose, Wasser)", kcal: 116, protein: 26, fett: 1, kh: 0 },
  { id: "ei", name: "Ei", kcal: 155, protein: 13, fett: 11, kh: 1 },
  { id: "magerquark", name: "Magerquark", kcal: 67, protein: 12, fett: 0.3, kh: 4 },
  { id: "griech_joghurt", name: "Griech. Joghurt 2 %", kcal: 73, protein: 10, fett: 2, kh: 4 },
  { id: "harzer", name: "Harzer Käse", kcal: 125, protein: 30, fett: 1, kh: 0 },
  { id: "tofu", name: "Tofu natur", kcal: 144, protein: 16, fett: 9, kh: 2 },
  { id: "tempeh", name: "Tempeh", kcal: 192, protein: 20, fett: 11, kh: 8 },
  { id: "linsen_gek", name: "Linsen (gekocht)", kcal: 116, protein: 9, fett: 0.4, kh: 20 },
  { id: "kichererbsen", name: "Kichererbsen (gekocht)", kcal: 164, protein: 9, fett: 2.6, kh: 27 },
  { id: "whey", name: "Whey-Protein (Pulver)", kcal: 400, protein: 80, fett: 6, kh: 8 },

  // Kohlenhydrate
  { id: "reis_gek", name: "Reis (gekocht)", kcal: 130, protein: 2.7, fett: 0.3, kh: 28 },
  { id: "reis_roh", name: "Reis (roh)", kcal: 360, protein: 7, fett: 1, kh: 78 },
  { id: "haferflocken", name: "Haferflocken", kcal: 372, protein: 13, fett: 7, kh: 59 },
  { id: "kartoffel", name: "Kartoffeln (gekocht)", kcal: 87, protein: 2, fett: 0.1, kh: 20 },
  { id: "suesskartoffel", name: "Süßkartoffel", kcal: 90, protein: 2, fett: 0.2, kh: 21 },
  { id: "nudeln_gek", name: "Nudeln (gekocht)", kcal: 158, protein: 6, fett: 1, kh: 31 },
  { id: "vollkornbrot", name: "Vollkornbrot", kcal: 247, protein: 9, fett: 3.5, kh: 41 },
  { id: "banane", name: "Banane", kcal: 89, protein: 1.1, fett: 0.3, kh: 23 },
  { id: "apfel", name: "Apfel", kcal: 52, protein: 0.3, fett: 0.2, kh: 14 },
  { id: "beeren", name: "Beeren gemischt", kcal: 45, protein: 1, fett: 0.4, kh: 8 },
  { id: "honig", name: "Honig", kcal: 304, protein: 0.3, fett: 0, kh: 82 },

  // Fette / Nüsse
  { id: "olivenoel", name: "Olivenöl", kcal: 884, protein: 0, fett: 100, kh: 0 },
  { id: "butter", name: "Butter", kcal: 717, protein: 0.9, fett: 81, kh: 0.6 },
  { id: "mandeln", name: "Mandeln", kcal: 579, protein: 21, fett: 50, kh: 22 },
  { id: "erdnussbutter", name: "Erdnussbutter", kcal: 588, protein: 25, fett: 50, kh: 20 },
  { id: "avocado", name: "Avocado", kcal: 160, protein: 2, fett: 15, kh: 9 },
  { id: "kaese_gouda", name: "Gouda", kcal: 356, protein: 25, fett: 27, kh: 2 },

  // Gemüse
  { id: "brokkoli", name: "Brokkoli", kcal: 34, protein: 2.8, fett: 0.4, kh: 7 },
  { id: "spinat", name: "Spinat", kcal: 23, protein: 2.9, fett: 0.4, kh: 3.6 },
  { id: "tomate", name: "Tomate", kcal: 18, protein: 0.9, fett: 0.2, kh: 3.9 },
  { id: "paprika", name: "Paprika", kcal: 31, protein: 1, fett: 0.3, kh: 6 },
  { id: "gurke", name: "Gurke", kcal: 15, protein: 0.7, fett: 0.1, kh: 3.6 },
  { id: "zwiebel", name: "Zwiebel", kcal: 40, protein: 1.1, fett: 0.1, kh: 9 },

  // Milch / Getränke
  { id: "milch", name: "Milch 1,5 %", kcal: 47, protein: 3.4, fett: 1.5, kh: 4.8 },
  { id: "hafermilch", name: "Hafermilch", kcal: 46, protein: 1, fett: 1.5, kh: 7 },
]

export function lebensmittelVon(id) {
  return LEBENSMITTEL.find((l) => l.id === id) ?? null
}

// Makros für eine Menge (g). Gibt gerundete Werte + die Referenz zurück.
export function makrosFuer(item, gramm) {
  const f = (gramm || 0) / 100
  return {
    kcal: Math.round(item.kcal * f),
    protein: Math.round(item.protein * f),
    fett: Math.round(item.fett * f),
    kohlenhydrate: Math.round(item.kh * f),
  }
}
