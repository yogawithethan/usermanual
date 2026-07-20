import type { ReactNode } from "react";

import lightningLottie from "@/data/lightning-lottie.json";

type LottieShape = {
  i: [number, number][];
  o: [number, number][];
  v: [number, number][];
  c: boolean;
};

type LottieItem = {
  ty: string;
  it?: LottieItem[];
  ks?: { k?: LottieShape };
  c?: { k?: number[] };
  o?: { k?: number };
  p?: { k?: number[] };
  a?: { k?: number[] };
  s?: { k?: number[] };
  r?: { k?: number };
};

type LottieLayer = {
  ip: number;
  op: number;
  shapes?: LottieItem[];
  ks?: {
    p?: { k?: number[] };
    a?: { k?: number[] };
    s?: { k?: number[] };
    r?: { k?: number };
    o?: { k?: number };
  };
};

export function PranaLightningField({
  className,
  firstClassName,
  secondClassName,
}: {
  className: string;
  firstClassName: string;
  secondClassName: string;
}) {
  return (
    <span aria-hidden className={className} data-prana-lightning="lottie">
      <LottieLightning
        className={firstClassName}
        playDuration={3.7}
        cycleDuration={9.8}
        begin="-1.9s"
      />
      <LottieLightning
        className={secondClassName}
        playDuration={3.33}
        cycleDuration={12.7}
        begin="-7.2s"
      />
    </span>
  );
}

function LottieLightning({
  className,
  playDuration,
  cycleDuration,
  begin,
}: {
  className: string;
  playDuration: number;
  cycleDuration: number;
  begin: string;
}) {
  const layers = (lightningLottie.layers as LottieLayer[])
    .slice()
    .sort((first, second) => first.ip - second.ip);

  return (
    <svg
      viewBox={`0 0 ${lightningLottie.w} ${lightningLottie.h}`}
      className={className}
      fill="none"
      preserveAspectRatio="none"
    >
      {layers.map((layer, index) => (
        <g key={`${layer.ip}-${index}`} opacity="0" transform={lottieTransform(layer.ks)}>
          <animate
            attributeName="opacity"
            dur={`${cycleDuration}s`}
            begin={begin}
            repeatCount="indefinite"
            calcMode="discrete"
            keyTimes={lottieKeyTimes(
              layer.ip,
              layers[index + 1]?.ip ?? layer.op,
              playDuration / cycleDuration,
            )}
            values="0;1;0;0;0"
          />
          {renderLottieItems(layer.shapes ?? [], `${index}`)}
        </g>
      ))}
    </svg>
  );
}

function renderLottieItems(
  items: LottieItem[],
  keyPrefix: string,
  inheritedFill = "currentColor",
): ReactNode[] {
  return items.flatMap((item, index) => {
    if (item.ty !== "gr") return [];

    const children = item.it ?? [];
    const transform = children.find((child) => child.ty === "tr");
    const fill = children.find((child) => child.ty === "fl");
    const fillColor = fill?.c?.k ? lottieColor(fill.c.k) : inheritedFill;
    const paths = children.filter((child) => child.ty === "sh");
    const groups = children.filter((child) => child.ty === "gr");

    return [
      <g key={`${keyPrefix}-${index}`} transform={lottieTransform(transform)}>
        {paths.map((path, pathIndex) => (
          <path
            key={`${keyPrefix}-${index}-path-${pathIndex}`}
            d={lottiePath(path.ks?.k)}
            fill={fillColor}
            fillOpacity={(fill?.o?.k ?? 100) / 100}
          />
        ))}
        {renderLottieItems(groups, `${keyPrefix}-${index}`, fillColor)}
      </g>,
    ];
  });
}

function lottiePath(shape?: LottieShape) {
  if (!shape || shape.v.length === 0) return "";

  const points = shape.v;
  const outTangents = shape.o;
  const inTangents = shape.i;
  let path = `M ${points[0][0]} ${points[0][1]}`;
  const segmentCount = shape.c ? points.length : points.length - 1;

  for (let index = 0; index < segmentCount; index += 1) {
    const nextIndex = (index + 1) % points.length;
    const current = points[index];
    const next = points[nextIndex];
    const out = outTangents[index];
    const input = inTangents[nextIndex];
    path += ` C ${current[0] + out[0]} ${current[1] + out[1]} ${next[0] + input[0]} ${next[1] + input[1]} ${next[0]} ${next[1]}`;
  }

  return shape.c ? `${path} Z` : path;
}

function lottieTransform(transform?: LottieItem | LottieLayer["ks"]) {
  if (!transform) return undefined;

  const position = transform.p?.k ?? [0, 0];
  const anchor = transform.a?.k ?? [0, 0];
  const scale = transform.s?.k ?? [100, 100];
  const rotation = transform.r?.k ?? 0;

  return [
    `translate(${position[0]} ${position[1]})`,
    `rotate(${rotation})`,
    `scale(${scale[0] / 100} ${scale[1] / 100})`,
    `translate(${-anchor[0]} ${-anchor[1]})`,
  ].join(" ");
}

function lottieColor(color: number[]) {
  const [r, g, b, a = 1] = color;
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
}

function lottieKeyTimes(ip: number, op: number, activeWindow: number) {
  const activeEnd = Math.max(0.05, Math.min(0.95, activeWindow));
  const start = Math.max(0.001, Math.min(activeEnd - 0.002, (ip / lightningLottie.op) * activeEnd));
  const end = Math.max(start + 0.001, Math.min(activeEnd - 0.001, (op / lightningLottie.op) * activeEnd));
  return `0;${start.toFixed(3)};${end.toFixed(3)};${activeEnd.toFixed(3)};1`;
}
