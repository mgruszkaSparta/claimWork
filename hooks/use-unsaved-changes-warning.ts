"use client"

import { useEffect } from "react"

export const UNSAVED_CHANGES_MESSAGE =
  "Uwaga, twoje dane nie zostaną zapisane. Naciśnij OK, aby kontynuować, lub wróć do formularza."

export function useUnsavedChangesWarning(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = UNSAVED_CHANGES_MESSAGE
      return UNSAVED_CHANGES_MESSAGE
    }

    const handlePopState = () => {
      if (!confirm(UNSAVED_CHANGES_MESSAGE)) {
        history.pushState(null, "", window.location.href)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("popstate", handlePopState)
    history.pushState(null, "", window.location.href)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [enabled])
}

