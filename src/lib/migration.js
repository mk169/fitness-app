// Datenmodell-Härtung: beim Laden (lokal & Cloud) werden gespeicherte Werte
// gegen kaputte/veraltete Formen abgesichert und – falls nötig – auf das
// aktuelle Schema migriert. Migrationen sind idempotent (dürfen mehrfach
// laufen), damit sie bei jedem Laden gefahrlos angewandt werden können.

// Registrierte Migrationen je Speicher-Schlüssel. altWert -> neuWert.
const MIGRATIONEN = {
  // Mahlzeiten kennen künftig Makros & Menge – Alt-Einträge (nur kcal)
  // werden hier mit Standardwerten aufgefüllt.
  mahlzeiten: (v) =>
    Array.isArray(v)
      ? v.map((m) => ({ protein: 0, fett: 0, kohlenhydrate: 0, menge: null, ...m }))
      : v,
}

// Prüft grob, ob ein geladener Wert zur erwarteten Form (aus dem Fallback)
// passt. Verhindert Abstürze durch kaputte oder fremde Daten.
function passtZuFallback(wert, fallback) {
  if (fallback === undefined || fallback === null) return true
  if (Array.isArray(fallback)) return Array.isArray(wert)
  const tf = typeof fallback
  if (tf === "object") return wert !== null && typeof wert === "object" && !Array.isArray(wert)
  return typeof wert === tf
}

// Sichert & migriert einen geladenen Wert. Bei Unbrauchbarkeit -> Fallback.
export function migriereWert(key, wert, fallback) {
  if (wert === undefined || wert === null) return fallback
  if (!passtZuFallback(wert, fallback)) return fallback
  const m = MIGRATIONEN[key]
  if (!m) return wert
  try {
    return m(wert)
  } catch {
    return fallback
  }
}
