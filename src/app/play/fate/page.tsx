'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { FATE_CONFIG, FATE_WEIGHTS } from '@/lib/constants';
import type { FateType, Player } from '@/lib/types';

// ── Config for each fate ──────────────────────────────────────
const FATE_META: Record<FateType, { icon: string; label: string; color: string; glow: string; textColor: string }> = {
  CAM_CHIU:  { icon: '😩', label: 'CAM CHỊU',  color: '#374151', glow: 'rgba(107,114,128,0.5)', textColor: '#9CA3AF' },
  CHET_CHUM: { icon: '💀', label: 'CHẾT CHÙM', color: '#164E63', glow: 'rgba(6,182,212,0.5)',   textColor: '#22D3EE' },
  THOAT_KIP: { icon: '🏃', label: 'THOÁT KÍP', color: '#14532D', glow: 'rgba(34,197,94,0.5)',  textColor: '#4ADE80' },
  KIM_THIEN: { icon: '✨', label: 'KIM THIỀN', color: '#713F12', glow: 'rgba(234,179,8,0.5)',  textColor: '#FACC15' },
};

// Build weighted pool: 83×CAM_CHIU, 10×CHET_CHUM, 5×THOAT_KIP, 2×KIM_THIEN
// Shuffle so rare fates are spread out → animation looks dynamic
function buildShuffledPool(): FateType[] {
  const pool: FateType[] = Object.entries(FATE_WEIGHTS).flatMap(
    ([fate, weight]) => Array(weight).fill(fate as FateType)
  );
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}
// NOTE: built once per module load; client-only so no hydration issue
const FATE_POOL: FateType[] = buildShuffledPool();

// ── Drum item ─────────────────────────────────────────────────
function FateItem({
  fate,
  offset,
  index,
}: {
  fate: FateType;
  offset: number;
  index: number;
}) {
  const meta = FATE_META[fate];
  const abs = Math.abs(offset);
  const cfg = FATE_CONFIG[fate];

  if (offset === 0) {
    return (
      <div
        className="relative rounded-2xl mx-1 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${meta.color}33, #0D0D2B)`,
          border: `1.5px solid ${meta.textColor}80`,
          boxShadow: `0 0 20px ${meta.glow}, 0 0 6px ${meta.glow}`,
          padding: '16px 18px 14px',
        }}
      >
        {/* shimmer */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `linear-gradient(105deg,transparent 40%,${meta.glow}20 50%,transparent 60%)`, animation: 'shimmer 3s infinite' }} />

        {/* Top row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
            style={{ background: `${meta.textColor}22`, color: meta.textColor }}>
            ⚡ TIÊU ĐIỂM
          </span>
          <span style={{ color: meta.textColor }} className="text-sm">✪</span>
        </div>

        {/* Main */}
        <div className="flex items-center gap-3 my-1">
          <span style={{ color: meta.textColor }} className="text-xl font-bold select-none">◀</span>
          <span className="text-4xl">{meta.icon}</span>
          <p className="flex-1 font-black text-2xl leading-snug" style={{ color: meta.textColor }}>
            {meta.label}
          </p>
          <span style={{ color: meta.textColor }} className="text-xl font-bold select-none">▶</span>
        </div>

        {/* Sub-label */}
        <p className="text-xs text-gray-500 mt-1 italic ml-1">{cfg.description}</p>

        {/* Progress dots */}
        <div className="flex items-center gap-1 mt-3">
          <div className="h-1.5 w-6 rounded-full" style={{ background: meta.textColor }} />
          {[1,2,3,4].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-gray-700" />)}
        </div>
      </div>
    );
  }

  const opacity = abs === 1 ? 0.38 : 0.14;
  const scale = abs === 1 ? 0.95 : 0.87;

  return (
    <div style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.12s' }}>
      <div className="rounded-xl mx-2 flex items-center gap-3 px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', minHeight: 52 }}>
        {abs === 1 && (
          <p className="text-xs text-gray-600 font-semibold uppercase tracking-widest min-w-16">
            {cfg.probability}%
          </p>
        )}
        <span className="text-xl">{meta.icon}</span>
        <span className="text-gray-400 text-sm font-semibold">{meta.label}</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function FatePage() {
  const router = useRouter();
  const { gameState, updateState } = useGameState();

  const victim = gameState.members.find(m => m.id === gameState.currentVictimId);
  const otherPlayers = gameState.members.filter(m => m.id !== gameState.currentVictimId);

  const [phase, setPhase] = useState<'idle' | 'spinning' | 'result'>('idle');
  const [focusIdx, setFocusIdx] = useState(0);
  const [result, setResult] = useState<FateType | null>(null);
  const [mounted, setMounted] = useState(false);
  const tickRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => () => { if (tickRef.current) clearTimeout(tickRef.current); }, []);

  const wrap = (i: number) => ((i % FATE_POOL.length) + FATE_POOL.length) % FATE_POOL.length;

  /* Spin animation */
  const handleSpin = useCallback(() => {
    if (phase === 'spinning') return;

    // Pick random result weighted by pool
    const landFate = FATE_POOL[Math.floor(Math.random() * FATE_POOL.length)];
    // Find an index in pool that has this fate
    const candidateIdxs = FATE_POOL.map((f, i) => f === landFate ? i : -1).filter(i => i >= 0);
    const landIdx = candidateIdxs[Math.floor(Math.random() * candidateIdxs.length)];

    const totalTicks = 40 + Math.floor(Math.random() * 12);
    const fastEnd = Math.floor(totalTicks * 0.55);
    let tick = 0;

    setPhase('spinning');

    const step = () => {
      tick++;
      setFocusIdx(prev => wrap(prev + 1));

      if (tick >= totalTicks) {
        setFocusIdx(landIdx);
        setResult(landFate);
        setTimeout(() => setPhase('result'), 400);
        return;
      }

      const t = Math.max(0, (tick - fastEnd) / (totalTicks - fastEnd));
      const delay = tick < fastEnd ? 50 : 50 + t * t * 400;
      tickRef.current = setTimeout(step, delay);
    };

    tickRef.current = setTimeout(step, 50);
  }, [phase]);

  /* Handlers */
  const handleCoVictim = (p: Player) => {
    updateState({ currentPenalties: gameState.currentPenalties });
    router.push('/result');
  };

  const handleNewVictim = (p: Player) => {
    updateState({ currentVictimId: p.id });
    router.push('/result');
  };

  const handleDirectNext = () => router.push('/result');

  /* Drum display */
  const drum = mounted
    ? [-2, -1, 0, 1, 2].map(off => ({ off, fate: FATE_POOL[wrap(focusIdx + off)] }))
    : [];

  const resultMeta = result ? FATE_META[result] : null;

  return (
    <main
      className="flex flex-col min-h-screen overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 40%, #1a0a33 0%, #0F0F1A 60%, #0a0a12 100%)' }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full border border-purple-700/40" />
          <div className="absolute inset-1 rounded-full border border-purple-600/30" />
          <div className="absolute inset-2 rounded-full border border-purple-500/20" />
          <div className="w-3 h-3 rounded-full bg-purple-600" style={{ boxShadow: '0 0 8px #A855F7' }} />
        </div>
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-base">🎭</span>
            <span className="font-black text-base tracking-wider text-white">NHÂN PHẨM</span>
          </div>
          <p className="text-xs font-bold tracking-widest"
            style={{ background: 'linear-gradient(90deg,#A855F7,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VÒNG QUAY NHÂN PHẨM
          </p>
        </div>
        <div className="w-10 h-10" />
      </div>

      {/* Victim */}
      <div className="px-5 pb-2 shrink-0">
        <p className="text-sm text-gray-300">
          Số phận của{' '}
          <span className="font-black" style={{ color: '#F472B6', textShadow: '0 0 8px rgba(244,114,182,0.6)' }}>
            {victim?.name ?? 'Nạn Nhân'} {victim?.emoji ?? '👤'}
          </span>
          {' '}chưa kết thúc đâu...{' '}
          <span style={{ filter: 'drop-shadow(0 0 4px #A855F7)' }}>🎭</span>
        </p>
      </div>

      {/* Drum */}
      <div className="flex-1 flex flex-col justify-center py-2">
        <div className="flex flex-col gap-2 py-1"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
          }}
        >
          {drum.map(({ off, fate }, i) => (
            <FateItem key={`${i}-${fate}-${off}`} fate={fate} offset={off} index={i} />
          ))}
        </div>

        {/* Post-result: pick player */}
        {phase === 'result' && result === 'CHET_CHUM' && (
          <div className="px-4 mt-3 space-y-2">
            <p className="text-xs text-cyan-400 font-bold text-center uppercase tracking-widest">
              💀 Chọn người chết chung với {victim?.name}:
            </p>
            {otherPlayers.map(p => (
              <button key={p.id} onClick={() => handleCoVictim(p)}
                className="w-full glass border border-cyan-500/30 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-cyan-500 transition active:scale-95">
                <span className="text-2xl">{p.emoji}</span>
                <span className="text-white font-semibold">{p.name}</span>
              </button>
            ))}
          </div>
        )}

        {phase === 'result' && result === 'THOAT_KIP' && (
          <div className="px-4 mt-3 space-y-2">
            <p className="text-xs text-green-400 font-bold text-center uppercase tracking-widest">
              🏃 Chọn nạn nhân mới:
            </p>
            {gameState.members.map(p => (
              <button key={p.id} onClick={() => handleNewVictim(p)}
                className="w-full glass border border-green-500/30 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-green-500 transition active:scale-95">
                <span className="text-2xl">{p.emoji}</span>
                <span className="text-white font-semibold">{p.name}</span>
              </button>
            ))}
          </div>
        )}

        {phase === 'result' && result === 'KIM_THIEN' && (
          <div className="px-4 mt-3 space-y-2">
            <p className="text-xs text-yellow-400 font-bold text-center uppercase tracking-widest">
              ✨ Chọn kẻ thế mạng:
            </p>
            {otherPlayers.map(p => (
              <button key={p.id} onClick={() => handleNewVictim(p)}
                className="w-full glass border border-yellow-500/30 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-yellow-500 transition active:scale-95">
                <span className="text-2xl">{p.emoji}</span>
                <span className="text-white font-semibold">{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-6 pt-3 shrink-0 space-y-3" style={{ borderTop: '1px solid rgba(168,85,247,0.1)' }}>
        <p className="text-center text-xs tracking-widest uppercase" style={{ color: 'rgba(156,163,175,0.5)' }}>
          Số phận chưa kết thúc ở đây đâu... 🎭
        </p>

        {phase === 'idle' && (
          <button
            onClick={handleSpin}
            className="w-full py-4 rounded-full font-black text-white text-base active:scale-95 transition"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 40%, #EC4899 100%)', boxShadow: '0 4px 24px rgba(168,85,247,0.55)' }}
          >
            🎭 Quay Nhân Phẩm!
          </button>
        )}

        {phase === 'spinning' && (
          <div className="text-center py-2">
            <p className="text-purple-400 font-bold animate-pulse">🌀 Đang định đoạt nhân phẩm...</p>
          </div>
        )}

        {phase === 'result' && result === 'CAM_CHIU' && (
          <button
            onClick={handleDirectNext}
            className="w-full py-4 rounded-full font-black text-white text-base active:scale-95 transition"
            style={{ background: 'linear-gradient(135deg,#374151,#1F2937)', boxShadow: '0 4px 20px rgba(107,114,128,0.4)', border: '1px solid rgba(156,163,175,0.3)' }}
          >
            😩 Cam Chịu... tiếp thôi
          </button>
        )}
      </div>
    </main>
  );
}
