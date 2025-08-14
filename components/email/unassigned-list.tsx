"use client"

import { useEffect, useState } from "react"
import { emailService, type EmailDto } from "@/lib/email-service"
import { apiService, type ClaimListItemDto } from "@/lib/api"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function UnassignedEmailList() {
  const [emails, setEmails] = useState<EmailDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<EmailDto | null>(null)
  const [claims, setClaims] = useState<ClaimListItemDto[]>([])
  const [selectedClaimId, setSelectedClaimId] = useState("")
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    const loadEmails = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await emailService.getUnassignedEmails()
        setEmails(data)
      } catch (err) {
        console.error(err)
        setError("Nie udało się pobrać wiadomości")
      } finally {
        setLoading(false)
      }
    }
    loadEmails()
  }, [])

  const openAssign = async (email: EmailDto) => {
    setSelectedEmail(email)
    setIsAssignOpen(true)
    setSelectedClaimId("")
    try {
      const { items } = await apiService.getClaims({ page: 1, pageSize: 50 })
      setClaims(items)
    } catch (err) {
      console.error("Failed to load claims", err)
      setClaims([])
    }
  }

  const handleAssign = async () => {
    if (!selectedEmail || !selectedClaimId) return
    setAssigning(true)
    try {
      const success = await emailService.assignEmailToClaim(selectedEmail.id, selectedClaimId)
      if (success) {
        setEmails((prev) => prev.filter((e) => e.id !== selectedEmail.id))
        setIsAssignOpen(false)
      }
    } catch (err) {
      console.error("Assign failed", err)
    } finally {
      setAssigning(false)
    }
  }

  if (loading) return <p className="p-4">Ładowanie...</p>
  if (error) return <p className="p-4 text-red-500">{error}</p>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Nieprzypisane wiadomości</h1>
      {emails.length === 0 ? (
        <p>Brak nieprzypisanych wiadomości.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nadawca</TableHead>
              <TableHead>Temat</TableHead>
              <TableHead>Otrzymano</TableHead>
              <TableHead className="w-32">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => (
              <TableRow key={email.id}>
                <TableCell>{email.from}</TableCell>
                <TableCell>{email.subject}</TableCell>
                <TableCell>{new Date(email.receivedDate).toLocaleString()}</TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => openAssign(email)}>
                    Przypisz
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Przypisz do szkody</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedClaimId} onValueChange={setSelectedClaimId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz szkodę" />
              </SelectTrigger>
              <SelectContent>
                {claims.map((claim) => (
                  <SelectItem key={claim.id} value={claim.id}>
                    {claim.claimNumber || claim.spartaNumber || claim.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleAssign} disabled={assigning || !selectedClaimId}>
              Przypisz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

