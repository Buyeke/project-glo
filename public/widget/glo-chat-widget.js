/**
 * GLO Platform Embeddable Chatbot Widget
 * 
 * Usage:
 * <script src="https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/org-widget-chat/embed.js"></script>
 * <script>
 *   GLOWidget.init({
 *     apiKey: 'glo_your_api_key_here',
 *     position: 'bottom-right',   // 'bottom-right' | 'bottom-left'
 *     theme: 'light',             // 'light' | 'dark'
 *     language: 'en',             // 'en' | 'sw' | 'sheng'
 *     greeting: 'Hello! How can I help you today?'
 *   });
 * </script>
 * 
 * Or as a direct script tag:
 * <script 
 *   src="https://projectglo.org/widget/glo-chat-widget.js"
 *   data-api-key="glo_your_api_key_here"
 *   data-position="bottom-right"
 *   data-theme="light"
 *   data-language="en"
 * ></script>
 */

(function() {
  'use strict';

  const SUPABASE_URL = 'https://fznhhkxwzqipwfwihwqr.supabase.co';
  const CHAT_ENDPOINT = `${SUPABASE_URL}/functions/v1/org-widget-chat`;

  const STYLES = `
    .glo-widget-container {
      position: fixed;
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .glo-widget-container.bottom-right {
      bottom: 20px;
      right: 20px;
    }
    .glo-widget-container.bottom-left {
      bottom: 20px;
      left: 20px;
    }

    .glo-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s, box-shadow 0.2s;
      background: linear-gradient(135deg, #D4AF37, #B8960C);
    }
    .glo-widget-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    }
    .glo-widget-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    .glo-chat-window {
      display: none;
      position: absolute;
      bottom: 72px;
      width: 380px;
      max-width: calc(100vw - 40px);
      height: 500px;
      max-height: calc(100vh - 100px);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      flex-direction: column;
    }
    .glo-widget-container.bottom-right .glo-chat-window {
      right: 0;
    }
    .glo-widget-container.bottom-left .glo-chat-window {
      left: 0;
    }
    .glo-chat-window.open {
      display: flex;
    }

    /* Light theme */
    .glo-chat-window.theme-light {
      background: #ffffff;
      color: #1a1a1a;
    }
    .glo-chat-window.theme-light .glo-chat-header {
      background: linear-gradient(135deg, #D4AF37, #B8960C);
      color: white;
    }
    .glo-chat-window.theme-light .glo-chat-input {
      background: #f5f5f5;
      color: #1a1a1a;
      border: 1px solid #e0e0e0;
    }
    .glo-chat-window.theme-light .glo-msg-user {
      background: #D4AF37;
      color: white;
    }
    .glo-chat-window.theme-light .glo-msg-bot {
      background: #f0f0f0;
      color: #1a1a1a;
    }

    /* Dark theme */
    .glo-chat-window.theme-dark {
      background: #1a1a2e;
      color: #e0e0e0;
    }
    .glo-chat-window.theme-dark .glo-chat-header {
      background: linear-gradient(135deg, #D4AF37, #8B7355);
      color: white;
    }
    .glo-chat-window.theme-dark .glo-chat-input {
      background: #16213e;
      color: #e0e0e0;
      border: 1px solid #333;
    }
    .glo-chat-window.theme-dark .glo-msg-user {
      background: #D4AF37;
      color: #1a1a1a;
    }
    .glo-chat-window.theme-dark .glo-msg-bot {
      background: #16213e;
      color: #e0e0e0;
    }

    .glo-chat-header {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .glo-chat-header-title {
      font-weight: 600;
      font-size: 16px;
    }
    .glo-chat-header-subtitle {
      font-size: 12px;
      opacity: 0.85;
    }
    .glo-chat-close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 20px;
      padding: 4px;
      opacity: 0.8;
    }
    .glo-chat-close:hover { opacity: 1; }

    .glo-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .glo-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    }
    .glo-msg-user {
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .glo-msg-bot {
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }

    .glo-chat-input-area {
      padding: 12px 16px;
      display: flex;
      gap: 8px;
      flex-shrink: 0;
      border-top: 1px solid rgba(0,0,0,0.08);
    }
    .glo-chat-input {
      flex: 1;
      padding: 10px 14px;
      border-radius: 24px;
      font-size: 14px;
      outline: none;
    }
    .glo-chat-input:focus {
      border-color: #D4AF37;
    }
    .glo-chat-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: #D4AF37;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .glo-chat-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .glo-typing {
      display: flex;
      gap: 4px;
      padding: 8px 14px;
      align-self: flex-start;
    }
    .glo-typing span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #D4AF37;
      animation: glo-bounce 1.4s ease-in-out infinite;
    }
    .glo-typing span:nth-child(2) { animation-delay: 0.2s; }
    .glo-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes glo-bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .glo-powered-by {
      text-align: center;
      font-size: 11px;
      padding: 6px;
      opacity: 0.5;
    }
    .glo-powered-by a {
      color: inherit;
      text-decoration: none;
    }
    .glo-powered-by a:hover {
      text-decoration: underline;
    }
  `;

  class GLOChatWidget {
    constructor() {
      this.config = {};
      this.sessionToken = null;
      this.isOpen = false;
      this.isLoading = false;
    }

    init(config) {
      this.config = {
        apiKey: config.apiKey || '',
        position: config.position || 'bottom-right',
        theme: config.theme || 'light',
        language: config.language || 'en',
        greeting: config.greeting || 'Hello! How can I help you today?',
      };

      if (!this.config.apiKey) {
        console.error('GLO Widget: API key is required');
        return;
      }

      this.visitorId = this.getVisitorId();
      this.injectStyles();
      this.render();
    }

    getVisitorId() {
      let id = localStorage.getItem('glo_visitor_id');
      if (!id) {
        id = 'v_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('glo_visitor_id', id);
      }
      return id;
    }

    injectStyles() {
      const style = document.createElement('style');
      style.textContent = STYLES;
      document.head.appendChild(style);
    }

    render() {
      const container = document.createElement('div');
      container.className = `glo-widget-container ${this.config.position}`;

      // Chat window
      const chatWindow = document.createElement('div');
      chatWindow.className = `glo-chat-window theme-${this.config.theme}`;
      chatWindow.innerHTML = `
        <div class="glo-chat-header">
          <div>
            <div class="glo-chat-header-title">GLO Support</div>
            <div class="glo-chat-header-subtitle">Powered by GLO Platform</div>
          </div>
          <button class="glo-chat-close">&times;</button>
        </div>
        <div class="glo-chat-messages"></div>
        <div class="glo-chat-input-area">
          <input class="glo-chat-input" placeholder="Type a message..." maxlength="2000" />
          <button class="glo-chat-send" disabled>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <div class="glo-powered-by">
          <a href="https://projectglo.org" target="_blank" rel="noopener">Powered by GLO Platform</a>
        </div>
      `;

      // Toggle button
      const button = document.createElement('button');
      button.className = 'glo-widget-button';
      button.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      `;

      container.appendChild(chatWindow);
      container.appendChild(button);
      document.body.appendChild(container);

      this.chatWindow = chatWindow;
      this.messagesContainer = chatWindow.querySelector('.glo-chat-messages');
      this.input = chatWindow.querySelector('.glo-chat-input');
      this.sendBtn = chatWindow.querySelector('.glo-chat-send');

      // Events
      button.addEventListener('click', () => this.toggle());
      chatWindow.querySelector('.glo-chat-close').addEventListener('click', () => this.toggle());
      this.input.addEventListener('input', () => {
        this.sendBtn.disabled = !this.input.value.trim();
      });
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !this.sendBtn.disabled) this.send();
      });
      this.sendBtn.addEventListener('click', () => this.send());

      // Show greeting
      this.addMessage(this.config.greeting, 'bot');
    }

    toggle() {
      this.isOpen = !this.isOpen;
      this.chatWindow.classList.toggle('open', this.isOpen);
      if (this.isOpen) this.input.focus();
    }

    addMessage(text, role) {
      const msg = document.createElement('div');
      msg.className = `glo-msg glo-msg-${role === 'user' ? 'user' : 'bot'}`;
      msg.textContent = text;
      this.messagesContainer.appendChild(msg);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    showTyping() {
      const typing = document.createElement('div');
      typing.className = 'glo-typing';
      typing.innerHTML = '<span></span><span></span><span></span>';
      this.messagesContainer.appendChild(typing);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      return typing;
    }

    async send() {
      if (this.isLoading) return;
      const message = this.input.value.trim();
      if (!message) return;

      this.addMessage(message, 'user');
      this.input.value = '';
      this.sendBtn.disabled = true;
      this.isLoading = true;

      const typing = this.showTyping();

      try {
        const response = await fetch(CHAT_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
          },
          body: JSON.stringify({
            message,
            session_token: this.sessionToken,
            visitor_id: this.visitorId,
            language: this.config.language,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          this.sessionToken = data.session_token;
          this.addMessage(data.response, 'bot');
        } else {
          this.addMessage(data.error || 'Sorry, something went wrong. Please try again.', 'bot');
        }
      } catch (error) {
        this.addMessage('Network error. Please check your connection.', 'bot');
      } finally {
        typing.remove();
        this.isLoading = false;
      }
    }
  }

  // Global instance
  window.GLOWidget = new GLOChatWidget();

  // Auto-init from script tag data attributes
  const currentScript = document.currentScript;
  if (currentScript && currentScript.dataset.apiKey) {
    window.GLOWidget.init({
      apiKey: currentScript.dataset.apiKey,
      position: currentScript.dataset.position,
      theme: currentScript.dataset.theme,
      language: currentScript.dataset.language,
      greeting: currentScript.dataset.greeting,
    });
  }
})();
