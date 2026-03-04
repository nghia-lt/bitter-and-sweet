'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { DrumSpinner, useDrumSpin } from '@/components/ui/DrumSpinner';
import { weightedRandom, filterFoodPenalties, getActivePenalties } from '@/lib/wheel-logic';
import { getEligiblePartners } from '@/lib/exclusion-logic';
import type { Penalty, Player, PenaltyResult } from '@/lib/types';

type SpinPhase = 'idle' | 'spinning' | 'result_single' | 'result_pair_select' | 'result_pair_done' | 'result_mix';

// ── Uniform row renderer (scrolling list) ─────────────────────
function PenaltyRow(p: Penalty, _isFocus: boolean, _isAdj: boolean, idx: number) {
  return (
    <div className="flex items-center gap-3 px-5 h-full">
      <span className="text-2xl">{p.icon}</span>
      <span className="text-white font-semibold text-sm truncate flex-1">{p.name}</span>
      <span className="text-xs text-gray-600">#{String(idx + 1).padStart(2, '0')}</span>
    </div>
  );
}

function SecretRow(_p: Penalty, _isFocus: boolean, _isAdj: boolean, idx: number) {
  return (
    <div className="flex items-center gap-3 px-5 h-full">
      <span className="text-2xl">🔒</span>
      <span className="text-gray-500 font-semibold text-sm">• • •</span>
      <span className="text-xs text-gray-700">#{String(idx + 1).padStart(2, '0')}</span>
    </div>
  );
}

// ── Static focus overlay (center card) ────────────────────────
function FocusOverlay(penalty: Penalty | null, idx: number, secretMode: boolean) {
  if (!penalty) return null;
  return (
    <div className="h-full mx-1 rounded-2xl overflow-hidden relative pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, #1E0A3C, #0D0D2B)',
        border: '1.5px solid #A855F7',
        boxShadow: '0 0 22px rgba(168,85,247,0.55), 0 0 8px rgba(236,72,153,0.3)',
        padding: '8px 16px',
      }}>
      {/* Shimmer */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(168,85,247,0.07) 50%,transparent 60%)', animation: 'shimmer 3s infinite' }} />
      {/* Top row */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(168,85,247,0.2)', color: '#C084FC' }}>
          ⚡ TIÊU ĐIỂM
        </span>
        <span className="text-cyan-400 text-sm font-bold">✪</span>
      </div>
      {/* Content */}
      <div className="flex items-center gap-3">
        <span className="text-purple-400 text-lg font-bold select-none">◀</span>
        <span className="text-2xl">{secretMode ? '❓' : penalty.icon}</span>
        <p className="flex-1 text-white font-black text-lg leading-snug">
          {secretMode ? 'BÍ MẬT ???' : penalty.name.toUpperCase()}
        </p>
        <span className="text-purple-400 text-lg font-bold select-none">▶</span>
      </div>
      {/* Dots */}
      <div className="flex items-center gap-1 mt-1">
        <div className="h-1 w-5 rounded-full bg-purple-500" />
        {[1,2,3,4].map(i => <div key={i} className="h-1 w-1 rounded-full bg-gray-600" />)}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function SpinPage() {
  const router = useRouter();
  const { gameState, updateState } = useGameState();

  const victim = gameState.members.find(m => m.id === gameState.currentVictimId);
  const activePenalties = getActivePenalties(gameState.selectedPenalties);

  const [shuffledList, setShuffledList] = useState<Penalty[]>([]);
  const [phase, setPhase] = useState<SpinPhase>('idle');
  const [resultPenalty, setResultPenalty] = useState<Penalty | null>(null);
  const [partner, setPartner] = useState<Player | null>(null);
  const [mixResults, setMixResults] = useState<PenaltyResult[]>([]);
  const [mixLeft, setMixLeft] = useState(0);
  const [mixBusy, setMixBusy] = useState(false);
  const [secretReveal, setSecretReveal] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [mounted, setMounted] = useState(false);

  const secretMode = gameState.secretMode;
  const { spinRef, spin, jumpTo } = useDrumSpin();

  useEffect(() => {
    setMounted(true);
    if (activePenalties.length > 0) setShuffledList([...activePenalties]);
  }, []);

  const list = shuffledList.length > 0 ? shuffledList : activePenalties;

  /* ── Spin ── */
  const handleSpin = useCallback(() => {
    if (phase === 'spinning' || list.length === 0) return;

    const result = weightedRandom(list);
    const landIdx = list.findIndex(p => p.id === result.id);

    setPhase('spinning');
    setSecretReveal(false);
    setFlipping(false);
    setResultPenalty(result);

    spin(landIdx);
  }, [phase, list, spin]);

  /* Called by DrumSpinner transitionend → state reset */
  const handleSpinEnd = useCallback((_item: Penalty, _index: number) => {
    // resultPenalty was set before spin started
    const result = resultPenalty;
    if (!result) { setPhase('idle'); return; }

    if (result.isMix && result.mixCount) {
      setMixResults([]); setMixLeft(result.mixCount);
      setPhase('result_mix');
    } else if (result.requiresPartner) {
      setPhase('result_pair_select');
    } else {
      setPhase('result_single');
    }
  }, [resultPenalty]);

  /* ── Shuffle ── */
  const handleShuffle = () => {
    if (phase === 'spinning') return;
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledList(arr);
    jumpTo(0);
    setResultPenalty(null);
    setPhase('idle');
    setSecretReveal(false);
  };

  /* ── Mix ── */
  const handleMixSpin = () => {
    if (mixBusy) return;
    setMixBusy(true);
    const food = filterFoodPenalties(gameState.selectedPenalties);
    const r = weightedRandom(food);
    setTimeout(() => {
      const next = [...mixResults, { penalty: r }];
      setMixResults(next);
      setMixLeft(prev => { const rem = prev - 1; if (rem === 0) updateState({ currentPenalties: next }); return rem; });
      setMixBusy(false);
    }, 900);
  };

  const handlePartner = (p: Player) => {
    setPartner(p);
    setPhase('result_pair_done');
    updateState({ currentPenalties: [{ penalty: resultPenalty!, partnerId: p.id, partnerName: p.name }] });
  };

  const handleReveal = () => { setFlipping(true); setTimeout(() => setSecretReveal(true), 380); };

  const handleNext = () => {
    updateState({
      members: gameState.members.map(m => m.id === victim?.id ? { ...m, penaltyCount: m.penaltyCount + 1 } : m),
      currentPenalties: phase !== 'result_mix' && resultPenalty
        ? [{ penalty: resultPenalty, partnerId: partner?.id, partnerName: partner?.name }]
        : gameState.currentPenalties,
    });
    router.push('/play/fate');
  };

  const eligible = resultPenalty ? getEligiblePartners(resultPenalty, victim, gameState.members, gameState.exclusionRules) : [];
  const showResult = phase === 'result_single' || phase === 'result_pair_done';
  const showNext = showResult || (phase === 'result_mix' && mixLeft === 0);
  const isSecret = secretMode && (phase === 'idle' || phase === 'spinning');

  return (
    <main className="flex flex-col min-h-screen overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 40%, #1A0A33 0%, #0F0F1A 60%, #0A0A12 100%)' }}>

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
            <span className="text-base">🎰</span>
            <span className="font-black text-base tracking-wider text-white">PHÁN QUYẾT</span>
          </div>
          <p className="text-xs font-bold tracking-widest"
            style={{ background: 'linear-gradient(90deg,#A855F7,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VÒNG QUAY HÌNH PHẠT
          </p>
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="text-gray-400 text-sm">⚙️</span>
        </button>
      </div>

      {/* Victim */}
      {victim && (
        <div className="px-5 pb-2 shrink-0">
          <p className="text-sm text-gray-300">
            Số phận của{' '}
            <span className="font-black" style={{ color: '#F472B6', textShadow: '0 0 8px rgba(244,114,182,0.6)' }}>
              {victim.name} {victim.emoji}
            </span> nằm ở đây... <span style={{ filter: 'drop-shadow(0 0 4px #F87171)' }}>🎯</span>
          </p>
        </div>
      )}

      {/* Drum */}
      <div className="flex-1 flex flex-col justify-center overflow-hidden">
        {mounted && list.length > 0 && (
          <DrumSpinner
            items={list}
            spinRef={spinRef}
            keyExtractor={(p, i) => `${p.id}-${i}`}
            renderItem={isSecret ? SecretRow : PenaltyRow}
            renderFocusOverlay={(item, idx) => FocusOverlay(item, idx, isSecret)}
            onSpinEnd={handleSpinEnd}
          />
        )}

        {/* Result overlays */}
        {showResult && resultPenalty && (
          <div className="px-4 mt-3">
            {secretMode && !secretReveal ? (
              <div onClick={handleReveal}
                className="rounded-2xl border border-purple-500 p-6 text-center cursor-pointer select-none"
                style={{ background: 'linear-gradient(135deg,#1a0533,#0d1a33)', boxShadow: '0 0 28px rgba(168,85,247,0.5)',
                  transform: flipping ? 'rotateY(90deg)' : 'rotateY(0deg)', transition: 'transform 0.38s ease' }}>
                <div className="text-3xl mb-3 space-x-1">🔮 🔮 🔮</div>
                <p className="text-white font-black text-xl tracking-wide">CHẠM ĐỂ LẬT</p>
                <p className="text-purple-300 text-2xl mt-2 animate-pulse">❓❓❓</p>
              </div>
            ) : (
              <div className="rounded-2xl border p-5 text-center"
                style={{ background: 'linear-gradient(135deg,#1a0533,#0A0A1A)', borderColor: '#A855F780', boxShadow: '0 0 25px rgba(168,85,247,0.4)' }}>
                <div className="text-5xl mb-2">{resultPenalty.icon}</div>
                <p className="text-2xl font-black text-white mb-1">{resultPenalty.name.toUpperCase()}!</p>
                {partner
                  ? <p className="text-purple-300 text-sm">Cùng với <strong>{partner.emoji} {partner.name}</strong></p>
                  : <p className="text-gray-500 text-xs italic">&ldquo;{victim?.name} ơi, chịu đi nha! 😈&rdquo;</p>}
              </div>
            )}
          </div>
        )}

        {phase === 'result_pair_select' && resultPenalty && (
          <div className="px-4 mt-3 space-y-2">
            <div className="rounded-2xl border p-4 text-center"
              style={{ background: 'linear-gradient(135deg,#1a0533,#0A0A1A)', borderColor: '#EC489980' }}>
              <div className="text-3xl mb-1">{resultPenalty.icon}</div>
              <p className="text-lg font-black text-white">{resultPenalty.name.toUpperCase()}!</p>
              <p className="text-pink-400 text-xs mt-1">Với ai đây?! 😏</p>
            </div>
            {eligible.map(p => (
              <button key={p.id} onClick={() => handlePartner(p)}
                className="w-full glass border border-purple-500/30 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-purple-500 transition active:scale-95">
                <span className="text-2xl">{p.emoji}</span>
                <span className="text-white font-semibold">{p.name}</span>
              </button>
            ))}
          </div>
        )}

        {phase === 'result_mix' && (
          <div className="px-4 mt-3 space-y-3">
            <div className="rounded-2xl border p-4 text-center"
              style={{ background: 'linear-gradient(135deg,#2d0a0a,#0A0A1A)', borderColor: '#DC262680' }}>
              <p className="text-xl font-black text-white">⚡ MIX {resultPenalty?.mixCount} — COMBO! ⚡</p>
            </div>
            {mixResults.length > 0 && (
              <div className="glass rounded-xl border border-purple-500/30 p-4">
                {mixResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-t border-white/5 first:border-0">
                    <span className="text-gray-500 text-xs">#{i+1}</span>
                    <span>{r.penalty.icon}</span>
                    <span className="text-white text-sm flex-1">{r.penalty.name}</span>
                  </div>
                ))}
              </div>
            )}
            {mixLeft > 0 && (
              <button onClick={handleMixSpin} disabled={mixBusy}
                className="w-full py-4 rounded-2xl font-black text-white disabled:opacity-50 active:scale-95 transition"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)' }}>
                {mixBusy ? '🌀 Đang quay...' : `🎰 Quay thêm (còn ${mixLeft})`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-6 pt-3 shrink-0 space-y-3" style={{ borderTop: '1px solid rgba(168,85,247,0.1)' }}>
        <p className="text-center text-xs tracking-widest uppercase" style={{ color: 'rgba(156,163,175,0.5)' }}>
          Thua là phải chịu. Không chạy đâu được. 💀
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-base">🤫</span>
          <span className={`text-sm font-bold ${secretMode ? 'text-white' : 'text-gray-600'}`}>BÍ MẬT</span>
          <button onClick={() => updateState({ secretMode: !secretMode })}
            className="relative w-12 h-6 rounded-full transition-all duration-300 ml-1"
            style={{ background: secretMode ? 'linear-gradient(90deg,#7C3AED,#EC4899)' : 'rgba(75,85,99,0.6)', boxShadow: secretMode ? '0 0 12px rgba(168,85,247,0.5)' : 'none' }}>
            <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
              style={{ left: secretMode ? '28px' : '4px' }} />
          </button>
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
              {phase === 'spinning' ? '🌀 Đang quay...' : '⚡ QUAY NGAY'}
            </button>
          </div>
        )}
        {showNext && (
          <button onClick={handleNext}
            disabled={secretMode && !secretReveal && phase !== 'result_mix'}
            className="w-full py-4 rounded-full font-black text-white text-base disabled:opacity-40 active:scale-95 transition"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', boxShadow: '0 4px 20px rgba(168,85,247,0.4)' }}>
            ĐẾN VÒNG CƠ HỘI ➡️
          </button>
        )}
      </div>
    </main>
  );
}
