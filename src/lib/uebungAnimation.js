// Bewegungs-Animationen für Übungen: statt 90 Einzel-Clips gruppieren wir die
// Übungen in ~10 Bewegungsmuster. Jede Übung bekommt so eine passende,
// geloopte Strichfigur-Animation – ganz ohne externe Assets/Dependencies.
//
// Eine Pose ist eine Sammlung von Gelenkpunkten [x, y] im 100×120-Koordinaten-
// system (Figur von der Seite, Blick nach rechts, Boden bei y≈115). Die
// Anzeige interpoliert zwischen Pose a und b und lässt die Bewegung pendeln.

// Gelenke: head, S(chulter), E(llbogen), W(rist/Hand), H(üfte), K(nie), F(uß)
const stand = {
  head: [50, 16], S: [50, 31], E: [50, 47], W: [50, 62],
  H: [50, 62], K: [50, 88], F: [50, 113],
}

// Hilfsfunktion: Pose aus Basis + Überschreibungen bauen.
function pose(over) {
  return { ...stand, ...over }
}

export const MUSTER = {
  kniebeuge: {
    label: "Kniebeuge",
    a: pose({ E: [62, 33], W: [74, 33] }),
    b: pose({ head: [54, 30], S: [54, 44], H: [47, 69], K: [64, 87], E: [66, 46], W: [78, 46] }),
    dauer: 1900,
  },
  hinge: {
    label: "Hüftbeuge",
    a: pose({}),
    b: pose({ head: [18, 40], S: [28, 42], H: [44, 60], K: [54, 86], E: [30, 55], W: [31, 70] }),
    dauer: 2000,
  },
  druck_horizontal: {
    label: "Liegestütz / Druck",
    a: { head: [20, 58], S: [32, 58], H: [64, 74], K: [82, 84], F: [96, 92], E: [32, 75], W: [32, 92] },
    b: { head: [20, 74], S: [32, 72], H: [64, 82], K: [82, 88], F: [96, 94], E: [24, 84], W: [32, 92] },
    dauer: 1700,
  },
  druck_vertikal: {
    label: "Überkopf-Druck",
    a: pose({ E: [41, 41], W: [40, 28] }),
    b: pose({ E: [48, 20], W: [50, 5] }),
    dauer: 1700,
  },
  zug_horizontal: {
    label: "Rudern",
    a: pose({ head: [40, 22], S: [46, 36], H: [52, 62], E: [58, 50], W: [66, 60] }),
    b: pose({ head: [40, 22], S: [46, 36], H: [52, 62], E: [44, 44], W: [39, 52] }),
    dauer: 1700,
  },
  zug_vertikal: {
    label: "Klimmzug",
    a: pose({ head: [50, 26], S: [50, 38], E: [50, 18], W: [50, 3], H: [50, 68], K: [50, 92], F: [50, 114] }),
    b: pose({ head: [50, 12], S: [50, 22], E: [43, 10], W: [50, 3], H: [50, 52], K: [50, 78], F: [50, 100] }),
    dauer: 1900,
  },
  curl: {
    label: "Curl / Isolation",
    a: pose({ E: [50, 47], W: [50, 62] }),
    b: pose({ E: [50, 47], W: [41, 31] }),
    dauer: 1500,
  },
  core: {
    label: "Bauch",
    a: { head: [20, 82], S: [32, 82], H: [62, 86], K: [80, 74], F: [94, 86], E: [30, 92], W: [40, 96] },
    b: { head: [32, 68], S: [42, 76], H: [62, 86], K: [80, 74], F: [94, 86], E: [40, 82], W: [50, 82] },
    dauer: 1600,
  },
  plank: {
    label: "Halten",
    a: { head: [18, 60], S: [30, 60], H: [62, 72], K: [82, 80], F: [96, 86], E: [30, 76], W: [30, 88] },
    b: { head: [18, 62], S: [30, 62], H: [62, 74], K: [82, 82], F: [96, 88], E: [30, 78], W: [30, 90] },
    dauer: 2600,
  },
  waden: {
    label: "Wadenheben",
    a: pose({}),
    b: pose({ head: [50, 10], S: [50, 25], E: [50, 41], W: [50, 56], H: [50, 56], K: [50, 82] }),
    dauer: 1300,
  },
}

// Reihenfolge der Regeln zählt: speziellere Schlüsselwörter zuerst.
const REGELN = [
  [/waden/, "waden"],
  [/klimmzug|klimmzueg|latzug|chinup|chin_up|pullup|scapula|negativ_klimm|breite_klimm/, "zug_vertikal"],
  [/rudern|row|face_?pull|reverse_fly|shrug|ueberzug|snow_angel/, "zug_horizontal"],
  [/schulterdruck|schulterdrueck|arnold|pike|handstand|seitheb|frontheb|overhead_press/, "druck_vertikal"],
  [/curl|trizeps|french|szcurl|sz_curl|hammer|beinstrecker|beincurl|nordic/, "curl"],
  [/kreuzheb|rumaen|good_morning|hip_thrust|glute|bridge|superman_hinge/, "hinge"],
  [/kniebeug|squat|ausfall|pistol|bulgar|wandsitz|stepup|step_up|beinpresse|goblet|sprung|hackensch/, "kniebeuge"],
  [/plank|planke|seitstuetz|seitstütz|hollow|superman|liegestuetz_hold/, "plank"],
  [/crunch|beinheben|russian|mountain|v_ups|vups|situp|sit_up|beinhebe/, "core"],
  [/liegestuetz|liegestütz|dip|bankdruck|bankdrueck|schraegbank|fliegende|kabelzueg|druck|press|diamant|archer/, "druck_horizontal"],
]

// Ermittelt das Bewegungsmuster einer Übung (Id + Kategorie als Fallback).
export function musterVon(uebung) {
  if (!uebung) return "curl"
  const id = uebung.id || ""
  for (const [re, key] of REGELN) if (re.test(id)) return key

  switch (uebung.kategorie) {
    case "Push": return "druck_horizontal"
    case "Pull": return "zug_horizontal"
    case "Beine": return "kniebeuge"
    case "Core": return "core"
    default: return "curl"
  }
}
