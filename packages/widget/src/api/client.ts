import type { WebSocketMessage, Message, CustomerConfig } from '@assist-widget/shared';

export class ApiClient {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private customerId: string;
  private serverUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private messageQueue: WebSocketMessage[] = [];

  // Event handlers
  public onMessage?: (message: Message) => void;
  public onTyping?: (isTyping: boolean) => void;
  public onConnected?: () => void;
  public onError?: (error: string) => void;
  public onConfig?: (config: CustomerConfig) => void;

  constructor(customerId: string, serverUrl: string) {
    this.customerId = customerId;
    this.serverUrl = serverUrl;
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    const key = `assist-widget-session-${this.customerId}`;
    let sessionId = sessionStorage.getItem(key);

    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      sessionStorage.setItem(key, sessionId);
    }

    return sessionId;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `${this.serverUrl}?customerId=${this.customerId}&sessionId=${this.sessionId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[AssistWidget] Connected to server');
        this.reconnectAttempts = 0;
        this.onConnected?.();
        this.flushMessageQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('[AssistWidget] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[AssistWidget] WebSocket error:', error);
        this.onError?.('Connection error');
      };

      this.ws.onclose = () => {
        console.log('[AssistWidget] Disconnected from server');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('[AssistWidget] Failed to connect:', error);
      this.onError?.('Failed to connect to server');
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.onError?.('Failed to reconnect after multiple attempts');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

    console.log(`[AssistWidget] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private handleMessage(data: WebSocketMessage): void {
    switch (data.type) {
      case 'message':
        if (data.payload) {
          this.onMessage?.(data.payload);
        }
        break;

      case 'typing':
        this.onTyping?.(data.payload?.isTyping || false);
        break;

      case 'connected':
        console.log('[AssistWidget] Session confirmed');
        break;

      case 'config':
        if (data.payload) {
          this.onConfig?.(data.payload);
        }
        break;

      case 'error':
        this.onError?.(data.payload?.message || 'Unknown error');
        break;
    }
  }

  sendMessage(content: string): void {
    const message: WebSocketMessage = {
      type: 'message',
      payload: { content },
      sessionId: this.sessionId || undefined,
      customerId: this.customerId,
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message if not connected
      this.messageQueue.push(message);
      this.connect();
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
