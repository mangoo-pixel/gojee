"use server";

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type Spot = {
  name: string | null;
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
      const country = s.country?.trim() || "";
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spotName + (country ? `, ${country}` : ""))}`;
      return `${i + 1}. ${spotName} (${country || "Unknown country"})\n   Instagram: ${s.instagram_url}\n   Map link: ${mapUrl}`;
    })
    .join("\n");

  const prompt = `
You are Gojee, a practical solo‑travel assistant. The user has saved these spots with their exact Instagram and map links:

${spotsList}

Create a **day‑by‑day itinerary** for a solo traveller covering ALL the saved spots. Follow these rules exactly:

- **NEVER use markdown** – no asterisks (*), no bold, no italics, no backticks.
- Use plain text only. Use ONLY these emojis: ☀️ Morning, 🌤️ Afternoon, 🌙 Evening, 🚶‍♂️ walk, 🚆 train, 🚌 bus, ⚠️ safety.
- For each spot, include:
  - **Best time to visit** (e.g., "9:00 AM – quiet").
  - **Walking or transport time** from the previous spot.
  - **The exact Instagram URL** that I provided – do not change it.
  - **The exact Google Maps link** that I provided – use it as is.
- Additionally, add:
  - **A hidden gem** nearby (a small cafe, viewpoint, or local shop).
  - **A budget tip** (e.g., "free entry before 10am", "buy a day pass").
  - **A solo traveller safety note** for that location (e.g., "well lit at night", "avoid alone after 10pm").
- Keep each day's format like this:

DAY 1: [Title]
☀️ Morning (9:00): [Activity]. Best time: [time]. Instagram: [url] Map: [url]
🚶‍♂️ Walk 12 min to next spot.
🌤️ Afternoon (13:00): ...
🚆 Take the Tokyo Metro (5 min).
🌙 Evening: ...
⚠️ Safety tip: ...
💎 Hidden gem: ...
💰 Budget tip: ...

Do not add extra commentary. Use the exact URLs I gave you.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a travel planner. Output plain text only – no markdown, no asterisks, no code blocks. Use the exact URLs provided.",
        },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 2500,
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
