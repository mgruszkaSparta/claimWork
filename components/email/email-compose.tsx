"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Send,
  Paperclip,
  X,
  Save,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Link,
  ImageIcon,
  Smile,
  MoreHorizontal,
} from "lucide-react"
import { emailTemplates } from "@/lib/email-data"
import type { EmailCompose, EmailAttachment } from "@/types/email"

interface EmailComposeProps {
  onSend: (email: EmailCompose) => void
  onSaveDraft: (email: EmailCompose) => void
  onClose: () => void
  replyTo?: string
  replySubject?: string
  replyBody?: string
  claimId: string
}

export const EmailComposeComponent = ({
  onSend,
  onSaveDraft,
  onClose,
  replyTo,
  replySubject,
  replyBody,
  claimId,
}: EmailComposeProps) => {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("")

  const [emailData, setEmailData] = useState<EmailCompose>({
    to: replyTo || "",
    cc: "",
    bcc: "",
    subject: replySubject || "",
    body: replyBody ? `\n\n--- Oryginalna wiadomość ---\n${replyBody}` : "",
    attachments: [],
    isHtml: false,
    priority: "normal",
    replyTo: replyTo,
    inReplyTo: replyTo,
  })

  const handleInputChange = (field: keyof EmailCompose, value: string) => {
    setEmailData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    const newAttachments: EmailAttachment[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }))

    setEmailData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments],
    }))

    toast({
      title: "Załączniki dodane",
      description: `Dodano ${newAttachments.length} plik(ów)`,
    })
  }

  const removeAttachment = (attachmentId: string) => {
    setEmailData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att.id !== attachmentId),
    }))
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find((t) => t.id === templateId)
    if (template) {
      setEmailData((prev) => ({
        ...prev,
        subject: template.subject.replace("{{claimNumber}}", claimId),
        body: template.body
          .replace("{{claimNumber}}", claimId)
          .replace("{{handlerName}}", "Piotr Raniecki")
          .replace("{{repairCost}}", "15,600.00")
          .replace("{{otherCosts}}", "0.00")
          .replace("{{totalCost}}", "15,600.00"),
      }))
      setSelectedTemplate("")
    }
  }

  const handleSend = () => {
    if (!emailData.to.trim()) {
      toast({
        title: "Błąd",
        description: "Pole 'Do' jest wymagane",
        variant: "destructive",
      })
      return
    }

    if (!emailData.subject.trim()) {
      toast({
        title: "Błąd",
        description: "Temat wiadomości jest wymagany",
        variant: "destructive",
      })
      return
    }

    onSend(emailData)
    toast({
      title: "E-mail wysłany",
      description: "Wiadomość została wysłana pomyślnie",
    })
  }

  const handleSaveDraft = () => {
    onSaveDraft(emailData)
    toast({
      title: "Szkic zapisany",
      description: "Wiadomość została zapisana w szkicach",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Nowa wiadomość</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Zapisz szkic
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Template Selection */}
        <div className="flex items-center space-x-4">
          <Label className="text-sm font-medium">Szablon:</Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Wybierz szablon..." />
            </SelectTrigger>
            <SelectContent>
              {emailTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Recipients */}
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <Label className="w-12 text-sm font-medium">Do:</Label>
            <Input
              value={emailData.to}
              onChange={(e) => handleInputChange("to", e.target.value)}
              placeholder="Wprowadź adresy e-mail oddzielone przecinkami"
              className="flex-1"
            />
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setShowCc(!showCc)} className="text-sm">
                DW
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowBcc(!showBcc)} className="text-sm">
                UDW
              </Button>
            </div>
          </div>

          {showCc && (
            <div className="flex items-center space-x-4">
              <Label className="w-12 text-sm font-medium">DW:</Label>
              <Input
                value={emailData.cc}
                onChange={(e) => handleInputChange("cc", e.target.value)}
                placeholder="Kopia wiadomości"
                className="flex-1"
              />
            </div>
          )}

          {showBcc && (
            <div className="flex items-center space-x-4">
              <Label className="w-12 text-sm font-medium">UDW:</Label>
              <Input
                value={emailData.bcc}
                onChange={(e) => handleInputChange("bcc", e.target.value)}
                placeholder="Ukryta kopia wiadomości"
                className="flex-1"
              />
            </div>
          )}
        </div>

        {/* Subject */}
        <div className="flex items-center space-x-4">
          <Label className="w-12 text-sm font-medium">Temat:</Label>
          <Input
            value={emailData.subject}
            onChange={(e) => handleInputChange("subject", e.target.value)}
            placeholder="Temat wiadomości"
            className="flex-1"
          />
          <Select value={emailData.priority} onValueChange={(value: any) => handleInputChange("priority", value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Niski</SelectItem>
              <SelectItem value="normal">Normalny</SelectItem>
              <SelectItem value="high">Wysoki</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-t border-b py-2">
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Underline className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <Button variant="ghost" size="sm">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <AlignRight className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <Button variant="ghost" size="sm">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Link className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsHtmlMode(!isHtmlMode)}
              className={isHtmlMode ? "bg-blue-100 text-blue-700" : ""}
            >
              <Type className="h-4 w-4 mr-1" />
              HTML
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Message Body */}
        <div className="space-y-2">
          <Textarea
            value={emailData.body}
            onChange={(e) => handleInputChange("body", e.target.value)}
            placeholder="Treść wiadomości..."
            rows={12}
            className="resize-none"
          />
        </div>

        {/* Attachments */}
        {emailData.attachments.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Załączniki:</Label>
            <div className="flex flex-wrap gap-2">
              {emailData.attachments.map((attachment) => (
                <Badge key={attachment.id} variant="secondary" className="flex items-center space-x-2 p-2">
                  <Paperclip className="h-3 w-3" />
                  <span className="text-xs">{attachment.name}</span>
                  <span className="text-xs text-gray-500">({formatFileSize(attachment.size)})</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => removeAttachment(attachment.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="h-4 w-4 mr-2" />
              Załącz pliki
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4 mr-2" />
              Wyślij
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
