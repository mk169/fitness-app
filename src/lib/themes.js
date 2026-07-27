// Stile (Themes). Jeder Stil ist ein Satz CSS-Variablen, den der Umschalter
// zur Laufzeit auf :root setzt. Dunkle Stile nutzen die Overlay-Standards aus
// index.css; der helle Stil überschreibt zusätzlich die Overlays und einige
// Tailwind-Farbtöne, damit getönte Chips auf hellem Grund lesbar bleiben.

export const STIL_STANDARD = "indigo"

// Helle Overlays (dunkle Tönung statt Weiß) für den hellen Stil.
const HELL_OVERLAYS = {
  "--ov-04": "rgba(17, 24, 39, 0.035)",
  "--ov-05": "rgba(17, 24, 39, 0.05)",
  "--ov-06": "rgba(17, 24, 39, 0.08)",
  "--ov-10": "rgba(17, 24, 39, 0.09)",
  "--ov-15": "rgba(17, 24, 39, 0.13)",
  "--ov-20": "rgba(17, 24, 39, 0.17)",
  "--ov-25": "rgba(17, 24, 39, 0.20)",
}

// Auf Hell werden die hellen Tailwind-Töne (…-300/-400), die als Chip-Text
// dienen, auf dunklere Varianten remappt – sonst wären sie kaum lesbar.
const HELL_TOENE = {
  "--color-rose-200": "#9f1239",
  "--color-rose-300": "#be123c",
  "--color-rose-400": "#e11d48",
  "--color-emerald-300": "#047857",
  "--color-emerald-400": "#059669",
  "--color-amber-300": "#b45309",
  "--color-amber-400": "#d97706",
  "--color-sky-300": "#0369a1",
  "--color-violet-300": "#6d28d9",
  "--color-teal-300": "#0f766e",
  "--color-red-300": "#b91c1c",
  "--color-orange-300": "#c2410c",
  "--color-lime-300": "#4d7c0f",
}

export const STILE = [
  {
    id: "indigo",
    name: "Mitternacht",
    gruppe: "Dunkel",
    hell: false,
    swatch: ["#0d0f17", "#6366f1", "#8b5cf6"],
    vars: {
      "--color-bg": "#0a0b10",
      "--color-bg-soft": "#0e0f16",
      "--color-surface": "#14161f",
      "--color-surface-2": "#1b1e29",
      "--color-hair": "#272b38",
      "--color-ink": "#f3f4f8",
      "--color-muted": "#9aa1ad",
      "--color-faint": "#6b7280",
      "--color-accent": "#6366f1",
      "--color-accent-2": "#8b5cf6",
      "--color-accent-soft": "#a5b4fc",
    },
  },
  {
    id: "obsidian",
    name: "Obsidian",
    gruppe: "Dunkel",
    hell: false,
    swatch: ["#000000", "#7c3aed", "#a855f7"],
    vars: {
      "--color-bg": "#000000",
      "--color-bg-soft": "#0a0a0c",
      "--color-surface": "#111114",
      "--color-surface-2": "#17171c",
      "--color-hair": "#2a2a31",
      "--color-ink": "#f4f4f6",
      "--color-muted": "#9b9ba6",
      "--color-faint": "#6c6c78",
      "--color-accent": "#7c3aed",
      "--color-accent-2": "#a855f7",
      "--color-accent-soft": "#c4b5fd",
    },
  },
  {
    id: "schiefer",
    name: "Schiefer",
    gruppe: "Dunkel",
    hell: false,
    swatch: ["#131b26", "#0ea5e9", "#22d3ee"],
    vars: {
      "--color-bg": "#0b1017",
      "--color-bg-soft": "#0f151e",
      "--color-surface": "#151c27",
      "--color-surface-2": "#1d2735",
      "--color-hair": "#2b3646",
      "--color-ink": "#eef2f7",
      "--color-muted": "#96a2b3",
      "--color-faint": "#64707f",
      "--color-accent": "#0ea5e9",
      "--color-accent-2": "#22d3ee",
      "--color-accent-soft": "#7dd3fc",
    },
  },
  {
    id: "smaragd",
    name: "Smaragd",
    gruppe: "Dunkel",
    hell: false,
    swatch: ["#0f1f19", "#10b981", "#34d399"],
    vars: {
      "--color-bg": "#07110d",
      "--color-bg-soft": "#0a1712",
      "--color-surface": "#101f19",
      "--color-surface-2": "#172a22",
      "--color-hair": "#24382e",
      "--color-ink": "#eef6f1",
      "--color-muted": "#93a89d",
      "--color-faint": "#62766b",
      "--color-accent": "#10b981",
      "--color-accent-2": "#34d399",
      "--color-accent-soft": "#6ee7b7",
    },
  },
  {
    id: "espresso",
    name: "Espresso",
    gruppe: "Dunkel",
    hell: false,
    swatch: ["#201710", "#d97706", "#f59e0b"],
    vars: {
      "--color-bg": "#120e0a",
      "--color-bg-soft": "#171009",
      "--color-surface": "#1f1710",
      "--color-surface-2": "#2a1f15",
      "--color-hair": "#3a2c1e",
      "--color-ink": "#f6f0e8",
      "--color-muted": "#b6a48f",
      "--color-faint": "#7d6f5e",
      "--color-accent": "#d97706",
      "--color-accent-2": "#f59e0b",
      "--color-accent-soft": "#fcd34d",
    },
  },
  {
    id: "bordeaux",
    name: "Bordeaux",
    gruppe: "Dunkel",
    hell: false,
    swatch: ["#201017", "#e11d48", "#f43f5e"],
    vars: {
      "--color-bg": "#120a0f",
      "--color-bg-soft": "#180b12",
      "--color-surface": "#201017",
      "--color-surface-2": "#2c1620",
      "--color-hair": "#3d2130",
      "--color-ink": "#f7eef2",
      "--color-muted": "#b899a6",
      "--color-faint": "#7e6070",
      "--color-accent": "#e11d48",
      "--color-accent-2": "#f43f5e",
      "--color-accent-soft": "#fda4af",
    },
  },
  {
    id: "tageslicht",
    name: "Tageslicht",
    gruppe: "Hell",
    hell: true,
    swatch: ["#ffffff", "#6366f1", "#8b5cf6"],
    vars: {
      "--color-bg": "#f5f6fa",
      "--color-bg-soft": "#ffffff",
      "--color-surface": "#ffffff",
      "--color-surface-2": "#eef1f7",
      "--color-hair": "#dde2ec",
      "--color-ink": "#1a1c25",
      "--color-muted": "#5a6472",
      "--color-faint": "#97a1b0",
      "--color-accent": "#6366f1",
      "--color-accent-2": "#8b5cf6",
      "--color-accent-soft": "#4f46e5",
      ...HELL_OVERLAYS,
      ...HELL_TOENE,
    },
  },
]

export function stilVon(id) {
  return STILE.find((s) => s.id === id) ?? STILE[0]
}

// Alle jemals gesetzten Variablen – beim Wechsel erst zurücksetzen, damit
// z. B. die Hell-Overrides beim Wechsel zurück auf einen dunklen Stil fallen.
export const ALLE_KEYS = [...new Set(STILE.flatMap((s) => Object.keys(s.vars)))]

// Setzt einen Stil auf das Wurzelelement.
export function wendeStilAn(stil) {
  if (typeof document === "undefined") return
  const el = document.documentElement
  ALLE_KEYS.forEach((k) => el.style.removeProperty(k))
  Object.entries(stil.vars).forEach(([k, v]) => el.style.setProperty(k, v))
  el.style.colorScheme = stil.hell ? "light" : "dark"
}
