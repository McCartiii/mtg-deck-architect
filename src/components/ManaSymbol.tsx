import { manaSymbolToClass, parseManaSymbols } from "@/lib/scryfall";

interface Props {
  manaCost: string;
  size?: "sm" | "md" | "lg";
}

const sizeClass = { sm: "text-sm", md: "text-base", lg: "text-lg" };

export function ManaSymbol({ manaCost, size = "md" }: Props) {
  const symbols = parseManaSymbols(manaCost);
  return (
    <span className="inline-flex items-center gap-0.5">
      {symbols.map((sym, i) => (
        <i
          key={i}
          className={`ms ms-cost ${manaSymbolToClass(sym)} ${sizeClass[size]}`}
          title={sym}
        />
      ))}
    </span>
  );
}
