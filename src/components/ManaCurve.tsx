import type { Deck } from "@/lib/deck";
import { manaCurve } from "@/lib/deck";

interface Props { deck: Deck }

export function ManaCurve({ deck }: Props) {
  const curve = manaCurve(deck);
  const max = Math.max(1, ...Object.values(curve));
  const labels = [0, 1, 2, 3, 4, 5, 6, "7+"];

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted uppercase tracking-widest mb-2">Mana Curve</p>
      <div className="flex items-end gap-1 h-20">
        {labels.map((label, i) => {
          const cmc = i === 7 ? 7 : i;
          const count = curve[cmc] ?? 0;
          const height = max > 0 ? (count / max) * 100 : 0;
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
              <span className="text-[10px] text-muted">{count > 0 ? count : ""}</span>
              <div
                className="w-full rounded-sm bg-gradient-to-t from-neon/80 to-neon/30 transition-all duration-300"
                style={{ height: `${height}%`, minHeight: count > 0 ? 4 : 0 }}
              />
              <span className="text-[10px] text-muted">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
