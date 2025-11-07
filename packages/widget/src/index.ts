import './Widget.svelte';

/**
 * Assist Chat Widget (Svelte)
 *
 * Usage:
 * <script src="widget.js" data-customer-id="your-customer-id" data-server-url="wss://your-server.com/chat"></script>
 *
 * The widget will automatically initialize and inject itself into the page.
 */

// Auto-initialize when script loads
(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  function initWidget() {
    // Get the script tag that loaded this widget
    const scriptTag = document.currentScript as HTMLScriptElement;

    if (!scriptTag) {
      console.error('[AssistWidget] Could not find script tag');
      return;
    }

    const customerId = scriptTag.getAttribute('data-customer-id');
    const serverUrl = scriptTag.getAttribute('data-server-url');

    if (!customerId) {
      console.error('[AssistWidget] Missing data-customer-id attribute');
      return;
    }

    // Create widget element (Svelte custom element)
    const widget = document.createElement('assist-chat-widget');
    widget.setAttribute('customer-id', customerId);

    if (serverUrl) {
      widget.setAttribute('server-url', serverUrl);
    }

    // Append to body
    document.body.appendChild(widget);

    console.log('[AssistWidget] Initialized successfully (Svelte)');
  }
})();
