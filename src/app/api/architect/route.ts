import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM = `You are an expert Magic: The Gathering deck architect with deep knowledge of all formats, strategies, card synergies, and the competitive metagame.

When a user describes what kind of deck they want, you:
1. Suggest a cohesive strategy and win condition
2. Recommend specific cards (real MTG card names only) with quantities
3. Explain the mana base requirements
4. Describe the deck's game plan and how to pilot it
5. Mention key synergies

Format card suggestions EXACTLY like this (so they can be parsed):
CARDS:
4 Lightning Bolt
4 Monastery Swiftspear
4 Goblin Guide
...
END_CARDS

Always specify quantities (1-4 for most formats, up to 1 for commanders/singletons).
Keep the deck to 60 cards for non-commander formats (plus sideboard), 100 for commander.
Use only real, printable Magic card names.`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const stream = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: SYSTEM,
    messages,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
          );
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
