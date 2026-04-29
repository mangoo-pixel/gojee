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
- Use plain text only. Use ONLY these emojis: ☀️ Morning, 🌤️ Afternoon, 🌙 Evening, ⚠️ safety, 💎 hidden gem, 💰 budget tip.
- Do NOT invent walking times or transport – just describe the activity and best time.
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

Do not add commentary. Never combine different cities in one day.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a travel planner. Output plain text only – no markdown, no asterisks. Never combine spots from different cities in the same day.",
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
