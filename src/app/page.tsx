"use client";
import { useState } from "react";
import { AIArchitect } from "@/components/AIArchitect";
import { CardSearch } from "@/components/CardSearch";
import { DeckList } from "@/components/DeckList";
import { ManaCurve } from "@/components/ManaCurve";
import { useDeck } from "@/hooks/useDeck";
import { exportMTGA, exportText, colorIdentity, totalCards } from "@/lib/deck";
import type { DeckCard } from "@/lib/deck";

type Tab = "ai" | "search";

const COLOR_ICON: Record<string, string> = {
  W: "ms ms-w ms-cost",
  U: "ms ms-u ms-cost",
  B: "ms ms-b ms-cost",
  R: "ms ms-r ms-cost",
  G: "ms ms-g ms-cost",
};

export default function HomePage() {
  const { deck, addCard, removeCard, updateQuantity, setName, setFormat, importCards } = useDeck({
    name: "My New Deck",
  });
  const [tab, setTab] = useState<Tab>("ai");
  const [copied, setCopied] = useState(false);

  async function copyExport(type: "mtga" | "text") {
    const text = type === "mtga" ? exportMTGA(deck) : exportText(deck);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleImport(cards: DeckCard[]) {
    importCards(cards);
  }

  const colors = colorIdentity(deck);
  const count = totalCards(deck);

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between glass sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon to-violet flex items-center justify-center text-bg font-bold text-sm font-display">
            DA
          </div>
          <h1 className="font-display font-bold text-lg holo-text">MTG Deck Architect</h1>
        </div>
        <div className="flex items-center gap-3">
          {colors.map((c) => (
            <i key={c} className={COLOR_ICON[c] ?? ""} />
          ))}
          <span className="text-xs text-muted">{count} cards</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: deck controls */}
        <aside className="w-72 border-r border-border flex flex-col glass overflow-y-auto">
          <div className="p-4 border-b border-border space-y-3">
            <input
              value={deck.name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold focus:outline-none focus:border-neon border-b border-transparent transition-colors pb-0.5"
            />
            <select
              value={deck.format}
              onChange={(e) => setFormat(e.target.value as Parameters<typeof setFormat>[0])}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-xs text-muted focus:outline-none focus:border-neon transition-colors"
            >
              {["standard","pioneer","modern","legacy","vintage","commander","brawl","pauper"].map((f) => (
                <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <DeckList
              deck={deck}
              onRemove={removeCard}
              onQuantityChange={updateQuantity}
            />
          </div>

          <div className="p-4 border-t border-border space-y-3">
            <ManaCurve deck={deck} />
            <div className="flex gap-2">
              <button
                onClick={() => copyExport("mtga")}
                className="flex-1 py-1.5 text-xs rounded-lg bg-surface-2 border border-border hover:border-neon text-muted hover:text-neon transition-all"
              >
                {copied ? "Copied!" : "Copy MTGA"}
              </button>
              <button
                onClick={() => copyExport("text")}
                className="flex-1 py-1.5 text-xs rounded-lg bg-surface-2 border border-border hover:border-pink text-muted hover:text-pink transition-all"
              >
                Export Text
              </button>
            </div>
          </div>
        </aside>

        {/* Center: AI / Search tabs */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-border px-6">
            {(["ai", "search"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t
                    ? "border-neon text-neon"
                    : "border-transparent text-muted hover:text-white"
                }`}
              >
                {t === "ai" ? "🧙 AI Architect" : "🔍 Card Search"}
              </button>
            ))}
          </div>

          <div className="flex-1 p-6 overflow-hidden">
            {tab === "ai" ? (
              <AIArchitect onImport={handleImport} />
            ) : (
              <CardSearch onAdd={addCard} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
