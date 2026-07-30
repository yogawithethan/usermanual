import type { CSSProperties } from "react";

const WTFU_DUST = [
  ["39%", "70%", "2px", "11s", "-2s"],
  ["43%", "58%", "1px", "14s", "-9s"],
  ["47%", "68%", "2px", "17s", "-5s"],
  ["51%", "52%", "1px", "13s", "-11s"],
  ["55%", "74%", "2px", "16s", "-7s"],
  ["59%", "61%", "1px", "12s", "-3s"],
  ["45%", "42%", "2px", "18s", "-13s"],
  ["53%", "66%", "1px", "15s", "-6s"],
  ["41%", "48%", "2px", "13s", "-10s"],
  ["49%", "76%", "1px", "18s", "-15s"],
  ["57%", "45%", "2px", "14s", "-8s"],
  ["61%", "72%", "1px", "17s", "-12s"],
  ["36%", "62%", "1px", "15s", "-4s"],
  ["64%", "55%", "2px", "16s", "-14s"],
  ["50%", "36%", "1px", "12s", "-7s"],
  ["46%", "82%", "2px", "19s", "-16s"],
] as const;

export function WtfuAtmosphere({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`universe-fx universe-fx--wtfu ${className}`.trim()}>
      <span className="universe-fx__light-source" />
      <span className="universe-fx__ray universe-fx__ray--one" />
      <span className="universe-fx__ray universe-fx__ray--two" />
      <span className="universe-fx__ray universe-fx__ray--three" />
      {WTFU_DUST.map(([left, top, size, duration, delay], index) => (
        <span
          key={index}
          className="universe-fx__dust"
          style={
            {
              "--fx-left": left,
              "--fx-top": top,
              "--fx-size": size,
              "--fx-duration": duration,
              "--fx-delay": delay,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
