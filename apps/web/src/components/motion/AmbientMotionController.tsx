"use client";

import { useEffect } from "react";

const AMBIENT_SELECTOR =
  ".cloud-drift, .rainbow-border, .rainbow-fill, .universe-fx, [data-ambient-purchase]";

/**
 * CSS animations keep ticking even when their cards are far outside the
 * viewport. The roadmap contains several large photographic layers and
 * practice-world effects, so pausing those off-screen animations frees the
 * compositor for the motion the visitor can actually see.
 */
export function AmbientMotionController() {
  useEffect(() => {
    const tracked = new Set<Element>();

    const setRunning = (element: Element, running: boolean) => {
      element.toggleAttribute(
        "data-ambient-paused",
        !running || document.hidden,
      );
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setRunning(entry.target, entry.isIntersecting);
      },
      { rootMargin: "180px 0px" },
    );

    const register = (root: ParentNode) => {
      const elements = root instanceof Element && root.matches(AMBIENT_SELECTOR)
        ? [root]
        : Array.from(root.querySelectorAll(AMBIENT_SELECTOR));

      for (const element of elements) {
        if (tracked.has(element)) continue;
        tracked.add(element);
        observer.observe(element);
      }
    };

    register(document);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof Element) register(node);
        }
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    const syncVisibility = () => {
      for (const element of tracked) {
        if (document.hidden) setRunning(element, false);
        else {
          observer.unobserve(element);
          observer.observe(element);
        }
      }
    };
    document.addEventListener("visibilitychange", syncVisibility);

    return () => {
      document.removeEventListener("visibilitychange", syncVisibility);
      mutations.disconnect();
      observer.disconnect();
      tracked.clear();
    };
  }, []);

  return null;
}
