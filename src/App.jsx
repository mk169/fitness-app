import { useEffect, useState } from "react"
import useStored, { setzeCloudSession } from "./lib/useStored"
import useStil from "./lib/useStil"
import { supabase, cloudAktiv } from "./lib/supabase"
import { cx, icons } from "./components/ui"
import StilWaehler from "./components/StilWaehler"
import Login from "./components/Login"
import Onboarding from "./components/Onboarding"
import Dashboard from "./components/Dashboard"
import ZielSeite from "./components/ZielSeite"
import TrainingsplanSeite from "./components/TrainingsplanSeite"
import ErnaehrungsplanSeite from "./components/ErnaehrungsplanSeite"
import KalenderSeite from "./components/KalenderSeite"

// Zentrale Navigation – Single Source of Truth für Sidebar & Bottom-Tabbar.
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: icons.dashboard },
  { key: "training", label: "Training", icon: icons.training },
  { key: "ernaehrung", label: "Ernährung", icon: icons.ernaehrung },
  { key: "kalender", label: "Kalender", icon: icons.kalender },
  { key: "ziel", label: "Ziel", icon: icons.ziel },
]

function Wortmarke() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-gradient text-base font-black text-white shadow-[var(--shadow-glow)]">
        M
      </span>
      <span className="text-lg font-bold tracking-tight text-ink">Mogged</span>
    </div>
  )
}

function Sidebar({ seite, onNavigate, session }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-[color:var(--ov-06)] bg-bg-soft px-4 py-6 md:flex">
      <button onClick={() => onNavigate("dashboard")} className="px-2">
        <Wortmarke />
      </button>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {NAV.map((n) => {
          const aktiv = seite === n.key
          return (
            <button
              key={n.key}
              onClick={() => onNavigate(n.key)}
              className={cx(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                aktiv
                  ? "bg-accent/15 text-accent-soft"
                  : "text-muted hover:bg-[color:var(--ov-04)] hover:text-ink"
              )}
            >
              {aktiv && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent-gradient" />
              )}
              {n.icon("h-5 w-5 shrink-0")}
              {n.label}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-[color:var(--ov-06)] pt-4">
        <StilWaehler variant="kompakt" />

        {cloudAktiv && session && (
          <div className="mt-4 border-t border-[color:var(--ov-06)] pt-4">
            <p className="truncate px-3 text-xs text-faint">{session.user?.email}</p>
            <button
              onClick={() => supabase.auth.signOut()}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-[color:var(--ov-04)] hover:text-ink"
            >
              {icons.logout("h-5 w-5 shrink-0")}
              Abmelden
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

function BottomBar({ seite, onNavigate }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--ov-06)] bg-bg-soft/95 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {NAV.map((n) => {
          const aktiv = seite === n.key
          return (
            <button
              key={n.key}
              onClick={() => onNavigate(n.key)}
              className={cx(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                aktiv ? "text-accent-soft" : "text-faint hover:text-ink"
              )}
            >
              {n.icon("h-5 w-5")}
              {n.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default function App() {
  const [seite, setSeite] = useState("dashboard")
  // Ohne Cloud gibt es keinen Login – dann gilt die App sofort als bereit.
  const [session, setSession] = useState(null)
  const [authBereit, setAuthBereit] = useState(!cloudAktiv)
  // Erst-Einrichtung: bis abgeschlossen wird der Onboarding-Assistent gezeigt.
  const [onboardingFertig, setOnboardingFertig] = useStored("onboardingFertig", false)
  // Gewählten Stil laden und auf das Wurzelelement anwenden.
  useStil()

  // Auth-Status verfolgen (nur wenn Supabase konfiguriert ist).
  useEffect(() => {
    if (!cloudAktiv) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setzeCloudSession(data.session?.user?.id ?? null)
      setAuthBereit(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      setzeCloudSession(s?.user?.id ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const navigiere = (ziel) => setSeite(ziel)
  const zurueck = () => setSeite("dashboard")

  if (cloudAktiv && !authBereit) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-muted">
        Lädt…
      </div>
    )
  }
  if (cloudAktiv && !session) return <Login />
  if (!onboardingFertig) return <Onboarding onFertig={() => setOnboardingFertig(true)} />

  return (
    <div className="min-h-screen text-ink">
      <Sidebar seite={seite} onNavigate={navigiere} session={session} />
      <BottomBar seite={seite} onNavigate={navigiere} />

      <main className="md:pl-60">
        <div
          key={seite}
          className="animate-page mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 sm:pt-10 md:pb-14"
        >
          {seite === "dashboard" && <Dashboard onNavigate={navigiere} />}
          {seite === "ziel" && <ZielSeite onBack={zurueck} />}
          {seite === "training" && (
            <TrainingsplanSeite onBack={zurueck} onZiel={() => navigiere("ziel")} />
          )}
          {seite === "ernaehrung" && <ErnaehrungsplanSeite onBack={zurueck} />}
          {seite === "kalender" && <KalenderSeite onBack={zurueck} />}
        </div>
      </main>
    </div>
  )
}
