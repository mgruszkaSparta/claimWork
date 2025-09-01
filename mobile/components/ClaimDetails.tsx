import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Car,
  Clock,
  FileText,
  CheckCircle,
  Home,
  Mail,
  MapPin,
  Phone,
  Truck,
  User,
} from "lucide-react";
import { Claim } from "./ActiveClaims";
import {
  DecisionsSummary,
  SettlementsSummary,
  AppealsSummary,
  NotesSummary,
} from "./ClaimRelatedSectionsSummary";

interface ClaimDetailsProps {
  onNavigate: (section: string, claim?: Claim) => void;
  claim?: Claim | null;
}

interface MobileDocument {
  id: string;
  name: string;
  size: number;
  type: "image" | "pdf" | "doc" | "video" | "other";
  uploadedAt: string;
  url: string;
  category?: string;
  categoryCode?: string;
  description?: string;
  date?: string;
  objectTypeId?: number;
  finalized?: boolean;
}

export function ClaimDetails({ onNavigate, claim }: ClaimDetailsProps) {
  // Dokumenty z "teczki szkodliwej" przeniesione 1:1 do zgłoszenia
  const harmfulDocs: MobileDocument[] = [
    {
      id: "doc1",
      name: "Protokol_szkody.pdf",
      size: 24576,
      type: "pdf",
      uploadedAt: "2024-08-25T10:00:00Z",
      url: "/docs/Protokol_szkody.pdf",
      category: "protokoły",
      categoryCode: "PROTOKOL",
      description: "Protokół szkody",
      objectTypeId: 1,
      finalized: false,
    },
    {
      id: "doc2",
      name: "Zdjecie_szkody.jpg",
      size: 40960,
      type: "image",
      uploadedAt: "2024-08-25T10:05:00Z",
      url: "/docs/Zdjecie_szkody.jpg",
      category: "zdjęcia",
      categoryCode: "PHOTO",
      description: "Zdjęcie szkody",
      objectTypeId: 2,
      finalized: false,
    },
  ];

  // Mock data - w rzeczywistej aplikacji byłoby pobierane na podstawie identyfikatora
  const typeLabelMap: Record<number, string> = {
    1: "komunikacyjna",
    2: "mienie",
    3: "transport",
  };

  const claimData = {
    id: claim?.id || "SK-2024-001",
    type: claim?.type || typeLabelMap[claim?.objectTypeId ?? 1],
    status: claim?.status || "w trakcie",
    progress: claim?.progress || 65,
    date: claim?.date || "2024-08-25",
    amount: claim?.amount || "8,500 PLN",
    location: claim?.location || "ul. Marszałkowska 1, Warszawa",
    description:
      claim?.description ||
      "Kolizja drogowa na skrzyżowaniu z udziałem dwóch pojazdów. Uszkodzenia obejmują przód pojazdu oraz lewe drzwi. Konieczna naprawa lakieru i wymiana zderzaka.",
      contact:
        claim?.contact || {
          person: "Jan Kowalski",
          phone: "+48 123 456 789",
          email: "jan.kowalski@email.com",
        },
    objectTypeId: claim?.objectTypeId || 1,
    documents: harmfulDocs,
    timeline: [
      {
        date: "2024-08-25",
        status: "Zgłoszenie otrzymane",
        description: "Szkoda została zgłoszona i przyjęta do realizacji",
        completed: true
      },
      {
        date: "2024-08-26", 
        status: "Ocena szkody",
        description: "Rzeczoznawca przeprowadził oględziny pojazdu",
        completed: true
      },
      {
        date: "2024-08-28",
        status: "Kosztorys",
        description: "Przygotowano szczegółowy kosztorys naprawy",
        completed: true
      },
      {
        date: "2024-08-30",
        status: "Realizacja naprawy",
        description: "Pojazd przekazany do warsztatu",
        completed: false,
        current: true
      },
      {
        date: "2024-09-05",
        status: "Zakończenie",
        description: "Planowane zakończenie naprawy",
        completed: false
      }
    ],
    decisions: [
      {
        id: "dec1",
        decisionDate: "2024-09-02",
        status: "Zaakceptowana",
        amount: 7500,
        currency: "PLN",
        documents: [
          {
            id: "dec-doc1",
            fileName: "decyzja.pdf",
            downloadUrl: "/docs/decyzja.pdf",
          },
        ],
      },
    ],
    settlements: [
      {
        id: "set1",
        settlementNumber: "UG-2024-001",
        status: "Zaakceptowana",
        settlementDate: "2024-09-02",
        settlementAmount: 7500,
        currency: "PLN",
        documents: [],
      },
    ],
    appeals: [
      {
        id: "app1",
        appealNumber: "OD-2024-001",
        submissionDate: "2024-09-10",
        status: "W toku",
        documents: [],
      },
    ],
    notes: [
      {
        id: "note1",
        type: "note",
        title: "Kontrola dokumentów",
        description: "Sprawdzić kompletność dokumentów.",
        user: "Anna Nowak",
        createdAt: "2024-09-01",
      },
    ],
  };

  const [documents, setDocuments] = useState(claimData.documents);
  const visibleDocs = documents.filter(
    (d) => !claimData.objectTypeId || d.objectTypeId === claimData.objectTypeId
  );

  const finalizeDocument = (id: string) => {
    setDocuments((docs) =>
      docs.map((d) => (d.id === id ? { ...d, finalized: true } : d))
    );
  };

  const getTypeIcon = (objectTypeId?: number) => {
    const iconProps = "w-6 h-6";
    switch(objectTypeId) {
      case 1: return <Car className={`${iconProps} text-[#1a3a6c]`} />;
      case 2: return <Home className={`${iconProps} text-[#059669]`} />;
      case 3: return <Truck className={`${iconProps} text-[#dc2626]`} />;
      default: return <AlertCircle className={`${iconProps} text-[#d97706]`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'w trakcie': return 'bg-[#e1e7ef] text-[#1a3a6c] border-[#1a3a6c]/20';
      case 'oczekuje': return 'bg-[#fef3c7] text-[#d97706] border-[#d97706]/20';
      case 'zakończona': return 'bg-[#d1fae5] text-[#059669] border-[#059669]/20';
      default: return 'bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]';
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#e2e8f0] px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('claims')}
            className="text-[#64748b] hover:bg-[#f1f5f9] rounded-full w-10 h-10 p-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {getTypeIcon(claimData.objectTypeId)}
              <div>
                <h1 className="text-[#1e293b] font-semibold">{claimData.id}</h1>
                <p className="text-[#64748b] text-sm">Szczegóły szkody</p>
              </div>
            </div>
          </div>
          <Badge className={`${getStatusColor(claimData.status)} font-medium px-3 py-1`}>
            {claimData.status}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Status i postęp */}
        <Card className="shadow-sm border-[#e2e8f0] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#1e293b] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1a3a6c]" />
              Status realizacji
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#64748b]">Postęp realizacji</span>
                <span className="text-[#1e293b] font-semibold">{claimData.progress}%</span>
              </div>
              <Progress value={claimData.progress} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 bg-[#f8fafc] rounded-lg">
                <div className="text-sm text-[#64748b]">Data zgłoszenia</div>
                <div className="font-semibold text-[#1e293b]">{claimData.date}</div>
              </div>
              <div className="text-center p-3 bg-[#f8fafc] rounded-lg">
                <div className="text-sm text-[#64748b]">Wartość szkody</div>
                <div className="font-semibold text-[#1e293b]">{claimData.amount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opis szkody */}
        <Card className="shadow-sm border-[#e2e8f0] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#1e293b] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1a3a6c]" />
              Opis szkody
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#64748b] leading-relaxed">{claimData.description}</p>
            <div className="mt-4 p-3 bg-[#f8fafc] rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-[#64748b]" />
                <span className="text-[#64748b]">Miejsce zdarzenia:</span>
              </div>
              <p className="text-[#1e293b] font-medium mt-1">{claimData.location}</p>
            </div>
          </CardContent>
        </Card>

        {/* Dokumenty */}
        <Card className="shadow-sm border-[#e2e8f0] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#1e293b] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1a3a6c]" />
              Dokumenty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#64748b]" />
                  <div className="flex flex-col">
                    <span className="text-sm text-[#1e293b]">{doc.name}</span>
                    <span className="text-xs text-[#64748b]">
                      {doc.type.toUpperCase()} • {(doc.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                </div>
                {doc.finalized ? (
                  <Badge className="bg-[#d1fae5] text-[#059669] border-[#059669]/20 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Zakończony
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    className="bg-[#1a3a6c] hover:bg-[#153458] text-white"
                    onClick={() => finalizeDocument(doc.id)}
                  >
                    Zakończ
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="shadow-sm border-[#e2e8f0] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#1e293b] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1a3a6c]" />
              Historia realizacji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {claimData.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      event.completed
                        ? 'bg-[#1a3a6c]'
                        : event.current
                          ? 'bg-[#d97706]'
                          : 'bg-[#e2e8f0]'
                    }`} />
                    {index < claimData.timeline.length - 1 && (
                      <div className={`w-0.5 h-8 ${
                        event.completed ? 'bg-[#1a3a6c]' : 'bg-[#e2e8f0]'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-medium ${
                        event.current ? 'text-[#d97706]' : 'text-[#1e293b]'
                      }`}>
                        {event.status}
                      </h4>
                      <span className="text-sm text-[#64748b]">{event.date}</span>
                    </div>
                    <p className="text-sm text-[#64748b]">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <DecisionsSummary decisions={claimData.decisions} />
        <SettlementsSummary settlements={claimData.settlements} />
        <AppealsSummary appeals={claimData.appeals} />
        <NotesSummary notes={claimData.notes} />

        {/* Dane kontaktowe */}
        <Card className="shadow-sm border-[#e2e8f0] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#1e293b] flex items-center gap-2">
              <User className="w-5 h-5 text-[#1a3a6c]" />
              Dane kontaktowe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg">
                <User className="w-5 h-5 text-[#64748b]" />
                <div>
                  <div className="text-sm text-[#64748b]">Zgłaszający</div>
                  <div className="font-medium text-[#1e293b]">{claimData.contact.person}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg">
                <Phone className="w-5 h-5 text-[#64748b]" />
                <div>
                  <div className="text-sm text-[#64748b]">Telefon</div>
                  <div className="font-medium text-[#1e293b]">{claimData.contact.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg">
                <Mail className="w-5 h-5 text-[#64748b]" />
                <div>
                  <div className="text-sm text-[#64748b]">Email</div>
                  <div className="font-medium text-[#1e293b]">{claimData.contact.email}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Akcje */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          <Button 
            variant="outline" 
            className="h-12 border-[#1a3a6c] text-[#1a3a6c] hover:bg-[#e1e7ef]"
          >
            <Phone className="w-4 h-4 mr-2" />
            Zadzwoń
          </Button>
          <Button 
            className="h-12 bg-[#1a3a6c] hover:bg-[#153458] text-white"
          >
            <Mail className="w-4 h-4 mr-2" />
            Wyślij email
          </Button>
        </div>
      </div>
    </div>
  );
}
