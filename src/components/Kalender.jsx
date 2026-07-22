import { useState } from "react"
import { heute } from "../lib/datum"
import { cx } from "./ui"

const WOCHENTAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
const MONATE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
]

export const EINTRAG_TYPEN = {
  training: { chip: "bg-accent/20 text-accent-soft", punkt: "bg-accent", name: "Training" },
  mahlzeit: { chip: "bg-emerald-500/20 text-emerald-300", punkt: "bg-emerald-400", name: "Ernährung" },
  fasten: { chip: "bg-violet-500/20 text-violet-300", punkt: "bg-violet-400", name: "Fasten" },
  termin: { chip: "bg-white/10 text-muted", punkt: "bg-slate-400", name: "Termin" },
}

export function schluessel(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function datumLang(key) {
  const d = new Date(key)
  return `${WOCHENTAGE[(d.getDay() + 6) % 7]}, ${d.getDate()}. ${MONATE[d.getMonth()]} ${d.getFullYear()}`
}

function montagVon(d) {
  const kopie = new Date(d)
  kopie.setDate(kopie.getDate() - ((kopie.getDay() + 6) % 7))
  return kopie
}

// Wiederverwendbarer Kalender mit Tages-, Wochen- und Monatsansicht.
// eintraegeAm(key) liefert die Einträge eines Tages:
//   { typ, label, zeit?, onRemove? }
export default function Kalender({ eintraegeAm, legende = [], onNeu }) {
  const [ansicht, setAnsicht] = useState("monat")
  const [cursor, setCursor] = useState(heute())
  const heuteKey = heute()
  const cursorDate = new Date(cursor)

  function blaettern(richtung) {
    const d = new Date(cursor)
    if (ansicht === "monat") d.setMonth(d.getMonth() + richtung)
    else if (ansicht === "woche") d.setDate(d.getDate() + richtung * 7)
    else d.setDate(d.getDate() + richtung)
    setCursor(schluessel(d))
  }

  const titel =
    ansicht === "monat"
      ? `${MONATE[cursorDate.getMonth()]} ${cursorDate.getFullYear()}`
      : ansicht === "woche"
        ? `Woche ab ${datumLang(schluessel(montagVon(cursorDate)))}`
        : datumLang(cursor)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{titel}</p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-white/10 bg-surface-2 p-0.5 text-xs">
            {[
              { key: "tag", label: "Tag" },
              { key: "woche", label: "Woche" },
              { key: "monat", label: "Monat" },
            ].map((a) => (
              <button
                key={a.key}
                onClick={() => setAnsicht(a.key)}
                className={cx(
                  "rounded-md px-2.5 py-1 font-medium transition-colors",
                  ansicht === a.key
                    ? "bg-accent-gradient on-accent"
                    : "text-muted hover:text-ink"
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCursor(heuteKey)}
            className="rounded-lg border border-white/10 bg-surface-2 px-2.5 py-1 text-xs text-muted transition-colors hover:text-ink"
          >
            Heute
          </button>
          <button
            onClick={() => blaettern(-1)}
            className="rounded-lg border border-white/10 bg-surface-2 px-2 py-1 text-xs text-muted transition-colors hover:text-ink"
          >
            ‹
          </button>
          <button
            onClick={() => blaettern(1)}
            className="rounded-lg border border-white/10 bg-surface-2 px-2 py-1 text-xs text-muted transition-colors hover:text-ink"
          >
            ›
          </button>
          {onNeu && (
            <button
              onClick={() => onNeu(ansicht === "tag" ? cursor : heuteKey)}
              className="rounded-lg bg-accent-gradient px-3 py-1 text-xs font-semibold on-accent shadow-[var(--shadow-glow)] hover:brightness-105"
            >
              + Neu
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        {ansicht === "monat" && (
          <MonatsAnsicht
            cursorDate={cursorDate}
            heuteKey={heuteKey}
            eintraegeAm={eintraegeAm}
            onTagKlick={(key) => {
              setCursor(key)
              setAnsicht("tag")
            }}
          />
        )}
        {ansicht === "woche" && (
          <WochenAnsicht
            cursorDate={cursorDate}
            heuteKey={heuteKey}
            eintraegeAm={eintraegeAm}
            onTagKlick={(key) => {
              setCursor(key)
              setAnsicht("tag")
            }}
          />
        )}
        {ansicht === "tag" && (
          <TagesAnsicht cursor={cursor} eintraegeAm={eintraegeAm} onNeu={onNeu} />
        )}
      </div>

      {legende.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
          {legende.map((typ) => (
            <span key={typ} className="flex items-center gap-1.5">
              <span className={cx("h-1.5 w-1.5 rounded-full", EINTRAG_TYPEN[typ].punkt)} />
              {EINTRAG_TYPEN[typ].name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function MonatsAnsicht({ cursorDate, heuteKey, eintraegeAm, onTagKlick }) {
  const jahr = cursorDate.getFullYear()
  const monat = cursorDate.getMonth()
  const tageImMonat = new Date(jahr, monat + 1, 0).getDate()
  const startOffset = (new Date(jahr, monat, 1).getDay() + 6) % 7

  return (
    <div>
      <div className="grid grid-cols-7 gap-px text-center text-xs text-faint">
        {WOCHENTAGE.map((w) => (
          <div key={w} className="pb-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06]">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`leer-${i}`} className="min-h-16 bg-bg-soft" />
        ))}
        {Array.from({ length: tageImMonat }).map((_, i) => {
          const tag = i + 1
          const key = `${jahr}-${String(monat + 1).padStart(2, "0")}-${String(tag).padStart(2, "0")}`
          const eintraege = eintraegeAm(key)
          const istHeute = key === heuteKey
          return (
            <button
              key={key}
              onClick={() => onTagKlick(key)}
              className="flex min-h-16 flex-col items-stretch gap-0.5 bg-surface p-1 text-left transition-colors hover:bg-surface-2"
            >
              <span
                className={cx(
                  "self-start rounded px-1 text-xs",
                  istHeute
                    ? "bg-accent-gradient font-semibold text-white"
                    : "text-muted"
                )}
              >
                {tag}
              </span>
              {eintraege.slice(0, 2).map((e, j) => (
                <span
                  key={j}
                  className={cx("truncate rounded px-1 text-[10px] leading-4", EINTRAG_TYPEN[e.typ].chip)}
                >
                  {e.label}
                </span>
              ))}
              {eintraege.length > 2 && (
                <span className="px-1 text-[10px] text-faint">
                  +{eintraege.length - 2} weitere
                </span>
              )}
            </button>
          )
        })}
        {(() => {
          const rest = (startOffset + tageImMonat) % 7
          return rest === 0
            ? null
            : Array.from({ length: 7 - rest }).map((_, i) => (
                <div key={`ende-${i}`} className="min-h-16 bg-bg-soft" />
              ))
        })()}
      </div>
    </div>
  )
}

function WochenAnsicht({ cursorDate, heuteKey, eintraegeAm, onTagKlick }) {
  const montag = montagVon(cursorDate)

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(montag)
        d.setDate(d.getDate() + i)
        const key = schluessel(d)
        const eintraege = eintraegeAm(key)
        const istHeute = key === heuteKey
        return (
          <button
            key={key}
            onClick={() => onTagKlick(key)}
            className={cx(
              "flex min-h-28 flex-col gap-1 rounded-xl border bg-surface p-2 text-left transition-colors hover:border-white/25",
              istHeute ? "border-accent/60" : "border-white/[0.06]"
            )}
          >
            <span
              className={cx("text-xs font-medium", istHeute ? "text-accent-soft" : "text-faint")}
            >
              {WOCHENTAGE[i]} {d.getDate()}.
            </span>
            {eintraege.map((e, j) => (
              <span
                key={j}
                className={cx("truncate rounded px-1.5 py-0.5 text-xs", EINTRAG_TYPEN[e.typ].chip)}
              >
                {e.zeit && <span className="font-medium">{e.zeit} </span>}
                {e.label}
              </span>
            ))}
          </button>
        )
      })}
    </div>
  )
}

// Tagesansicht als Zeitraster (Timestacking): Einträge mit Uhrzeit werden
// als Blöcke im Tagesverlauf gestapelt, ihre Höhe entspricht der Dauer.
const TAG_START = 6
const TAG_ENDE = 22
const PX_PRO_STUNDE = 48

function TagesAnsicht({ cursor, eintraegeAm, onNeu }) {
  const eintraege = eintraegeAm(cursor)
  const ohneZeit = eintraege.filter((e) => !e.zeit)
  const mitZeit = eintraege.filter((e) => e.zeit)

  return (
    <div>
      {ohneZeit.length > 0 && (
        <ul className="mb-4 space-y-1.5">
          {ohneZeit.map((e, i) => (
            <li
              key={i}
              className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface px-3 py-2"
            >
              <span className={cx("rounded px-2 py-0.5 text-xs", EINTRAG_TYPEN[e.typ].chip)}>
                {EINTRAG_TYPEN[e.typ].name}
              </span>
              <span className="flex-1 text-sm text-ink/90">{e.label}</span>
              {e.onRemove && (
                <button
                  onClick={e.onRemove}
                  title="Eintrag löschen"
                  className="text-faint opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div
        className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-surface"
        style={{ height: (TAG_ENDE - TAG_START) * PX_PRO_STUNDE }}
      >
        {Array.from({ length: TAG_ENDE - TAG_START }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-white/[0.05]"
            style={{ top: i * PX_PRO_STUNDE }}
          >
            <span className="absolute left-2 top-0.5 text-[10px] text-faint">
              {String(TAG_START + i).padStart(2, "0")}:00
            </span>
          </div>
        ))}

        {mitZeit.map((e, i) => {
          const [h, m] = e.zeit.split(":").map(Number)
          const start = Math.max(h + m / 60, TAG_START)
          const dauer = e.dauer ?? 60
          const top = (start - TAG_START) * PX_PRO_STUNDE
          const hoehe = Math.max(24, (dauer / 60) * PX_PRO_STUNDE)
          return (
            <div
              key={i}
              className={cx(
                "group absolute left-14 right-2 overflow-hidden rounded-md border border-white/10 px-2 py-1 text-xs",
                EINTRAG_TYPEN[e.typ].chip
              )}
              style={{ top, height: hoehe }}
            >
              <span className="font-medium">
                {e.zeit}
                {e.bis ? `–${e.bis}` : ""}
              </span>{" "}
              {e.label}
              {!e.bis && <span className="ml-1 opacity-60">({dauer} Min.)</span>}
              {e.onRemove && (
                <button
                  onClick={e.onRemove}
                  title="Eintrag löschen"
                  className="absolute right-1.5 top-1 opacity-0 transition-opacity hover:text-rose-200 group-hover:opacity-100"
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
      </div>

      {onNeu && (
        <button
          onClick={() => onNeu(cursor)}
          className="mt-3 text-xs font-medium text-muted transition-colors hover:text-ink"
        >
          + Eintrag an diesem Tag
        </button>
      )}
    </div>
  )
}
