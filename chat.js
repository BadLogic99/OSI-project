function toggleChat() {
    const chatContainer = document.getElementById('chat-container');
    const toggleBtn = document.getElementById('chat-toggle');
    
    if (chatContainer.classList.contains('hidden')) {
        chatContainer.classList.remove('hidden');
        toggleBtn.innerHTML = '✖'; 
    } else {
        chatContainer.classList.add('hidden');
        toggleBtn.innerHTML = '💬';
    }
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById("chat-input");
    const log = document.getElementById("chat-window");
    const text = input.value.trim();

    if (!text) return;

    // User message
    log.innerHTML += `<div class="msg-user">${text}</div>`;
    input.value = "";
    log.scrollTop = log.scrollHeight;

    try {
        // Animacja "..."
        const loadingId = "loading-" + Date.now();
        log.innerHTML += `<div id="${loadingId}" class="msg-bot">...</div>`;
        log.scrollTop = log.scrollHeight;

        // Fetch do Netlify Function
        const response = await fetch('/.netlify/functions/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();
        const botText = data.reply || "Błąd odpowiedzi.";

        // Usuń kropki
        const loader = document.getElementById(loadingId);
        if (loader) loader.remove();

        // Pokaż odpowiedź
        const formattedText = botText.replace(/\n/g, '<br>');
        log.innerHTML += `<div class="msg-bot">${formattedText}</div>`;

    } catch (e) {
        console.error(e);
        log.innerHTML += `<div style="color: red; font-size: 0.8em;">Błąd połączenia.</div>`;
    }
    
    log.scrollTop = log.scrollHeight;
}