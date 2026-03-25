import type { ScryfallCard } from "./scryfall";

export type Format =
  | "standard"
  | "pioneer"
  | "modern"
  | "legacy"
  | "vintage"
  | "commander"
  | "brawl"
  | "pauper";

export interface DeckCard {
  card: ScryfallCard;
  quantity: number;
  isSideboard: boolean;
}

export interface Deck {
  id: string;
  name: string;
  format: Format;
  description: string;
  cards: DeckCard[];
  commander?: ScryfallCard;
  createdAt: Date;
  updatedAt: Date;
}

export function totalCards(deck: Deck): number {
  return deck.cards
    .filter((c) => !c.isSideboard)
    .reduce((sum, c) => sum + c.quantity, 0);
}

export function sideboardCount(deck: Deck): number {
  return deck.cards
    .filter((c) => c.isSideboard)
    .reduce((sum, c) => sum + c.quantity, 0);
}

export function manaCurve(deck: Deck): Record<number, number> {
  const curve: Record<number, number> = {};
  deck.cards
    .filter((c) => !c.isSideboard && c.card.type_line && !c.card.type_line.includes("Land"))
    .forEach(({ card, quantity }) => {
      const cmc = Math.min(card.cmc ?? 0, 7);
      curve[cmc] = (curve[cmc] ?? 0) + quantity;
    });
  return curve;
}

export function colorIdentity(deck: Deck): string[] {
  const colors = new Set<string>();
  deck.cards.forEach(({ card }) => {
    card.color_identity.forEach((c) => colors.add(c));
  });
  return [...colors].sort();
}

export function exportMTGA(deck: Deck): string {
  const main = deck.cards.filter((c) => !c.isSideboard);
  const side = deck.cards.filter((c) => c.isSideboard);
  let out = "";
  if (deck.commander) out += `Commander\n${deck.commander.name}\n\n`;
  out += "Deck\n";
  main.forEach(({ quantity, card }) => (out += `${quantity} ${card.name}\n`));
  if (side.length) {
    out += "\nSideboard\n";
    side.forEach(({ quantity, card }) => (out += `${quantity} ${card.name}\n`));
  }
  return out;
}

export function exportText(deck: Deck): string {
  return exportMTGA(deck);
}

export function newDeck(partial: Partial<Deck> = {}): Deck {
  return {
    id: crypto.randomUUID(),
    name: "New Deck",
    format: "standard",
    description: "",
    cards: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  };
}
