function parseItinerary(raw: string) {
  const cleanRaw = cleanWeirdChars(raw);
  // Split by "DAY X:" pattern
  const dayBlocks = cleanRaw
    .split(/\n\s*DAY\s+\d+:\s*/i)
    .filter((block) => block.trim().length > 0);
  const result: {
    title: string;
    blocks: { type: string; content: string }[];
  }[] = [];

  for (let i = 0; i < dayBlocks.length; i++) {
    const block = dayBlocks[i];
    const lines = block.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length === 0) continue;
    // The first line is the location name (e.g., "Tokyo")
    const location = lines[0].trim();
    const dayTitle = `Day ${i + 1}: ${location}`;
    const restLines = lines.slice(1);
    const blocks: { type: string; content: string }[] = [];

    for (let rawLine of restLines) {
      let line = rawLine.trim();
      // Remove duplicate emojis
      line = line.replace(/([☀️🌤️🌙⚠️💎🚶‍♂️])\1+/g, "$1");
      // Skip lines that are only emojis or empty after cleaning
      if (/^[☀️🌤️🌙⚠️💎🚶‍♂️\s]+$/.test(line)) continue;
      const lower = line.toLowerCase();
      if (lower.includes("morning") || line.startsWith("☀️")) {
        let content = line.replace(/^(☀️\s*Morning|Morning)\s*/i, "").trim();
        if (content) blocks.push({ type: "morning", content });
      } else if (lower.includes("afternoon") || line.startsWith("🌤️")) {
        let content = line
          .replace(/^(🌤️\s*Afternoon|Afternoon)\s*/i, "")
          .trim();
        if (content) blocks.push({ type: "afternoon", content });
      } else if (lower.includes("evening") || line.startsWith("🌙")) {
        let content = line.replace(/^(🌙\s*Evening|Evening)\s*/i, "").trim();
        if (content) blocks.push({ type: "evening", content });
      } else if (lower.includes("safety tip")) {
        let content = line.replace(/^⚠️\s*Safety tip:\s*/i, "").trim();
        if (content) blocks.push({ type: "safety", content });
      } else if (lower.includes("hidden gem")) {
        let content = line.replace(/^💎\s*Hidden gem:\s*/i, "").trim();
        if (content) blocks.push({ type: "hidden", content });
      } else if (line.length > 0) {
        blocks.push({ type: "text", content: line });
      }
    }
    if (blocks.length > 0) {
      result.push({ title: dayTitle, blocks });
    }
  }
  return result;
}
