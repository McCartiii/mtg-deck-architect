"use client";
import { ManaSymbol } from "./ManaSymbol";
import type { DeckCard } from "@/lib/deck";
import { totalCards, sideboardCount } from "@/lib/deck";
import type { Deck } from "@/lib/deck";

interface Props {
  deck: Deck;
  onRemove?: (cardId: string, isSideboard: boolean) => void;
  onQuantityChange?: (cardId: string, qty: number, isSideboard: boolean) => void;
}

function groupByType(cards: DeckCard[]) {
  const groups: Record<string, DeckCard[]> = {};
  for (const dc of cards) {
    const type = dc.card.type_line.split(" — ")[0].trim().split(" ").pop() ?? "Other";
    if (!groups[type]) groups[type] = [];
    groups[type].push(dc);
  }
  return groups;
}

export function DeckList({ deck, onRemove, onQuantityChange }: Props) {
  const main = deck.cards.filter((c) => !c.isSideboard);
  const side = deck.cards.filter((c) => c.isSideboard);
  const grouped = groupByType(main);
  const typeOrder = ["Creature", "Instant", "Sorcery", "Enchantment", "Artifact", "Planeswalker", "Land", "Battle", "Other"];

  return (
    <div className="space-y-4 text-sm">
      {deck.commander && (
        <div>
          <p className="text-xs text-muted uppercase tracking-widest mb-1">Commander</p>
          <div className="flex items-center justify-between py-1 px-2 rounded bg-surface-2">
            <span className="font-medium text-gold">{deck.commander.name}</span>
            {deck.commander.mana_cost && (
              <ManaSymbol manaCost={deck.commander.mana_cost} size="sm" />
            )}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-muted uppercase tracking-widest mb-2">
          Main Deck ({totalCards(deck)})
        </p>
        {typeOrder.map((type) => {
          const cards = grouped[type];
          if (!cards?.length) return null;
          const count = cards.reduce((s, c) => s + c.quantity, 0);
          return (
            <div key={type} className="mb-3">
              <p className="text-xs text-muted mb-1">{type} ({count})</p>
              {cards.map(({ card, quantity }) => (
                <div
                  key={card.id}
                  className="flex items-center gap-2 py-0.5 px-2 rounded hover:bg-surface-2 group"
                >
                  {onQuantityChange && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onQuantityChange(card.id, quantity - 1, false)}
                        className="w-4 h-4 text-muted hover:text-white transition-colors text-xs leading-none"
                      >−</button>
                      <span className="w-4 text-center text-neon font-mono text-xs">{quantity}</span>
                      <button
                        onClick={() => onQuantityChange(card.id, quantity + 1, false)}
                        className="w-4 h-4 text-muted hover:text-white transition-colors text-xs leading-none"
                      >+</button>
                    </div>
                  )}
                  {!onQuantityChange && (
                    <span className="w-4 text-center text-neon font-mono text-xs">{quantity}</span>
                  )}
                  <span className="flex-1 truncate">{card.name}</span>
                  {card.mana_cost && (
                    <ManaSymbol manaCost={card.mana_cost} size="sm" />
                  )}
                  {onRemove && (
                    <button
                      onClick={() => onRemove(card.id, false)}
                      className="opacity-0 group-hover:opacity-100 text-muted hover:text-pink transition-all text-xs"
                    >✕</button>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {side.length > 0 && (
        <div>
          <p className="text-xs text-muted uppercase tracking-widest mb-2">
            Sideboard ({sideboardCount(deck)})
          </p>
          {side.map(({ card, quantity }) => (
            <div
              key={card.id}
              className="flex items-center gap-2 py-0.5 px-2 rounded hover:bg-surface-2 group"
            >
              <span className="w-4 text-center text-muted font-mono text-xs">{quantity}</span>
              <span className="flex-1 truncate text-muted">{card.name}</span>
              {card.mana_cost && (
                <ManaSymbol manaCost={card.mana_cost} size="sm" />
              )}
              {onRemove && (
                <button
                  onClick={() => onRemove(card.id, true)}
                  className="opacity-0 group-hover:opacity-100 text-muted hover:text-pink transition-all text-xs"
                >✕</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
