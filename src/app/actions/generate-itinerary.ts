"use server";

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type Spot = {
  name: string | null;
  country: string | null;
};

export async function generateItinerary(spots: Spot[]) {
  if (!spots.length) {
    return "No saved spots yet. Go to Home and save some Instagram links to build your itinerary.";
  }

  const spotsList = spots
    .map((s, i) => `${i + 1}. ${s.name || "Unnamed spot"} (${s.country || "Unknown country"})`)
    .join("\n");

  const prompt = `
You are Gojee, a solo‑travel assistant for Japan (but also other countries).  
The user has saved these spots:

${spotsList}

Create a **practical, day‑by‑day itinerary** for a solo traveller.  
Suggest morning, afternoon, and evening activities.  
Include local hidden gems (underrated cafés, quiet viewpoints, etc.) that are nearby each spot.  
Add one **safety tip** per day (e.g., best time to visit, transport advice).  
Keep the tone warm and encouraging.  
Do not mention that you are an AI.  
Format the response in Markdown with clear headings (e.g., "## Day 1") and bullet points.
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", // free, fast, good for long outputs
      temperature: 0.7,
      max_tokens: 1500,
    });

    return completion.choices[0]?.message?.content || "Sorry, I couldn't generate an itinerary. Please try again.";
  } catch (error) {
    console.error("Groq error:", error);
    return "Failed to generate itinerary. Please check your API key or try later.";
  }
}