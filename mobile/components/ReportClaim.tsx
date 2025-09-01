import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Car, Home, Truck, ArrowLeft, Bell } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";
import { useNotifications } from "../hooks/useNotifications";

import { authFetch } from "../../lib/auth-fetch";


interface ReportClaimProps {
  onNavigate: (section: string, claimId?: string) => void;
}

export function ReportClaim({ onNavigate }: ReportClaimProps) {
  const { unreadCount, addNotification } = useNotifications();
  const [selectedType, setSelectedType] = useState<string>("");
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    damageNumber: "",
    time: "",
    location: "",
    description: "",
    estimatedValue: "",
    contactPerson: "",
    phone: "",
    driverFirstName: "",
    driverLastName: "",
    driverLicense: ""
  });
  const [damageData, setDamageData] = useState<{ [key: string]: DamageLevel }>({});

  const claimTypes = [
    {
      id: "komunikacyjna",
      name: "Szkoda komunikacyjna",
      icon: <Car className="w-6 h-6" />,
      description: "Wypadki drogowe, kolizje, szkody w pojazdach"
    },
    {
      id: "mienie", 
      name: "Szkoda majątkowa",
      icon: <Home className="w-6 h-6" />,
      description: "Szkody w nieruchomościach, zalania, kradzieże"
    },
    {
      id: "transport",
      name: "Szkoda transportowa", 
      icon: <Truck className="w-6 h-6" />,
      description: "Szkody w transporcie, uszkodzenia ładunku"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authFetch('/mobile/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          date: date?.toISOString(),
          ...formData,
          damageData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit claim');
      }

      const { id: claimId } = await response.json();

      addNotification({
        title: 'Szkoda zgłoszona',
        message: `Pomyślnie utworzono zgłoszenie ${claimId}`,
        type: 'success',
        actionType: 'new_claim',
        claimId
      });

      toast.success('Szkoda zgłoszona pomyślnie!', {
        description: `Numer zgłoszenia: ${claimId}`,
        action: {
          label: 'Zobacz szczegóły',
          onClick: () => onNavigate('claim-details', claimId)
        },
        duration: 5000
      });

      onNavigate('dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Nie udało się wysłać zgłoszenia');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePartClick = (partName: string, newLevel: DamageLevel) => {
    setDamageData(prev => {
      const updated = { ...prev, [partName]: newLevel };
      if (newLevel === DamageLevel.NONE) {
        delete updated[partName];
      }
      return updated;
    });
  };

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
            <h1 className="text-[#1e293b]">Zgłoś szkodę</h1>
            <p className="text-[#64748b]">Wypełnij formularz zgłoszenia</p>
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

      <div className="p-4">

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Typ szkody */}
        <div className="space-y-4">
          <Label className="text-[#202124]">Typ szkody</Label>
          <RadioGroup
            value={selectedType}
            onValueChange={(value) => {
              setSelectedType(value);
              setDamageData({});
            }}
          >
            {claimTypes.map((type, index) => {
              const colors = ['#1a3a6c', '#059669', '#dc2626'];
              const bgColors = ['#e1e7ef', '#d1fae5', '#fee2e2'];
              const color = colors[index];
              const bgColor = bgColors[index];
              
              return (
                <Card 
                  key={type.id} 
                  className={`cursor-pointer transition-all duration-200 border-[#e2e8f0] hover:shadow-md ${
                    selectedType === type.id 
                      ? 'shadow-md border-2' 
                      : 'shadow-sm hover:shadow-md'
                  }`}
                  style={{
                    borderColor: selectedType === type.id ? color : '#e2e8f0',
                    backgroundColor: selectedType === type.id ? `${color}08` : '#ffffff'
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem 
                        value={type.id} 
                        id={type.id}
                        className="border-[#64748b] data-[state=checked]:border-[#1a3a6c] data-[state=checked]:bg-[#1a3a6c]"
                      />
                      <div className="flex items-center gap-4 flex-1">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: bgColor }}
                        >
                          <div style={{ color: color }}>
                            {type.icon}
                          </div>
                        </div>
                        <div className="flex-1">
                          <Label 
                            htmlFor={type.id} 
                            className="cursor-pointer text-[#1e293b] font-medium"
                          >
                            {type.name}
                          </Label>
                          <p className="text-sm text-[#64748b] mt-1">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </RadioGroup>
        </div>

        {/* Numer szkody */}
        <div className="space-y-2">
          <Label>Numer szkody</Label>
          <Input
            placeholder="Wprowadź numer szkody"
            value={formData.damageNumber}
            onChange={(e) => handleInputChange('damageNumber', e.target.value)}
          />
        </div>

        {/* Data szkody */}
        <div className="space-y-2">
          <Label>Data wystąpienia szkody</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd MMMM yyyy", { locale: pl }) : "Wybierz datę"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Godzina szkody */}
        <div className="space-y-2">
          <Label>Godzina wystąpienia szkody</Label>
          <Input
            type="time"
            value={formData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
          />
        </div>

        {/* Miejsce */}
        <div className="space-y-2">
          <Label>Miejsce wystąpienia</Label>
          <Input
            placeholder="np. ul. Marszałkowska 1, Warszawa"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </div>

        {/* Opis */}
        <div className="space-y-2">
          <Label>Opis szkody</Label>
          <Textarea
            placeholder="Opisz dokładnie co się wydarzyło..."
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </div>

        {/* Diagram uszkodzeń */}
        {selectedType === "komunikacyjna" && (
          <DamageDiagram
            damageData={damageData}
            onPartClick={handlePartClick}
            vehicleType={VehicleType.PASSENGER_CAR}
          />
        )}

        {/* Szacowana wartość */}
        <div className="space-y-2">
          <Label>Szacowana wartość szkody (PLN)</Label>
          <Input
            type="number"
            placeholder="0"
            value={formData.estimatedValue}
            onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
          />
        </div>

        {/* Dane kontaktowe */}
        <div className="space-y-4">
          <h3>Dane kontaktowe</h3>
          <div className="space-y-2">
            <Label>Osoba kontaktowa</Label>
            <Input
              placeholder="Imię i nazwisko"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input
              type="tel"
              placeholder="+48 123 456 789"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
        </div>

        {/* Dane kierowcy */}
        <div className="space-y-4">
          <h3>Dane kierowcy</h3>
          <div className="space-y-2">
            <Label>Imię</Label>
            <Input
              placeholder="Imię kierowcy"
              value={formData.driverFirstName}
              onChange={(e) => handleInputChange('driverFirstName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Nazwisko</Label>
            <Input
              placeholder="Nazwisko kierowcy"
              value={formData.driverLastName}
              onChange={(e) => handleInputChange('driverLastName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Numer prawa jazdy</Label>
            <Input
              placeholder="AB1234567"
              value={formData.driverLicense}
              onChange={(e) => handleInputChange('driverLicense', e.target.value)}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-14 bg-[#4285f4] hover:bg-[#3367d6] text-white shadow-lg hover:shadow-xl transition-all rounded-lg text-base font-medium"
          disabled={!selectedType || !date || !formData.damageNumber || !formData.description || !formData.driverFirstName || !formData.driverLastName}
        >
          Zgłoś szkodę
        </Button>
      </form>
      </div>
    </div>
  );
}
