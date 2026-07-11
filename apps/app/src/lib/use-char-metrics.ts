"use client";

import type { CharMetrics } from "@wiretext/engine";
import { useEffect, useRef, useState } from "react";

export const useCharMetrics = (): CharMetrics | null => {
  const [metrics, setMetrics] = useState<CharMetrics | null>(null);
  const probeRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const measure = () => {
      if (!probeRef.current) {
        const span = document.createElement("span");
        span.style.position = "absolute";
        span.style.visibility = "hidden";
        span.style.whiteSpace = "pre";
        span.style.fontFamily = 'var(--font-mono), "JetBrains Mono", monospace';
        span.style.fontSize = "14px";
        span.style.lineHeight = "1.5";
        span.textContent = "X";
        document.body.append(span);
        probeRef.current = span;
      }

      const rect = probeRef.current.getBoundingClientRect();
      setMetrics({
        charWidth: rect.width,
        lineHeight: rect.height,
      });
    };

    measure();
    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(document.documentElement);
    return () => {
      observer.disconnect();
      if (probeRef.current) {
        probeRef.current.remove();
        probeRef.current = null;
      }
    };
  }, []);

  return metrics;
};
