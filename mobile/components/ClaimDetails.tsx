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
  DollarSign,
  FileText,
  Handshake,
  Home,
  Mail,
  MapPin,
  Phone,
  Truck,
  User,
} from "lucide-react";

interface ClaimDetailsProps {
  onNavigate: (section: string) => void;
  claimId?: string;
}

export function ClaimDetails({ onNavigate, claimId }: ClaimDetailsProps) {
  // Mock data - w rzeczywistej aplikacji byłoby pobierane na podstawie claimId
  const claim = {
    id: claimId || "SK-2024-001",
    type: "komunikacyjna",
    status: "w trakcie",
    progress: 65,
    date: "2024-08-25",
    amount: "8,500 PLN",
    location: "ul. Marszałkowska 1, Warszawa",
    description: "Kolizja drogowa na skrzyżowaniu z udziałem dwóch pojazdów. Uszkodzenia obejmują przód pojazdu oraz lewe drzwi. Konieczna naprawa lakieru i wymiana zderzaka.",
    contact: {
      person: "Jan Kowalski",
      phone: "+48 123 456 789",
      email: "jan.kowalski@email.com"
    },
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
    settlement: {
      number: "UG-2024-001",
      decision: "Zaakceptowana",
      date: "2024-09-02",
      amount: "7,500 PLN"
    }
  };

  const getTypeIcon = (type: string) => {
    const iconProps = "w-6 h-6";
    switch(type) {
      case 'komunikacyjna': return <Car className={`${iconProps} text-[#1a3a6c]`} />;
      case 'mienie': return <Home className={`${iconProps} text-[#059669]`} />;
      case 'transport': return <Truck className={`${iconProps} text-[#dc2626]`} />;
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

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'Zaakceptowana':
        return 'bg-[#d1fae5] text-[#059669] border-[#059669]/20';
      case 'Odrzucona':
        return 'bg-[#fee2e2] text-[#dc2626] border-[#dc2626]/20';
      default:
        return 'bg-[#e1e7ef] text-[#1a3a6c] border-[#1a3a6c]/20';
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
              {getTypeIcon(claim.type)}
              <div>
                <h1 className="text-[#1e293b] font-semibold">{claim.id}</h1>
                <p className="text-[#64748b] text-sm">Szczegóły szkody</p>
              </div>
            </div>
          </div>
          <Badge className={`${getStatusColor(claim.status)} font-medium px-3 py-1`}>
            {claim.status}
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
                <span className="text-[#1e293b] font-semibold">{claim.progress}%</span>
              </div>
              <Progress value={claim.progress} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 bg-[#f8fafc] rounded-lg">
                <div className="text-sm text-[#64748b]">Data zgłoszenia</div>
                <div className="font-semibold text-[#1e293b]">{claim.date}</div>
              </div>
              <div className="text-center p-3 bg-[#f8fafc] rounded-lg">
                <div className="text-sm text-[#64748b]">Wartość szkody</div>
                <div className="font-semibold text-[#1e293b]">{claim.amount}</div>
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
            <p className="text-[#64748b] leading-relaxed">{claim.description}</p>
            <div className="mt-4 p-3 bg-[#f8fafc] rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-[#64748b]" />
                <span className="text-[#64748b]">Miejsce zdarzenia:</span>
              </div>
              <p className="text-[#1e293b] font-medium mt-1">{claim.location}</p>
            </div>
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
              {claim.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      event.completed 
                        ? 'bg-[#1a3a6c]' 
                        : event.current 
                          ? 'bg-[#d97706]' 
                          : 'bg-[#e2e8f0]'
                    }`} />
                    {index < claim.timeline.length - 1 && (
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

        {/* Decyzja ugody */}
        {claim.settlement && (
          <Card className="shadow-sm border-[#e2e8f0] bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#1e293b] flex items-center gap-2">
                <Handshake className="w-5 h-5 text-[#1a3a6c]" />
                Decyzja ugody
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#64748b]">
                <FileText className="w-4 h-4" />
                <span>Numer ugody:</span>
                <span className="font-medium text-[#1e293b]">{claim.settlement.number}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#64748b]">
                <Calendar className="w-4 h-4" />
                <span>Data decyzji:</span>
                <span className="font-medium text-[#1e293b]">{claim.settlement.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#64748b]">
                <DollarSign className="w-4 h-4" />
                <span>Kwota ugody:</span>
                <span className="font-medium text-[#1e293b]">{claim.settlement.amount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#64748b]">
                <span>Status:</span>
                <Badge className={`${getDecisionColor(claim.settlement.decision)} font-medium px-2 py-1`}>
                  {claim.settlement.decision}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

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
                  <div className="font-medium text-[#1e293b]">{claim.contact.person}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg">
                <Phone className="w-5 h-5 text-[#64748b]" />
                <div>
                  <div className="text-sm text-[#64748b]">Telefon</div>
                  <div className="font-medium text-[#1e293b]">{claim.contact.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-lg">
                <Mail className="w-5 h-5 text-[#64748b]" />
                <div>
                  <div className="text-sm text-[#64748b]">Email</div>
                  <div className="font-medium text-[#1e293b]">{claim.contact.email}</div>
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
