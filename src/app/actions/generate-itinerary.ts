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

  // Group spots by city
  const spotsByCity: Record<string, Spot[]> = {};
  for (const spot of spots) {
    const city = spot.city?.trim() || "Unknown";
    if (!spotsByCity[city]) spotsByCity[city] = [];
    spotsByCity[city].push(spot);
  }

  const citySections = Object.entries(spotsByCity)
    .map(([city, citySpots]) => {
      const spotsList = citySpots
        .map((s, i) => {
          const spotName = s.name?.trim() || "Unnamed spot";
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spotName + (city !== "Unknown" ? `, ${city}` : ""))}`;
          return `${i + 1}. ${spotName}\n   Instagram: ${s.instagram_url}\n   Map link: ${mapUrl}`;
        })
        .join("\n");
      return `CITY: ${city}\n${spotsList}`;
    })
    .join("\n\n");

  const prompt = `
You are Gojee, a solo‑travel planner. The user has saved these spots, grouped by city:

${citySections}

Create a **simple day‑by‑day itinerary** for a solo traveller. Follow these rules exactly:

- **Each day MUST be for ONE city**. Start the day with "DAY X: [City name]".
- **NEVER mention prices, costs, opening hours, or transport times.** Use only ☀️ Morning, 🌤️ Afternoon, 🌙 Evening.
- For each spot, include:
  - A suggested time of day (morning/afternoon/evening) – no exact hour.
  - The exact Instagram URL and Google Maps link (provided above).
- You may add a very short note like "check local hours" or "popular spot" – but nothing specific.
- Format:

DAY 1: Tokyo
☀️ Morning: Visit [Spot name]. Instagram: [url] Map: [url]
🌤️ Afternoon: ...
🌙 Evening: ...
⚠️ Safety tip: (optional, generic)

Do not add any extra commentary. No markdown, no asterisks.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a travel planner. Output plain text only – no markdown, no asterisks. Never invent specific facts about spots.",
        },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1500,
    });

    let content =
      completion.choices[0]?.message?.content ||
      "Sorry, I couldn't generate an itinerary. Please try again.";
    content = content.replace(/\*/g, "").replace(/[�]/g, "");
    content = content.replace(/\b\d{1,2}:\d{2}\s*(AM|PM)?\b/gi, "");
    return content;
  } catch (error) {
    console.error("Groq error:", error);
    return "Failed to generate itinerary. Please check your API key or try later.";
  }
}
