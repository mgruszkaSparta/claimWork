import { Button } from "./ui/button";
import { Home, Plus, List, User, Bell } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";

interface BottomNavigationProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export function BottomNavigation({ activeSection, onNavigate }: BottomNavigationProps) {
  const { unreadCount } = useNotifications();

  const navItems = [
    {
      id: "dashboard",
      label: "Główna",
      icon: Home,
      color: "#1a3a6c"
    },
    {
      id: "report",
      label: "Zgłoś",
      icon: Plus,
      color: "#059669"
    },
    {
      id: "notifications",
      label: "Powiad.",
      icon: Bell,
      color: "#3b82f6"
    },
    {
      id: "claims",
      label: "Szkody",
      icon: List,
      color: "#dc2626"
    },
    {
      id: "profile",
      label: "Profil", 
      icon: User,
      color: "#d97706"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0] shadow-lg">
      <div className="flex items-center justify-around px-2 py-1 safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id || 
            (activeSection === 'claim-details' && item.id === 'claims');
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 h-auto py-3 px-4 min-w-0 flex-1 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'hover:bg-transparent' 
                  : 'text-[#64748b] hover:bg-[#f1f5f9]'
              }`}
              style={{
                color: isActive ? item.color : '#64748b',
                backgroundColor: isActive ? `${item.color}15` : 'transparent'
              }}
            >
              <div className={`relative ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>
                <Icon className={`w-6 h-6`} style={{ color: isActive ? item.color : '#64748b' }} />
                {item.id === 'notifications' && unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#dc2626] rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-white font-medium">{Math.min(unreadCount, 9)}</span>
                  </div>
                )}
                {isActive && (
                  <div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
              </div>
              <span 
                className={`text-xs font-medium transition-all duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-75'
                }`}
                style={{ color: isActive ? item.color : '#64748b' }}
              >
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
