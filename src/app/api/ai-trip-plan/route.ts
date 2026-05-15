import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  const { prompt } = await request.json();
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 800,
    });
    const plan = completion.choices[0]?.message?.content?.trim() || "✨ Enjoy your trip!";
    return NextResponse.json({ plan });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ plan: "✨ Plan your trip using the 'Reorder by proximity' button." });
  }
}