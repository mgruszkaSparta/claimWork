"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { emailService, type EmailDto } from "@/lib/email-service"

export function UnassignedEmailList() {
  const [emails, setEmails] = useState<EmailDto[]>([])
  const [loading, setLoading] = useState(false)
  const [assigningEmail, setAssigningEmail] = useState<EmailDto | null>(null)
  const [selectedClaim, setSelectedClaim] = useState("")

  useEffect(() => {
    const fetchEmails = async () => {
      setLoading(true)
      try {
        const data = await emailService.getUnassignedEmails()
        setEmails(data)
      } catch (error) {
        console.error("Failed to load emails", error)
        setEmails([])
      } finally {
        setLoading(false)
      }
    }
    fetchEmails()
  }, [])

  const handleAssign = async () => {
    if (!assigningEmail || !selectedClaim) return
    try {
      const success = await emailService.assignEmailToClaim(
        assigningEmail.id,
        selectedClaim,
      )
      if (success) {
        setEmails((prev) => prev.filter((e) => e.id !== assigningEmail.id))
        setAssigningEmail(null)
        setSelectedClaim("")
      }
    } catch (error) {
      console.error("Failed to assign email", error)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Szkody nieprzydzielone</h1>
      {loading ? (
        <p>Ładowanie...</p>
      ) : (
        <ul className="space-y-4">
          {emails.map((email) => (
            <li key={email.id} className="border rounded p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{email.subject}</p>
                  <p className="text-sm text-gray-500">{email.from}</p>
                </div>
                <Button onClick={() => setAssigningEmail(email)}>Przypisz</Button>
              </div>
            </li>
          ))}
          {emails.length === 0 && !loading && (
            <li className="text-gray-500">Brak e-maili do przypisania</li>
          )}
        </ul>
      )}

      <Dialog
        open={assigningEmail !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAssigningEmail(null)
            setSelectedClaim("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Przypisz do szkody</DialogTitle>
          </DialogHeader>
          <SearchableSelect
            apiEndpoint="/api/claims/options"
            value={selectedClaim}
            onValueChange={setSelectedClaim}
            placeholder="Wybierz szkodę"
            searchPlaceholder="Szukaj szkody..."
            emptyText="Nie znaleziono"
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setAssigningEmail(null); setSelectedClaim("") }}>Anuluj</Button>
            <Button onClick={handleAssign} disabled={!selectedClaim}>Przypisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
