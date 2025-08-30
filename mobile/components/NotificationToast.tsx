import { useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { Car, Home, Truck, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationToast() {
  const { addNotification } = useNotifications();

  // Symulacja nowych powiadomień - w rzeczywistej aplikacji byłyby to prawdziwe zdarzenia
  useEffect(() => {
    const showNewNotification = () => {
      const notifications = [
        {
          title: 'Status zaktualizowany',
          message: 'Szkoda SK-2024-005 przeszła do realizacji',
          type: 'info' as const,
          actionType: 'status_update' as const,
          claimId: 'SK-2024-005'
        },
        {
          title: 'Nowa szkoda',
          message: 'Otrzymano zgłoszenie szkody transportowej',
          type: 'success' as const,
          actionType: 'new_claim' as const
        },
        {
          title: 'Przypomnienie',
          message: 'Szkoda wymaga Twojej uwagi',
          type: 'warning' as const,
          actionType: 'reminder' as const,
          claimId: 'SK-2024-003'
        }
      ];

      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      
      // Dodaj do listy powiadomień
      addNotification(randomNotification);
      
      // Pokaż toast
      toast(randomNotification.title, {
        description: randomNotification.message,
        action: randomNotification.claimId ? {
          label: 'Zobacz',
          onClick: () => {
            // W rzeczywistej aplikacji przekierowałoby to do szczegółów szkody
            console.log('Navigate to claim:', randomNotification.claimId);
          }
        } : undefined,
        duration: 5000,
      });
    };

    // Pokaż pierwsze powiadomienie po 5 sekundach
    const firstTimeout = setTimeout(showNewNotification, 5000);
    
    // Następnie pokaż kolejne co 30 sekund
    const interval = setInterval(showNewNotification, 30000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, [addNotification]);

  return null; // Ten komponent nie renderuje nic wizualnie
}

// Funkcje pomocnicze do tworzenia powiadomień
export const showClaimStatusToast = (claimId: string, status: string) => {
  const statusMessages = {
    'w trakcie': 'Szkoda przeszła do realizacji',
    'zakończona': 'Szkoda została zakończona',
    'oczekuje': 'Szkoda oczekuje na weryfikację'
  };

  toast.success('Status zaktualizowany', {
    description: `${statusMessages[status as keyof typeof statusMessages] || 'Status zmieniony'} - ${claimId}`,
    action: {
      label: 'Zobacz szczegóły',
      onClick: () => console.log('Navigate to claim:', claimId)
    }
  });
};

export const showNewClaimToast = (claimId: string, type: string) => {
  const typeNames = {
    'komunikacyjna': 'komunikacyjnej',
    'mienie': 'mienia',
    'transport': 'transportowej'
  };

  toast.success('Nowe zgłoszenie', {
    description: `Utworzono szkodę ${typeNames[type as keyof typeof typeNames]} - ${claimId}`,
    action: {
      label: 'Zobacz',
      onClick: () => console.log('Navigate to claim:', claimId)
    }
  });
};

export const showReminderToast = (message: string, claimId?: string) => {
  toast.warning('Przypomnienie', {
    description: message,
    action: claimId ? {
      label: 'Sprawdź',
      onClick: () => console.log('Navigate to claim:', claimId)
    } : undefined
  });
};
