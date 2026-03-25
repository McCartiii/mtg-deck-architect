export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  colors?: string[];
  color_identity: string[];
  rarity: "common" | "uncommon" | "rare" | "mythic" | "special" | "bonus";
  set: string;
  set_name: string;
  legalities: Record<string, string>;
  prices: {
    usd?: string;
    usd_foil?: string;
    eur?: string;
  };
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    art_crop: string;
  };
  card_faces?: Array<{
    name: string;
    mana_cost?: string;
    type_line: string;
    oracle_text?: string;
    image_uris?: {
      small: string;
      normal: string;
      large: string;
      art_crop: string;
    };
  }>;
}

export interface ScryfallSearchResult {
  data: ScryfallCard[];
  total_cards: number;
  has_more: boolean;
  next_page?: string;
}

const BASE = "https://api.scryfall.com";

export async function searchCards(query: string, page = 1): Promise<ScryfallSearchResult> {
  const url = `${BASE}/cards/search?q=${encodeURIComponent(query)}&page=${page}&order=name`;
  const res = await fetch(url, { headers: { "User-Agent": "MTGDeckArchitect/1.0" } });
  if (!res.ok) {
    if (res.status === 404) return { data: [], total_cards: 0, has_more: false };
    throw new Error(`Scryfall error: ${res.status}`);
  }
  return res.json();
}

export async function getCard(id: string): Promise<ScryfallCard> {
  const res = await fetch(`${BASE}/cards/${id}`, {
    headers: { "User-Agent": "MTGDeckArchitect/1.0" },
  });
  if (!res.ok) throw new Error(`Scryfall error: ${res.status}`);
  return res.json();
}

export async function getCardByName(name: string): Promise<ScryfallCard | null> {
  const res = await fetch(`${BASE}/cards/named?fuzzy=${encodeURIComponent(name)}`, {
    headers: { "User-Agent": "MTGDeckArchitect/1.0" },
  });
  if (!res.ok) return null;
  return res.json();
}

export function getCardImage(card: ScryfallCard, size: "small" | "normal" | "large" | "art_crop" = "normal"): string {
  if (card.image_uris) return card.image_uris[size];
  if (card.card_faces?.[0]?.image_uris) return card.card_faces[0].image_uris[size];
  return "/placeholder-card.png";
}

export function parseManaSymbols(manaCost: string): string[] {
  return [...manaCost.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
}

export function manaSymbolToClass(symbol: string): string {
  const map: Record<string, string> = {
    W: "ms-w", U: "ms-u", B: "ms-b", R: "ms-r", G: "ms-g",
    C: "ms-c", X: "ms-x", T: "ms-tap", Q: "ms-untap",
    "0": "ms-0", "1": "ms-1", "2": "ms-2", "3": "ms-3", "4": "ms-4",
    "5": "ms-5", "6": "ms-6", "7": "ms-7", "8": "ms-8", "9": "ms-9",
    "10": "ms-10", "11": "ms-11", "12": "ms-12",
    "W/U": "ms-wu", "W/B": "ms-wb", "B/R": "ms-br", "B/G": "ms-bg",
    "U/B": "ms-ub", "U/R": "ms-ur", "R/G": "ms-rg", "R/W": "ms-rw",
    "G/W": "ms-gw", "G/U": "ms-gu",
    "2/W": "ms-2w", "2/U": "ms-2u", "2/B": "ms-2b", "2/R": "ms-2r", "2/G": "ms-2g",
    "W/P": "ms-wp", "U/P": "ms-up", "B/P": "ms-bp", "R/P": "ms-rp", "G/P": "ms-gp",
    S: "ms-s", E: "ms-e",
  };
  return map[symbol] ?? "ms-" + symbol.toLowerCase();
}
