import useStored from "../lib/useStored"
import { STILE, STIL_STANDARD } from "../lib/themes"
import { SectionTitle, cx } from "./ui"

// Farbvorschau eines Stils: Fläche in der Hintergrundfarbe mit Akzent-Punkt.
function Swatch({ stil, size = "h-7 w-7" }) {
  return (
    <span
      className={cx(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-lg ring-1 ring-black/20",
        size
      )}
      style={{ background: stil.swatch[0] }}
    >
      <span
        className="h-3 w-3 rounded-full"
        style={{ backgroundImage: `linear-gradient(120deg, ${stil.swatch[1]}, ${stil.swatch[2]})` }}
      />
    </span>
  )
}

// Stil-Umschalter. variant="kompakt" für die Sidebar (nur Farbfelder),
// variant="voll" für die Ziel-Seite (Kacheln mit Namen).
export default function StilWaehler({ variant = "kompakt" }) {
  const [stilId, setStilId] = useStored("stil", STIL_STANDARD)

  if (variant === "voll") {
    return (
      <section className="mt-8">
        <SectionTitle>Stil &amp; Erscheinungsbild</SectionTitle>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {STILE.map((s) => {
            const aktiv = s.id === stilId
            return (
              <button
                key={s.id}
                onClick={() => setStilId(s.id)}
                className={cx(
                  "flex items-center gap-3 rounded-2xl border bg-surface p-3 text-left transition-colors",
                  aktiv
                    ? "border-accent/60 shadow-[var(--shadow-glow)]"
                    : "border-[color:var(--ov-06)] hover:border-[color:var(--ov-20)]"
                )}
              >
                <Swatch stil={s} size="h-9 w-9" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{s.name}</span>
                  <span className="block text-[11px] text-faint">{s.gruppe}</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>
    )
  }

  return (
    <div>
      <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">Stil</p>
      <div className="mt-2 flex flex-wrap gap-1.5 px-1">
        {STILE.map((s) => {
          const aktiv = s.id === stilId
          return (
            <button
              key={s.id}
              onClick={() => setStilId(s.id)}
              title={s.name}
              aria-label={`Stil ${s.name}`}
              className={cx(
                "rounded-xl p-0.5 ring-2 transition",
                aktiv ? "ring-accent" : "ring-transparent hover:ring-[color:var(--ov-20)]"
              )}
            >
              <Swatch stil={s} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
