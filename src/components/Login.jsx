import { useState } from "react"
import { supabase } from "../lib/supabase"
import { Card, Button, inputCls } from "./ui"

// Einfacher Login mit E-Mail und Passwort. „Registrieren“ legt einen
// neuen Account an, „Anmelden“ meldet einen bestehenden an.

export default function Login() {
  const [modus, setModus] = useState("anmelden")
  const [email, setEmail] = useState("")
  const [passwort, setPasswort] = useState("")
  const [meldung, setMeldung] = useState("")
  const [laden, setLaden] = useState(false)

  async function absenden(e) {
    e.preventDefault()
    setMeldung("")
    setLaden(true)
    const fn =
      modus === "anmelden"
        ? supabase.auth.signInWithPassword({ email, password: passwort })
        : supabase.auth.signUp({ email, password: passwort })
    const { error } = await fn
    setLaden(false)
    if (error) {
      setMeldung(error.message)
    } else if (modus === "registrieren") {
      setMeldung(
        "Fast geschafft: Bitte bestätige den Link in der E-Mail, dann kannst du dich anmelden."
      )
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-6">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-gradient text-xl font-black text-white shadow-[var(--shadow-glow)]">
            M
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">Mogged</h1>
          <p className="mt-1 text-center text-sm text-muted">
            {modus === "anmelden"
              ? "Melde dich an, um deine Daten auf allen Geräten zu sehen."
              : "Erstelle deinen Account."}
          </p>
        </div>

        <Card as="form" onSubmit={absenden} className="mt-6 space-y-3 p-5">
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            E-Mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            Passwort
            <input
              type="password"
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
              required
              minLength={6}
              autoComplete={
                modus === "anmelden" ? "current-password" : "new-password"
              }
              className={inputCls}
            />
          </label>

          {meldung && <p className="text-xs text-muted">{meldung}</p>}

          <Button type="submit" disabled={laden} className="w-full py-2.5">
            {laden
              ? "Moment…"
              : modus === "anmelden"
                ? "Anmelden"
                : "Registrieren"}
          </Button>
        </Card>

        <button
          onClick={() =>
            setModus(modus === "anmelden" ? "registrieren" : "anmelden")
          }
          className="mt-3 w-full text-center text-xs text-muted transition-colors hover:text-ink"
        >
          {modus === "anmelden"
            ? "Noch kein Account? Registrieren"
            : "Schon einen Account? Anmelden"}
        </button>
      </div>
    </div>
  )
}
