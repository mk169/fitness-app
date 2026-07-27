import { WOCHEN_KEYS } from "./splits"

// Habit-Tracker-Logik. Habits werden pro Tag im bestehenden `checks`-Store
// abgehakt: Feld-Habits (Ernährung/Fasten) nutzen checks[tag].feld, eigene
// Habits checks[tag].habits[id]. Automatische Habits kommen aus den Plänen.

// Farbtöne für Habits & Programme (statische Klassen -> von Tailwind erfasst).
export const HABIT_FARBE = {
  indigo: { dot: "bg-indigo-400", chip: "bg-indigo-500/15 text-indigo-300", rand: "border-indigo-400/50" },
  sky: { dot: "bg-sky-400", chip: "bg-sky-500/15 text-sky-300", rand: "border-sky-400/50" },
  emerald: { dot: "bg-emerald-400", chip: "bg-emerald-500/15 text-emerald-300", rand: "border-emerald-400/50" },
  amber: { dot: "bg-amber-400", chip: "bg-amber-500/15 text-amber-300", rand: "border-amber-400/50" },
  rose: { dot: "bg-rose-400", chip: "bg-rose-500/15 text-rose-300", rand: "border-rose-400/50" },
  violet: { dot: "bg-violet-400", chip: "bg-violet-500/15 text-violet-300", rand: "border-violet-400/50" },
  teal: { dot: "bg-teal-400", chip: "bg-teal-500/15 text-teal-300", rand: "border-teal-400/50" },
  orange: { dot: "bg-orange-400", chip: "bg-orange-500/15 text-orange-300", rand: "border-orange-400/50" },
  lime: { dot: "bg-lime-400", chip: "bg-lime-500/15 text-lime-300", rand: "border-lime-400/50" },
  slate: { dot: "bg-slate-400", chip: "bg-[color:var(--ov-10)] text-muted", rand: "border-[color:var(--ov-25)]" },
}
export const farbeVon = (k) => HABIT_FARBE[k] ?? HABIT_FARBE.slate
export const HABIT_FARBEN = ["sky", "emerald", "amber", "rose", "violet", "teal", "orange", "lime"]

// Vorschläge beim Anlegen eigener Habits.
export const HABIT_VORSCHLAEGE = [
  { name: "Wasser trinken", icon: "💧", farbe: "sky" },
  { name: "10.000 Schritte", icon: "👟", farbe: "emerald" },
  { name: "Schlaf 7–8 h", icon: "😴", farbe: "violet" },
  { name: "Protein-Ziel", icon: "🥩", farbe: "rose" },
  { name: "Mobility / Stretching", icon: "🧘", farbe: "teal" },
  { name: "Kein Alkohol", icon: "🚫", farbe: "amber" },
]

const zuKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

const wochentag = (dayKey) =>
  WOCHEN_KEYS[(new Date(`${dayKey}T00:00:00`).getDay() + 6) % 7]

// Automatische Habits aus den Plänen für einen konkreten Tag.
export function autoHabits(dayKey, { wochenplan, fastenMethode } = {}) {
  const list = [
    { id: "auto-ernaehrung", name: "Ernährung eingehalten", icon: "🥗", farbe: "amber", feld: "ernaehrung", auto: true },
  ]
  if (fastenMethode && fastenMethode !== "keins") {
    list.push({ id: "auto-fasten", name: "Fasten eingehalten", icon: "⏳", farbe: "violet", feld: "fasten", auto: true })
  }
  const geplant = wochenplan?.[wochentag(dayKey)] ?? []
  if (geplant.length > 0) {
    list.push({ id: "auto-training", name: "Training", icon: "🏋️", farbe: "indigo", auto: true })
  }
  return list
}

// Alle Habits eines Tages: automatische + eigene.
export function habitsAmTag(dayKey, ctx, eigene) {
  return [...autoHabits(dayKey, ctx), ...(eigene ?? []).map((h) => ({ ...h, auto: false }))]
}

// Ist ein Habit an einem Tag erledigt?
export function istErledigt(checks, dayKey, habit) {
  const tag = checks?.[dayKey]
  if (!tag) return false
  if (habit.feld) return !!tag[habit.feld]
  return !!tag.habits?.[habit.id]
}

// Erledigt-Status umschalten – gibt ein neues checks-Objekt zurück.
export function toggle(checks, dayKey, habit) {
  const tag = { ...(checks?.[dayKey] ?? {}) }
  if (habit.feld) {
    tag[habit.feld] = !tag[habit.feld]
  } else {
    tag.habits = { ...(tag.habits ?? {}) }
    tag.habits[habit.id] = !tag.habits[habit.id]
  }
  return { ...checks, [dayKey]: tag }
}

// Aktuelle Streak: aufeinanderfolgende erledigte Tage bis (einschließlich) heute.
// Ist heute noch nicht erledigt, zählt die Serie bis gestern (kein Nuller).
export function streak(checks, habit, todayKey) {
  let n = 0
  const d = new Date(`${todayKey}T00:00:00`)
  if (!istErledigt(checks, zuKey(d), habit)) d.setDate(d.getDate() - 1)
  while (istErledigt(checks, zuKey(d), habit)) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

// Tages-Fortschritt: wie viele der Tages-Habits erledigt sind.
export function tagesFortschritt(checks, dayKey, habits) {
  const erledigt = habits.filter((h) => istErledigt(checks, dayKey, h)).length
  return { erledigt, gesamt: habits.length }
}

// Neue eigene Habit-Definition (mit stabiler Id).
export function neuerHabit(name, icon = "✅", farbe = "sky") {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  return { id, name: name.trim(), icon, farbe }
}
