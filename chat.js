function toggleChat() {
    const chatContainer = document.getElementById('chat-container');
    const toggleBtn = document.getElementById('chat-toggle');
    
    if (chatContainer.classList.contains('hidden')) {
        // Pokaż
        chatContainer.classList.remove('hidden');
        chatContainer.style.display = 'flex';
        toggleBtn.innerHTML = '✖'; 
    } else {
        // Ukryj
        chatContainer.classList.add('hidden');
        setTimeout(() => { chatContainer.style.display = 'none'; }, 300);
        toggleBtn.innerHTML = '💬';
    }
}

// 2. Obsługa klawisza Enter
function handleEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// 3. Funkcja wysyłania (poprawiona)
async function sendMessage() {
    const input = document.getElementById("chat-input");
    const log = document.getElementById("chat-window");
    const text = input.value.trim();

    if (!text) return;

    // Wyświetl wiadomość użytkownika (dymek)
    log.innerHTML += `<div class="msg-user">${text}</div>`;
    input.value = "";
    log.scrollTop = log.scrollHeight;

    try {
        // Efekt "pisania..."
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
        
        // Usuń "..." i wyświetl odpowiedź
        document.getElementById(loadingId).remove();
        
        // Formatowanie nowych linii na <br>
        const formattedText = botText.replace(/\n/g, '<br>');
        log.innerHTML += `<div class="msg-bot">${formattedText}</div>`;

    } catch (e) {
        console.error(e);
        log.innerHTML += `<div style="color: red; text-align: center; font-size: 0.8em;">Błąd połączenia z serwerem.</div>`;
    }
    
    log.scrollTop = log.scrollHeight;
}


// ======= MINI-GALERIA (Reszta Twojego kodu) =======
const obrazki = [
    'kosmos1.png',
    'kosmos2.png',
    'kosmos3.png',
    'kosmos4.png',
    'kosmos5.png',
    'kosmos6.png'
];

let index = 0;
const imgElement = document.getElementById('galeria-img');

if(imgElement) {
    imgElement.src = obrazki[0];
    imgElement.style.display = 'block';
}

function zmienObrazek() {
    if(!imgElement) return;
    imgElement.style.opacity = 0; // fade-out
    setTimeout(() => {
        imgElement.src = obrazki[index];
        imgElement.style.opacity = 1; // fade-in
        index = (index + 1) % obrazki.length;
    }, 300);
}

setInterval(() => {
    index = (index + 1) % obrazki.length;
    zmienObrazek();
}, 15000);

// ======= KALKULATOR PODRÓŻY =======
const dystanse = {
    merkury: 91700000,
    wenus: 41400000,
    ziemia: 0,
    mars: 78300000,
    jowisz: 628730000,
    saturn: 1275000000,
    uran: 2723950000,
    neptun: 4351400000,
    pluton: 5906400000,
    proxima: 4.24 * 9.461e12,
    rx1856: 400 * 9.461e12,
    gaia: 1560 * 9.461e12,
    andromeda: 2.5e6 * 9.461e12,
    sagA: 26000 * 9.461e12
};

function formatCzasH(czasH) {
    if (czasH < 24) return `${czasH.toFixed(2)} godzin`;
    const czasD = czasH / 24;
    if (czasD < 365.25) return `${czasD.toFixed(2)} dni`;
    const czasLata = czasD / 365.25;
    return `${czasLata.toFixed(2)} lat`;
}

const btnLicz = document.getElementById('licz');
if(btnLicz) {
    btnLicz.addEventListener('click', () => {
        const cel = document.getElementById('cel').value;
        let procentC = parseFloat(document.getElementById('procent').value);
        let kmh = parseFloat(document.getElementById('kmh').value);
        let ms = parseFloat(document.getElementById('ms').value);

        const C = 299792.458; // km/s

        if (procentC > 0) {
            ms = (C * procentC / 100) * 1000;
            kmh = ms * 3.6;
        } else if (kmh > 0) {
            ms = kmh / 3.6;
            procentC = (ms / (C * 1000)) * 100;
        } else if (ms > 0) {
            kmh = ms * 3.6;
            procentC = (ms / (C * 1000)) * 100;
        }

        const dystans = dystanse[cel];
        const czasH = dystans / kmh;

        let wynikTekst = `Czas podróży do ${cel.charAt(0).toUpperCase() + cel.slice(1)}: ${formatCzasH(czasH)}`;

        if (procentC > 100) {
            wynikTekst += " (hipotetycznie, podróż z prędkością większą od prędkości światła nie jest możliwa)";
        }

        document.getElementById('wynik').textContent = wynikTekst;
    });
}