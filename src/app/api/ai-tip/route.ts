import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  const { prompt } = await request.json();
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 60,
    });
    const tip =
      completion.choices[0]?.message?.content?.trim() || "✨ Enjoy your visit!";
    return NextResponse.json({ tip });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      tip: "✨ Ask a local for their recommendation!",
    });
  }
}
