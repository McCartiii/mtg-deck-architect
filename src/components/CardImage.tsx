"use client";
import Image from "next/image";
import { useState } from "react";
import type { ScryfallCard } from "@/lib/scryfall";
import { getCardImage } from "@/lib/scryfall";

interface Props {
  card: ScryfallCard;
  size?: "small" | "normal" | "large";
  className?: string;
  priority?: boolean;
}

export function CardImage({ card, size = "normal", className = "", priority }: Props) {
  const [flipped, setFlipped] = useState(false);
  const isDoubleFaced = (card.card_faces?.length ?? 0) >= 2;

  const faceCard = isDoubleFaced && flipped
    ? { ...card, image_uris: card.card_faces![1].image_uris }
    : card;

  const src = getCardImage(faceCard, size);

  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={card.name}
        fill
        className="object-contain rounded-lg"
        priority={priority}
        sizes="(max-width: 768px) 180px, 240px"
      />
      {isDoubleFaced && (
        <button
          onClick={() => setFlipped((f) => !f)}
          className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-surface-2/90 border border-border flex items-center justify-center text-xs hover:border-neon transition-colors"
          title="Flip card"
        >
          ↻
        </button>
      )}
    </div>
  );
}
