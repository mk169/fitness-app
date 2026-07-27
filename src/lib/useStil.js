import { useEffect } from "react"
import useStored from "./useStored"
import { STIL_STANDARD, stilVon, wendeStilAn } from "./themes"

// Liest den gewählten Stil (geräteübergreifend synchronisiert via useStored)
// und wendet ihn auf das Wurzelelement an. Rückgabe wie useState.
export default function useStil() {
  const [stilId, setStilId] = useStored("stil", STIL_STANDARD)
  const stil = stilVon(stilId)

  useEffect(() => {
    wendeStilAn(stil)
  }, [stil])

  return [stilId, setStilId, stil]
}
