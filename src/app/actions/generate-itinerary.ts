"use server";

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type Spot = {
  name: string | null;
  country: string | null;
  instagram_url: string;
};

// Helper to extract city from spot name (basic)
function extractCity(name: string): string {
  const cities = [
    "Tokyo",
    "Kyoto",
    "Osaka",
    "Yokohama",
    "Nagoya",
    "Sapporo",
    "Fukuoka",
    "Kobe",
    "Nara",
    "Hiroshima",
  ];
  for (const city of cities) {
    if (name.includes(city)) return city;
  }
  return "";
}

export async function generateItinerary(spots: Spot[]) {
  if (!spots.length) {
    return "No saved spots yet. Go to Home and save some Instagram links to build your itinerary.";
  }

  // Group spots by city before sending to AI
  const spotsByCity: Record<string, Spot[]> = {};
  for (const spot of spots) {
    const spotName = spot.name?.trim() || "Unnamed spot";
    let city = extractCity(spotName);
    if (!city && spot.country) city = spot.country; // fallback to country
    if (!city) city = "Other";
    if (!spotsByCity[city]) spotsByCity[city] = [];
    spotsByCity[city].push(spot);
  }

  const citySections = Object.entries(spotsByCity)
    .map(([city, citySpots]) => {
      const spotsList = citySpots
        .map((s, i) => {
          const spotName = s.name?.trim() || "Unnamed spot";
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spotName + (city !== "Other" ? `, ${city}` : ""))}`;
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

- **NEVER combine spots from different cities in the same day**. Each day must belong to ONE city.
- Use plain text only. Use ONLY these emojis: ☀️ Morning, 🌤️ Afternoon, 🌙 Evening, ⚠️ safety, 💎 hidden gem, 💰 budget tip.
- **Do NOT invent walking times or transport** – just describe the activity and best time.
- For each spot, include:
  - Best time to visit (e.g., "9:00 AM – quiet").
  - The exact Instagram URL (use the one I gave).
  - The exact Google Maps link (use the one I gave).
- Add optional: hidden gem, budget tip, safety note.
- Format each day like this:

DAY 1: [City name]
☀️ Morning (9:00): [Activity]. Best time: [time]. Instagram: [url] Map: [url]
🌤️ Afternoon (13:00): ... (next spot in same city)
🌙 Evening: ...
⚠️ Safety tip: ...
💎 Hidden gem: ... (optional)
💰 Budget tip: ...

Do not add commentary. Do not mix cities.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a travel planner. Output plain text only – no markdown, no asterisks. Never combine different cities in the same day.",
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
    return content;
  } catch (error) {
    console.error("Groq error:", error);
    return "Failed to generate itinerary. Please check your API key or try later.";
  }
}
