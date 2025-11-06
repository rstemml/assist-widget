# 🚀 Quick Start Guide

Schnellanleitung zum Testen des Assist Chat Widgets

## ⚡ Schnellstart (3 Schritte)

### 1. Azure Credentials konfigurieren

```bash
# .env Datei erstellen
cp packages/backend/.env.example packages/backend/.env

# Öffne packages/backend/.env und füge deine Azure Credentials ein:
# AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
# AZURE_OPENAI_API_KEY=your-api-key-here
# AZURE_OPENAI_DEPLOYMENT=gpt-4
```

### 2. Backend starten

In einem Terminal:

```bash
npm run dev:backend
```

Du solltest sehen:
```
╔═══════════════════════════════════════════════╗
║   🚀 Assist Widget Backend Server Running    ║
╠═══════════════════════════════════════════════╣
║   Port: 3000                                  ║
║   Host: 0.0.0.0                               ║
╚═══════════════════════════════════════════════╝

WebSocket endpoint: ws://0.0.0.0:3000/chat
```

### 3. Demo-Seite öffnen

In einem **zweiten** Terminal:

```bash
npm run demo
```

Dann öffne im Browser: **http://localhost:8080/examples/index.html**

---

## 📖 Was passiert?

1. **Backend (Port 3000)** - Fastify Server mit WebSocket + Azure OpenAI
2. **Frontend (Port 8080)** - HTTP-Server der die HTML-Beispiele ausliefert
3. **Widget** - Lädt automatisch und verbindet sich mit dem Backend

---

## 🎨 Demo-Seiten

Drei verschiedene Konfigurationen zum Testen:

- **http://localhost:8080/examples/index.html**
  - Default Konfiguration (Blue Theme)
  - Position: Bottom-Right
  - Kein Auto-Open

- **http://localhost:8080/examples/kunde-123.html**
  - Purple Theme
  - Auto-Open nach 5 Sekunden
  - Position: Bottom-Right

- **http://localhost:8080/examples/demo-kunde.html**
  - Green Theme
  - Position: Bottom-Left
  - Kein Auto-Open

---

## ❓ Troubleshooting

### 404 Error beim Widget-Laden

**Problem:** Widget kann nicht geladen werden

**Lösung:**
- Stelle sicher, dass du die HTML-Datei über einen Web-Server öffnest (`http://localhost:8080`)
- **NICHT** direkt die HTML-Datei öffnen (`file:///...`)

```bash
# Web-Server starten:
npm run demo
```

### Backend startet nicht

**Problem:** Port 3000 bereits belegt

**Lösung:** Ändere den Port in `packages/backend/.env`:
```env
PORT=3001
```

Und passe die `data-server-url` in den HTML-Beispielen an:
```html
data-server-url="ws://localhost:3001/chat"
```

### Widget verbindet nicht zum Backend

**Problem:** WebSocket Verbindung fehlgeschlagen

**Lösung:**
1. Prüfe, ob das Backend läuft (Terminal-Output)
2. Öffne Browser DevTools → Console
3. Solltest du sehen: `[AssistWidget] Connected to server`

### Keine AI-Antworten

**Problem:** Chat sendet Nachrichten, aber keine Antwort

**Lösung:**
1. Prüfe Azure Credentials in `packages/backend/.env`
2. Schaue in Backend-Logs nach Fehlern
3. Teste Azure Endpoint & API Key

---

## 🔄 Development Workflow

### Widget entwickeln

```bash
# Watch mode - Auto-rebuild
npm run dev:widget
```

### Backend entwickeln

```bash
# Watch mode - Auto-restart
npm run dev:backend
```

### Production Build

```bash
# Alles bauen
npm run build

# Outputs:
# - packages/widget/dist/widget.js (11.7KB)
# - packages/backend/dist/
```

---

## 📦 Widget in eigene Webseite einbinden

```html
<!DOCTYPE html>
<html>
<head>
    <title>Meine Webseite</title>
</head>
<body>
    <h1>Willkommen!</h1>

    <!-- Widget Integration (1-Zeiler) -->
    <script
        src="http://localhost:8080/packages/widget/dist/widget.js"
        data-customer-id="default"
        data-server-url="ws://localhost:3000/chat"
    ></script>
</body>
</html>
```

**Für Production:**
- Hoste `widget.js` auf einem CDN oder deinem Server
- Ändere die URLs entsprechend
- Nutze `wss://` (nicht `ws://`) für verschlüsselte WebSocket-Verbindungen

---

## 🎯 Nächste Schritte

1. ✅ Teste die Demo-Seiten
2. ✅ Passe Kunden-Konfigurationen an (`packages/backend/src/config/customers.ts`)
3. ✅ Erstelle eigene Themes
4. ✅ Integriere auf deiner Webseite

Viel Erfolg! 🚀
