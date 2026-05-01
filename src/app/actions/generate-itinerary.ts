"use server";

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type Spot = {
  name: string | null;
  city: string | null;
  country: string | null;
  instagram_url: string;
};

export async function generateItinerary(spots: Spot[]) {
  if (!spots.length) {
    return "No saved spots yet. Go to Home and save some Instagram links to build your itinerary.";
  }

  const spotsList = spots
    .map((s, i) => {
      const spotName = s.name?.trim() || "Unnamed spot";
      const city = s.city?.trim() || "";
      const country = s.country?.trim() || "";
      const location = city ? `${city}, ${country}` : country;
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spotName + (location ? `, ${location}` : ""))}`;
      return `${i + 1}. ${spotName} (${location || "unknown location"})\n   Instagram: ${s.instagram_url}\n   Map link: ${mapUrl}`;
    })
    .join("\n");

  const prompt = `
You are Gojee, a practical solo‑travel assistant. The user has saved these spots:

${spotsList}

Create a **day‑by‑day itinerary** for a solo traveller. Follow these rules exactly:

- **Group spots by city**: All spots that belong to the same city MUST be on the same day. Never put spots from different cities on the same day.
- **NEVER invent specific opening hours or exact times** (like "9:00 AM"). Instead, use generic time slots: ☀️ Morning, 🌤️ Afternoon, 🌙 Evening.
- If you don't know the exact opening time, just say "check local hours" or omit the time detail.
- Use plain text only. Use ONLY these emojis: ☀️ Morning, 🌤️ Afternoon, 🌙 Evening, ⚠️ safety, 💎 hidden gem, 💰 budget tip.
- Do NOT invent walking times or transport – just describe the activity.
- For each spot, include:
  - A suggested time of day (morning/afternoon/evening) – no exact hour.
  - The exact Instagram URL (use the one I gave).
  - The exact Google Maps link (use the one I gave).
- Optional: hidden gem, budget tip, safety note.
- Format each day like this:

DAY 1: [City name]
☀️ Morning: [Activity] – description. Instagram: [url] Map: [url]
🌤️ Afternoon: ...
🌙 Evening: ...
⚠️ Safety tip: ...
💎 Hidden gem: ... (optional)
💰 Budget tip: ...

Do not add commentary. Never use exact hours (e.g., "9:00 AM"). Never combine different cities in one day.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a travel planner. Output plain text only – no markdown, no asterisks. Never invent exact opening times. Use only morning/afternoon/evening.",
        },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 2000,
    });

    let content =
      completion.choices[0]?.message?.content ||
      "Sorry, I couldn't generate an itinerary. Please try again.";
    content = content.replace(/\*/g, "").replace(/[�]/g, "");
    // Remove any remaining specific times like "9:00 AM", "10:00", "2:00 PM", etc.
    content = content.replace(/\b\d{1,2}:\d{2}\s*(AM|PM)?\b/gi, "");
    return content;
  } catch (error) {
    console.error("Groq error:", error);
    return "Failed to generate itinerary. Please check your API key or try later.";
  }
}
