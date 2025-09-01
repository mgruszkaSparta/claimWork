import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { ReportClaim } from "./components/ReportClaim";
import { ActiveClaims, Claim } from "./components/ActiveClaims";
import { Profile } from "./components/Profile";
import { ClaimDetails } from "./components/ClaimDetails";
import { NotificationCenter } from "./components/NotificationCenter";
import { NotificationToast } from "./components/NotificationToast";
import { BottomNavigation } from "./components/BottomNavigation";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const handleNavigate = (section: string, claim?: Claim) => {
    setActiveSection(section);
    setSelectedClaim(claim ?? null);
  };

  const renderCurrentSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "report":
        return <ReportClaim onNavigate={handleNavigate} />;
      case "claims":
        return <ActiveClaims onNavigate={handleNavigate} />;
      case "claim-details":
        return <ClaimDetails onNavigate={handleNavigate} claim={selectedClaim} />;
      case "notifications":
        return <NotificationCenter onNavigate={handleNavigate} />;
      case "profile":
        return <Profile onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Główna zawartość */}
      <div className="pb-16">
        {renderCurrentSection()}
      </div>
      
      {/* Dolna nawigacja */}
      <BottomNavigation 
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />
      
      {/* Toast notifications */}
      <Toaster 
        position="top-center"
        expand={false}
        richColors
        closeButton
      />
      
      {/* Komponent do zarządzania automatycznymi powiadomieniami */}
      <NotificationToast />
    </div>
  );
}
