import type { CustomerConfig } from '@assist-widget/shared';

/**
 * Customer configurations
 * In production, this would be loaded from a database
 */

export const customerConfigs: Record<string, CustomerConfig> = {
  'default': {
    customerId: 'default',
    behavior: {
      autoOpen: false,
      autoOpenDelay: 3000,
      welcomeMessage: 'Hallo! Wie kann ich Ihnen heute helfen?',
      position: 'bottom-right',
      enableNotifications: true,
      maxMessagesPerMinute: 10,
      placeholder: 'Nachricht eingeben...',
      title: 'Chat Support',
    },
    theme: {
      primaryColor: '#0066cc',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      borderRadius: '12px',
    },
  },
  'kunde-123': {
    customerId: 'kunde-123',
    behavior: {
      autoOpen: true,
      autoOpenDelay: 5000,
      welcomeMessage: 'Willkommen! Ich bin Ihr persönlicher Assistent.',
      position: 'bottom-right',
      enableNotifications: true,
      maxMessagesPerMinute: 15,
      placeholder: 'Frage stellen...',
      title: 'KI Assistent',
    },
    theme: {
      primaryColor: '#6B46C1',
      backgroundColor: '#ffffff',
      textColor: '#1a202c',
      borderRadius: '16px',
    },
  },
  'demo-kunde': {
    customerId: 'demo-kunde',
    behavior: {
      autoOpen: false,
      autoOpenDelay: 0,
      welcomeMessage: 'Demo Chat - Stellen Sie mir eine Frage!',
      position: 'bottom-left',
      enableNotifications: false,
      maxMessagesPerMinute: 20,
      placeholder: 'Demo-Nachricht...',
      title: 'Demo Chat',
    },
    theme: {
      primaryColor: '#48BB78',
      backgroundColor: '#F7FAFC',
      textColor: '#2D3748',
      borderRadius: '8px',
    },
  },
};

export function getCustomerConfig(customerId: string): CustomerConfig | null {
  return customerConfigs[customerId] || customerConfigs['default'] || null;
}
