import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const CRISIS_KEYWORDS = [
  "abuse", "hit me", "hurting me", "scared of", "unsafe",
  "suicide", "kill", "self harm", "self-harm", "domestic violence",
  "sexual abuse", "molest", "rape", "danger", "emergency"
];

const CRISIS_RESPONSE = `It sounds like you may be going through something serious right now. ParentWise is here for everyday parenting questions, but what you've described needs immediate professional support.

If anyone is in immediate danger, please call **999** or **112**.

**Childline Kenya — 116** (free, 24/7, also on WhatsApp: 0722 116 116)
**GBV Helpline — 1195** (domestic and gender-based violence, 24/7)
**FIDA Kenya — 0800 720 50** (free legal advice and family support)

Please reach out to these services — they are trained to help.`;

function isCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

function isParentingRelated(text: string): boolean {
  const blockList = [
    "math problem", "solve this equation", "write code", "programming",
    "stock price", "weather", "sports score", "recipe", "song lyrics",
    "movie review", "news today", "politics", "election"
  ];
  const lower = text.toLowerCase();
  return !blockList.some((kw) => lower.includes(kw));
}

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { question, childName, age, notes } = body;

    console.log("API hit — question:", question);
    console.log("Child:", childName, age);

    if (!question || question.length < 10 || question.length > 1000) {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 });
    }

    if (isCrisis(question)) {
      return NextResponse.json({ crisis: true, response: CRISIS_RESPONSE });
    }

    if (!isParentingRelated(question)) {
      return NextResponse.json({
        notParenting: true,
        response: "I'm here specifically to help with parenting questions. Is there something about your child or your parenting journey I can help with?"
      });
    }

    console.log("Embedding question...");
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });
    const embedding = embeddingResponse.data[0].embedding;
    console.log("Embedding done");

    const { data: chunks, error: searchError } = await supabase.rpc(
      "match_documents",
      {
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: 3,
      }
    );

    if (searchError) {
      console.error("Vector search error:", searchError);
    }

    console.log("Chunks found:", chunks?.length || 0);

    const context = chunks?.map((c: { content: string }) => c.content).join("\n\n") || "";

    const systemPrompt = `You are ParentWise, a warm and non-judgmental parenting guide grounded in Jai Institute methodology.

${context ? `Use the following Jai Institute content to inform your response:\n\n${context}\n\n` : ""}

You are answering a question about ${childName}, who is ${age} years old.${notes ? ` Notes about this child: ${notes}` : ""}

Respond in exactly this JSON format with no extra text:
{
  "whatsHappening": "Brief developmental or psychological context (2-3 sentences)",
  "whatToDoNow": "2-3 concrete immediate action steps",
  "longerTerm": "One longer term habit or approach to build"
}

Keep your tone warm, concise and actionable. Never clinical or preachy. Never judge the parent.`;

    console.log("Calling OpenAI...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      response_format: { type: "json_object" },
    });

    console.log("OpenAI response received");
    const raw = completion.choices[0].message.content || "";
    console.log("Raw response:", raw);

    let parsed;
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch (e) {
      console.error("JSON parse error:", e);
      return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
    }

    return NextResponse.json({
      whatsHappening: parsed.whatsHappening,
      whatToDoNow: parsed.whatToDoNow,
      longerTerm: parsed.longerTerm,
    });

  } catch (error) {
    console.error("Query route error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}