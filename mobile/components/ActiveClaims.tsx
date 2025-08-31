import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, Car, Home, Truck, Search, Eye, Bell } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";

interface MobileEventDto {
  id: string;
  claimNumber?: string;
  damageType?: string;
  damageDate?: string;
  status?: string;
  totalClaim?: number;
  currency?: string;
  eventLocation?: string;
  eventDescription?: string;
  handler?: string;
  handlerPhone?: string;
  handlerEmail?: string;
}

interface Claim {
  id: string;
  type: string;
  date: string;
  status: string;
  amount: string;
  location: string;
  description: string;
  contact: {
    person: string;
    phone: string;
    email: string;
  };
  progress: number;
}

interface ActiveClaimsProps {
  onNavigate: (section: string, claimId?: string) => void;
}

export function ActiveClaims({ onNavigate }: ActiveClaimsProps) {
  const { unreadCount } = useNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api";
        const res = await fetch(`${apiUrl}/mobile/events`);
        if (!res.ok) throw new Error("Failed to fetch events");
        const data: MobileEventDto[] = await res.json();
        const mapped: Claim[] = data.map((e) => ({
          id: e.claimNumber || e.id,
          type: e.damageType || "",
          date: e.damageDate?.split("T")[0] || "",
          status: e.status || "",
          amount: e.totalClaim ? `${e.totalClaim} ${e.currency || ""}` : "",
          location: e.eventLocation || "",
          description: e.eventDescription || "",
          contact: {
            person: e.handler || "",
            phone: e.handlerPhone || "",
            email: e.handlerEmail || "",
          },
          progress: 0,
        }));
        setClaims(mapped);
      } catch (err) {
        console.error("Error fetching events", err);
      }
    };
    fetchClaims();
  }, []);

  const getTypeIcon = (type: string) => {
    const iconProps = "w-5 h-5";
    switch(type) {
      case 'komunikacyjna': return <Car className={`${iconProps} text-[#1a3a6c]`} />;
      case 'mienie': return <Home className={`${iconProps} text-[#059669]`} />;
      case 'transport': return <Truck className={`${iconProps} text-[#dc2626]`} />;
      default: return null;
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

  const getProgressColor = (progress: number) => {
    if (progress < 30) return '#dc2626';
    if (progress < 70) return '#d97706';
    return '#059669';
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || claim.type === filterType;
    const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#e2e8f0] px-4 py-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('dashboard')}
            className="text-[#64748b] hover:bg-[#f1f5f9] rounded-full w-10 h-10 p-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-[#1e293b]">Aktywne szkody</h1>
            <p className="text-[#64748b]">Lista wszystkich zgłoszonych szkód</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('notifications')}
            className="relative text-[#64748b] hover:bg-[#f1f5f9] rounded-full w-10 h-10 p-0"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#dc2626] rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">{Math.min(unreadCount, 9)}</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">

        {/* Filtry i wyszukiwanie */}
        <Card className="shadow-sm border-[#e2e8f0] bg-white">
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#64748b] w-5 h-5" />
              <Input
                placeholder="Wyszukaj po numerze lub opisie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-[#e2e8f0] bg-[#f8fafc] focus:bg-white focus:border-[#1a3a6c] transition-colors"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="flex-1 h-12 border-[#e2e8f0] bg-[#f8fafc] focus:bg-white focus:border-[#1a3a6c]">
                  <SelectValue placeholder="Typ szkody" />
                </SelectTrigger>
                <SelectContent className="border-[#e2e8f0]">
                  <SelectItem value="all">Wszystkie typy</SelectItem>
                  <SelectItem value="komunikacyjna">Komunikacyjna</SelectItem>
                  <SelectItem value="mienie">Mienie</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="flex-1 h-12 border-[#e2e8f0] bg-[#f8fafc] focus:bg-white focus:border-[#1a3a6c]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="border-[#e2e8f0]">
                  <SelectItem value="all">Wszystkie statusy</SelectItem>
                  <SelectItem value="oczekuje">Oczekuje</SelectItem>
                  <SelectItem value="w trakcie">W trakcie</SelectItem>
                  <SelectItem value="zakończona">Zakończona</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista szkód */}
        <div className="space-y-4">
          {filteredClaims.map((claim) => (
            <Card key={claim.id} className="shadow-sm border-[#e2e8f0] hover:shadow-md transition-all bg-white">
              <CardContent className="p-5">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(claim.type)}
                      <span className="font-medium text-[#1e293b]">{claim.id}</span>
                    </div>
                    <Badge className={`${getStatusColor(claim.status)} font-medium px-3 py-1`}>
                      {claim.status}
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748b]">Postęp realizacji</span>
                      <span className="text-[#1e293b] font-medium">{claim.progress}%</span>
                    </div>
                    <div className="w-full bg-[#f1f5f9] rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all`}
                        style={{ 
                          width: `${claim.progress}%`,
                          backgroundColor: getProgressColor(claim.progress)
                        }}
                      />
                    </div>
                  </div>

                  {/* Szczegóły */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748b]">Data:</span>
                      <span className="text-[#1e293b]">{claim.date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748b]">Wartość:</span>
                      <span className="font-medium text-[#1e293b]">{claim.amount}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-[#64748b]">Miejsce:</span>
                      <span className="text-right flex-1 ml-4 text-[#1e293b]">{claim.location}</span>
                    </div>
                  </div>

                  {/* Akcje */}
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full h-11 border-[#1a3a6c] text-[#1a3a6c] hover:bg-[#e1e7ef] transition-colors"
                      onClick={() => onNavigate('claim-details', claim.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Zobacz szczegóły
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClaims.length === 0 && (
          <Card className="shadow-sm border-[#e2e8f0] bg-white">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f1f5f9] flex items-center justify-center">
                <Search className="w-8 h-8 text-[#64748b]" />
              </div>
              <p className="text-[#64748b] text-base">Nie znaleziono szkód spełniających kryteria wyszukiwania</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
