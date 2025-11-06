import type { Message, CustomerConfig } from '@assist-widget/shared';
import { ApiClient } from '../api/client';
import { widgetStyles } from '../styles/widget.css';

export class AssistChatWidget extends HTMLElement {
  private shadow: ShadowRoot;
  private isOpen = false;
  private messages: Message[] = [];
  private isTyping = false;
  private config: CustomerConfig | null = null;
  private client: ApiClient;

  // DOM elements
  private container!: HTMLDivElement;
  private chatWindow!: HTMLDivElement;
  private messagesContainer!: HTMLDivElement;
  private inputElement!: HTMLInputElement;
  private sendButton!: HTMLButtonElement;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });

    const customerId = this.getAttribute('data-customer-id') || 'default';
    const serverUrl = this.getAttribute('data-server-url') || 'ws://localhost:3000/chat';

    this.client = new ApiClient(customerId, serverUrl);
    this.setupEventHandlers();
  }

  connectedCallback(): void {
    this.render();
    this.attachEventListeners();
    this.client.connect();

    // Auto-open if configured
    if (this.config?.behavior.autoOpen) {
      setTimeout(() => {
        this.toggleChat();
      }, this.config.behavior.autoOpenDelay);
    }
  }

  disconnectedCallback(): void {
    this.client.disconnect();
  }

  private setupEventHandlers(): void {
    this.client.onMessage = (message) => {
      this.addMessage(message);
    };

    this.client.onTyping = (isTyping) => {
      this.isTyping = isTyping;
      this.renderMessages();
    };

    this.client.onConnected = () => {
      console.log('[AssistWidget] Connected successfully');
    };

    this.client.onError = (error) => {
      console.error('[AssistWidget] Error:', error);
      // Could show error in UI
    };

    this.client.onConfig = (config) => {
      this.config = config;
      this.applyConfig(config);

      // Send welcome message if configured
      if (config.behavior.welcomeMessage && this.messages.length === 0) {
        this.addMessage({
          id: 'welcome',
          role: 'assistant',
          content: config.behavior.welcomeMessage,
          timestamp: Date.now(),
        });
      }
    };
  }

  private applyConfig(config: CustomerConfig): void {
    const root = this.shadow.host as HTMLElement;

    if (config.theme?.primaryColor) {
      root.style.setProperty('--primary-color', config.theme.primaryColor);
    }
    if (config.theme?.backgroundColor) {
      root.style.setProperty('--bg-color', config.theme.backgroundColor);
    }
    if (config.theme?.textColor) {
      root.style.setProperty('--text-color', config.theme.textColor);
    }
    if (config.theme?.borderRadius) {
      root.style.setProperty('--border-radius', config.theme.borderRadius);
    }

    // Update position
    this.container.className = `widget-container ${config.behavior.position}`;

    // Update placeholder
    if (config.behavior.placeholder && this.inputElement) {
      this.inputElement.placeholder = config.behavior.placeholder;
    }
  }

  private render(): void {
    this.shadow.innerHTML = `
      <style>${widgetStyles}</style>
      <div class="widget-container bottom-right">
        <button class="widget-button" id="widget-button" aria-label="Open chat">
          💬
        </button>
        <div class="chat-window" id="chat-window">
          <div class="chat-header">
            <h3>${this.config?.behavior.title || 'Chat Support'}</h3>
            <button class="close-button" id="close-button" aria-label="Close chat">&times;</button>
          </div>
          <div class="chat-messages" id="chat-messages"></div>
          <div class="chat-input-container">
            <input
              type="text"
              class="chat-input"
              id="chat-input"
              placeholder="${this.config?.behavior.placeholder || 'Nachricht eingeben...'}"
              aria-label="Chat message input"
            />
            <button class="send-button" id="send-button" aria-label="Send message">
              ➤
            </button>
          </div>
        </div>
      </div>
    `;

    // Cache DOM references
    this.container = this.shadow.querySelector('.widget-container') as HTMLDivElement;
    this.chatWindow = this.shadow.getElementById('chat-window') as HTMLDivElement;
    this.messagesContainer = this.shadow.getElementById('chat-messages') as HTMLDivElement;
    this.inputElement = this.shadow.getElementById('chat-input') as HTMLInputElement;
    this.sendButton = this.shadow.getElementById('send-button') as HTMLButtonElement;
  }

  private attachEventListeners(): void {
    const widgetButton = this.shadow.getElementById('widget-button');
    const closeButton = this.shadow.getElementById('close-button');

    widgetButton?.addEventListener('click', () => this.toggleChat());
    closeButton?.addEventListener('click', () => this.toggleChat());

    this.sendButton.addEventListener('click', () => this.handleSendMessage());
    this.inputElement.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSendMessage();
      }
    });
  }

  private toggleChat(): void {
    this.isOpen = !this.isOpen;
    this.chatWindow.classList.toggle('open', this.isOpen);

    if (this.isOpen) {
      this.inputElement.focus();

      // Show notification if permission granted
      if (this.config?.behavior.enableNotifications && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }

  private handleSendMessage(): void {
    const content = this.inputElement.value.trim();

    if (!content) return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    this.addMessage(userMessage);
    this.client.sendMessage(content);

    this.inputElement.value = '';
    this.sendButton.disabled = true;
  }

  private addMessage(message: Message): void {
    this.messages.push(message);
    this.renderMessages();

    // Show notification for assistant messages if widget is closed
    if (!this.isOpen && message.role === 'assistant' && this.config?.behavior.enableNotifications) {
      this.showNotification(message.content);
    }

    // Re-enable send button
    if (message.role === 'assistant') {
      this.sendButton.disabled = false;
    }
  }

  private renderMessages(): void {
    this.messagesContainer.innerHTML = '';

    this.messages.forEach((msg) => {
      const messageEl = document.createElement('div');
      messageEl.className = `message ${msg.role}`;

      const contentEl = document.createElement('div');
      contentEl.className = 'message-content';
      contentEl.textContent = msg.content;

      messageEl.appendChild(contentEl);
      this.messagesContainer.appendChild(messageEl);
    });

    // Show typing indicator
    if (this.isTyping) {
      const typingEl = document.createElement('div');
      typingEl.className = 'message assistant';
      typingEl.innerHTML = `
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      `;
      this.messagesContainer.appendChild(typingEl);
    }

    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  private showNotification(message: string): void {
    if (Notification.permission === 'granted') {
      new Notification('Neue Nachricht', {
        body: message.substring(0, 100),
        icon: '/favicon.ico',
        tag: 'assist-widget',
      });
    }
  }
}

// Register the custom element
if (!customElements.get('assist-chat-widget')) {
  customElements.define('assist-chat-widget', AssistChatWidget);
}
