import { NextRequest, NextResponse } from "next/server";

// ─── Provider Switch ───────────────────────────────────────────────
const AI_PROVIDER: "groq" | "gemini" = "gemini";
// ──────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a friendly and expert AI cooking assistant for RecipeVerse AI, a recipe sharing platform.

Your specialties:
- Scaling recipes up or down for different serving sizes (show a clear ingredient table)
- Suggesting ingredient substitutions (dairy-free, gluten-free, vegan, etc.)
- Answering cooking technique questions
- Estimating cook/prep times
- Food pairing and cuisine suggestions
- Helping with meal planning

Guidelines:
- Keep responses concise and practical
- Use bullet points or numbered lists for clarity
- When scaling recipes, show before/after ingredient amounts clearly
- Always be encouraging and helpful
- If asked something unrelated to cooking/food, politely redirect to cooking topics`;

type GeminiMessage = { role: "user" | "model"; parts: [{ text: string }] };

async function runGroq(messages: GeminiMessage[]): Promise<string> {
  const Groq = (await import("groq-sdk")).default;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

  const groqMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role === "model" ? ("assistant" as const) : ("user" as const),
      content: m.parts[0].text,
    })),
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: groqMessages,
    max_tokens: 1024,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content ?? "";
}

async function runGemini(messages: GeminiMessage[]): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role,
    parts: m.parts,
  }));

  const lastMessage = messages[messages.length - 1].parts[0].text;

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage);
  return result.response.text();
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as { messages: GeminiMessage[] };

    if (!messages?.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const text = AI_PROVIDER === "gemini"
      ? await runGemini(messages)
      : await runGroq(messages);

    return NextResponse.json({ text });

  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : String(err);
    const is429 = raw.includes("429") || raw.includes("quota") || raw.includes("Too Many Requests") || raw.includes("rate_limit");
    return NextResponse.json({ error: raw }, { status: is429 ? 429 : 500 });
  }
}
