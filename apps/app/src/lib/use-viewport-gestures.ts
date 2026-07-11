import { useGesture } from "@use-gesture/react";
import { useEffect, useRef } from "react";

import { useEditorStore } from "@/store";

/**
 * Centralised viewport gesture handling via @use-gesture/react.
 *
 * Normalises scroll-to-pan, pinch-to-zoom (Safari GestureEvent + Chrome
 * ctrl+wheel), space+drag pan, and middle-click pan across all browsers.
 *
 * Returns `bind` (spread onto the overlay div), plus stable refs that canvas
 * reads to guard tool dispatch.
 */
export const useViewportGestures = () => {
  const isPanning = useRef(false);
  const spaceHeld = useRef(false);

  const panViewport = useEditorStore((s) => s.panViewport);
  const zoomViewport = useEditorStore((s) => s.zoomViewport);

  // --- Space key tracking (skip when focus is in a text input) -----------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        const { target } = e;
        if (target instanceof HTMLElement) {
          const isFormTag =
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT";
          if (isFormTag || target.isContentEditable) {
            return;
          }
        }
        spaceHeld.current = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceHeld.current = false;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const bind = useGesture(
    {
      // Space+left-click or middle-click → pan.
      // For any other drag, cancel immediately so mouse events reach tools.
      onDrag: ({ first, delta: [dx, dy], cancel, buttons, event }) => {
        if (first) {
          const isMiddle = buttons === 4;
          const isSpaceDrag = buttons === 1 && spaceHeld.current;
          if (!(isMiddle || isSpaceDrag)) {
            cancel();
            return;
          }
          isPanning.current = true;
          event.preventDefault();
        }

        panViewport(dx, dy);
      },

      onDragEnd: () => {
        isPanning.current = false;
      },

      // Safari trackpad pinch (GestureEvent) + Chrome ctrl+wheel fallback.
      // The library's `da` field gives [distance, angle]; `delta` gives the
      // frame-to-frame change. We use `offset` which accumulates from the
      // gesture start so we can derive a smooth multiplicative delta.
      onPinch: ({ event, offset: [scale], memo }) => {
        event?.preventDefault();
        const prevScale = typeof memo === "number" ? memo : 1;
        const delta = scale - prevScale;

        if ("clientX" in event) {
          const node = event.currentTarget ?? event.target;
          const rect =
            node instanceof Element
              ? node.closest("[data-gesture-root]")
              : null;
          if (rect) {
            const bounds = rect.getBoundingClientRect();
            const centerX = event.clientX - bounds.left;
            const centerY = event.clientY - bounds.top;
            zoomViewport(delta * 0.5, centerX, centerY);
          }
        }

        // memo for next frame
        return scale;
      },

      // Scroll-to-pan + ctrl/cmd+scroll zoom
      onWheel: ({ event, delta: [dx, dy], ctrlKey }) => {
        event.preventDefault();
        if (ctrlKey || event.metaKey) {
          const node = event.currentTarget ?? event.target;
          const target = node instanceof Element ? node : null;
          const rect = target?.getBoundingClientRect();
          const centerX = rect ? event.clientX - rect.left : event.clientX;
          const centerY = rect ? event.clientY - rect.top : event.clientY;
          zoomViewport(-dy * 0.005, centerX, centerY);
        } else {
          panViewport(-dx, -dy);
        }
      },
    },
    {
      drag: {
        // Listen for left-button (1) and middle-button (4)
        filterTaps: true,
        pointer: { buttons: [1, 4] },
      },
      pinch: {
        eventOptions: { passive: false },
      },
      wheel: {
        eventOptions: { passive: false },
      },
    }
  );

  return { bind, isPanning, spaceHeld };
};
