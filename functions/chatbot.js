import fetch from "node-fetch"; // konieczne w Netlify Functions

export async function handler(event, context) {
  try {
    // Pobranie danych z requestu
    const body = JSON.parse(event.body);

    // Sprawdź, czy jest text od użytkownika
    if (!body.contents || !body.contents[0]?.parts) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Brak danych do wysłania" }),
      };
    }

    const userText = body.contents[0].parts[0].text;

    // API Google Gemini
    const API_KEY = "TU_WKLEJ_SWÓJ_KLUCZ_API"; // <--- wklej tutaj swój klucz
    const MODEL = "gemini-1.5-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: {
            text: userText
          },
          temperature: 0.7,
          candidateCount: 1
        })
      }
    );

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Błąd serwera" }),
    };
  }
}
