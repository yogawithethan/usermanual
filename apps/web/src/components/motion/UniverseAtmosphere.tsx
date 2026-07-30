import type { CSSProperties } from "react";
import type { PracticeUniverse } from "@islands/content";

import { PranaLightningField } from "./PranaLightning";
import { WtfuAtmosphere } from "./WtfuAtmosphere";

function seededUnit(index: number, salt: number) {
  return Math.abs(Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453) % 1;
}

const GY_PARTICLES = Array.from({ length: 74 }, (_, index) => {
  const left = 4 + seededUnit(index, 1) * 92;
  const top = 10 + seededUnit(index, 2) * 78;
  const size = 0.2 + seededUnit(index, 3) * 0.8;
  const duration = 34 + seededUnit(index, 4) * 34;
  const delay = -seededUnit(index, 5) * duration;
  const attract = index % 4 === 0 ? -1 : 1;
  const dx = (50 - left) * (0.035 + seededUnit(index, 6) * 0.085) * attract;
  const dy = (50 - top) * (0.035 + seededUnit(index, 7) * 0.085) * attract;
  const opacity = seededUnit(index, 15) * 0.7;

  return [
    `${left.toFixed(1)}%`,
    `${top.toFixed(1)}%`,
    `${size.toFixed(2)}px`,
    `${duration.toFixed(1)}s`,
    `${delay.toFixed(1)}s`,
    `${dx.toFixed(1)}px`,
    `${dy.toFixed(1)}px`,
    `${(dx * 0.64).toFixed(1)}px`,
    `${(dy * 0.64).toFixed(1)}px`,
    opacity.toFixed(2),
  ] as const;
});

const H2T_EDGE_PARTICLES = Array.from({ length: 118 }, (_, index) => {
  const side = index % 4;
  const along = 3 + seededUnit(index, 8) * 94;
  const inset = seededUnit(index, 9) * 16;
  const left = side === 0 || side === 1 ? along : side === 2 ? 4 + inset : 96 - inset;
  const top = side === 2 || side === 3 ? along : side === 0 ? 5 + inset : 95 - inset;
  const size = seededUnit(index, 10) > 0.78 ? 2.5 : seededUnit(index, 11) > 0.42 ? 2 : 1.25;
  const duration = 0.32 + seededUnit(index, 12) * 0.28;
  const delay = -seededUnit(index, 13) * 0.8;
  const opacity = 0.18 + seededUnit(index, 14) * 0.5;

  return [
    `${left.toFixed(1)}%`,
    `${top.toFixed(1)}%`,
    `${size}px`,
    `${duration.toFixed(2)}s`,
    `${delay.toFixed(2)}s`,
    opacity.toFixed(2),
  ] as const;
});

export function UniverseAtmosphere({
  className = "",
  paused = false,
  slug,
}: {
  className?: string;
  paused?: boolean;
  slug: PracticeUniverse["slug"];
}) {
  const classes = (...values: string[]) => values.filter(Boolean).join(" ");

  if (paused) {
    const staticClass = {
      "wake-the-fck-up": "universe-fx--wtfu",
      "prana-fusion": "universe-fx--pf",
      "yoga-reset": "universe-fx--yr",
      "gravity-yoga": "universe-fx--gy",
      "here-to-there": "universe-fx--h2t",
    }[slug];

    return staticClass ? (
      <span
        aria-hidden
        className={classes("universe-fx", "universe-fx--static", staticClass, className)}
        data-ambient-paused=""
        style={{ animation: "none" }}
      />
    ) : null;
  }

  if (slug === "wake-the-fck-up") return <WtfuAtmosphere className={className} />;

  if (slug === "prana-fusion") {
    return (
      <PranaLightningField
        className={classes("universe-fx", "universe-fx--pf", className)}
        firstClassName="universe-fx__lottie universe-fx__lottie--one"
        secondClassName="universe-fx__lottie universe-fx__lottie--two"
      />
    );
  }

  if (slug === "yoga-reset") {
    return <span aria-hidden className={classes("universe-fx", "universe-fx--yr", className)} />;
  }

  if (slug === "gravity-yoga") {
    return (
      <span aria-hidden className={classes("universe-fx", "universe-fx--gy", className)}>
        {GY_PARTICLES.map(([left, top, size, duration, delay, dx, dy, midDx, midDy, opacity], index) => (
          <span
            key={index}
            className="universe-fx__particle universe-fx__particle--gy"
            style={{
              "--fx-left": left,
              "--fx-top": top,
              "--fx-size": size,
              "--fx-duration": duration,
              "--fx-delay": delay,
              "--fx-dx": dx,
              "--fx-dy": dy,
              "--fx-mid-dx": midDx,
              "--fx-mid-dy": midDy,
              "--fx-opacity": opacity,
            } as CSSProperties}
          />
        ))}
      </span>
    );
  }

  if (slug === "here-to-there") {
    return (
      <span aria-hidden className={classes("universe-fx", "universe-fx--h2t", className)}>
        {H2T_EDGE_PARTICLES.map(([left, top, size, duration, delay, opacity], index) => (
          <span
            key={index}
            className="universe-fx__particle universe-fx__particle--edge"
            style={{
              "--fx-left": left,
              "--fx-top": top,
              "--fx-size": size,
              "--fx-duration": duration,
              "--fx-delay": delay,
              "--fx-opacity": opacity,
            } as CSSProperties}
          />
        ))}
      </span>
    );
  }

  return null;
}
