import { useEffect, useState } from "react"
import { setzeCloudSession } from "./lib/useStored"
import { supabase, cloudAktiv } from "./lib/supabase"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import ZielSeite from "./components/ZielSeite"
import TrainingsplanSeite from "./components/TrainingsplanSeite"
import ErnaehrungsplanSeite from "./components/ErnaehrungsplanSeite"
import KalenderSeite from "./components/KalenderSeite"

export default function App() {
  const [seite, setSeite] = useState("dashboard")
  // Ohne Cloud gibt es keinen Login – dann gilt die App sofort als bereit.
  const [session, setSession] = useState(null)
  const [authBereit, setAuthBereit] = useState(!cloudAktiv)

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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-400">
        Lädt…
      </div>
    )
  }
  if (cloudAktiv && !session) return <Login />

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <button
            onClick={zurueck}
            className="text-sm font-semibold tracking-tight"
          >
            Form
          </button>
          {cloudAktiv && session && (
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-xs text-gray-400 transition-colors hover:text-gray-900"
            >
              Abmelden
            </button>
          )}
        </div>
      </header>

      <main>
        {seite === "dashboard" && <Dashboard onNavigate={navigiere} />}
        {seite === "ziel" && <ZielSeite onBack={zurueck} />}
        {seite === "training" && (
          <TrainingsplanSeite onBack={zurueck} onZiel={() => navigiere("ziel")} />
        )}
        {seite === "ernaehrung" && <ErnaehrungsplanSeite onBack={zurueck} />}
        {seite === "kalender" && <KalenderSeite onBack={zurueck} />}
      </main>
    </div>
  )
}
