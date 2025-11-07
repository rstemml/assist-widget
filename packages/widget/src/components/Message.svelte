<script lang="ts">
  import type { Message } from '@assist-widget/shared';

  export let message: Message;
</script>

<div class="message {message.role}">
  <div class="message-content">
    {message.content}
  </div>
</div>

<style>
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
</style>
