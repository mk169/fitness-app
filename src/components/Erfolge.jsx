import useStored from "../lib/useStored"
import { badgeListe } from "../lib/badges"
import { SectionTitle, cx } from "./ui"

// Erfolge/Badges als Raster. Erreichte leuchten farbig, offene sind gedimmt
// und zeigen einen Fortschrittsbalken. Rein aus vorhandenen Daten abgeleitet.
export default function Erfolge() {
  const [log] = useStored("trainingLog", [])
  const [checks] = useStored("checks", {})
  const [mahlzeiten] = useStored("mahlzeiten", [])

  const liste = badgeListe({ log, checks, mahlzeiten })
  const erreicht = liste.filter((b) => b.erreicht).length

  return (
    <section className="mt-10">
      <SectionTitle right={<span className="text-xs font-medium text-muted">{erreicht} / {liste.length}</span>}>
        Erfolge
      </SectionTitle>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {liste.map((b) => (
          <div
            key={b.id}
            className={cx(
              "rounded-2xl border p-4 transition-colors",
              b.erreicht
                ? "border-accent/40 bg-accent/10"
                : "border-[color:var(--ov-06)] bg-surface-2"
            )}
          >
            <div className="flex items-start gap-3">
              <span className={cx("text-2xl", !b.erreicht && "opacity-40 grayscale")}>{b.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={cx("truncate text-sm font-semibold", b.erreicht ? "text-ink" : "text-muted")}>
                    {b.name}
                  </p>
                  {b.erreicht && <span className="text-xs text-accent-soft">✓</span>}
                </div>
                <p className="mt-0.5 text-xs text-faint">{b.beschreibung}</p>
                {!b.erreicht && (
                  <div className="mt-2">
                    <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--ov-10)]">
                      <div
                        className="h-full rounded-full bg-accent-gradient transition-all"
                        style={{ width: `${Math.round(b.fortschritt * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
