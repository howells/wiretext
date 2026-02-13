"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CharMetrics } from "@/engine/types";

export function useCharMetrics(): CharMetrics | null {
  const [metrics, setMetrics] = useState<CharMetrics | null>(null);
  const probeRef = useRef<HTMLSpanElement | null>(null);

  const measure = useCallback(() => {
    if (!probeRef.current) {
      const span = document.createElement("span");
      span.style.position = "absolute";
      span.style.visibility = "hidden";
      span.style.whiteSpace = "pre";
      span.style.fontFamily = 'var(--font-mono), "JetBrains Mono", monospace';
      span.style.fontSize = "14px";
      span.style.lineHeight = "1.5";
      span.textContent = "X";
      document.body.appendChild(span);
      probeRef.current = span;
    }

    const rect = probeRef.current.getBoundingClientRect();
    setMetrics({
      charWidth: rect.width,
      lineHeight: rect.height,
    });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      if (probeRef.current) {
        document.body.removeChild(probeRef.current);
        probeRef.current = null;
      }
    };
  }, [measure]);

  return metrics;
}
