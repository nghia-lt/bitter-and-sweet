'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { DrumSpinner, useDrumSpin } from '@/components/ui/DrumSpinner';
import { FATE_CONFIG, FATE_WEIGHTS } from '@/lib/constants';
import type { FateType, Player } from '@/lib/types';

const FATE_META: Record<FateType, { icon: string; label: string; glow: string; textColor: string }> = {
  CAM_CHIU: { icon: '😩', label: 'CAM CHỊU', glow: 'rgba(107,114,128,0.5)', textColor: '#9CA3AF' },
  CHET_CHUM: { icon: '💀', label: 'CHẾT CHÙM', glow: 'rgba(6,182,212,0.5)', textColor: '#22D3EE' },
  THOAT_KIP: { icon: '🏃', label: 'THOÁT KÍP', glow: 'rgba(34,197,94,0.5)', textColor: '#4ADE80' },
  KIM_THIEN: { icon: '✨', label: 'KIM THIỀN', glow: 'rgba(234,179,8,0.5)', textColor: '#FACC15' },
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

// ── Normal row ───────────────────────────────────────────────
function FateRow(fate: FateType, _isFocus: boolean, _isAdj: boolean, _idx: number) {
  const m = FATE_META[fate];
  return (
    <div className="relative flex items-center justify-center gap-3 px-5 h-full w-full text-center">
      <span className="text-2xl">{m.icon}</span>
      <span className="text-white font-semibold text-sm">{m.label}</span>
      <span className="absolute right-5 text-xs text-gray-600">{FATE_CONFIG[fate].probability}%</span>
    </div>
  );
}

// ── Secret row (hidden) ──────────────────────────────────────
function SecretFateRow(_fate: FateType, _isFocus: boolean, _isAdj: boolean, _idx: number) {
  return (
    <div className="flex items-center justify-center gap-3 px-5 h-full w-full">
      <span className="text-2xl">🔒</span>
      <span className="text-gray-500 font-semibold text-sm">• • •</span>
    </div>
  );
}

// ── Normal focus overlay ─────────────────────────────────────
function FateFocusOverlay(fate: FateType | null, idx: number) {
  if (!fate) return null;
  const m = FATE_META[fate];
  return (
    <div className="h-full mx-1 rounded-2xl overflow-hidden relative pointer-events-none flex flex-col items-center justify-center"
      style={{
        background: `linear-gradient(135deg, rgba(15,15,26,0.95), rgba(13,13,43,0.95))`,
        border: `1.5px solid ${m.textColor}80`,
        boxShadow: `0 0 20px ${m.glow}, 0 0 6px ${m.glow}`,
        padding: '0 16px',
      }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(105deg,transparent 40%,${m.glow}20 50%,transparent 60%)`, animation: 'shimmer 3s infinite' }} />
      <div className="flex items-center justify-between w-full">
        <span style={{ color: m.textColor }} className="text-lg font-bold select-none">◀</span>
        <div className="flex items-center gap-2 justify-center flex-1">
          <span className="text-3xl">{m.icon}</span>
          <p className="font-black text-xl leading-snug text-center" style={{ color: m.textColor }}>{m.label}</p>
        </div>
        <span style={{ color: m.textColor }} className="text-lg font-bold select-none">▶</span>
      </div>
    </div>
  );
}

// ── Secret focus overlay ─────────────────────────────────────
function SecretFateFocusOverlay(_fate: FateType | null, _idx: number) {
  return (
    <div className="h-full mx-1 rounded-2xl overflow-hidden relative pointer-events-none flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(15,15,26,0.95), rgba(13,13,43,0.95))',
        border: '1.5px solid rgba(168,85,247,0.5)',
        boxShadow: '0 0 20px rgba(168,85,247,0.3), 0 0 6px rgba(168,85,247,0.2)',
        padding: '0 16px',
      }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(168,85,247,0.07) 50%,transparent 60%)', animation: 'shimmer 3s infinite' }} />
      <div className="flex items-center justify-between w-full">
        <span className="text-purple-400 text-lg font-bold select-none">◀</span>
        <div className="flex items-center gap-2 justify-center flex-1">
          <span className="text-3xl">❓</span>
          <p className="font-black text-xl leading-snug text-center text-purple-400">BÍ MẬT ???</p>
        </div>
        <span className="text-purple-400 text-lg font-bold select-none">▶</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function FatePage() {
  const router = useRouter();
  const { gameState, updateState, toggleSecretMode } = useGameState();

  const victim = gameState.members.find(m => m.id === gameState.currentVictimId);
  const otherPlayers = gameState.members.filter(m => m.id !== gameState.currentVictimId);

  const [pool, setPool] = useState<FateType[]>([]);
  const [shuffledPool, setShuffledPool] = useState<FateType[]>([]);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'result_secret' | 'result'>('idle');
  const [result, setResult] = useState<FateType | null>(null);
  const [mounted, setMounted] = useState(false);
  const [flipAnim, setFlipAnim] = useState(false);

  const secretMode = gameState.secretMode;
  const secretModeRef = useRef(secretMode);
  useEffect(() => { secretModeRef.current = secretMode; }, [secretMode]);

  const { spinRef, spin } = useDrumSpin();

  useEffect(() => {
    const initial = buildShuffledPool();
    setPool(initial);
    setShuffledPool(initial);
    setMounted(true);
  }, []);

  const activePool = shuffledPool.length > 0 ? shuffledPool : pool;
  const isSecret = mounted && secretMode && (phase === 'idle' || phase === 'spinning' || phase === 'result_secret');

  const handleSpin = useCallback(() => {
    if (phase === 'spinning' || activePool.length === 0) return;
    const landFate = activePool[Math.floor(Math.random() * activePool.length)];
    const candidates = activePool.map((f, i) => f === landFate ? i : -1).filter(i => i >= 0);
    const landIdx = candidates[Math.floor(Math.random() * candidates.length)];
    setPhase('spinning');
    setResult(landFate);
    setFlipAnim(false);
    spin(landIdx);
  }, [phase, activePool, spin]);

  const handleSpinEnd = useCallback(() => {
    // Use ref to always get latest secretMode value (avoids stale closure)
    if (secretModeRef.current) {
      setPhase('result_secret');
    } else {
      setPhase('result');
    }
  }, []);

  const handleReveal = () => {
    setFlipAnim(true);
    setTimeout(() => {
      setPhase('result');
      setTimeout(() => setFlipAnim(false), 250);
    }, 220);
  };

  const handleShuffle = () => {
    if (phase === 'spinning') return;
    setShuffledPool(buildShuffledPool());
    setPhase('idle');
    setResult(null);
    setFlipAnim(false);
  };

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

      <div className="px-5 pb-2 shrink-0" suppressHydrationWarning>
        <p className="text-sm text-gray-300">
          Số phận của{' '}
          <span className="font-black" style={{ color: '#F472B6', textShadow: '0 0 8px rgba(244,114,182,0.6)' }} suppressHydrationWarning>
            {mounted ? (victim?.name ?? 'Nạn Nhân') : 'Nạn Nhân'} {mounted ? (victim?.emoji ?? '👤') : '👤'}
          </span> chưa kết thúc đâu... 🎭
        </p>
      </div>

      {/* Drum */}
      <div className="flex-1 flex flex-col justify-center overflow-hidden">
        {mounted && activePool.length > 0 && (
          <DrumSpinner
            items={activePool}
            spinRef={spinRef}
            keyExtractor={(fate, i) => `${fate}-${i}`}
            renderItem={isSecret ? SecretFateRow : FateRow}
            renderFocusOverlay={isSecret ? SecretFateFocusOverlay : FateFocusOverlay}
            onSpinEnd={handleSpinEnd}
          />
        )}

        {/* Result panels (only show after reveal or when not in secret mode) */}
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
          SỐ PHẬN CHƯA KẾT THÚC Ở ĐÂY ĐÂU... 🎭
        </p>
        <div className="flex items-center justify-center gap-2" suppressHydrationWarning>
          <span className="text-base">🤫</span>
          <span className={`text-sm font-bold ${mounted && secretMode ? 'text-white' : 'text-gray-600'}`} suppressHydrationWarning>BÍ MẬT</span>
          <div
            className="relative w-12 h-6 rounded-full transition-all duration-300 ml-1 pointer-events-none opacity-60"
            style={{ background: mounted && secretMode ? 'linear-gradient(90deg,#7C3AED,#EC4899)' : 'rgba(75,85,99,0.6)', boxShadow: mounted && secretMode ? '0 0 12px rgba(168,85,247,0.5)' : 'none' }}
            suppressHydrationWarning>
            <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
              style={{ left: mounted && secretMode ? '28px' : '4px' }} suppressHydrationWarning />
          </div>
        </div>
        {(phase === 'idle' || phase === 'spinning') && (
          <div className="flex gap-3">
            <button onClick={handleShuffle} disabled={phase === 'spinning'}
              className="flex-none px-5 py-3.5 rounded-full text-white text-sm font-bold transition active:scale-95 disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(168,85,247,0.4)' }}>
              🔀 XÁO TRỘN
            </button>
            <button onClick={handleSpin} disabled={phase === 'spinning'}
              className="flex-1 py-3.5 rounded-full font-black text-white text-sm disabled:opacity-60 active:scale-95 transition"
              style={{ background: 'linear-gradient(135deg,#7C3AED 0%,#A855F7 40%,#EC4899 100%)', boxShadow: '0 4px 24px rgba(168,85,247,0.55)' }}>
              {phase === 'spinning' ? '🌀 Đang quay...' : '⚡ QUAY NHÂN PHẨM'}
            </button>
          </div>
        )}

        {/* Secret reveal button */}
        {phase === 'result_secret' && (
          <button onClick={handleReveal}
            className="w-full py-4 rounded-full font-black text-white text-base active:scale-95 transition"
            style={{
              background: 'linear-gradient(135deg, #B91C1C, #EA580C)',
              boxShadow: '0 0 32px rgba(239,68,68,0.7)',
              animation: 'pulse 1s cubic-bezier(0.4,0,0.6,1) infinite',
            }}>
            👀 MỞ KẾT QUẢ
          </button>
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
