"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import { searchCards, getCardImage, type ScryfallCard } from "@/lib/scryfall";
import { ManaSymbol } from "./ManaSymbol";
import { HoloCard } from "./HoloCard";

interface Props {
  onAdd: (card: ScryfallCard, qty: number, isSideboard: boolean) => void;
}

export function CardSearch({ onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState<ScryfallCard | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await searchCards(q);
      setResults(res.data.slice(0, 20));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") search(query);
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Search panel */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search cards… (press Enter)"
            className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:border-neon focus:shadow-[0_0_12px_rgba(0,212,255,0.2)] transition-all"
          />
          <button
            onClick={() => search(query)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-neon transition-colors text-sm"
          >
            {loading ? "⟳" : "⌕"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {results.map((card) => (
            <div
              key={card.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 cursor-pointer group transition-colors"
              onMouseEnter={() => setHovered(card)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="w-10 h-14 relative flex-shrink-0 rounded overflow-hidden">
                <Image
                  src={getCardImage(card, "small")}
                  alt={card.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{card.name}</p>
                <p className="text-xs text-muted truncate">{card.type_line}</p>
                {card.mana_cost && <ManaSymbol manaCost={card.mana_cost} size="sm" />}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onAdd(card, 1, false)}
                  className="px-2 py-1 text-xs rounded bg-neon/10 border border-neon/30 text-neon hover:bg-neon/20 transition-colors"
                >
                  +Main
                </button>
                <button
                  onClick={() => onAdd(card, 1, true)}
                  className="px-2 py-1 text-xs rounded bg-pink/10 border border-pink/30 text-pink hover:bg-pink/20 transition-colors"
                >
                  +Side
                </button>
              </div>
            </div>
          ))}
          {!loading && results.length === 0 && query && (
            <p className="text-sm text-muted text-center py-8">No cards found</p>
          )}
        </div>
      </div>

      {/* Hover preview */}
      {hovered && (
        <div className="w-52 flex-shrink-0">
          <HoloCard rarity={hovered.rarity} className="w-full aspect-[5/7]">
            <div className="relative w-full aspect-[5/7]">
              <Image
                src={getCardImage(hovered, "normal")}
                alt={hovered.name}
                fill
                className="object-contain rounded-xl"
                sizes="208px"
              />
            </div>
          </HoloCard>
          {hovered.prices?.usd && (
            <p className="text-center text-xs text-gold mt-2">${hovered.prices.usd}</p>
          )}
        </div>
      )}
    </div>
  );
}
