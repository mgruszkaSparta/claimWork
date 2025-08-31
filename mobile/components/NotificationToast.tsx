import { useEffect, useRef } from 'react';
import { toast } from 'sonner@2.0.3';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationToast() {
  const { notifications } = useNotifications();
  const shown = useRef(new Set<string>());

  useEffect(() => {
    notifications.forEach(n => {
      if (!shown.current.has(n.id)) {
        toast(n.title, {
          description: n.message,
          duration: 5000,
        });
        shown.current.add(n.id);
      }
    });
  }, [notifications]);

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
