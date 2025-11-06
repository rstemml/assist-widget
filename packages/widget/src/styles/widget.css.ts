/**
 * CSS Styles for the widget - exported as string for Shadow DOM injection
 */

export const widgetStyles = `
:host {
  --primary-color: #0066cc;
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-radius: 12px;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --transition: all 0.3s ease;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.widget-container {
  position: fixed;
  z-index: 999999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
}

.widget-container.bottom-right {
  bottom: 20px;
  right: 20px;
}

.widget-container.bottom-left {
  bottom: 20px;
  left: 20px;
}

.widget-container.top-right {
  top: 20px;
  right: 20px;
}

.widget-container.top-left {
  top: 20px;
  left: 20px;
}

.widget-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--primary-color);
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  color: white;
  font-size: 24px;
}

.widget-button:hover {
  transform: scale(1.1);
}

.chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 380px;
  height: 600px;
  background: var(--bg-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  transform: scale(0.8) translateY(20px);
  transition: var(--transition);
  pointer-events: none;
}

.chat-window.open {
  opacity: 1;
  transform: scale(1) translateY(0);
  pointer-events: all;
}

.chat-header {
  background-color: var(--primary-color);
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.close-button:hover {
  opacity: 1;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f8f9fa;
}

.message {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 12px;
  word-wrap: break-word;
}

.message.user .message-content {
  background-color: var(--primary-color);
  color: white;
}

.message.assistant .message-content {
  background-color: white;
  color: var(--text-color);
  border: 1px solid #e0e0e0;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 10px 14px;
  background-color: white;
  border-radius: 12px;
  width: fit-content;
  border: 1px solid #e0e0e0;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background-color: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

.chat-input-container {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background-color: white;
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
  font-family: inherit;
}

.chat-input:focus {
  border-color: var(--primary-color);
}

.send-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .chat-window {
    width: 100vw;
    height: 100vh;
    bottom: 0;
    right: 0;
    border-radius: 0;
  }
}
`;
