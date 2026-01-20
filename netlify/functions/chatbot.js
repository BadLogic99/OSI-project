// netlify/functions/chatbot.js

exports.handler = async function(event, context) {
  // Nagłówki CORS
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
    
    const API_KEY = process.env.GOOGLE_API_KEY;
    if (!API_KEY) {
        return { statusCode: 500, headers, body: JSON.stringify({ reply: "BŁĄD: Brak klucza API w Netlify." }) };
    }

    // ZMIANA TUTAJ: Używamy "gemini-pro" zamiast "flash" - ten model działa zawsze.
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

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

    // Sprawdzanie błędów
    if (data.error) {
        console.error("Google Error:", data.error);
        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify({ reply: `Błąd Google: ${data.error.message}` }) 
        };
    }

    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      const botReply = data.candidates[0].content.parts[0].text;
      return { statusCode: 200, headers, body: JSON.stringify({ reply: botReply }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: "Model nie zwrócił tekstu. Spróbuj zadać inne pytanie." }),
    };

  } catch (error) {
    console.error("Błąd funkcji:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ reply: "Błąd serwera: " + error.message }),
    };
  }
};