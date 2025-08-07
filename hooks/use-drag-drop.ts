"use client"

import { useState, useCallback } from "react"

interface DragDropState {
  isDragOver: boolean
  isOutlookDrag: boolean
}

export const useDragDrop = () => {
  const [dragState, setDragState] = useState<DragDropState>({
    isDragOver: false,
    isOutlookDrag: false,
  })

  const detectOutlookDrag = useCallback((event: DragEvent): boolean => {
    const types = event.dataTransfer?.types || []

    // Outlook-specific indicators
    const outlookIndicators = [
      "application/x-moz-file",
      "Files",
      "text/uri-list",
      "text/html",
      "text/plain",
      "application/x-msoutlook",
      "application/octet-stream",
    ]

    // Check if any indicators are present
    for (const indicator of outlookIndicators) {
      if (types.includes(indicator)) {
        return true
      }
    }

    // Additional check for HTML content
    try {
      const htmlContent = event.dataTransfer?.getData("text/html")
      if (
        htmlContent &&
        (htmlContent.includes("outlook") ||
          htmlContent.includes("Office") ||
          htmlContent.includes("Microsoft") ||
          htmlContent.includes("attachment"))
      ) {
        return true
      }
    } catch (e) {
      // Ignore errors during dragover
    }

    return false
  }, [])

  const handleDragOver = useCallback(
    (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      const isOutlookDrag = detectOutlookDrag(event)
      setDragState({
        isDragOver: true,
        isOutlookDrag,
      })
    },
    [detectOutlookDrag],
  )

  const handleDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    setDragState({
      isDragOver: false,
      isOutlookDrag: false,
    })
  }, [])

  const handleDrop = useCallback((event: DragEvent, onFilesDropped: (files: FileList) => void) => {
    event.preventDefault()
    event.stopPropagation()

    setDragState({
      isDragOver: false,
      isOutlookDrag: false,
    })

    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      onFilesDropped(files)
    }
  }, [])

  const handlePaste = useCallback((event: ClipboardEvent, onFilesPasted: (files: File[]) => void) => {
    const items = event.clipboardData?.items
    if (!items) return

    const files: File[] = []

    // Look for files in clipboard
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const file = items[i].getAsFile()
        if (file) {
          files.push(file)
        }
      }
    }

    if (files.length > 0) {
      onFilesPasted(files)
    }
  }, [])

  return {
    dragState,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePaste,
  }
}
