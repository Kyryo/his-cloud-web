"use client";

import { useEffect, useRef, useState } from "react";

type UseLandingRevealOptions = {
  threshold?: number;
  rootMargin?: string;
};

export function useLandingReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseLandingRevealOptions = {},
) {
  const { threshold = 0.12, rootMargin = "0px 0px -8% 0px" } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref, isVisible };
}
