# 🚀 Assist Chat Widget

Ein leichtgewichtiges, konfigurierbares KI-Chat-Widget mit Azure AI Foundry Backend Integration.

> **🎯 Neu hier?** → Lies die [**QUICKSTART.md**](QUICKSTART.md) für eine 3-Schritte-Anleitung!

## ✨ Features

- **Web Components** - Perfekte Style-Isolation mit Shadow DOM
- **Leichtgewichtig** - ~15-20KB gzipped Bundle-Größe
- **Multi-Tenant** - Konfigurierbar für verschiedene Kunden
- **Real-time** - WebSocket-basierte Kommunikation
- **Rate Limiting** - Schutz gegen Flooding
- **Typing Indicators** - Echtzeit Tipp-Anzeigen
- **Desktop Notifications** - Optional aktivierbar
- **Azure AI Integration** - Azure OpenAI / AI Foundry
- **Responsive** - Mobile-optimiert

## 📁 Projektstruktur

```
assist-widget/
├── packages/
│   ├── widget/              # Frontend Widget (Vanilla TS + Web Components)
│   ├── backend/             # Backend API (Fastify + WebSocket)
│   └── shared/              # Shared TypeScript Types
└── examples/                # Demo HTML Seiten
```

## 🚀 Quick Start

```bash
# 1. Dependencies installieren
npm install

# 2. Azure Credentials konfigurieren
cp packages/backend/.env.example packages/backend/.env
# → Öffne packages/backend/.env und füge Azure Credentials ein

# 3. Backend starten (Terminal 1)
npm run dev:backend

# 4. Demo starten (Terminal 2)
npm run demo
# → Öffne http://localhost:8080/examples/index.html
```

📖 **Detaillierte Anleitung & Troubleshooting:** Siehe [QUICKSTART.md](QUICKSTART.md)

## 🔧 Widget Integration

### Einfache Integration (1-Zeiler)

```html
<script
  src="https://your-domain.com/widget.js"
  data-customer-id="your-customer-id"
  data-server-url="wss://your-server.com/chat"
></script>
```

### Attribute

- `data-customer-id` - Pflicht: Deine Kunden-ID
- `data-server-url` - Optional: WebSocket Server URL (default: ws://localhost:3000/chat)

## ⚙️ Konfiguration

### Kunden-Konfiguration

Konfigurationen werden in `packages/backend/src/config/customers.ts` verwaltet:

```typescript
{
  customerId: 'kunde-123',
  behavior: {
    autoOpen: true,              // Widget automatisch öffnen
    autoOpenDelay: 5000,         // Verzögerung in ms
    welcomeMessage: 'Hallo!',    // Begrüßungsnachricht
    position: 'bottom-right',    // Position des Widgets
    enableNotifications: true,   // Desktop-Benachrichtigungen
    maxMessagesPerMinute: 15,    // Rate Limit
    placeholder: 'Nachricht...',
    title: 'Chat Support'
  },
  theme: {
    primaryColor: '#6B46C1',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    borderRadius: '12px'
  }
}
```

### Verfügbare Positionen

- `bottom-right` (default)
- `bottom-left`
- `top-right`
- `top-left`

## 🎨 Theming

Das Widget nutzt CSS Custom Properties für einfaches Theming:

```css
--primary-color: #0066cc;
--bg-color: #ffffff;
--text-color: #333333;
--border-radius: 12px;
```

## 🔐 Sicherheit

- **Rate Limiting** - Pro Session & Kunde konfigurierbar
- **Session Management** - In-Memory mit automatischem Cleanup
- **WebSocket Authentifizierung** - Customer ID & Session ID
- **CORS Configuration** - Konfigurierbar über .env

## 📦 Produktion

### Widget bauen

```bash
npm run build:widget
```

Output: `packages/widget/dist/widget.js`

### Backend bauen

```bash
npm run build:backend
```

Output: `packages/backend/dist/`

### Backend starten

```bash
cd packages/backend
npm start
```

## 🛠️ Entwicklung

### Widget Development

```bash
npm run dev:widget
```

esbuild watch mode - Automatisches Rebuild bei Änderungen.

### Backend Development

```bash
npm run dev:backend
```

tsx watch mode - Automatischer Neustart bei Änderungen.

## 📱 Responsive Design

Das Widget ist vollständig responsive:

- Desktop: 380x600px Floating Window
- Mobile: Fullscreen Mode bei < 480px

## 🔄 WebSocket API

### Client → Server

```typescript
{
  type: 'message',
  payload: { content: 'Hallo' },
  sessionId: 'session-id',
  customerId: 'kunde-123'
}
```

### Server → Client

```typescript
// Nachricht
{ type: 'message', payload: { id, role, content, timestamp } }

// Typing Indicator
{ type: 'typing', payload: { isTyping: true } }

// Config
{ type: 'config', payload: { ...customerConfig } }

// Error
{ type: 'error', payload: { message: 'Error' } }
```

## 📝 Beispiele

Siehe `examples/` Ordner für verschiedene Konfigurationen:

- `index.html` - Default Konfiguration
- `kunde-123.html` - Purple Theme mit Auto-Open
- `demo-kunde.html` - Green Theme, linke Position

## 🚧 Produktions-Verbesserungen

Für den Produktionseinsatz sollten folgende Punkte noch umgesetzt werden:

1. **Redis** - Für distributed Rate Limiting & Session Management
2. **Datenbank** - Für Customer Configs & Chat Historie
3. **Logging** - Structured Logging (z.B. Winston, Pino)
4. **Monitoring** - Health Checks, Metrics
5. **CDN** - Widget über CDN ausliefern
6. **SSL/TLS** - WSS für verschlüsselte WebSocket-Verbindungen
7. **Authentication** - API Keys für Backend-Zugriff
8. **Analytics** - Tracking von Widget-Usage

## 📄 Lizenz

MIT

## 👤 Author

Entwickelt mit ❤️ für perfekte Widget-Integration
