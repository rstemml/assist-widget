<svelte:options customElement="assist-chat-widget" />

<script lang="ts">
  import ChatWindow from './components/ChatWindow.svelte';

  export let customerId: string = 'default';
  export let serverUrl: string = 'ws://localhost:3000/chat';
</script>

<ChatWindow {customerId} {serverUrl} />
