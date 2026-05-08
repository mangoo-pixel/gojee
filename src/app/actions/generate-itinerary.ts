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

  // Group spots by city, but if city is missing, use country
  const spotsByLocation: Record<string, Spot[]> = {};
  for (const spot of spots) {
    let location = spot.city?.trim();
    if (!location) location = spot.country?.trim() || "Other";
    if (!spotsByLocation[location]) spotsByLocation[location] = [];
    spotsByLocation[location].push(spot);
  }

  const locationSections = Object.entries(spotsByLocation)
    .map(([location, locationSpots]) => {
      const spotsList = locationSpots
        .map((s, i) => {
          const spotName = s.name?.trim() || "Unnamed spot";
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spotName + (location !== "Other" ? `, ${location}` : ""))}`;
          return `${i + 1}. ${spotName}\n   Instagram: ${s.instagram_url}\n   Map link: ${mapUrl}`;
        })
        .join("\n");
      return `LOCATION: ${location}\n${spotsList}`;
    })
    .join("\n\n");

  const prompt = `
You are Gojee, a solo‑travel planner. The user has saved these spots, grouped by location (city or country):

${locationSections}

Create a **day‑by‑day itinerary** for a solo traveller. Follow these rules exactly:

- **Each day MUST be for ONE location** (city or country). Start the day with "DAY X: [Location name]".
- **NEVER mention prices, costs, opening hours, or transport times.** Use only ☀️ Morning, 🌤️ Afternoon, 🌙 Evening.
- For each spot, include:
  - A suggested time of day (morning/afternoon/evening) – no exact hour.
  - The exact Instagram URL and Google Maps link (provided above).
- You may add a very short note like "check local hours" or "popular spot" – but nothing specific.
- Format:

DAY 1: [Location name]
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
            "You are a travel planner. Output plain text only – no markdown, no asterisks. Never invent specific facts about spots. Use the location names exactly as provided.",
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
    // Also replace any leftover "unknown" (case insensitive) with "Japan" or a generic? Better to leave as is; the AI now uses country.
    return content;
  } catch (error) {
    console.error("Groq error:", error);
    return "Failed to generate itinerary. Please check your API key or try later.";
  }
}
