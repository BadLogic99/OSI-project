// netlify/functions/chatbot.js

exports.handler = async function(event, context) {
  // 1. Obsługa CORS (żeby strona mogła gadać z funkcją)
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // Obsługa pre-flight request (dla przeglądarek)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  try {
    // 2. Pobranie wiadomości od użytkownika
    if (!event.body) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Pusty request" }) };
    }
    
    const body = JSON.parse(event.body);
    const userMessage = body.message; // Oczekujemy { "message": "treść" }

    if (!userMessage) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Brak wiadomości" }) };
    }

    // 3. Konfiguracja Gemini API
    // Klucz pobieramy ze zmiennych środowiskowych Netlify (nie wpisuj go tutaj!)
    const API_KEY = process.env.GOOGLE_API_KEY; 
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    // 4. Zapytanie do Google (bez node-fetch, używamy wbudowanego fetch)
    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Jesteś edukacyjnym asystentem astronomicznym. Odpowiadaj krótko i ciekawie po polsku. Pytanie: ${userMessage}` }]
        }]
      })
    });

    const data = await response.json();

    // 5. Wyciągnięcie odpowiedzi
    let botReply = "Błąd API Google.";
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      botReply = data.candidates[0].content.parts[0].text;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: botReply }),
    };

  } catch (error) {
    console.error("Błąd funkcji:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Błąd serwera: " + error.message }),
    };
  }
};