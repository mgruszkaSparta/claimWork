import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { ArrowLeft, Bell, BellRing, Car, Home, Truck, AlertTriangle, CheckCircle, Info, X, Eye } from "lucide-react";
import { useNotifications, Notification } from "../hooks/useNotifications";

interface NotificationCenterProps {
  onNavigate: (section: string, claimId?: string) => void;
}

export function NotificationCenter({ onNavigate }: NotificationCenterProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    getFormattedTime 
  } = useNotifications();

  const getNotificationIcon = (type: string, actionType?: string) => {
    const iconProps = "w-5 h-5";
    
    if (actionType === 'new_claim') return <Car className={`${iconProps} text-[#059669]`} />;
    if (actionType === 'status_update') return <CheckCircle className={`${iconProps} text-[#1a3a6c]`} />;
    if (actionType === 'reminder') return <AlertTriangle className={`${iconProps} text-[#d97706]`} />;
    if (actionType === 'system') return <Info className={`${iconProps} text-[#64748b]`} />;
    
    switch(type) {
      case 'success': return <CheckCircle className={`${iconProps} text-[#059669]`} />;
      case 'warning': return <AlertTriangle className={`${iconProps} text-[#d97706]`} />;
      case 'error': return <AlertTriangle className={`${iconProps} text-[#dc2626]`} />;
      default: return <Info className={`${iconProps} text-[#1a3a6c]`} />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch(type) {
      case 'success': return 'bg-[#d1fae5]';
      case 'warning': return 'bg-[#fef3c7]';
      case 'error': return 'bg-[#fee2e2]';
      default: return 'bg-[#e1e7ef]';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    if (notification.claimId) {
      onNavigate('claim-details', notification.claimId);
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
            onClick={() => onNavigate('dashboard')}
            className="text-[#64748b] hover:bg-[#f1f5f9] rounded-full w-10 h-10 p-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-6 h-6 text-[#1a3a6c]" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#dc2626] rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{unreadCount}</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-[#1e293b] font-semibold">Powiadomienia</h1>
                <p className="text-[#64748b] text-sm">
                  {unreadCount > 0 ? `${unreadCount} nieprzeczytanych` : 'Wszystkie przeczytane'}
                </p>
              </div>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={markAllAsRead}
              className="text-[#1a3a6c] hover:bg-[#e1e7ef] px-3"
            >
              Oznacz wszystkie
            </Button>
          )}
        </div>
      </div>

      <div className="p-4">
        {notifications.length === 0 ? (
          <Card className="shadow-sm border-[#e2e8f0] bg-white">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f1f5f9] flex items-center justify-center">
                <Bell className="w-8 h-8 text-[#64748b]" />
              </div>
              <h3 className="text-[#1e293b] font-medium mb-2">Brak powiadomień</h3>
              <p className="text-[#64748b]">Nie masz jeszcze żadnych powiadomień</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <Card 
                key={notification.id} 
                className={`shadow-sm border-[#e2e8f0] transition-all cursor-pointer hover:shadow-md ${
                  !notification.read ? 'bg-white border-l-4 border-l-[#1a3a6c]' : 'bg-white'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {/* Ikona powiadomienia */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getNotificationBgColor(notification.type)} flex items-center justify-center`}>
                      {getNotificationIcon(notification.type, notification.actionType)}
                    </div>

                    {/* Treść powiadomienia */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className={`font-medium ${!notification.read ? 'text-[#1e293b]' : 'text-[#64748b]'}`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mt-1 ${!notification.read ? 'text-[#64748b]' : 'text-[#94a3b8]'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-[#94a3b8]">
                              {getFormattedTime(notification.timestamp)}
                            </span>
                            {notification.claimId && (
                              <>
                                <span className="text-xs text-[#94a3b8]">•</span>
                                <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                                  {notification.claimId}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status i akcje */}
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-[#1a3a6c] rounded-full"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="text-[#64748b] hover:text-[#dc2626] hover:bg-[#fee2e2] w-8 h-8 p-0 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Akcja specjalna dla szkód */}
                  {notification.claimId && (
                    <div className="mt-3 pt-3 border-t border-[#f1f5f9]">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-[#1a3a6c] border-[#1a3a6c] hover:bg-[#e1e7ef] h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('claim-details', notification.claimId);
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Zobacz szczegóły
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
