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

  // Group spots by city to help AI
  const spotsByCity: Record<string, Spot[]> = {};
  for (const spot of spots) {
    const city = spot.city?.trim() || "Unknown city";
    if (!spotsByCity[city]) spotsByCity[city] = [];
    spotsByCity[city].push(spot);
  }

  const citySections = Object.entries(spotsByCity)
    .map(([city, citySpots]) => {
      const spotsList = citySpots
        .map((s, i) => {
          const spotName = s.name?.trim() || "Unnamed spot";
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spotName + (city !== "Unknown city" ? `, ${city}` : ""))}`;
          return `${i + 1}. ${spotName}\n   Instagram: ${s.instagram_url}\n   Map link: ${mapUrl}`;
        })
        .join("\n");
      return `CITY: ${city}\n${spotsList}`;
    })
    .join("\n\n");

  const prompt = `
You are Gojee, a practical solo‑travel assistant. The user has saved these spots, grouped by city:

${citySections}

Create a **day‑by‑day itinerary** for a solo traveller. Follow these rules exactly:

- **Each day MUST be dedicated to ONE city**. Start the day with "DAY X: [City name]".
- **NEVER invent specific opening hours or exact times**. Use only generic time slots: ☀️ Morning, 🌤️ Afternoon, 🌙 Evening.
- Use plain text only. Use ONLY these emojis: ☀️ Morning, 🌤️ Afternoon, 🌙 Evening, ⚠️ safety, 💎 hidden gem, 💰 budget tip.
- Do NOT invent walking times or transport – just describe the activity.
- For each spot, include:
  - A suggested time of day (morning/afternoon/evening).
  - The exact Instagram URL (use the one I gave).
  - The exact Google Maps link (use the one I gave).
- Optional: hidden gem, budget tip, safety note.
- Format each day like this (city name must appear in the title):

DAY 1: Tokyo
☀️ Morning: [Activity] – description. Instagram: [url] Map: [url]
🌤️ Afternoon: ...
🌙 Evening: ...
⚠️ Safety tip: ...
💎 Hidden gem: ...
💰 Budget tip: ...

Do not add commentary. Never use exact hours. Never mix cities.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a travel planner. Output plain text only – no markdown, no asterisks. Always include the city name in the day title (e.g., 'DAY 1: Tokyo'). Use only morning/afternoon/evening as time indicators.",
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
    // Clean up
    content = content.replace(/\*/g, "").replace(/[�]/g, "");
    // Remove any remaining specific times
    content = content.replace(/\b\d{1,2}:\d{2}\s*(AM|PM)?\b/gi, "");
    return content;
  } catch (error) {
    console.error("Groq error:", error);
    return "Failed to generate itinerary. Please check your API key or try later.";
  }
}
