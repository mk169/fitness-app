import useStored from "../lib/useStored"
import { heute, tageBis } from "../lib/datum"
import { datumLang, EINTRAG_TYPEN } from "./Kalender"
import { KalenderPanel } from "./KalenderSeite"
import { useZiel } from "./ZielSeite"
import { useTrainingsUebersicht } from "./TrainingsplanSeite"
import Koerperkarte from "./Koerperkarte"
import { MUSKELGRUPPEN } from "../lib/uebungen"
import { WOCHEN_KEYS, SPLITS, tagesName, standardTage, normEintrag } from "../lib/splits"
import {
  konzeptVon, methodeVon, FARBEN, FASTEN_STANDARD, fastenStatus, aktivePhase,
} from "../lib/ernaehrung"

function begruessung() {
  const stunde = new Date().getHours()
  if (stunde < 11) return "Guten Morgen"
  if (stunde < 18) return "Guten Tag"
  return "Guten Abend"
}

function Abschnitt({ titel, onOeffnen, children }) {
  return (
    <section className="mt-10">
      <button
        onClick={onOeffnen}
        className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400 transition-colors hover:text-gray-900"
      >
        {titel}
        <span className="text-gray-300 transition-colors group-hover:text-gray-900">→</span>
      </button>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export default function Dashboard({ onNavigate }) {
  const { profil, plan } = useZiel()

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <p className="text-sm text-gray-400">{datumLang(heute())}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">
        {begruessung()}, Matthias
      </h1>

      {/* 1. Heute – mit dem Kalender verbundener Tagesblock zum Abhaken */}
      <HeuteBlock profil={profil} plan={plan} onNavigate={onNavigate} />

      {/* 2. + 3. Trainings- und Ernährungsplan */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <TrainingVorschau onOeffnen={() => onNavigate("training")} />
        <ErnaehrungVorschau plan={plan} onOeffnen={() => onNavigate("ernaehrung")} />
      </div>

      {/* 4. Ziel & Anpassung */}
      <ZielBanner plan={plan} onOeffnen={() => onNavigate("ziel")} />

      <Abschnitt titel="Kalender" onOeffnen={() => onNavigate("kalender")}>
        <KalenderPanel />
      </Abschnitt>
    </div>
  )
}

// ---- Heute: Tages-Agenda aus dem Kalender – Termine, Training und
// Ernährungsbesonderheiten (Fasten, Mahlzeiten) des Tages an einem Ort ----
function HeuteBlock({ profil, plan, onNavigate }) {
  const heuteKey = heute()
  const [checks, setChecks] = useStored("checks", {})
  const [termine] = useStored("kalenderTermine", [])
  const [mahlzeiten] = useStored("mahlzeiten", [])
  const [wochenplan] = useStored("trainingsplanUebungen", {})
  const [fasten] = useStored("fasten", FASTEN_STANDARD)
  const [phasen] = useStored("fastenPhasen", [])
  const [konzeptId] = useStored("ernaehrungKonzept", "standard")
  const tages = checks[heuteKey] ?? {}

  function toggleFlag(feld) {
    setChecks({ ...checks, [heuteKey]: { ...tages, [feld]: !tages[feld] } })
  }

  // Training des Tages (aus dem Wochenplan).
  const tagKey = WOCHEN_KEYS[(new Date().getDay() + 6) % 7]
  const eintraegePlan = (wochenplan[tagKey] ?? []).map(normEintrag)
  const abgehakt = eintraegePlan.filter((e) => tages.uebungen?.[e.id]).length
  const tageWahl = profil.tageWahl ?? standardTage(profil.trainingsTage ?? 3)
  const einheit = tagesName(profil.splitWahl ?? "oberUnter", tageWahl, tagKey)

  // Fasten des Tages: mehrtägige Phase vor täglichem Fenster.
  const phase = aktivePhase(phasen, heuteKey)
  const methode = methodeVon(fasten.methode)
  const jetzt = new Date()
  const status = fastenStatus(fasten.fenster ?? [], jetzt.getHours() + jetzt.getMinutes() / 60)
  const fensterText = (fasten.fenster ?? [])
    .map((f) => `${f.start}–${f.ende} Uhr`)
    .join(", ")

  // Ernährung: Konzept + kcal-Stand.
  const konzept = konzeptVon(konzeptId)
  const heutigeMahlzeiten = mahlzeiten.filter((m) => m.datum === heuteKey)
  const kcal = heutigeMahlzeiten.reduce((s, m) => s + (m.kcal || 0), 0)

  // Agenda: Training & Fasten oben, dann alles mit Uhrzeit chronologisch.
  const zeilen = [
    ...(eintraegePlan.length > 0
      ? [{
          typ: "training",
          label: `${einheit ?? "Training"} · ${eintraegePlan.length} Übungen`,
          status: `${abgehakt}/${eintraegePlan.length}${abgehakt === eintraegePlan.length ? " ✓" : ""}`,
          onClick: () => onNavigate("training"),
        }]
      : []),
    ...(phase
      ? [{
          typ: "fasten",
          label: `${phase.titel || "Fastenphase"} · Tag ${phase.tag} von ${phase.tage}`,
          status: "mehrtägig",
          onClick: () => onNavigate("ernaehrung"),
        }]
      : status
        ? [{
            typ: "fasten",
            label: `Fasten ${methode.name} · Fenster ${fensterText}`,
            status: status.imFenster ? "Fenster offen" : "fastet",
            onClick: () => onNavigate("ernaehrung"),
          }]
        : []),
    ...(konzept
      ? [{
          typ: "mahlzeit",
          label: `${konzept.name} · ${heutigeMahlzeiten.length} Mahlzeiten`,
          status: plan ? `${kcal} / ${plan.kalorien} kcal` : kcal > 0 ? `${kcal} kcal` : "",
          onClick: () => onNavigate("ernaehrung"),
        }]
      : []),
    ...[...termine.filter((t) => t.datum === heuteKey), ...heutigeMahlzeiten.map((m) => ({ ...m, typ: "mahlzeit", titel: m.titel }))]
      .sort((a, b) => (a.zeit || "99:99").localeCompare(b.zeit || "99:99"))
      .map((t) => ({
        typ: EINTRAG_TYPEN[t.typ] ? t.typ : "termin",
        label: t.titel,
        zeit: t.zeit,
        status: t.kcal ? `${t.kcal} kcal` : "",
      })),
  ]

  return (
    <section className="mt-6">
      <button
        onClick={() => onNavigate("kalender")}
        className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400 transition-colors hover:text-gray-900"
      >
        Heute
        <span className="text-gray-300 transition-colors group-hover:text-gray-900">→</span>
      </button>

      <div className="mt-3 rounded-xl border-2 border-gray-900 bg-white px-5 py-2">
        {zeilen.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">
            Heute steht nichts an – Kalender öffnen, um zu planen.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {zeilen.map((z, i) => {
              const typ = EINTRAG_TYPEN[z.typ]
              const Zeile = z.onClick ? "button" : "div"
              return (
                <li key={i}>
                  <Zeile
                    onClick={z.onClick}
                    className={`flex w-full items-center gap-3 py-2.5 text-left ${z.onClick ? "cursor-pointer" : ""}`}
                  >
                    <span className="w-12 shrink-0 text-xs tabular-nums text-gray-400">
                      {z.zeit || ""}
                    </span>
                    <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium ${typ.chip}`}>
                      {typ.name}
                    </span>
                    <span className="flex-1 truncate text-sm text-gray-800">{z.label}</span>
                    {z.status && (
                      <span className="shrink-0 text-xs font-medium text-gray-400">{z.status}</span>
                    )}
                    {z.onClick && <span className="text-gray-300">→</span>}
                  </Zeile>
                </li>
              )
            })}
          </ul>
        )}

        {/* Tages-Check: eingehalten? */}
        <div className="flex flex-wrap gap-5 border-t border-gray-100 py-2.5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={!!tages.ernaehrung}
              onChange={() => toggleFlag("ernaehrung")}
              className="h-4 w-4 accent-gray-900"
            />
            Ernährung eingehalten
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={!!tages.fasten}
              onChange={() => toggleFlag("fasten")}
              className="h-4 w-4 accent-gray-900"
            />
            Fasten eingehalten
          </label>
        </div>
      </div>
    </section>
  )
}

function ZielBanner({ plan, onOeffnen }) {
  if (!plan) {
    return (
      <button
        onClick={onOeffnen}
        className="mt-10 flex w-full items-center justify-between rounded-xl border border-dashed border-gray-300 px-5 py-4 text-left transition-colors hover:border-gray-400"
      >
        <span>
          <span className="block text-sm font-medium text-gray-900">Ziel festlegen</span>
          <span className="mt-0.5 block text-xs text-gray-400">
            Definiere dein Ziel – Ernährung und Training richten sich danach.
          </span>
        </span>
        <span className="text-gray-300">→</span>
      </button>
    )
  }

  const dl = plan.deadline
  return (
    <button
      onClick={onOeffnen}
      className="mt-10 w-full rounded-xl border border-gray-200 bg-white p-5 text-left transition-colors hover:border-gray-400"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Ziel &amp; Anpassung
          </span>
          <p className="mt-1 text-lg font-semibold text-gray-900">{plan.modusInfo.name}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-center text-sm">
          <span className="rounded-lg bg-gray-100 px-3 py-1.5 font-medium text-gray-700">
            {plan.kalorien} kcal
          </span>
          <span className="rounded-lg bg-rose-50 px-3 py-1.5 font-medium text-rose-700">
            {plan.makros.protein} g P
          </span>
          <span className="rounded-lg bg-amber-50 px-3 py-1.5 font-medium text-amber-700">
            {plan.makros.fett} g F
          </span>
          <span className="rounded-lg bg-sky-50 px-3 py-1.5 font-medium text-sky-700">
            {plan.makros.kohlenhydrate} g C
          </span>
        </div>
      </div>
      {dl && (
        <p className="mt-3 text-xs text-gray-400">
          Deadline {new Date(dl.datum).toLocaleDateString("de-DE")} ({tageBis(dl.datum)}) ·{" "}
          {dl.differenz > 0 ? "+" : ""}{dl.differenz} kg ·{" "}
          <span className={dl.realistisch ? "text-emerald-600" : "text-rose-600"}>
            {dl.realistisch ? "realistisch" : "ambitioniert"}
          </span>
        </p>
      )}
    </button>
  )
}

function TrainingVorschau({ onOeffnen }) {
  const { anzahl, muskeln } = useTrainingsUebersicht()
  const { profil } = useZiel()
  const split = SPLITS[profil.splitWahl ?? "oberUnter"]

  return (
    <button
      onClick={onOeffnen}
      className="rounded-xl border border-gray-200 bg-white p-5 text-left transition-colors hover:border-gray-400"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Trainingsplan</span>
        <span className="text-gray-300">→</span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="w-28 shrink-0">
          <Koerperkarte aktiv={muskeln} labels={false} />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{split?.name ?? "—"}</p>
          <p className="mt-0.5 text-sm text-gray-400">
            {anzahl} Trainingstage · {muskeln.size > 0 ? `${muskeln.size} Muskelgruppen` : "noch nichts geplant"}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {[...muskeln].slice(0, 4).map((m) => (
              <span key={m} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                {MUSKELGRUPPEN[m]?.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}

function ErnaehrungVorschau({ plan, onOeffnen }) {
  const [konzeptId] = useStored("ernaehrungKonzept", "standard")
  const [fasten] = useStored("fasten", FASTEN_STANDARD)
  const konzept = konzeptVon(konzeptId)
  const methode = methodeVon(fasten.methode)

  return (
    <button
      onClick={onOeffnen}
      className="rounded-xl border border-gray-200 bg-white p-5 text-left transition-colors hover:border-gray-400"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Ernährungsplan</span>
        <span className="text-gray-300">→</span>
      </div>
      <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <span className={`h-2.5 w-2.5 rounded-full ${FARBEN[konzept.farbe].punkt}`} />
        {konzept.name}
      </p>
      <p className="mt-0.5 text-sm text-gray-400">
        Fasten: {methode.name}
        {plan ? ` · ${plan.kalorien} kcal Ziel` : ""}
      </p>
    </button>
  )
}
