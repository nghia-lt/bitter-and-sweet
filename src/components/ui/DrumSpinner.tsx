'use client';
import { useState, useRef, useEffect, useCallback, ReactNode, useMemo } from 'react';

/**
 * ============================================================
 *  Physics-based Vertical Drum Spinner v3
 * ============================================================
 *
 *  Architecture (fixes focus-window-scrolling bug):
 *
 *    ┌─────────────────────────────┐  ← outer container (overflow:hidden)
 *    │  ┌───────────────────────┐  │
 *    │  │ dim item              │  │  ← scrolling column (translateY)
 *    │  │ dim item              │  │
 *    │  │ ████ VISIBLE ITEM ████│  │  ← item at center row
 *    │  │ dim item              │  │
 *    │  │ dim item              │  │
 *    │  └───────────────────────┘  │
 *    │                             │
 *    │  ╔═══ FOCUS OVERLAY ═════╗  │  ← STATIC absolute overlay
 *    │  ║  ⚡ TIÊU ĐIỂM    ✪  ║  │     Never moves. Just a glowing
 *    │  ║  ◀  content here  ▶  ║  │     window/frame on top.
 *    │  ║  ▬ ● ● ● ●          ║  │
 *    │  ╚═══════════════════════╝  │
 *    └─────────────────────────────┘
 *
 *  Key insight: The focus overlay is a SEPARATE DOM layer.
 *  It sits absolutely positioned at the center row and never
 *  moves. The scrolling list flows BEHIND it. Items are all
 *  uniform height. CSS mask fades the top/bottom edges.
 *
 *  State fix: Uses CSS `transitionend` event listener to
 *  reliably detect animation completion instead of setTimeout.
 * ============================================================
 */

// ── Constants ─────────────────────────────────────────────────
const ITEM_H = 80;
const VISIBLE = 5;
const EXTRA_LOOPS = 5;
const MIN_DURATION = 3.5;
const MAX_DURATION = 5.0;
const EASING = 'cubic-bezier(0.12, 0.82, 0.08, 1.0)';
const BOUNCE_PX = 5;
const BOUNCE_MS = 280;

// ── Types ─────────────────────────────────────────────────────
interface DrumSpinnerProps<T> {
  items: T[];
  /** Render every item uniformly (simple row). Receives isFocus hint (only valid when stopped). */
  renderItem: (item: T, isFocus: boolean, isAdj: boolean, originalIndex: number) => ReactNode;
  /** Optional: render the FOCUS OVERLAY content (the big center card). If omitted, a default glow frame is shown. */
  renderFocusOverlay?: (item: T | null, originalIndex: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  onSpinEnd?: (item: T, index: number) => void;
  spinRef?: React.MutableRefObject<SpinHandle | null>;
}

export interface SpinHandle {
  spin: (targetIndex: number) => void;
  jumpTo: (index: number) => void;
  isSpinning: () => boolean;
}

export function DrumSpinner<T>({
  items, renderItem, renderFocusOverlay, keyExtractor, onSpinEnd, spinRef,
}: DrumSpinnerProps<T>) {
  const N = items.length;
  if (N === 0) return null;

  const repeats = EXTRA_LOOPS + 3;
  const expandedList = useMemo(() => {
    const arr: { item: T; origIdx: number }[] = [];
    for (let r = 0; r < repeats; r++)
      for (let i = 0; i < N; i++)
        arr.push({ item: items[i], origIdx: i });
    return arr;
  }, [items, N, repeats]);

  const [stoppedAt, setStoppedAt] = useState(N);
  const [yOffset, setYOffset] = useState(0);
  const [cssTrans, setCssTrans] = useState('none');
  const [blur, setBlur] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'main' | 'bounce' | 'settle'>('idle');

  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pendingLand = useRef<{ pos: number; targetIdx: number; targetY: number } | null>(null);

  const windowH = VISIBLE * ITEM_H;
  const topPad = Math.floor(VISIBLE / 2) * ITEM_H;

  const calcY = useCallback((pos: number) => -(pos * ITEM_H - topPad), [topPad]);

  // Init
  useEffect(() => { setYOffset(calcY(stoppedAt)); }, []);

  // Cleanup
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const addTimer = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  // ── CSS transitionend handler (reliable state reset) ──
  const handleTransitionEnd = useCallback((e: React.TransitionEvent) => {
    if (e.propertyName !== 'transform') return;
    const land = pendingLand.current;
    if (!land) return;

    if (phase === 'main') {
      // Main spin done → bounce
      setPhase('bounce');
      setCssTrans(`transform ${BOUNCE_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1)`);
      setYOffset(land.targetY + BOUNCE_PX);
    } else if (phase === 'bounce') {
      // Bounce done → settle
      setPhase('settle');
      setCssTrans('transform 0.14s ease-out');
      setYOffset(land.targetY);
    } else if (phase === 'settle') {
      // All done!
      setStoppedAt(land.pos);
      setSpinning(false);
      setPhase('idle');
      setCssTrans('none');
      setBlur(0);
      pendingLand.current = null;
      onSpinEnd?.(items[land.targetIdx], land.targetIdx);
    }
  }, [phase, items, onSpinEnd]);

  // ── Imperative handle ──
  useEffect(() => {
    if (!spinRef) return;
    spinRef.current = {
      spin: (targetIndex: number) => {
        if (spinning) return;
        setSpinning(true);

        timers.current.forEach(clearTimeout);
        timers.current = [];

        const currentLoop = Math.floor(stoppedAt / N);
        const landPos = (currentLoop + EXTRA_LOOPS) * N + targetIndex;
        const targetY = calcY(landPos);
        const duration = MIN_DURATION + Math.random() * (MAX_DURATION - MIN_DURATION);

        pendingLand.current = { pos: landPos, targetIdx: targetIndex, targetY };

        // Motion blur
        setBlur(4);
        const blurEnd = duration * 0.45 * 1000;
        for (let s = 1; s <= 6; s++) {
          const t = (s / 6) * blurEnd;
          addTimer(() => setBlur(4 * (1 - s / 6)), t);
        }

        // Kick off main transition
        setPhase('main');
        setCssTrans(`transform ${duration}s ${EASING}`);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setYOffset(targetY);
          });
        });
      },

      jumpTo: (index: number) => {
        if (spinning) return;
        const newPos = N + index;
        setCssTrans('none');
        setStoppedAt(newPos);
        requestAnimationFrame(() => setYOffset(calcY(newPos)));
      },

      isSpinning: () => spinning,
    };
  }, [spinning, stoppedAt, N, items, calcY, spinRef]);

  // ── Which item is at center when stopped ──
  const focusedItem = !spinning ? items[stoppedAt % N] : null;
  const focusedOrigIdx = stoppedAt % N;

  return (
    <div className="relative" style={{ height: windowH }}>
      {/* Layer 1: SCROLLING LIST (behind) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
        }}
      >
        <div
          ref={scrollRef}
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translateY(${yOffset}px)`,
            transition: cssTrans,
            filter: blur > 0 ? `blur(${blur}px)` : 'none',
            willChange: 'transform',
          }}
        >
          {expandedList.map(({ item, origIdx }, i) => {
            const dist = i - stoppedAt;
            const abs = Math.abs(dist);
            const isFocus = !spinning && dist === 0;
            const isAdj = !spinning && abs === 1;

            let opacity: number;
            if (spinning) {
              opacity = 0.55;
            } else {
              opacity = isFocus ? 1 : isAdj ? 0.4 : abs === 2 ? 0.15 : 0.06;
            }

            const render = abs <= 8 || spinning;

            return (
              <div
                key={`${keyExtractor(item, origIdx)}-${i}`}
                style={{
                  height: ITEM_H,
                  opacity: render ? opacity : 0,
                  transition: spinning ? 'none' : 'opacity 0.4s ease',
                }}
              >
                {render && renderItem(item, isFocus, isAdj, origIdx)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Layer 2: FOCUS OVERLAY (static, never moves) */}
      {!spinning && renderFocusOverlay && focusedItem && (
        <div
          className="absolute left-0 right-0 pointer-events-none z-10"
          style={{ top: topPad, height: ITEM_H }}
        >
          {renderFocusOverlay(focusedItem, focusedOrigIdx)}
        </div>
      )}

      {/* Fallback: simple glow frame if no custom overlay */}
      {!renderFocusOverlay && !spinning && (
        <div
          className="absolute left-0 right-0 pointer-events-none z-10"
          style={{
            top: topPad - 2,
            height: ITEM_H + 4,
            borderRadius: 16,
            border: '1.5px solid rgba(168,85,247,0.5)',
            boxShadow: '0 0 20px rgba(168,85,247,0.35), inset 0 0 14px rgba(168,85,247,0.1)',
          }}
        />
      )}

      {/* Spinning glow frame (pulsing) */}
      {spinning && (
        <div
          className="absolute left-0 right-0 pointer-events-none z-10 animate-pulse"
          style={{
            top: topPad - 2,
            height: ITEM_H + 4,
            borderRadius: 16,
            border: '1.5px solid rgba(168,85,247,0.3)',
            boxShadow: '0 0 14px rgba(168,85,247,0.2)',
          }}
        />
      )}
    </div>
  );
}

// ── Hook ──────────────────────────────────────────────────────
export function useDrumSpin() {
  const ref = useRef<SpinHandle | null>(null);
  const spin = useCallback((idx: number) => ref.current?.spin(idx), []);
  const jumpTo = useCallback((idx: number) => ref.current?.jumpTo(idx), []);
  return { spinRef: ref, spin, jumpTo };
}
