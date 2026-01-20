// Otwieranie i zamykanie okna
function toggleChat() {
    const chatContainer = document.getElementById('chat-container');
    const toggleBtn = document.getElementById('chat-toggle');
    
    if (chatContainer.classList.contains('hidden')) {
        chatContainer.classList.remove('hidden');
        chatContainer.style.display = 'flex'; // Pokaż flexem
        toggleBtn.innerHTML = '✖'; // Zmień ikonę na X
    } else {
        chatContainer.classList.add('hidden');
        setTimeout(() => { chatContainer.style.display = 'none'; }, 300); // Czekaj na animację
        toggleBtn.innerHTML = '💬'; // Przywróć dymek
    }
}

// Obsługa Entera
function handleEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Główna funkcja wysyłania (ZAKTUALIZOWANA)
async function sendMessage() {
    const input = document.getElementById("chat-input");
    const log = document.getElementById("chat-window");
    const text = input.value.trim();

    if (!text) return;

    // 1. Dodaj wiadomość użytkownika (nowy styl)
    log.innerHTML += `<div class="msg-user">${text}</div>`;
    input.value = "";
    log.scrollTop = log.scrollHeight;

    try {
        // Efekt "pisania" (opcjonalny bajer)
        const loadingId = "loading-" + Date.now();
        log.innerHTML += `<div id="${loadingId}" class="msg-bot">...</div>`;
        log.scrollTop = log.scrollHeight;

        const response = await fetch('/.netlify/functions/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();
        const botText = data.reply || "Coś poszło nie tak...";

        // Usuń kropki "..."
        document.getElementById(loadingId).remove();

        // 2. Dodaj odpowiedź bota (nowy styl)
        // Zamieniamy \n na <br> żeby ładnie łamało linie
        const formattedText = botText.replace(/\n/g, '<br>');
        log.innerHTML += `<div class="msg-bot">${formattedText}</div>`;

    } catch (e) {
        console.error(e);
        log.innerHTML += `<div style="color: red; font-size: 0.8em; text-align: center;">Błąd połączenia.</div>`;
    }
    
    log.scrollTop = log.scrollHeight;
}