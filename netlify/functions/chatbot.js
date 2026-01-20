// netlify/functions/chatbot.js - WERSJA DO DIAGNOZY

exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  try {
    if (!event.body) {
      return { statusCode: 400, headers, body: JSON.stringify({ reply: "Błąd: Pusty request" }) };
    }
    
    const body = JSON.parse(event.body);
    const userMessage = body.message;
    
    // Sprawdzamy czy klucz w ogóle istnieje
    const API_KEY = process.env.GOOGLE_API_KEY;
    if (!API_KEY) {
        return { statusCode: 500, headers, body: JSON.stringify({ reply: "BŁĄD KONFIGURACJI: Brak zmiennej GOOGLE_API_KEY w Netlify!" }) };
    }

    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: userMessage }]
        }]
      })
    });

    const data = await response.json();

    // === TUTAJ JEST ZMIANA - SPRAWDZAMY BŁĘDY ===
    
    // 1. Jeśli Google zwróciło błąd w JSON
    if (data.error) {
        console.error("Google Error:", data.error);
        return { 
            statusCode: 200, // Zwracamy 200 żeby frontend wyświetlił wiadomość
            headers, 
            body: JSON.stringify({ reply: `Błąd Google: ${data.error.message}` }) 
        };
    }

    // 2. Jeśli sukces
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      const botReply = data.candidates[0].content.parts[0].text;
      return { statusCode: 200, headers, body: JSON.stringify({ reply: botReply }) };
    }

    // 3. Jeśli odpowiedź jest dziwna
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: "Dostałem odpowiedź od Google, ale nie ma w niej tekstu. Zobacz logi Netlify." + JSON.stringify(data) }),
    };

  } catch (error) {
    console.error("Błąd funkcji:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ reply: "Krytyczny błąd serwera: " + error.message }),
    };
  }
};