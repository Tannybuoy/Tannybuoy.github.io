/* ============================================
   Ask Tanya AI — Chat Widget
   Self-mounting, ES5-compatible
   ============================================ */

(function () {
    'use strict';

    // --- Configuration ---
    // IMPORTANT: Update this URL after deploying chatbot-proxy to Render
    var CHATBOT_API_URL = 'https://ask-tanya-ai.onrender.com/api/chat';

    // --- State ---
    var isOpen = false;
    var isStreaming = false;
    var messages = [];   // { role: 'user'|'assistant', content: '' }
    var startersHidden = false;

    // --- Restore session ---
    try {
        var saved = sessionStorage.getItem('chatbot-messages');
        if (saved) {
            messages = JSON.parse(saved);
            startersHidden = messages.length > 0;
        }
    } catch (e) { /* ignore */ }

    // --- Helpers ---
    function saveSession() {
        try {
            sessionStorage.setItem('chatbot-messages', JSON.stringify(messages));
        } catch (e) { /* ignore */ }
    }

    // --- Build DOM ---
    function createWidget() {
        // Floating button
        var btn = document.createElement('button');
        btn.className = 'chatbot-btn';
        btn.setAttribute('aria-label', 'Open AI chat assistant');
        btn.innerHTML = [
            '<svg class="chatbot-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
            '  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
            '</svg>',
            '<svg class="chatbot-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">',
            '  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
            '</svg>'
        ].join('');

        // Panel
        var panel = document.createElement('div');
        panel.className = 'chatbot-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Chat with Tanya\'s AI assistant');
        panel.innerHTML = [
            '<div class="chatbot-header">',
            '  <span class="chatbot-header-dot"></span>',
            '  <div>',
            '    <div class="chatbot-header-title">Ask Tanya AI</div>',
            '    <div class="chatbot-header-mode">Powered by Claude</div>',
            '  </div>',
            '</div>',
            '<div class="chatbot-messages" id="chatbotMessages">',
            '  <div class="chatbot-typing" id="chatbotTyping">',
            '    <span class="chatbot-typing-dot"></span>',
            '    <span class="chatbot-typing-dot"></span>',
            '    <span class="chatbot-typing-dot"></span>',
            '  </div>',
            '</div>',
            '<div class="chatbot-starters" id="chatbotStarters">',
            '  <button class="chatbot-starter" data-q="What\u2019s Tanya\u2019s PM philosophy?">PM philosophy?</button>',
            '  <button class="chatbot-starter" data-q="Tell me about the Danfoss ML project">Danfoss ML project</button>',
            '  <button class="chatbot-starter" data-q="What AI tools has Tanya built with?">AI tools she uses</button>',
            '  <button class="chatbot-starter" data-q="Why should I hire Tanya?">Why hire Tanya?</button>',
            '</div>',
            '<div class="chatbot-input-area">',
            '  <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Ask me anything..." autocomplete="off">',
            '  <button class="chatbot-send" id="chatbotSend" aria-label="Send message">',
            '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">',
            '      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
            '    </svg>',
            '  </button>',
            '</div>'
        ].join('\n');

        document.body.appendChild(panel);
        document.body.appendChild(btn);

        return { btn: btn, panel: panel };
    }

    // --- DOM References (after creation) ---
    var widget = createWidget();
    var btn = widget.btn;
    var panel = widget.panel;
    var messagesEl = document.getElementById('chatbotMessages');
    var typingEl = document.getElementById('chatbotTyping');
    var startersEl = document.getElementById('chatbotStarters');
    var inputEl = document.getElementById('chatbotInput');
    var sendBtn = document.getElementById('chatbotSend');

    // --- Render Messages ---
    function renderMessages() {
        // Remove all message bubbles (keep typing indicator)
        var children = messagesEl.children;
        var i = children.length - 1;
        while (i >= 0) {
            if (children[i] !== typingEl) {
                messagesEl.removeChild(children[i]);
            }
            i--;
        }

        // Add welcome message if empty
        if (messages.length === 0) {
            var welcome = document.createElement('div');
            welcome.className = 'chatbot-msg chatbot-msg-bot';
            welcome.textContent = 'Hi! I\'m an AI assistant for Tanya\'s portfolio. Ask me about her experience, projects, or PM philosophy.';
            messagesEl.insertBefore(welcome, typingEl);
        }

        // Render conversation
        for (var j = 0; j < messages.length; j++) {
            var msg = messages[j];
            var bubble = document.createElement('div');
            bubble.className = 'chatbot-msg ' + (msg.role === 'user' ? 'chatbot-msg-user' : 'chatbot-msg-bot');
            bubble.textContent = msg.content;
            messagesEl.insertBefore(bubble, typingEl);
        }

        scrollToBottom();
    }

    function scrollToBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // --- Send Message ---
    function sendMessage(text) {
        if (!text || isStreaming) return;

        text = text.trim();
        if (!text) return;

        // Hide starters
        if (!startersHidden) {
            startersHidden = true;
            startersEl.className = 'chatbot-starters is-hidden';
        }

        // Add user message
        messages.push({ role: 'user', content: text });
        saveSession();
        renderMessages();

        // Clear input
        inputEl.value = '';
        sendBtn.disabled = true;
        isStreaming = true;

        // Show typing
        typingEl.className = 'chatbot-typing is-visible';
        scrollToBottom();

        // Create bot bubble for streaming
        var botBubble = document.createElement('div');
        botBubble.className = 'chatbot-msg chatbot-msg-bot';
        botBubble.textContent = '';
        botBubble._streaming = true;
        botBubble.style.display = 'none';

        // Build API messages (only user/assistant, no system)
        var apiMessages = [];
        for (var i = 0; i < messages.length; i++) {
            apiMessages.push({
                role: messages[i].role,
                content: messages[i].content
            });
        }

        // Call API with streaming
        fetch(CHATBOT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: apiMessages })
        }).then(function (response) {
            if (!response.ok) {
                throw new Error('API returned ' + response.status);
            }

            // Insert bot bubble, hide typing
            typingEl.className = 'chatbot-typing';
            messagesEl.insertBefore(botBubble, typingEl);
            botBubble.style.display = '';

            var reader = response.body.getReader();
            var decoder = new TextDecoder();
            var buffer = '';
            var fullText = '';

            function processStream() {
                return reader.read().then(function (result) {
                    if (result.done) {
                        // Finalize
                        botBubble._streaming = false;
                        if (fullText) {
                            messages.push({ role: 'assistant', content: fullText });
                            saveSession();
                        }
                        isStreaming = false;
                        sendBtn.disabled = !inputEl.value.trim();
                        return;
                    }

                    buffer += decoder.decode(result.value, { stream: true });
                    var lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (var k = 0; k < lines.length; k++) {
                        var line = lines[k].trim();
                        if (line.indexOf('data: ') === 0) {
                            try {
                                var data = JSON.parse(line.substring(6));
                                if (data.type === 'text') {
                                    fullText += data.text;
                                    botBubble.textContent = fullText;
                                    scrollToBottom();
                                } else if (data.type === 'error') {
                                    showError(data.error);
                                }
                            } catch (e) { /* skip malformed */ }
                        }
                    }

                    return processStream();
                });
            }

            return processStream();
        }).catch(function (err) {
            console.error('Chatbot error:', err);
            typingEl.className = 'chatbot-typing';
            botBubble.style.display = 'none';
            isStreaming = false;
            sendBtn.disabled = false;
            showError('Sorry, I couldn\'t connect to the server. Please try again in a moment.');
        });
    }

    function showError(text) {
        var errEl = document.createElement('div');
        errEl.className = 'chatbot-error';
        errEl.textContent = text;
        messagesEl.insertBefore(errEl, typingEl);
        scrollToBottom();
    }

    // --- Toggle Panel ---
    function togglePanel() {
        isOpen = !isOpen;
        if (isOpen) {
            panel.className = 'chatbot-panel is-visible';
            btn.className = 'chatbot-btn is-open';
            btn.setAttribute('aria-label', 'Close AI chat assistant');
            inputEl.focus();
        } else {
            panel.className = 'chatbot-panel';
            btn.className = 'chatbot-btn';
            btn.setAttribute('aria-label', 'Open AI chat assistant');
        }
    }

    // --- Event Listeners ---
    btn.addEventListener('click', togglePanel);

    sendBtn.addEventListener('click', function () {
        sendMessage(inputEl.value);
    });

    inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            sendMessage(inputEl.value);
        }
    });

    inputEl.addEventListener('input', function () {
        sendBtn.disabled = isStreaming || !inputEl.value.trim();
    });

    // Starter chips
    var starterBtns = startersEl.querySelectorAll('.chatbot-starter');
    for (var s = 0; s < starterBtns.length; s++) {
        starterBtns[s].addEventListener('click', function () {
            var q = this.getAttribute('data-q');
            if (q) sendMessage(q);
        });
    }

    // Close on Escape
    document.addEventListener('keydown', function (e) {
        if ((e.key === 'Escape' || e.keyCode === 27) && isOpen) {
            togglePanel();
        }
    });

    // --- Initial render ---
    if (startersHidden) {
        startersEl.className = 'chatbot-starters is-hidden';
    }
    renderMessages();
    sendBtn.disabled = true;

})();
