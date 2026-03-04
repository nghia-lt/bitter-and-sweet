'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { weightedRandom, filterFoodPenalties, getActivePenalties } from '@/lib/wheel-logic';
import { getEligiblePartners } from '@/lib/exclusion-logic';
import type { Penalty, Player, PenaltyResult } from '@/lib/types';

type SpinPhase = 'idle' | 'spinning' | 'result_single' | 'result_pair_select' | 'result_pair_done' | 'result_mix';

// ─────────────────────────────────────────────
// Carousel – one visible item
// ─────────────────────────────────────────────
function PenaltyItem({
  penalty,
  offset,       // -2 / -1 / 0 / 1 / 2
  index,
  secretMode,
}: {
  penalty: Penalty;
  offset: number;
  index: number;
  secretMode: boolean;
}) {
  const abs = Math.abs(offset);

  /* ── Focus card (centre) ── */
  if (offset === 0) {
    return (
      <div className="relative rounded-2xl mx-1 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1E0A3C, #0D0D2B)',
          border: '1.5px solid #A855F7',
          boxShadow: '0 0 18px rgba(168,85,247,0.55), 0 0 6px rgba(236,72,153,0.3)',
          padding: '14px 16px 12px',
        }}
      >
        {/* Shimmer sweep */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(168,85,247,0.07) 50%,transparent 60%)', animation: 'shimmer 3s infinite' }} />

        {/* Top row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(168,85,247,0.2)', color: '#C084FC' }}>
            ⚡ TIÊU ĐIỂM
          </span>
          <span className="text-cyan-400 text-sm font-bold">✪</span>
        </div>

        {/* Main content */}
        <div className="flex items-center gap-3 my-1">
          {/* Left arrow */}
          <span className="text-purple-400 text-xl font-bold select-none">◀</span>
          <span className="text-3xl">{secretMode ? '❓' : penalty.icon}</span>
          <p className="flex-1 text-white font-black text-xl leading-snug">
            {secretMode ? 'BÍ MẬT ???' : penalty.name.toUpperCase()}
          </p>
          {/* Right arrow */}
          <span className="text-purple-400 text-xl font-bold select-none">▶</span>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1 mt-3">
          <div className="h-1.5 w-6 rounded-full bg-purple-500" />
          <div className="h-1.5 w-1.5 rounded-full bg-gray-600" />
          <div className="h-1.5 w-1.5 rounded-full bg-gray-600" />
          <div className="h-1.5 w-1.5 rounded-full bg-gray-600" />
          <div className="h-1.5 w-1.5 rounded-full bg-gray-600" />
        </div>
      </div>
    );
  }

  /* ── Faded items ── */
  const opacity = abs === 1 ? 0.38 : 0.15;
  const scale = abs === 1 ? 0.95 : 0.88;

  return (
    <div style={{ opacity, transform: `scale(${scale})`, transition: 'all 0.15s' }}>
      <div className="rounded-xl mx-2 flex items-center gap-3 px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,85,247,0.15)', minHeight: 52 }}
      >
        <div className="flex-1 min-w-0">
          {abs === 1 && (
            <p className="text-xs text-gray-600 font-semibold tracking-widest uppercase mb-0.5">
              HÌNH PHẠT {String(index + 1).padStart(2, '0')}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-base">{secretMode ? '🔒' : penalty.icon}</span>
            <span className="text-gray-400 text-sm font-semibold truncate">
              {secretMode ? '• • •' : penalty.name}
            </span>
          </div>
        </div>
        {abs === 1 && !secretMode && (
          <span className="text-gray-700 text-xs">🔒</span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function SpinPage() {
  const router = useRouter();
  const { gameState, updateState } = useGameState();

  const victim = gameState.members.find(m => m.id === gameState.currentVictimId);
  const activePenalties = getActivePenalties(gameState.selectedPenalties);

  const [phase, setPhase] = useState<SpinPhase>('idle');
  const [focusIdx, setFocusIdx] = useState(0);
  const [shuffledList, setShuffledList] = useState<Penalty[]>([]);
  const [resultPenalty, setResultPenalty] = useState<Penalty | null>(null);
  const [partner, setPartner] = useState<Player | null>(null);
  const [mixResults, setMixResults] = useState<PenaltyResult[]>([]);
  const [mixLeft, setMixLeft] = useState(0);
  const [mixBusy, setMixBusy] = useState(false);
  const [secretReveal, setSecretReveal] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const tickRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const secretMode = gameState.secretMode;

  // Init shuffledList from activePenalties
  useEffect(() => {
    setMounted(true);
    if (activePenalties.length > 0) setShuffledList([...activePenalties]);
  }, []);
  useEffect(() => () => { if (tickRef.current) clearTimeout(tickRef.current); }, []);

  const list = shuffledList.length > 0 ? shuffledList : activePenalties;
  const wrap = (i: number) => ((i % list.length) + list.length) % list.length;

  /* ── Slot spin animation ── */
  const handleSpin = useCallback(() => {
    if (phase === 'spinning' || list.length === 0) return;

    const result = weightedRandom(list);
    const landIdx = list.findIndex(p => p.id === result.id);
    const totalTicks = 30 + Math.floor(Math.random() * 10);
    const fastEnd = Math.floor(totalTicks * 0.58);
    let tick = 0;

    setPhase('spinning');
    setSecretReveal(false);

    const step = () => {
      tick++;
      setFocusIdx(prev => wrap(prev + 1));

      if (tick >= totalTicks) {
        setFocusIdx(landIdx);
        setResultPenalty(result);
        setTimeout(() => {
          if (result.isMix && result.mixCount) {
            setMixResults([]); setMixLeft(result.mixCount);
            setPhase('result_mix');
          } else if (result.requiresPartner) {
            setPhase('result_pair_select');
          } else {
            setPhase('result_single');
          }
        }, 350);
        return;
      }

      const t = (tick - fastEnd) / (totalTicks - fastEnd);
      const delay = tick < fastEnd ? 55 : 55 + t * t * 380;
      tickRef.current = setTimeout(step, delay);
    };

    tickRef.current = setTimeout(step, 55);
  }, [phase, list]);

  /* ── Shuffle: Fisher-Yates shuffle the actual list ── */
  const handleShuffle = () => {
    if (phase === 'spinning') return;
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledList(arr);
    setFocusIdx(0);
    setResultPenalty(null);
    setPhase('idle');
    setSecretReveal(false);
  };

  /* ── Mix sub-spin ── */
  const handleMixSpin = () => {
    if (mixBusy) return;
    setMixBusy(true);
    const food = filterFoodPenalties(gameState.selectedPenalties);
    const r = weightedRandom(food);
    setTimeout(() => {
      const next = [...mixResults, { penalty: r }];
      setMixResults(next);
      const rem = mixLeft - 1;
      setMixLeft(rem);
      setMixBusy(false);
      if (rem === 0) updateState({ currentPenalties: next });
    }, 900);
  };

  /* ── Select partner ── */
  const handlePartner = (p: Player) => {
    setPartner(p);
    setPhase('result_pair_done');
    updateState({ currentPenalties: [{ penalty: resultPenalty!, partnerId: p.id, partnerName: p.name }] });
  };

  /* ── Reveal flip ── */
  const handleReveal = () => {
    setFlipping(true);
    setTimeout(() => setSecretReveal(true), 380);
  };

  /* ── Next screen ── */
  const handleNext = () => {
    updateState({
      members: gameState.members.map(m => m.id === victim?.id ? { ...m, penaltyCount: m.penaltyCount + 1 } : m),
      currentPenalties: phase !== 'result_mix' && resultPenalty
        ? [{ penalty: resultPenalty, partnerId: partner?.id, partnerName: partner?.name }]
        : gameState.currentPenalties,
    });
    router.push('/play/fate');
  };

  /* ── Drum items (5 visible) ── */
  const drumOffsets = [-2, -1, 0, 1, 2];
  const drum = mounted && list.length > 0
    ? drumOffsets.map(off => ({ off, penalty: list[wrap(focusIdx + off)] }))
    : [];

  const eligible = resultPenalty
    ? getEligiblePartners(resultPenalty, victim!, gameState.members, gameState.exclusionRules)
    : [];

  const showResult = phase === 'result_single' || phase === 'result_pair_done';
  const showNext = showResult || (phase === 'result_mix' && mixLeft === 0);
  const penaltyIndex = (p: Penalty) => activePenalties.findIndex(x => x.id === p.id);

  return (
    <main
      className="flex flex-col min-h-screen relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 40%, #1A0A33 0%, #0F0F1A 60%, #0A0A12 100%)' }}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3 shrink-0">
        {/* Radar icon */}
        <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full border border-purple-700/40" />
          <div className="absolute inset-1 rounded-full border border-purple-600/30" />
          <div className="absolute inset-2 rounded-full border border-purple-500/20" />
          <div className="w-3 h-3 rounded-full bg-purple-600" style={{ boxShadow: '0 0 8px #A855F7' }} />
        </div>

        {/* Title */}
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-base">🎰</span>
            <span className="font-black text-base tracking-wider text-white">PHÁN QUYẾT</span>
          </div>
          <p className="text-xs font-bold tracking-widest"
            style={{ background: 'linear-gradient(90deg,#A855F7,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VÒNG QUAY HÌNH PHẠT
          </p>
        </div>

        {/* Settings */}
        <button className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="text-gray-400 text-sm">⚙️</span>
        </button>
      </div>

      {/* ── Victim name ── */}
      <div className="px-5 pb-2 shrink-0">
        <p className="text-sm text-gray-300">
          Số phận của{' '}
          <span className="font-black" style={{ color: '#F472B6', textShadow: '0 0 8px rgba(244,114,182,0.6)' }}>
            {victim?.name ?? 'Nạn Nhân'} {victim?.emoji ?? '👤'}
          </span>
          {' '}nằm ở đây...{' '}
          <span style={{ filter: 'drop-shadow(0 0 4px #F87171)' }}>🎯</span>
        </p>
      </div>

      {/* ── Carousel ── */}
      <div className="flex-1 relative flex flex-col justify-center py-2">
        {/* CSS mask for fade top/bottom */}
        <div className="flex flex-col gap-2 py-1"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
          }}
        >
          {drum.map(({ off, penalty }, i) => (
            <PenaltyItem
              key={`${i}-${penalty.id}-${off}`}
              penalty={penalty}
              offset={off}
              index={activePenalties.findIndex(p => p.id === penalty.id)}
              secretMode={secretMode && (phase === 'idle' || phase === 'spinning')}
            />
          ))}
        </div>

        {/* ── Result overlays ── */}
        {showResult && resultPenalty && (
          <div className="px-4 mt-3">
            {secretMode && !secretReveal ? (
              /* Secret flip card */
              <div
                onClick={handleReveal}
                className="rounded-2xl border border-purple-500 p-6 text-center cursor-pointer select-none"
                style={{
                  background: 'linear-gradient(135deg, #1a0533, #0d1a33)',
                  boxShadow: '0 0 28px rgba(168,85,247,0.5)',
                  transform: flipping ? 'rotateY(90deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.38s ease',
                }}
              >
                <div className="text-3xl mb-3 space-x-1">🔮 🔮 🔮</div>
                <p className="text-white font-black text-xl tracking-wide">CHẠM ĐỂ LẬT</p>
                <p className="text-purple-300 text-2xl mt-2 animate-pulse">❓❓❓</p>
              </div>
            ) : (
              /* Revealed */
              <div className="rounded-2xl border p-5 text-center"
                style={{ background: 'linear-gradient(135deg,#1a0533,#0A0A1A)', borderColor: '#A855F780', boxShadow: '0 0 28px rgba(168,85,247,0.4)' }}>
                <div className="text-5xl mb-2">{resultPenalty.icon}</div>
                <p className="text-2xl font-black text-white mb-1">{resultPenalty.name.toUpperCase()}!</p>
                {partner
                  ? <p className="text-purple-300 text-sm">Cùng với <strong>{partner.emoji} {partner.name}</strong></p>
                  : <p className="text-gray-500 text-xs italic">&ldquo;{victim?.name} ơi, chịu đi nha! 😈&rdquo;</p>
                }
              </div>
            )}
          </div>
        )}

        {/* Pair select */}
        {phase === 'result_pair_select' && resultPenalty && (
          <div className="px-4 mt-3 space-y-2">
            <div className="rounded-2xl border p-4 text-center"
              style={{ background: 'linear-gradient(135deg,#1a0533,#0A0A1A)', borderColor: '#EC489980' }}>
              <div className="text-3xl mb-1">{resultPenalty.icon}</div>
              <p className="text-lg font-black text-white">{resultPenalty.name.toUpperCase()}!</p>
              <p className="text-pink-400 text-xs mt-1">Với ai đây?! 😏</p>
            </div>
            {eligible.length === 0
              ? <p className="text-amber-400 text-sm text-center">⚠️ Không có ai hợp lệ</p>
              : eligible.map(p => (
                <button key={p.id} onClick={() => handlePartner(p)}
                  className="w-full glass border border-purple-500/30 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-purple-500 transition active:scale-95">
                  <span className="text-2xl">{p.emoji}</span>
                  <span className="text-white font-semibold">{p.name}</span>
                </button>
              ))
            }
          </div>
        )}

        {/* Mix */}
        {phase === 'result_mix' && (
          <div className="px-4 mt-3 space-y-3">
            <div className="rounded-2xl border p-4 text-center"
              style={{ background: 'linear-gradient(135deg,#2d0a0a,#0A0A1A)', borderColor: '#DC262680', boxShadow: '0 0 16px rgba(220,38,38,0.3)' }}>
              <p className="text-xl font-black text-white">⚡ MIX {resultPenalty?.mixCount} — COMBO TỬ THẦN! ⚡</p>
              <p className="text-red-400 text-xs mt-1">Quay thêm {resultPenalty?.mixCount} phát nữa!</p>
            </div>
            {mixResults.length > 0 && (
              <div className="glass rounded-xl border border-purple-500/30 p-4">
                <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-2">📋 PHÁN QUYẾT:</p>
                {mixResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-t border-white/5 first:border-0">
                    <span className="text-gray-500 text-xs min-w-5">#{i+1}</span>
                    <span>{r.penalty.icon}</span>
                    <span className="text-white text-sm flex-1">{r.penalty.name}</span>
                  </div>
                ))}
              </div>
            )}
            {mixLeft > 0 && (
              <button onClick={handleMixSpin} disabled={mixBusy}
                className="w-full py-4 rounded-2xl font-black text-white text-sm disabled:opacity-50 active:scale-95 transition"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', boxShadow: '0 4px 20px rgba(168,85,247,0.4)' }}>
                {mixBusy ? '🌀 Đang quay...' : `🎰 Quay thêm (còn ${mixLeft} lần)`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-4 pb-6 pt-3 shrink-0 space-y-3" style={{ borderTop: '1px solid rgba(168,85,247,0.1)' }}>
        {/* Tagline */}
        <p className="text-center text-xs tracking-widest uppercase"
          style={{ color: 'rgba(156,163,175,0.5)' }}>
          Thua là phải chịu. Không chạy đâu được. 💀
        </p>

        {/* Secret toggle */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-base">🤫</span>
          <span className={`text-sm font-bold ${secretMode ? 'text-white' : 'text-gray-600'}`}>BÍ MẬT</span>
          <button
            onClick={() => updateState({ secretMode: !secretMode })}
            className="relative w-12 h-6 rounded-full transition-all duration-300 ml-1"
            style={{ background: secretMode ? 'linear-gradient(90deg,#7C3AED,#EC4899)' : 'rgba(75,85,99,0.6)', boxShadow: secretMode ? '0 0 12px rgba(168,85,247,0.5)' : 'none' }}
          >
            <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
              style={{ left: secretMode ? '28px' : '4px' }} />
          </button>
        </div>

        {/* Buttons */}
        {(phase === 'idle' || phase === 'spinning') && (
          <div className="flex gap-3">
            {/* Shuffle */}
            <button
              onClick={handleShuffle}
              disabled={phase === 'spinning'}
              className="flex-none px-5 py-3.5 rounded-full text-white text-sm font-bold transition active:scale-95 disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(168,85,247,0.4)' }}
            >
              🔀 XÁO TRỘN
            </button>

            {/* Spin */}
            <button
              onClick={() => handleSpin()}
              disabled={phase === 'spinning'}
              className="flex-1 py-3.5 rounded-full font-black text-white text-sm disabled:opacity-60 active:scale-95 transition relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 40%, #EC4899 100%)',
                boxShadow: '0 4px 24px rgba(168,85,247,0.55), 0 0 0 1px rgba(168,85,247,0.3)',
              }}
            >
              {phase === 'spinning' ? '🌀 Đang quay...' : '⚡ QUAY NGAY'}
            </button>
          </div>
        )}

        {/* Continue */}
        {showNext && (
          <button
            onClick={handleNext}
            disabled={secretMode && !secretReveal && phase !== 'result_mix'}
            className="w-full py-4 rounded-full font-black text-white text-base disabled:opacity-40 active:scale-95 transition"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', boxShadow: '0 4px 20px rgba(168,85,247,0.4)' }}
          >
            Đã rõ! Tiếp tục ➡️
          </button>
        )}
      </div>
    </main>
  );
}
