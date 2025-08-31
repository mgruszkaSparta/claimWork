import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { User, Phone, Mail, MapPin, Calendar, Settings, LogOut, Shield, List, CheckCircle } from "lucide-react";

interface ProfileProps {
  onNavigate: (section: string) => void;
}

export function Profile({ onNavigate }: ProfileProps) {
  const mockUser = {
    name: "Jan Kowalski",
    email: "jan.kowalski@email.com",
    phone: "+48 123 456 789",
    address: "ul. Przykładowa 15, 00-001 Warszawa",
    memberSince: "2022-03-15",
    claimsCount: 18,
    status: "Premium"
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#dadce0] px-4 py-6">
        <div className="text-center">
          <h1 className="text-[#202124] mb-2">Profil</h1>
          <p className="text-[#5f6368]">Zarządzaj swoim kontem</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Informacje o użytkowniku */}
        <Card className="shadow-sm border-[#dadce0] bg-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="w-20 h-20 border-4 border-[#e8f0fe]">
                <AvatarImage src="/api/placeholder/80/80" />
                <AvatarFallback className="text-xl bg-[#4285f4] text-white font-medium">
                  {mockUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="mb-2 text-[#202124]">{mockUser.name}</h3>
                <Badge className="mb-3 bg-[#e6f4ea] text-[#137333] border-[#34a853]/20">
                  <Shield className="w-3 h-3 mr-1" />
                  {mockUser.status}
                </Badge>
                <p className="text-sm text-[#5f6368]">
                  Członek od {new Date(mockUser.memberSince).toLocaleDateString('pl-PL')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statystyki */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-sm border-[#dadce0] bg-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#e8f0fe] flex items-center justify-center">
                <List className="w-6 h-6 text-[#4285f4]" />
              </div>
              <div className="text-3xl font-normal text-[#202124] mb-1">{mockUser.claimsCount}</div>
              <p className="text-sm text-[#5f6368]">Zgłoszone szkody</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-[#dadce0] bg-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#e6f4ea] flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#34a853]" />
              </div>
              <div className="text-3xl font-normal text-[#202124] mb-1">16</div>
              <p className="text-sm text-[#5f6368]">Rozliczone</p>
            </CardContent>
          </Card>
        </div>

        {/* Dane kontaktowe */}
        <Card className="shadow-sm border-[#dadce0] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[#202124]">
              <User className="w-5 h-5 text-[#4285f4]" />
              Dane kontaktowe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-[#f8f9fa]">
              <Mail className="w-5 h-5 text-[#5f6368]" />
              <span className="text-sm text-[#202124]">{mockUser.email}</span>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-[#f8f9fa]">
              <Phone className="w-5 h-5 text-[#5f6368]" />
              <span className="text-sm text-[#202124]">{mockUser.phone}</span>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-[#f8f9fa]">
              <MapPin className="w-5 h-5 text-[#5f6368]" />
              <span className="text-sm text-[#202124]">{mockUser.address}</span>
            </div>
          </CardContent>
        </Card>

        {/* Menu opcji */}
        <Card className="shadow-sm border-[#dadce0] bg-white">
          <CardContent className="p-0">
            <div className="space-y-0">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-14 rounded-none text-[#202124] hover:bg-[#f8f9fa]"
              >
                <Settings className="w-5 h-5 mr-4 text-[#5f6368]" />
                Ustawienia konta
              </Button>
              <Separator className="bg-[#dadce0]" />
              <Button 
                variant="ghost" 
                className="w-full justify-start h-14 rounded-none text-[#202124] hover:bg-[#f8f9fa]"
              >
                <Shield className="w-5 h-5 mr-4 text-[#5f6368]" />
                Polityka prywatności
              </Button>
              <Separator className="bg-[#dadce0]" />
              <Button 
                variant="ghost" 
                className="w-full justify-start h-14 rounded-none text-[#202124] hover:bg-[#f8f9fa]"
              >
                <Phone className="w-5 h-5 mr-4 text-[#5f6368]" />
                Pomoc i kontakt
              </Button>
              <Separator className="bg-[#dadce0]" />
              <Button 
                variant="ghost" 
                className="w-full justify-start h-14 rounded-none text-[#ea4335] hover:bg-[#fce8e6] hover:text-[#ea4335]"
              >
                <LogOut className="w-5 h-5 mr-4" />
                Wyloguj się
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informacje o aplikacji */}
        <div className="text-center text-sm text-[#5f6368] pt-4">
          <p>Aplikacja Szkody v1.0.0</p>
          <p>© 2024 Wszystkie prawa zastrzeżone</p>
        </div>
      </div>
    </div>
  );
}
