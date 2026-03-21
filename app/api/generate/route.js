import Anthropic from "@anthropic-ai/sdk";

export async function POST(request) {
  const { topic } = await request.json();

  if (!topic) {
    return Response.json({ error: "Topic is required" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not set. Add it in your Vercel environment variables." },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Generate exactly 32 unique, well-known, and interesting items for the bracket tournament topic: "${topic}".
Return ONLY a valid JSON array of exactly 32 strings. No markdown, no explanation, no extra text — just the raw JSON array.
Make the items diverse, recognizable, and fun to debate. Example format: ["Item 1","Item 2","Item 3"]`,
      },
    ],
  });

  const raw = message.content[0].text.trim();
  let items;
  try {
    items = JSON.parse(raw);
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) items = JSON.parse(match[0]);
    else throw new Error("Could not parse response");
  }

  if (!Array.isArray(items) || items.length < 32) {
    return Response.json({ error: `Expected 32 items, got ${items?.length}` }, { status: 500 });
  }

  return Response.json({ items: items.slice(0, 32) });
}
