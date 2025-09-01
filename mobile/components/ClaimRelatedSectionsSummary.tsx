import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Gavel, Handshake, Shield, MessageSquare } from "lucide-react";
import type { Decision, Settlement, Appeal, Note } from "../../types";

interface DecisionsSummaryProps {
  decisions?: Decision[];
}

export function DecisionsSummary({ decisions }: DecisionsSummaryProps) {
  if (!decisions || decisions.length === 0) return null;
  return (
    <Card className="shadow-sm border-[#e2e8f0] bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#1e293b] flex items-center gap-2">
          <Gavel className="w-5 h-5 text-[#1a3a6c]" />
          Decyzje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {decisions.map((decision, idx) => (
          <div key={decision.id || idx} className="p-3 bg-[#f8fafc] rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-xs text-[#64748b] block">Data decyzji</span>
                <span className="font-medium text-[#1e293b]">{decision.decisionDate || '-'}</span>
              </div>
              {decision.status && (
                <div>
                  <span className="text-xs text-[#64748b] block">Status</span>
                  <span className="font-medium text-[#1e293b]">{decision.status}</span>
                </div>
              )}
              {typeof decision.amount !== 'undefined' && (
                <div>
                  <span className="text-xs text-[#64748b] block">Kwota</span>
                  <span className="font-medium text-[#1e293b]">
                    {decision.amount} {decision.currency || ''}
                  </span>
                </div>
              )}
            </div>
            {decision.documents && decision.documents.length > 0 && (
              <div className="text-sm">
                <span className="text-xs text-[#64748b] block mb-1">Dokumenty</span>
                <ul className="list-disc pl-5 space-y-1">
                  {decision.documents.map((doc) => (
                    <li key={doc.id}>
                      <a
                        href={doc.downloadUrl ?? doc.filePath ?? '#'}
                        className="text-[#1a3a6c] underline"
                      >
                        {doc.fileName || doc.originalFileName || 'Dokument'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface SettlementsSummaryProps {
  settlements?: Settlement[];
}

export function SettlementsSummary({ settlements }: SettlementsSummaryProps) {
  if (!settlements || settlements.length === 0) return null;
  return (
    <Card className="shadow-sm border-[#e2e8f0] bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#1e293b] flex items-center gap-2">
          <Handshake className="w-5 h-5 text-[#1a3a6c]" />
          Ugody
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {settlements.map((s, idx) => (
          <div key={s.id || idx} className="p-3 bg-[#f8fafc] rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {s.settlementNumber && (
                <div>
                  <span className="text-xs text-[#64748b] block">Numer</span>
                  <span className="font-medium text-[#1e293b]">{s.settlementNumber}</span>
                </div>
              )}
              {s.status && (
                <div>
                  <span className="text-xs text-[#64748b] block">Status</span>
                  <span className="font-medium text-[#1e293b]">{s.status}</span>
                </div>
              )}
              {s.settlementDate && (
                <div>
                  <span className="text-xs text-[#64748b] block">Data</span>
                  <span className="font-medium text-[#1e293b]">{s.settlementDate}</span>
                </div>
              )}
              {(typeof s.settlementAmount !== 'undefined' || typeof s.amount !== 'undefined') && (
                <div>
                  <span className="text-xs text-[#64748b] block">Kwota</span>
                  <span className="font-medium text-[#1e293b]">
                    {(s.settlementAmount ?? s.amount) ?? ''} {s.currency || ''}
                  </span>
                </div>
              )}
            </div>
            {s.documents && s.documents.length > 0 && (
              <div className="text-sm">
                <span className="text-xs text-[#64748b] block mb-1">Dokumenty</span>
                <ul className="list-disc pl-5 space-y-1">
                  {s.documents.map((doc) => (
                    <li key={doc.id}>
                      <a
                        href={doc.downloadUrl ?? doc.filePath ?? '#'}
                        className="text-[#1a3a6c] underline"
                      >
                        {doc.fileName || doc.originalFileName || 'Dokument'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface AppealsSummaryProps {
  appeals?: Appeal[];
}

export function AppealsSummary({ appeals }: AppealsSummaryProps) {
  if (!appeals || appeals.length === 0) return null;
  return (
    <Card className="shadow-sm border-[#e2e8f0] bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#1e293b] flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#1a3a6c]" />
          Odwołania
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {appeals.map((a, idx) => (
          <div key={a.id || idx} className="p-3 bg-[#f8fafc] rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {a.appealNumber && (
                <div>
                  <span className="text-xs text-[#64748b] block">Numer</span>
                  <span className="font-medium text-[#1e293b]">{a.appealNumber}</span>
                </div>
              )}
              {a.status && (
                <div>
                  <span className="text-xs text-[#64748b] block">Status</span>
                  <span className="font-medium text-[#1e293b]">{a.status}</span>
                </div>
              )}
              {a.submissionDate && (
                <div>
                  <span className="text-xs text-[#64748b] block">Data złożenia</span>
                  <span className="font-medium text-[#1e293b]">{a.submissionDate}</span>
                </div>
              )}
              {a.decisionDate && (
                <div>
                  <span className="text-xs text-[#64748b] block">Data decyzji</span>
                  <span className="font-medium text-[#1e293b]">{a.decisionDate}</span>
                </div>
              )}
              {typeof a.appealAmount !== 'undefined' && (
                <div>
                  <span className="text-xs text-[#64748b] block">Kwota</span>
                  <span className="font-medium text-[#1e293b]">{a.appealAmount}</span>
                </div>
              )}
            </div>
            {a.documents && a.documents.length > 0 && (
              <div className="text-sm">
                <span className="text-xs text-[#64748b] block mb-1">Dokumenty</span>
                <ul className="list-disc pl-5 space-y-1">
                  {a.documents.map((doc) => (
                    <li key={doc.id}>
                      <a
                        href={doc.downloadUrl ?? doc.filePath ?? '#'}
                        className="text-[#1a3a6c] underline"
                      >
                        {doc.fileName || doc.originalFileName || 'Dokument'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface NotesSummaryProps {
  notes?: Note[];
}

export function NotesSummary({ notes }: NotesSummaryProps) {
  if (!notes || notes.length === 0) return null;
  return (
    <Card className="shadow-sm border-[#e2e8f0] bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#1e293b] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#1a3a6c]" />
          Notatki
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-[#f8fafc] rounded-r-lg">
            {note.title && (
              <h4 className="font-medium text-[#1e293b] text-sm">{note.title}</h4>
            )}
            <p className="text-sm text-[#64748b]">{note.description}</p>
            <div className="flex items-center space-x-4 text-xs text-[#64748b] mt-2">
              {note.user && <span>{note.user}</span>}
              {note.createdAt && (
                <span>{new Date(note.createdAt).toLocaleDateString('pl-PL')}</span>
              )}
              {note.dueDate && (
                <span>Termin: {new Date(note.dueDate).toLocaleDateString('pl-PL')}</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default {
  DecisionsSummary,
  SettlementsSummary,
  AppealsSummary,
  NotesSummary,
};

