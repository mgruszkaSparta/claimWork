"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { apiService, ClaimNotificationSettings } from "@/lib/api"

const eventOptions = [
  "ClaimCreated",
  "ClaimUpdated",
  "StatusChanged",
  "DocumentAdded",
  "RequiredDocumentAdded",
  "DecisionAdded",
  "RecourseAdded",
  "SettlementAdded",
  "SettlementAppealAdded",
  "SettlementAppealReminder30Days",
  "SettlementAppealReminder60Days",
]

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<ClaimNotificationSettings>({ recipients: ["", "", ""], events: [] })

  useEffect(() => {
    const load = async () => {
      const data = await apiService.getNotificationSettings()
      setSettings({
        recipients: [0,1,2].map(i => data.recipients[i] || ""),
        events: data.events || [],
      })
    }
    load()
  }, [])

  const handleRecipientChange = (index: number, value: string) => {
    const recipients = [...settings.recipients]
    recipients[index] = value
    setSettings(prev => ({ ...prev, recipients }))
  }

  const toggleEvent = (evt: string) => {
    setSettings(prev => ({
      ...prev,
      events: prev.events.includes(evt)
        ? prev.events.filter(e => e !== evt)
        : [...prev.events, evt],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await apiService.updateNotificationSettings({
      recipients: settings.recipients.filter(r => r),
      events: settings.events,
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Powiadomienia i automatyczne zadania</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div className="space-y-4">
          <h2 className="text-xl font-medium">Adresaci powiadomień</h2>
          {[0,1,2].map(i => (
            <div key={i}>
              <Label htmlFor={`recipient-${i}`}>Email {i+1}</Label>
              <Input
                id={`recipient-${i}`}
                type="email"
                value={settings.recipients[i] || ""}
                onChange={e => handleRecipientChange(i, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-medium">Zdarzenia</h2>
          {eventOptions.map(evt => (
            <div key={evt} className="flex items-center space-x-2">
              <Checkbox
                id={evt}
                checked={settings.events.includes(evt)}
                onCheckedChange={() => toggleEvent(evt)}
              />
              <Label htmlFor={evt}>{evt}</Label>
            </div>
          ))}
        </div>
        <Button type="submit">Zapisz</Button>
      </form>
      <div>
        <h2 className="text-xl font-medium">Automatyczne zadania</h2>
        <p className="text-gray-500">Konfiguracja automatycznych zadań będzie dostępna w przyszłej wersji.</p>
      </div>
    </div>
  )
}
