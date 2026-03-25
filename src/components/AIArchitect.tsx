"use client";
import { useState, useRef, useCallback } from "react";
import type { ScryfallCard } from "@/lib/scryfall";
import { getCardByName } from "@/lib/scryfall";
import type { DeckCard } from "@/lib/deck";

interface Message { role: "user" | "assistant"; content: string }

interface Props {
  onImport: (cards: DeckCard[]) => void;
}

function parseCards(text: string): { name: string; qty: number }[] {
  const match = text.match(/CARDS:\n([\s\S]*?)END_CARDS/);
  if (!match) return [];
  return match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(\d+)\s+(.+)$/);
      if (!m) return null;
      return { qty: parseInt(m[1]), name: m[2] };
    })
    .filter(Boolean) as { name: string; qty: number }[];
}

export function AIArchitect({ onImport }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [importing, setImporting] = useState(false);
  const [lastCards, setLastCards] = useState<{ name: string; qty: number }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const { text } = JSON.parse(data);
              full += text;
              setMessages((prev) => [
                ...prev.slice(0, -1),
                { role: "assistant", content: full },
              ]);
            } catch { /* skip */ }
          }
        }
      }

      const cards = parseCards(full);
      setLastCards(cards);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      console.error(err);
    } finally {
      setStreaming(false);
    }
  }, [input, messages, streaming]);

  async function importCards() {
    if (!lastCards.length) return;
    setImporting(true);
    try {
      const resolved = await Promise.all(
        lastCards.map(async ({ name, qty }) => {
          const card = await getCardByName(name);
          if (!card) return null;
          return { card, quantity: qty, isSideboard: false } as DeckCard;
        })
      );
      const valid = resolved.filter(Boolean) as DeckCard[];
      onImport(valid);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message history */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🧙</p>
            <p className="text-muted text-sm">Tell me what kind of deck you want to build.</p>
            <p className="text-muted/60 text-xs mt-1">
              e.g. "Build me a mono-red aggro deck for Modern" or "Create a Sultai midrange Commander deck"
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-neon/10 border border-neon/20 text-white"
                  : "glass text-white/90"
              }`}
            >
              {msg.content}
              {i === messages.length - 1 && streaming && (
                <span className="inline-block w-1 h-4 ml-0.5 bg-neon animate-pulse" />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Import button */}
      {lastCards.length > 0 && !streaming && (
        <div className="mb-3">
          <button
            onClick={importCards}
            disabled={importing}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-neon/20 to-violet/20 border border-neon/30 text-neon text-sm font-medium hover:from-neon/30 hover:to-violet/30 transition-all disabled:opacity-50"
          >
            {importing ? "Fetching cards…" : `Import ${lastCards.length} card types into deck`}
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Describe your deck idea…"
          disabled={streaming}
          className="flex-1 bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:border-neon focus:shadow-[0_0_12px_rgba(0,212,255,0.2)] transition-all disabled:opacity-60"
        />
        <button
          onClick={sendMessage}
          disabled={streaming || !input.trim()}
          className="px-5 py-2.5 rounded-xl bg-neon text-bg font-semibold text-sm hover:bg-neon/90 disabled:opacity-40 transition-all"
        >
          {streaming ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
