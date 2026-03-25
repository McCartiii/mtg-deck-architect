"use client";
import { useState, useCallback } from "react";
import { newDeck, type Deck, type DeckCard, type Format } from "@/lib/deck";
import type { ScryfallCard } from "@/lib/scryfall";

export function useDeck(initial?: Partial<Deck>) {
  const [deck, setDeck] = useState<Deck>(() => newDeck(initial));

  const addCard = useCallback(
    (card: ScryfallCard, quantity = 1, isSideboard = false) => {
      setDeck((prev) => {
        const existing = prev.cards.find(
          (c) => c.card.id === card.id && c.isSideboard === isSideboard
        );
        if (existing) {
          return {
            ...prev,
            cards: prev.cards.map((c) =>
              c.card.id === card.id && c.isSideboard === isSideboard
                ? { ...c, quantity: c.quantity + quantity }
                : c
            ),
            updatedAt: new Date(),
          };
        }
        return {
          ...prev,
          cards: [...prev.cards, { card, quantity, isSideboard }],
          updatedAt: new Date(),
        };
      });
    },
    []
  );

  const removeCard = useCallback((cardId: string, isSideboard = false) => {
    setDeck((prev) => ({
      ...prev,
      cards: prev.cards.filter(
        (c) => !(c.card.id === cardId && c.isSideboard === isSideboard)
      ),
      updatedAt: new Date(),
    }));
  }, []);

  const updateQuantity = useCallback(
    (cardId: string, quantity: number, isSideboard = false) => {
      if (quantity <= 0) {
        removeCard(cardId, isSideboard);
        return;
      }
      setDeck((prev) => ({
        ...prev,
        cards: prev.cards.map((c) =>
          c.card.id === cardId && c.isSideboard === isSideboard
            ? { ...c, quantity }
            : c
        ),
        updatedAt: new Date(),
      }));
    },
    [removeCard]
  );

  const setName = useCallback((name: string) => {
    setDeck((prev) => ({ ...prev, name, updatedAt: new Date() }));
  }, []);

  const setFormat = useCallback((format: Format) => {
    setDeck((prev) => ({ ...prev, format, updatedAt: new Date() }));
  }, []);

  const setDescription = useCallback((description: string) => {
    setDeck((prev) => ({ ...prev, description, updatedAt: new Date() }));
  }, []);

  const setCommander = useCallback((card: ScryfallCard | undefined) => {
    setDeck((prev) => ({ ...prev, commander: card, updatedAt: new Date() }));
  }, []);

  const clearDeck = useCallback(() => {
    setDeck((prev) => ({ ...prev, cards: [], updatedAt: new Date() }));
  }, []);

  const importCards = useCallback((cards: DeckCard[]) => {
    setDeck((prev) => ({
      ...prev,
      cards,
      updatedAt: new Date(),
    }));
  }, []);

  return {
    deck,
    addCard,
    removeCard,
    updateQuantity,
    setName,
    setFormat,
    setDescription,
    setCommander,
    clearDeck,
    importCards,
  };
}
