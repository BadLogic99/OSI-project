// netlify/functions/chatbot.js - WERSJA DIAGNOSTYCZNA

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
    const body = JSON.parse(event.body || "{}");
    const userMessage = body.message || "";
    const API_KEY = process.env.GOOGLE_API_KEY;

    if (!API_KEY) {
        return { statusCode: 500, headers, body: JSON.stringify({ reply: "BŁĄD: Brak klucza API w Netlify." }) };
    }

    // === TRYB DIAGNOSTYCZNY: SPRAWDZANIE DOSTĘPNYCH MODELI ===
    if (userMessage === "SYSTEM_CHECK") {
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const listResp = await fetch(listUrl);
        const listData = await listResp.json();

        if (listData.models) {
            // Filtrujemy tylko modele "generateContent"
            const availableModels = listData.models
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name.replace("models/", "")) // usuwamy prefix 'models/'
                .join(", ");
            
            return { 
                statusCode: 200, 
                headers, 
                body: JSON.stringify({ reply: `Dostępne modele dla Twojego klucza: ${availableModels}` }) 
            };
        } else {
             return { 
                statusCode: 200, 
                headers, 
                body: JSON.stringify({ reply: `Błąd listowania modeli: ${JSON.stringify(listData)}` }) 
            };
        }
    }

    // === NORMALNY CHAT ===
    // Ustawiam "gemini-1.5-flash" jako domyślny, ale jeśli nie zadziała,
    // użyj komendy SYSTEM_CHECK żeby zobaczyć co wpisać.
    
    const MODEL_NAME = "gemini-1.5-flash"; 
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

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

    if (data.error) {
        console.error("Google Error:", data.error);
        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify({ reply: `Błąd Google (Model: ${MODEL_NAME}): ${data.error.message}. Spróbuj wpisać SYSTEM_CHECK.` }) 
        };
    }

    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      return { statusCode: 200, headers, body: JSON.stringify({ reply: data.candidates[0].content.parts[0].text }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: "Brak odpowiedzi. Zobacz logi." }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ reply: "Błąd serwera: " + error.message }),
    };
  }
};