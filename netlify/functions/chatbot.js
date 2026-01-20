exports.handler = async function(event, context) {
  // 1. Nagłówki, żeby przeglądarka nie blokowała połączenia (CORS)
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // Obsługa wstępnego zapytania przeglądarki
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  try {
    // 2. Walidacja danych wejściowych
    const body = JSON.parse(event.body || "{}");
    const userMessage = body.message;
    const API_KEY = process.env.GOOGLE_API_KEY;

    if (!API_KEY) {
        return { statusCode: 500, headers, body: JSON.stringify({ reply: "BŁĄD: Brak klucza API w ustawieniach Netlify." }) };
    }

    if (!userMessage) {
        return { statusCode: 400, headers, body: JSON.stringify({ reply: "Pusta wiadomość." }) };
    }

    // 3. Konfiguracja modelu - Wybraliśmy gemini-2.5-flash
    const MODEL_NAME = "gemini-2.5-flash"; 
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    // 4. Zapytanie do Google
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

    // 5. Obsługa błędów Google
    if (data.error) {
        console.error("Google Error:", data.error);
        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify({ reply: `Błąd modelu (${MODEL_NAME}): ${data.error.message}` }) 
        };
    }

    // 6. Wyciągnięcie odpowiedzi
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      const botReply = data.candidates[0].content.parts[0].text;
      return { statusCode: 200, headers, body: JSON.stringify({ reply: botReply }) };
    }

    // 7. Fallback (gdyby odpowiedź była pusta)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: "Model milczy (brak tekstu w odpowiedzi)." }),
    };

  } catch (error) {
    console.error("Critical Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ reply: "Błąd serwera: " + error.message }),
    };
  }
};