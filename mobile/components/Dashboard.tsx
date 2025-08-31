import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AlertCircle, Car, Home, Truck, Plus, Eye, TrendingUp, Bell } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";

interface DashboardProps {
  onNavigate: (section: string, claimId?: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { unreadCount } = useNotifications();
  
  const mockStats = {
    activeClaimsCount: 3,
    pendingCount: 2,
    completedCount: 15,
    totalValue: "45,250 PLN"
  };

  const recentClaims = [
    {
      id: "SK-2024-001",
      type: "komunikacyjna",
      date: "2024-08-25",
      status: "w trakcie",
      amount: "8,500 PLN"
    },
    {
      id: "SK-2024-002", 
      type: "mienie",
      date: "2024-08-20",
      status: "oczekuje",
      amount: "2,300 PLN"
    },
    {
      id: "SK-2024-003",
      type: "transport",
      date: "2024-08-18",
      status: "w trakcie", 
      amount: "15,200 PLN"
    }
  ];

  const getTypeIcon = (type: string) => {
    const iconProps = "w-5 h-5";
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

  const getStatColor = (index: number) => {
    const colors = ['#1a3a6c', '#059669', '#d97706', '#dc2626'];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#e2e8f0] px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-[#1e293b] mb-2">Panel szkód</h1>
            <p className="text-[#64748b]">Zarządzaj swoimi zgłoszeniami szkód</p>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('notifications')}
              className="relative text-[#64748b] hover:bg-[#f1f5f9] rounded-full w-12 h-12 p-0"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#dc2626] rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">{Math.min(unreadCount, 9)}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Statystyki - Corporate Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-sm border-[#e2e8f0] hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#e1e7ef] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#1a3a6c]" />
              </div>
              <div className="text-3xl font-semibold text-[#1e293b] mb-1">{mockStats.activeClaimsCount}</div>
              <p className="text-sm text-[#64748b]">Aktywne szkody</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-[#e2e8f0] hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#fef3c7] flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-[#d97706]" />
              </div>
              <div className="text-3xl font-semibold text-[#1e293b] mb-1">{mockStats.pendingCount}</div>
              <p className="text-sm text-[#64748b]">Oczekujące</p>
            </CardContent>
          </Card>
        </div>

        {/* Primary Action Button */}
        <div className="relative">
          <Button 
            onClick={() => onNavigate('report')}
            className="w-full h-14 bg-[#1a3a6c] hover:bg-[#153458] text-white shadow-lg hover:shadow-xl transition-all rounded-lg font-semibold"
          >
            <Plus className="w-6 h-6 mr-3" />
            Zgłoś nową szkodę
          </Button>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-sm border-[#e2e8f0] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#1e293b]">Szybkie akcje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="ghost"
              onClick={() => onNavigate('claims')}
              className="w-full justify-start h-12 text-[#1a3a6c] hover:bg-[#e1e7ef]"
            >
              <Eye className="w-5 h-5 mr-3" />
              Zobacz aktywne szkody ({mockStats.activeClaimsCount})
            </Button>
          </CardContent>
        </Card>

        {/* Ostatnie szkody - Corporate Design Cards */}
        <Card className="shadow-sm border-[#e2e8f0] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#1e293b]">Ostatnie szkody</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentClaims.map((claim, index) => (
              <div 
                key={claim.id} 
                className="p-4 rounded-lg border border-[#e2e8f0] hover:shadow-md transition-all cursor-pointer bg-white hover:bg-[#f8fafc]"
                onClick={() => onNavigate('claim-details', claim.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(claim.type)}
                    <span className="font-medium text-[#1e293b]">{claim.id}</span>
                  </div>
                  <Badge className={`${getStatusColor(claim.status)} font-medium px-3 py-1`}>
                    {claim.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748b]">{claim.date}</span>
                  <span className="font-medium text-[#1e293b]">{claim.amount}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
