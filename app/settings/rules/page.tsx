"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  apiService,
  type RuleTemplateDto,
  type RuleDto,
  type RuleTemplateUpsertDto,
  type RuleUpsertDto,
} from "@/lib/api"

const eventOptions = ["OnDecisionAdded", "OnClaimCreated", "OnClaimUpdated"]
const channelOptions = ["email", "sms"]

export default function RulesPage() {
  const [templates, setTemplates] = useState<RuleTemplateDto[]>([])
  const [rules, setRules] = useState<RuleDto[]>([])

  const [templateForm, setTemplateForm] = useState<RuleTemplateUpsertDto>({
    name: "",
    content: "",
    type: "notification",
  })
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)

  const [ruleForm, setRuleForm] = useState<RuleUpsertDto>({
    eventType: eventOptions[0],
    taskTemplateId: undefined,
    notificationTemplateId: undefined,
    recipients: [],
    channels: [],
    cronExpression: "",
  })
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const [tmpl, rls] = await Promise.all([
        apiService.getRuleTemplates(),
        apiService.getRules(),
      ])
      setTemplates(tmpl)
      setRules(rls)
    }
    load()
  }, [])

  const submitTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTemplateId) {
      const updated = { ...templateForm }
      setTemplates((prev) =>
        prev.map((t) => (t.id === editingTemplateId ? { ...t, ...updated } : t)),
      )
      await apiService.updateRuleTemplate(editingTemplateId, updated)
      setEditingTemplateId(null)
    } else {
      const tempId = `tmp-${Date.now()}`
      setTemplates((prev) => [...prev, { id: tempId, ...templateForm }])
      const created = await apiService.createRuleTemplate(templateForm)
      setTemplates((prev) =>
        prev.map((t) => (t.id === tempId ? created : t)),
      )
    }
    setTemplateForm({ name: "", content: "", type: "notification" })
  }

  const startEditTemplate = (t: RuleTemplateDto) => {
    setTemplateForm({ name: t.name, content: t.content, type: t.type })
    setEditingTemplateId(t.id)
  }

  const deleteTemplate = async (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    await apiService.deleteRuleTemplate(id)
  }

  const submitRule = async (e: React.FormEvent) => {
    e.preventDefault()
    const form: RuleUpsertDto = {
      ...ruleForm,
      recipients: ruleForm.recipients.filter((r) => r),
    }
    if (editingRuleId) {
      setRules((prev) => prev.map((r) => (r.id === editingRuleId ? { ...r, ...form } : r)))
      await apiService.updateRule(editingRuleId, form)
      setEditingRuleId(null)
    } else {
      const tempId = `tmp-${Date.now()}`
      setRules((prev) => [...prev, { id: tempId, ...form }])
      const created = await apiService.createRule(form)
      setRules((prev) => prev.map((r) => (r.id === tempId ? created : r)))
    }
    setRuleForm({
      eventType: eventOptions[0],
      taskTemplateId: undefined,
      notificationTemplateId: undefined,
      recipients: [],
      channels: [],
      cronExpression: "",
    })
  }

  const startEditRule = (r: RuleDto) => {
    setRuleForm({
      eventType: r.eventType,
      taskTemplateId: r.taskTemplateId,
      notificationTemplateId: r.notificationTemplateId,
      recipients: r.recipients,
      channels: r.channels,
      cronExpression: r.cronExpression ?? "",
    })
    setEditingRuleId(r.id)
  }

  const deleteRule = async (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
    await apiService.deleteRule(id)
  }

  const toggleChannel = (channel: string) => {
    setRuleForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reguły</h1>
      <section className="space-y-4">
        <h2 className="text-xl font-medium">Szablony</h2>
        <form onSubmit={submitTemplate} className="space-y-4 max-w-xl">
          <div>
            <Label htmlFor="template-name">Nazwa</Label>
            <Input
              id="template-name"
              value={templateForm.name}
              onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="template-content">Treść</Label>
            <Input
              id="template-content"
              value={templateForm.content}
              onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
            />
          </div>
          <div>
            <Label>Typ</Label>
            <Select
              value={templateForm.type}
              onValueChange={(v) => setTemplateForm({ ...templateForm, type: v as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">Zadanie</SelectItem>
                <SelectItem value="notification">Powiadomienie</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">
            {editingTemplateId ? "Aktualizuj" : "Dodaj"}
          </Button>
        </form>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.type}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => startEditTemplate(t)}>
                    Edytuj
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteTemplate(t.id)}>
                    Usuń
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-medium">Reguły</h2>
        <form onSubmit={submitRule} className="space-y-4 max-w-xl">
          <div>
            <Label>Zdarzenie</Label>
            <Select
              value={ruleForm.eventType}
              onValueChange={(v) => setRuleForm({ ...ruleForm, eventType: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventOptions.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Szablon zadania</Label>
            <Select
              value={ruleForm.taskTemplateId ?? ""}
              onValueChange={(v) =>
                setRuleForm({ ...ruleForm, taskTemplateId: v || undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Brak</SelectItem>
                {templates
                  .filter((t) => t.type === "task")
                  .map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Szablon powiadomienia</Label>
            <Select
              value={ruleForm.notificationTemplateId ?? ""}
              onValueChange={(v) =>
                setRuleForm({ ...ruleForm, notificationTemplateId: v || undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Brak</SelectItem>
                {templates
                  .filter((t) => t.type === "notification")
                  .map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Adresaci</Label>
            <Input
              value={ruleForm.recipients.join(",")}
              onChange={(e) =>
                setRuleForm({
                  ...ruleForm,
                  recipients: e.target.value
                    .split(",")
                    .map((r) => r.trim())
                    .filter((r) => r),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Kanały</Label>
            {channelOptions.map((c) => (
              <div key={c} className="flex items-center space-x-2">
                <Checkbox
                  id={`ch-${c}`}
                  checked={ruleForm.channels.includes(c)}
                  onCheckedChange={() => toggleChannel(c)}
                />
                <Label htmlFor={`ch-${c}`}>{c}</Label>
              </div>
            ))}
          </div>
          <div>
            <Label htmlFor="cron">Cron</Label>
            <Input
              id="cron"
              value={ruleForm.cronExpression}
              onChange={(e) =>
                setRuleForm({ ...ruleForm, cronExpression: e.target.value })
              }
            />
          </div>
          <Button type="submit">{editingRuleId ? "Aktualizuj" : "Dodaj"}</Button>
        </form>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zdarzenie</TableHead>
              <TableHead>Zadanie</TableHead>
              <TableHead>Powiadomienie</TableHead>
              <TableHead>Adresaci</TableHead>
              <TableHead>Kanały</TableHead>
              <TableHead>Cron</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.eventType}</TableCell>
                <TableCell>
                  {templates.find((t) => t.id === r.taskTemplateId)?.name || "-"}
                </TableCell>
                <TableCell>
                  {templates.find((t) => t.id === r.notificationTemplateId)?.name || "-"}
                </TableCell>
                <TableCell>{r.recipients.join(", ")}</TableCell>
                <TableCell>{r.channels.join(", ")}</TableCell>
                <TableCell>{r.cronExpression || "-"}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => startEditRule(r)}>
                    Edytuj
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteRule(r.id)}>
                    Usuń
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  )
}

