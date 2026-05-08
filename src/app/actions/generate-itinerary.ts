"use server";

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type Spot = {
  id: string;
  name: string | null;
  city: string | null;
  country: string | null;
  instagram_url: string;
};

export async function generateItinerary(spots: Spot[]) {
  if (!spots.length) {
    return "No saved spots yet. Go to Home and save some Instagram links to build your itinerary.";
  }

  // Group by city (fallback to country)
  const groups: Record<string, Spot[]> = {};
  for (const spot of spots) {
    let location = spot.city?.trim();
    if (!location) location = spot.country?.trim();
    if (!location) location = "Other";
    if (!groups[location]) groups[location] = [];
    groups[location].push(spot);
  }

  // Build a structured list for each location
  const daysInput = Object.entries(groups)
    .map(([location, locationSpots]) => {
      const spotsList = locationSpots
        .map((s, i) => {
          const name = s.name?.trim() || "Unnamed spot";
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + (location !== "Other" ? `, ${location}` : ""))}`;
          return `${i + 1}. ${name}\n   Instagram: ${s.instagram_url}\n   Map link: ${mapUrl}`;
        })
        .join("\n");
      return `LOCATION: ${location}\n${spotsList}`;
    })
    .join("\n\n");

  const prompt = `
You are Gojee, a solo‑travel planner. The user has saved spots grouped by location (city or country). Each "LOCATION: X" block below must become one separate day. Do not merge or reorder spots.

${daysInput}

Create a simple itinerary for each day. Use exactly this format:

DAY 1: [location name]
☀️ Morning: Visit [spot name]. Instagram: [url] Map: [url]
🌤️ Afternoon: Visit [next spot name]. Instagram: [url] Map: [url]
🌙 Evening: [if any spot left]

Rules:
- Always include the location name in the "DAY X: ..." line.
- Never mention prices, hours, or transport.
- Use only the URLs provided.
- No markdown, no asterisks.
- Do not add empty lines or extra emojis.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a travel planner. Output plain text only. Always include the location name in the day title. Never output empty lines for missing time slots; just skip them.",
        },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 2000,
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
