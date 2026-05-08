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

  // Group spots by city (fallback to country)
  const groups: Record<string, Spot[]> = {};
  for (const spot of spots) {
    let location = spot.city?.trim();
    if (!location) location = spot.country?.trim() || "Other";
    if (!groups[location]) groups[location] = [];
    groups[location].push(spot);
  }

  // For each group, prepare the day data
  const daysData = Object.entries(groups)
    .map(([location, locationSpots]) => {
      const spotsList = locationSpots
        .map((s, i) => {
          const name = s.name?.trim() || "Unnamed spot";
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + (location !== "Other" ? `, ${location}` : ""))}`;
          return `${i + 1}. ${name}\n   Instagram: ${s.instagram_url}\n   Map link: ${mapUrl}`;
        })
        .join("\n");
      return `DAY LOCATION: ${location}\n${spotsList}`;
    })
    .join("\n\n");

  const prompt = `
You are Gojee, a solo‑travel planner. The user has saved spots grouped by location (city or country). Each "DAY LOCATION" block below must become a separate day. Do not merge or reorder spots.

${daysData}

For each day, create a simple itinerary with morning, afternoon, evening. Keep the spots in the same order as listed. Use only these emojis: ☀️ Morning, 🌤️ Afternoon, 🌙 Evening. Never mention prices, hours, or transport times. For each spot, include its Instagram and Google Maps links exactly as given.

Format exactly like this (no extra text):

DAY 1: [Location name]
☀️ Morning: Visit [Spot name]. Instagram: [url] Map: [url]
🌤️ Afternoon: Visit [next spot]. Instagram: [url] Map: [url]
🌙 Evening: ...

Do not add any commentary. No markdown, no asterisks.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a travel planner. Output plain text only – no markdown, no asterisks. Never merge days or reorder spots. Use the exact URLs provided.",
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
