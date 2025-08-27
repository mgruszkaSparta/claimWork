import React, { useState } from 'react';
import { Paperclip, CloudUpload, FolderOpen, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LeaveAttachmentsProps {
  // W przyszłości tutaj mogą być propsy do zarządzania plikami, np. onFilesChange
}

export function LeaveAttachments({}: LeaveAttachmentsProps) {
  const [attachedFiles, setAttachedFiles] = useState([
    { id: 'doc1', name: 'zaswiadczenie_lekarz.pdf', size: '245 KB', type: 'pdf' },
  ]);

  // Symulacja dodawania pliku (na razie bez rzeczywistego uploadu)
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFile = {
        id: `doc${attachedFiles.length + 1}`,
        name: event.target.files[0].name,
        size: `${(event.target.files[0].size / 1024).toFixed(0)} KB`,
        type: event.target.files[0].type.split('/')[1] || 'file',
      };
      setAttachedFiles([...attachedFiles, newFile]);
      // W prawdziwej aplikacji tutaj byłaby logika uploadu
    }
  };

  const handleFileDelete = (id: string) => {
    setAttachedFiles(attachedFiles.filter(file => file.id !== id));
  };

  return (
    <div className="grid gap-4 border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Załączniki dokumentów</h3>
        <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
          <Paperclip className="text-neutral-400 h-4 w-4" />
        </div>
      </div>
      
      <div className="mb-2">
        <p className="text-neutral-600 dark:text-neutral-400 text-sm">
          Załącz dokumenty potwierdzające powód urlopu (jeśli wymagane). Akceptowane formaty: PDF, DOC, DOCX, JPG, PNG. Maksymalny rozmiar: 10MB.
        </p>
      </div>
      
      <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-8 text-center hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors cursor-pointer">
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          // W przyszłości można dodać accept="application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <div className="mb-4">
            <CloudUpload className="text-4xl text-neutral-400 mx-auto h-10 w-10" />
          </div>
          <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-2">Przeciągnij pliki tutaj lub kliknij aby wybrać</p>
          <Button type="button" variant="outline" className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <FolderOpen className="mr-2 h-4 w-4" />
            Wybierz pliki
          </Button>
        </label>
      </div>
      
      {attachedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-neutral-900 dark:text-neutral-100 mb-3 font-medium">Załączone dokumenty</h3>
          <div className="space-y-2">
            {attachedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="text-neutral-500 h-5 w-5" /> {/* Ikona pliku */}
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{file.name}</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">({file.size})</span>
                </div>
                <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-destructive dark:hover:text-red-500" onClick={() => handleFileDelete(file.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}