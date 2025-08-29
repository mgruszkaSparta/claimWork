"use client"

import React, { useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download, FileText } from "lucide-react"
import { renderAsync } from "docx-preview"

export type FileType = "pdf" | "image" | "excel" | "docx" | "other"

interface DocumentPreviewProps {
  isOpen: boolean
  url: string
  fileName: string
  fileType: FileType
  onClose: () => void
  onDownload: () => void
  canNavigate?: boolean
  onNext?: () => void
  onPrev?: () => void
  extraActions?: React.ReactNode
}

export function DocumentPreview({
  isOpen,
  url,
  fileName,
  fileType,
  onClose,
  onDownload,
  canNavigate = false,
  onNext,
  onPrev,
  extraActions,
}: DocumentPreviewProps) {
  const docxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && fileType === "docx" && url && docxRef.current) {
      fetch(url)
        .then((r) => r.arrayBuffer())
        .then((buffer) => renderAsync(buffer, docxRef.current!))
        .catch(() => {
          /* ignore */
        })
    }
    return () => {
      if (docxRef.current) docxRef.current.innerHTML = ""
    }
  }, [isOpen, fileType, url])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Podgląd: {fileName}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto flex items-center justify-center bg-muted/50 rounded-lg">
          {fileType === "pdf" ? (
            <iframe src={url} className="w-full h-[70vh] border-0" title="Document Preview" />
          ) : fileType === "image" ? (
            <img src={url || "/placeholder.svg"} alt="Preview" className="max-w-full max-h-[70vh] object-contain" />
          ) : fileType === "excel" ? (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
              className="w-full h-[70vh] border-0"
              title="Document Preview"
            />
          ) : fileType === "docx" ? (
            <div ref={docxRef} className="w-full h-[70vh] overflow-auto bg-white" />
          ) : (
            <div className="text-center p-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Podgląd niedostępny dla tego typu pliku.</p>
              <p className="text-gray-500 text-sm mt-2">Możesz pobrać plik, aby go otworzyć.</p>
            </div>
          )}
        </div>
        <div className="flex justify-between pt-4">
          {canNavigate && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onPrev} disabled={!onPrev}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Poprzedni</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onNext} disabled={!onNext}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Następny</span>
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            {extraActions}
            <Button onClick={onDownload} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Pobierz plik
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DocumentPreview
