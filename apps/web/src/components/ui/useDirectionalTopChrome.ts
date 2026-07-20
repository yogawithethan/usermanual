"use client";

import { useEffect, useState } from "react";

interface DirectionalChromeOptions {
  enabled?: boolean;
  forceVisible?: boolean;
}

export function observeDirectionalTopChrome(onHiddenChange: (hidden: boolean) => void) {
  let frame = 0;
  let lastY = window.scrollY;
  let downwardTravel = 0;
  let upwardTravel = 0;
  let hidden = false;

  const update = () => {
    frame = 0;
    const y = Math.max(0, window.scrollY);

    if (document.documentElement.hasAttribute("data-directional-chrome-frozen")) {
      lastY = y;
      downwardTravel = 0;
      upwardTravel = 0;
      return;
    }

    const delta = y - lastY;

    if (delta > 0) {
      downwardTravel += delta;
      upwardTravel = 0;
    } else if (delta < 0) {
      upwardTravel += Math.abs(delta);
      downwardTravel = 0;
    }

    if (y < 40 || upwardTravel >= 1) hidden = false;
    else if (y > 72 && downwardTravel >= 6) hidden = true;

    lastY = y;
    onHiddenChange(hidden);
  };

  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(update);
  };

  const resync = () => {
    lastY = Math.max(0, window.scrollY);
    downwardTravel = 0;
    upwardTravel = 0;
  };

  update();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("directional-chrome-resync", resync);

  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("directional-chrome-resync", resync);
    if (frame) window.cancelAnimationFrame(frame);
  };
}

export function useDirectionalTopChrome({ enabled = true, forceVisible = false }: DirectionalChromeOptions = {}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled || forceVisible) {
      setHidden(false);
      return;
    }
    return observeDirectionalTopChrome(setHidden);
  }, [enabled, forceVisible]);

  return enabled && !forceVisible && hidden;
}
