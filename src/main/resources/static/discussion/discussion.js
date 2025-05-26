document.addEventListener('DOMContentLoaded', function() {
    const chatMain = document.querySelector('.chat-main');

    const chatData = {
        topicId: 1,
        topicTitle: "Обсуждение шахматных стратегий",
        messages: [
            {
                id: "msg_1",
                sender: "@prostoErik",
                senderId: 1,
                text: "Привет! Как вам новая стратегия в королевском гамбите?",
                image: "/static/images/msg_img.png",
                time: "10:00",
                isOutgoing: false,
                isPinned: true
            },
            {
                id: "msg_2",
                parentId: "msg_1",
                sender: "Вы",
                senderId: 0,
                text: "Мне кажется, она слишком рискованная",
                time: "10:32",
                isOutgoing: true
            },
            {
                id: "msg_3",
                parentId: null,
                sender: "@sonya_german",
                senderId: 102,
                text: "Вы знали, что слово «гамбит» происходит от итальянского выражения «dare il gambetto» — «поставить подножку».",
                time: "10:35",
                isOutgoing: false
            }
        ],
        replyTo: null
    };

    // Инициализация чата
    function initChat() {
        chatMain.innerHTML = `
            <div class="chat-header">
                <button class="back-button" onclick="goBack()">← Назад</button>
                <h2 class="chat-title">${chatData.topicTitle}</h2>
                <div></div>
            </div>
            <div class="pinned-message" id="pinnedMessage"></div>

            <div class="messages-container" id="messagesContainer"></div>
            <div class="reply-preview" id="replyPreview"></div>
            <div class="chat-input-container">
                <textarea class="message-input" placeholder="Напишите сообщение..." id="messageInput"></textarea>
                <input type="file" id="fileInput" class="file-input" accept="image/*">
                <button class="attach-button" onclick="document.getElementById('fileInput').click()">📎</button>
                <button class="send-button" id="sendButton">➤</button>
            </div>
        `;

        renderPinnedMessage();
        renderMessages();
        setupEventListeners();

        if (window.location.hash) {
            scrollToMessage(window.location.hash.substring(1));
        }
    }

    function getPinnedMessage() {
        return chatData.messages.find(msg => msg.isPinned);
    }

    function renderPinnedMessage() {
        const pinnedContainer = document.getElementById('pinnedMessage');
        const pinnedMsg = getPinnedMessage();

        if (!pinnedMsg) return;

        pinnedContainer.innerHTML = `
            <div class="message pinned">
                <div class="message-sender">📌 ${pinnedMsg.sender}</div>
                <div class="message-text">${pinnedMsg.text}</div>
                <div class="message-footer">
                    <a href="#${pinnedMsg.id}" class="go-to-message">Перейти к обсуждению</a>

                </div>
            </div>
        `;

        pinnedContainer.querySelector('.go-to-message').addEventListener('click', function(e) {
            e.preventDefault();
            scrollToMessage(pinnedMsg.id);
        });
    }

    function renderMessages() {
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';

        chatData.messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${msg.isOutgoing ? 'message-outgoing' : 'message-incoming'}`;
            messageElement.id = msg.id;

            let content = '';
            if (msg.text) {
                content = `<div class="message-text">${msg.text}</div>`;
            }
            if (msg.image) {
                content += `<img src="${msg.image}" class="message-image" alt="Прикрепленное изображение">`;
            }
            let replyInfo = '';
            if (msg.parentId) {
                const parentMsg = findMessage(msg.parentId);
                if (parentMsg) {
                    const parentText = parentMsg.text ?
                        parentMsg.text.substring(0, 50) + (parentMsg.text.length > 50 ? '...' : '') :
                        'Изображение';
                    replyInfo = `
                        <div class="reply-info">
                            <a href="#${parentMsg.id}" class="reply-link">
                                <div class="reply-to">${parentMsg.isOutgoing ? 'Вам' : parentMsg.sender}</div>
                                <div class="reply-text">${parentText}</div>
                            </a>
                        </div>
                    `;
                }
            }

            messageElement.innerHTML = `
                ${!msg.isOutgoing ? `<div class="message-sender">${msg.sender}</div>` : ''}
                ${replyInfo}
                ${content}
                <div class="message-footer">
                    <button class="reply-button" data-message-id="${msg.id}">↩ Ответить</button>
                    <a href="#${msg.id}" class="go-to-message">#</a>
                    <div class="message-time">${msg.time}</div>
                </div>
            `;

            container.appendChild(messageElement);
        });

        document.querySelectorAll('.reply-button').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const messageId = this.dataset.messageId;
                setReplyTo(messageId);
            });
        });

        document.querySelectorAll('.reply-link, .go-to-message').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const messageId = this.getAttribute('href').substring(1);
                scrollToMessage(messageId);
            });
        });

        container.scrollTop = container.scrollHeight;
    }

    function findMessage(messageId) {
        return chatData.messages.find(m => m.id === messageId);
    }

    function scrollToMessage(messageId) {
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageElement.classList.add('highlight');
            setTimeout(() => messageElement.classList.remove('highlight'), 2000);

            history.pushState(null, null, `#${messageId}`);
        }
    }

    function setReplyTo(messageId) {
        const message = findMessage(messageId);
        if (!message) return;

        chatData.replyTo = message;
        updateReplyPreview();
    }

    function updateReplyPreview() {
        const preview = document.getElementById('replyPreview');

        if (chatData.replyTo) {
            const text = chatData.replyTo.text ?
                chatData.replyTo.text.substring(0, 70) + (chatData.replyTo.text.length > 70 ? '...' : '') :
                'Изображение';

            preview.innerHTML = `
                <div class="reply-preview-content">
                    <div>Ответ ${chatData.replyTo.isOutgoing ? 'вам' : chatData.replyTo.sender}: ${text}</div>
                    <button class="cancel-reply" onclick="cancelReply()">×</button>
                </div>
            `;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    }

    window.cancelReply = function() {
        chatData.replyTo = null;
        updateReplyPreview();
    };

    function setupEventListeners() {
        document.getElementById('sendButton').addEventListener('click', sendMessage);
        document.getElementById('messageInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        document.getElementById('fileInput').addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();

                reader.onload = function(event) {
                    addMessage({
                        sender: "Вы",
                        text: "",
                        image: event.target.result,
                        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                        isOutgoing: true,
                        parentId: chatData.replyTo ? chatData.replyTo.id : chatData.pinnedMessage.id
                    });
                    cancelReply();
                };

                reader.readAsDataURL(file);
            }
        });
    }

    function sendMessage() {
        const input = document.getElementById('messageInput');
        const text = input.value.trim();

        if (text) {
            addMessage({
                sender: "Вы",
                text: text,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                isOutgoing: true,
                parentId: chatData.replyTo ? chatData.replyTo.id : null
            });
            input.value = '';
            cancelReply();
        }
    }

    function addMessage(message) {
        chatData.messages.push({
            id: "msg_" + Date.now(),
            ...message
        });
        renderMessages();
    }

    initChat();
});

function goBack() {
    window.history.back();
}

window.addEventListener('hashchange', function() {
    if (window.location.hash) {
        const messageId = window.location.hash.substring(1);
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageElement.classList.add('highlight');
            setTimeout(() => messageElement.classList.remove('highlight'), 2000);
        }
    }
});
