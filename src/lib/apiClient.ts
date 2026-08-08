// apiClient.ts - Fixed API Client to handle responses safely
export async function callApi(url: string, payload: any) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();

    // अगर सर्वर ने गलती से HTML एरर पेज भेज दिया है
    if (rawText.trim().startsWith('<')) {
      console.error("Server HTML Error Response:", rawText);
      throw new Error("Server returned an HTML error page instead of JSON.");
    }

    // सुरक्षित रूप से JSON पार्स करें
    return JSON.parse(rawText);
  } catch (error: any) {
    console.error("API Request Failed:", error.message);
    throw error;
  }
}
