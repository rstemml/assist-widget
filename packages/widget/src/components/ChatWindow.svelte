<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import type { Message, CustomerConfig } from '@assist-widget/shared';
  import { ApiClient } from '../api/client';
  import MessageComponent from './Message.svelte';
  import TypingIndicator from './TypingIndicator.svelte';

  export let customerId: string;
  export let serverUrl: string;

  let isOpen = false;
  let messages: Message[] = [];
  let isTyping = false;
  let config: CustomerConfig | null = null;
  let inputValue = '';
  let messagesContainer: HTMLDivElement;

  const client = new ApiClient(customerId, serverUrl);

  // Setup API client handlers
  client.onMessage = (message: Message) => {
    messages = [...messages, message];
  };

  client.onTyping = (typing: boolean) => {
    isTyping = typing;
  };

  client.onConfig = (newConfig: CustomerConfig) => {
    config = newConfig;

    // Add welcome message if configured
    if (config.behavior.welcomeMessage && messages.length === 0) {
      messages = [{
        id: 'welcome',
        role: 'assistant',
        content: config.behavior.welcomeMessage,
        timestamp: Date.now(),
      }];
    }
  };

  client.onError = (error: string) => {
    console.error('[AssistWidget] Error:', error);
  };

  onMount(() => {
    client.connect();

    // Auto-open if configured
    if (config?.behavior.autoOpen) {
      setTimeout(() => {
        isOpen = true;
      }, config.behavior.autoOpenDelay);
    }
  });

  onDestroy(() => {
    client.disconnect();
  });

  afterUpdate(() => {
    // Scroll to bottom when messages change
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });

  function toggleChat() {
    isOpen = !isOpen;
  }

  function handleSendMessage() {
    const content = inputValue.trim();
    if (!content) return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    messages = [...messages, userMessage];
    client.sendMessage(content);
    inputValue = '';
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  }

  function showNotification(message: string) {
    if (config?.behavior.enableNotifications && Notification.permission === 'granted') {
      new Notification('Neue Nachricht', {
        body: message.substring(0, 100),
        tag: 'assist-widget',
      });
    }
  }

  // Watch for new assistant messages when chat is closed
  $: if (!isOpen && messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant' && lastMessage.id !== 'welcome') {
      showNotification(lastMessage.content);
    }
  }

  // Request notification permission when opening chat
  $: if (isOpen && config?.behavior.enableNotifications && Notification.permission === 'default') {
    Notification.requestPermission();
  }
</script>

<div class="widget-container {config?.behavior.position || 'bottom-right'}">
  <button class="widget-button" on:click={toggleChat} aria-label="Open chat">
    💬
  </button>

  <div class="chat-window" class:open={isOpen}>
    <div class="chat-header">
      <h3>{config?.behavior.title || 'Chat Support'}</h3>
      <button class="close-button" on:click={toggleChat} aria-label="Close chat">&times;</button>
    </div>

    <div class="chat-messages" bind:this={messagesContainer}>
      {#each messages as message (message.id)}
        <MessageComponent {message} />
      {/each}

      {#if isTyping}
        <TypingIndicator />
      {/if}
    </div>

    <div class="chat-input-container">
      <input
        type="text"
        class="chat-input"
        bind:value={inputValue}
        on:keypress={handleKeyPress}
        placeholder={config?.behavior.placeholder || 'Nachricht eingeben...'}
        aria-label="Chat message input"
      />
      <button
        class="send-button"
        on:click={handleSendMessage}
        disabled={!inputValue.trim()}
        aria-label="Send message"
      >
        ➤
      </button>
    </div>
  </div>
</div>

<style>
  :global(:host) {
    --primary-color: #0066cc;
    --bg-color: #ffffff;
    --text-color: #333333;
    --border-radius: 12px;
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    --transition: all 0.3s ease;
  }

  * {
    box-sizing: border-box;
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
</style>
