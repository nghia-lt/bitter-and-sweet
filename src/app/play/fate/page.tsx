'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { DrumSpinner, useDrumSpin } from '@/components/ui/DrumSpinner';
import { FATE_CONFIG, FATE_WEIGHTS } from '@/lib/constants';
import type { FateType, Player } from '@/lib/types';

const FATE_META: Record<FateType, { icon: string; label: string; glow: string; textColor: string }> = {
  CAM_CHIU:  { icon: '😩', label: 'CAM CHỊU',  glow: 'rgba(107,114,128,0.5)', textColor: '#9CA3AF' },
  CHET_CHUM: { icon: '💀', label: 'CHẾT CHÙM', glow: 'rgba(6,182,212,0.5)',   textColor: '#22D3EE' },
  THOAT_KIP: { icon: '🏃', label: 'THOÁT KÍP', glow: 'rgba(34,197,94,0.5)',  textColor: '#4ADE80' },
  KIM_THIEN: { icon: '✨', label: 'KIM THIỀN', glow: 'rgba(234,179,8,0.5)',  textColor: '#FACC15' },
};

function buildShuffledPool(): FateType[] {
  const pool: FateType[] = Object.entries(FATE_WEIGHTS).flatMap(
    ([fate, weight]) => Array(weight).fill(fate as FateType)
  );
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

// ── Uniform row ───────────────────────────────────────────────
function FateRow(fate: FateType, _isFocus: boolean, _isAdj: boolean, _idx: number) {
  const m = FATE_META[fate];
  return (
    <div className="flex items-center gap-3 px-5 h-full">
      <span className="text-2xl">{m.icon}</span>
      <span className="text-white font-semibold text-sm">{m.label}</span>
      <span className="text-xs text-gray-600 ml-auto">{FATE_CONFIG[fate].probability}%</span>
    </div>
  );
}

// ── Focus overlay ─────────────────────────────────────────────
function FateFocusOverlay(fate: FateType | null, idx: number) {
  if (!fate) return null;
  const m = FATE_META[fate];
  const cfg = FATE_CONFIG[fate];
  return (
    <div className="h-full mx-1 rounded-2xl overflow-hidden relative pointer-events-none"
      style={{
        background: `linear-gradient(135deg, rgba(15,15,26,0.95), rgba(13,13,43,0.95))`,
        border: `1.5px solid ${m.textColor}80`,
        boxShadow: `0 0 20px ${m.glow}, 0 0 6px ${m.glow}`,
        padding: '8px 16px',
      }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(105deg,transparent 40%,${m.glow}20 50%,transparent 60%)`, animation: 'shimmer 3s infinite' }} />
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
          style={{ background: `${m.textColor}22`, color: m.textColor }}>
          ⚡ TIÊU ĐIỂM
        </span>
        <span style={{ color: m.textColor }} className="text-sm">✪</span>
      </div>
      <div className="flex items-center gap-3">
        <span style={{ color: m.textColor }} className="text-lg font-bold select-none">◀</span>
        <span className="text-3xl">{m.icon}</span>
        <p className="flex-1 font-black text-xl leading-snug" style={{ color: m.textColor }}>{m.label}</p>
        <span style={{ color: m.textColor }} className="text-lg font-bold select-none">▶</span>
      </div>
      <div className="flex items-center gap-1 mt-1">
        <div className="h-1 w-5 rounded-full" style={{ background: m.textColor }} />
        {[1,2,3,4].map(i => <div key={i} className="h-1 w-1 rounded-full bg-gray-700" />)}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function FatePage() {
  const router = useRouter();
  const { gameState, updateState } = useGameState();

  const victim = gameState.members.find(m => m.id === gameState.currentVictimId);
  const otherPlayers = gameState.members.filter(m => m.id !== gameState.currentVictimId);

  const [pool, setPool] = useState<FateType[]>([]);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'result'>('idle');
  const [result, setResult] = useState<FateType | null>(null);
  const [mounted, setMounted] = useState(false);

  const { spinRef, spin } = useDrumSpin();

  useEffect(() => { setMounted(true); setPool(buildShuffledPool()); }, []);

  const handleSpin = useCallback(() => {
    if (phase === 'spinning' || pool.length === 0) return;
    const landFate = pool[Math.floor(Math.random() * pool.length)];
    const candidates = pool.map((f, i) => f === landFate ? i : -1).filter(i => i >= 0);
    const landIdx = candidates[Math.floor(Math.random() * candidates.length)];
    setPhase('spinning');
    setResult(landFate);
    spin(landIdx);
  }, [phase, pool, spin]);

  const handleSpinEnd = useCallback(() => { setPhase('result'); }, []);

  const handleCoVictim = (p: Player) => { updateState({ currentPenalties: gameState.currentPenalties }); router.push('/result'); };
  const handleNewVictim = (p: Player) => { updateState({ currentVictimId: p.id }); router.push('/result'); };
  const handleDirectNext = () => router.push('/result');

  return (
    <main className="flex flex-col min-h-screen overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 40%, #1a0a33 0%, #0F0F1A 60%, #0a0a12 100%)' }}>

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

      <div className="px-5 pb-2 shrink-0">
        <p className="text-sm text-gray-300">
          Số phận của{' '}
          <span className="font-black" style={{ color: '#F472B6', textShadow: '0 0 8px rgba(244,114,182,0.6)' }}>
            {victim?.name ?? 'Nạn Nhân'} {victim?.emoji ?? '👤'}
          </span> chưa kết thúc đâu... 🎭
        </p>
      </div>

      {/* Drum */}
      <div className="flex-1 flex flex-col justify-center overflow-hidden">
        {mounted && pool.length > 0 && (
          <DrumSpinner
            items={pool}
            spinRef={spinRef}
            keyExtractor={(fate, i) => `${fate}-${i}`}
            renderItem={FateRow}
            renderFocusOverlay={FateFocusOverlay}
            onSpinEnd={handleSpinEnd}
          />
        )}

        {phase === 'result' && result === 'CHET_CHUM' && (
          <div className="px-4 mt-3 space-y-2">
            <p className="text-xs text-cyan-400 font-bold text-center uppercase tracking-widest">💀 Chọn người chết chung:</p>
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
            <p className="text-xs text-green-400 font-bold text-center uppercase tracking-widest">🏃 Chọn nạn nhân mới:</p>
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
            <p className="text-xs text-yellow-400 font-bold text-center uppercase tracking-widest">✨ Chọn kẻ thế mạng:</p>
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
          <button onClick={handleSpin}
            className="w-full py-4 rounded-full font-black text-white text-base active:scale-95 transition"
            style={{ background: 'linear-gradient(135deg,#7C3AED 0%,#A855F7 40%,#EC4899 100%)', boxShadow: '0 4px 24px rgba(168,85,247,0.55)' }}>
            🎭 Quay Nhân Phẩm!
          </button>
        )}
        {phase === 'spinning' && (
          <div className="text-center py-2">
            <p className="text-purple-400 font-bold animate-pulse">🌀 Đang định đoạt nhân phẩm...</p>
          </div>
        )}
        {phase === 'result' && result === 'CAM_CHIU' && (
          <button onClick={handleDirectNext}
            className="w-full py-4 rounded-full font-black text-white text-base active:scale-95 transition"
            style={{ background: 'linear-gradient(135deg,#374151,#1F2937)', border: '1px solid rgba(156,163,175,0.3)' }}>
            😩 Cam Chịu... tiếp thôi
          </button>
        )}
      </div>
    </main>
  );
}
