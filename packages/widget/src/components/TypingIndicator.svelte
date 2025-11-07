<div class="message assistant">
  <div class="typing-indicator">
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  </div>
</div>

<style>
  .message {
    margin-bottom: 12px;
    display: flex;
    gap: 8px;
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
</style>
