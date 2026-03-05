'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { DrumSpinner, useDrumSpin } from '@/components/ui/DrumSpinner';
import { weightedRandom, filterFoodPenalties, getActivePenalties } from '@/lib/wheel-logic';
import { getEligiblePartners } from '@/lib/exclusion-logic';
import type { Penalty, Player, PenaltyResult } from '@/lib/types';

type SpinPhase = 'idle' | 'spinning' | 'result_secret' | 'result_single' | 'result_pair_select' | 'result_pair_spinning' | 'result_pair_done' | 'result_mix';
type Step = 'select_punishment' | 'select_target';

// ═══════════════════════════════════════════════════════════════
//  PENALTY RENDERERS (Purple theme)
// ═══════════════════════════════════════════════════════════════
function PenaltyRow(p: Penalty, _isFocus: boolean, _isAdj: boolean, _idx: number) {
  return (
    <div className="flex items-center justify-center gap-3 px-5 h-full w-full text-center">
      <span className="text-2xl">{p.icon}</span>
      <span className="text-white font-semibold text-sm">{p.name}</span>
    </div>
  );
}

function SecretRow(_p: Penalty, _isFocus: boolean, _isAdj: boolean, _idx: number) {
  return (
    <div className="flex items-center justify-center gap-3 px-5 h-full w-full">
      <span className="text-2xl">🔒</span>
      <span className="text-gray-500 font-semibold text-sm">• • •</span>
    </div>
  );
}

function PenaltyFocusOverlay(penalty: Penalty | null, _idx: number, secretMode: boolean) {
  if (!penalty) return null;
  return (
    <div className="h-full mx-1 rounded-2xl overflow-hidden relative pointer-events-none flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #1E0A3C, #0D0D2B)',
        border: '1.5px solid #A855F7',
        boxShadow: '0 0 22px rgba(168,85,247,0.55), 0 0 8px rgba(236,72,153,0.3)',
        padding: '0 16px',
      }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(168,85,247,0.07) 50%,transparent 60%)', animation: 'shimmer 3s infinite' }} />
      <div className="flex items-center justify-between w-full">
        <span className="text-purple-400 text-lg font-bold select-none">◀</span>
        <div className="flex items-center gap-2 justify-center flex-1">
          <span className="text-2xl">{secretMode ? '❓' : penalty.icon}</span>
          <p className="text-white font-black text-lg leading-snug text-center">
            {secretMode ? 'BÍ MẬT ???' : penalty.name.toUpperCase()}
          </p>
        </div>
        <span className="text-purple-400 text-lg font-bold select-none">▶</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PLAYER RENDERERS (Cyan theme)
// ═══════════════════════════════════════════════════════════════
function PlayerRow(p: Player, _isFocus: boolean, _isAdj: boolean, _idx: number) {
  return (
    <div className="flex items-center justify-center gap-3 px-5 h-full w-full text-center">
      <span className="text-2xl">{p.emoji}</span>
      <span className="text-white font-semibold text-sm">{p.name}</span>
    </div>
  );
}

function PlayerFocusOverlay(player: Player | null, _idx: number) {
  if (!player) return null;
  return (
    <div className="h-full mx-1 rounded-2xl overflow-hidden relative pointer-events-none flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0A1E2E, #0D0D2B)',
        border: '1.5px solid #06B6D4',
        boxShadow: '0 0 22px rgba(6,182,212,0.55), 0 0 8px rgba(6,182,212,0.3)',
        padding: '0 16px',
      }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(6,182,212,0.07) 50%,transparent 60%)', animation: 'shimmer 3s infinite' }} />
      <div className="flex items-center justify-between w-full">
        <span className="text-cyan-400 text-lg font-bold select-none">◀</span>
        <div className="flex items-center gap-2 justify-center flex-1">
          <span className="text-3xl">{player.emoji}</span>
          <p className="font-black text-xl leading-snug text-center text-cyan-300">{player.name}</p>
        </div>
        <span className="text-cyan-400 text-lg font-bold select-none">▶</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function SpinPage() {
  const router = useRouter();
  const { gameState, updateState, toggleSecretMode } = useGameState();

  const victim = gameState.members.find(m => m.id === gameState.currentVictimId);
  const activePenalties = getActivePenalties(gameState.selectedPenalties, gameState.penaltySlots ?? {});

  // ── State ──
  const [shuffledList, setShuffledList] = useState<Penalty[]>([]);
  const [phase, setPhase] = useState<SpinPhase>('idle');
  const [step, setStep] = useState<Step>('select_punishment');
  const [resultPenalty, setResultPenalty] = useState<Penalty | null>(null);
  const [partner, setPartner] = useState<Player | null>(null);
  const [mixResults, setMixResults] = useState<PenaltyResult[]>([]);
  const [mixLeft, setMixLeft] = useState(0);
  const [mixBusy, setMixBusy] = useState(false);
  const [secretReveal, setSecretReveal] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [flipAnim, setFlipAnim] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const secretMode = gameState.secretMode;
  const secretModeRef = useRef(secretMode);
  useEffect(() => { secretModeRef.current = secretMode; }, [secretMode]);

  // ── Two separate drum spin hooks ──
  const { spinRef: penaltySpinRef, spin: penaltySpin, jumpTo: penaltyJumpTo } = useDrumSpin();
  const { spinRef: playerSpinRef, spin: playerSpin } = useDrumSpin();

  // ── Eligible players for pair penalty ──
  const eligible = resultPenalty ? getEligiblePartners(resultPenalty, victim, gameState.members, gameState.exclusionRules) : [];

  useEffect(() => {
    setMounted(true);
    if (activePenalties.length > 0) setShuffledList([...activePenalties]);
  }, []);

  const list = shuffledList.length > 0 ? shuffledList : activePenalties;
  const isSecret = secretMode && (phase === 'idle' || phase === 'spinning' || phase === 'result_secret');

  // ═══════════════════════════════════════════════════════════
  //  PENALTY WHEEL HANDLERS
  // ═══════════════════════════════════════════════════════════
  const handleSpin = useCallback(() => {
    if (phase === 'spinning' || list.length === 0) return;
    const result = weightedRandom(list);
    const landIdx = list.findIndex(p => p.id === result.id);
    setPhase('spinning');
    setSecretReveal(false);
    setIsRevealed(false);
    setFlipAnim(false);
    setResultPenalty(result);
    penaltySpin(landIdx);
  }, [phase, list, penaltySpin]);

  const handleSpinEnd = useCallback((_item: Penalty, _index: number) => {
    const result = resultPenalty;
    if (!result) { setPhase('idle'); return; }
    if (secretModeRef.current) { setPhase('result_secret'); return; }
    if (result.isMix && result.mixCount) {
      setMixResults([]); setMixLeft(result.mixCount);
      setPhase('result_mix');
    } else if (result.requiresPartner) {
      // ★ Transition to player wheel after 1s delay
      setPhase('result_pair_select');
      setTransitioning(true);
      setTimeout(() => {
        setStep('select_target');
        setTransitioning(false);
      }, 1000);
    } else {
      setPhase('result_single');
    }
  }, [resultPenalty]);

  const handleShuffle = () => {
    if (phase === 'spinning') return;
    const arr = [...activePenalties];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledList(arr);
    penaltyJumpTo(0);
    setResultPenalty(null);
    setPhase('idle');
    setSecretReveal(false);
  };

  // ═══════════════════════════════════════════════════════════
  //  PLAYER WHEEL HANDLERS
  // ═══════════════════════════════════════════════════════════
  const handlePlayerSpin = useCallback(() => {
    if (phase === 'result_pair_spinning' || eligible.length === 0) return;
    const landIdx = Math.floor(Math.random() * eligible.length);
    setPhase('result_pair_spinning');
    playerSpin(landIdx);
  }, [phase, eligible, playerSpin]);

  const handlePlayerSpinEnd = useCallback((player: Player, _index: number) => {
    setPartner(player);
    setPhase('result_pair_done');
    updateState({ currentPenalties: [{ penalty: resultPenalty!, partnerId: player.id, partnerName: player.name }] });
  }, [resultPenalty, updateState]);

  // ═══════════════════════════════════════════════════════════
  //  MIX HANDLERS
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  //  SECRET REVEAL
  // ═══════════════════════════════════════════════════════════
  const handleReveal = () => {
    setFlipAnim(true);
    setTimeout(() => {
      setIsRevealed(true);
      setSecretReveal(true);
      const result = resultPenalty;
      if (!result) return;
      if (result.isMix && result.mixCount) {
        setMixResults([]); setMixLeft(result.mixCount); setPhase('result_mix');
      } else if (result.requiresPartner) {
        setPhase('result_pair_select');
        setTransitioning(true);
        setTimeout(() => {
          setStep('select_target');
          setTransitioning(false);
        }, 1000);
      } else {
        setPhase('result_single');
      }
      setTimeout(() => setFlipAnim(false), 250);
    }, 220);
  };

  // ═══════════════════════════════════════════════════════════
  //  NAVIGATION
  // ═══════════════════════════════════════════════════════════
  const handleNext = () => {
    updateState({
      members: gameState.members.map(m => m.id === victim?.id ? { ...m, penaltyCount: m.penaltyCount + 1 } : m),
      currentPenalties: phase !== 'result_mix' && resultPenalty
        ? [{ penalty: resultPenalty, partnerId: partner?.id, partnerName: partner?.name }]
        : gameState.currentPenalties,
    });
    router.push('/play/fate');
  };

  // ═══════════════════════════════════════════════════════════
  //  DERIVED
  // ═══════════════════════════════════════════════════════════
  const showResult = phase === 'result_single' || phase === 'result_pair_done';
  const showNext = showResult || (phase === 'result_mix' && mixLeft === 0);
  const isPenaltyStep = step === 'select_punishment';
  const isTargetStep = step === 'select_target';

  return (
    <main className="flex flex-col min-h-screen max-h-screen overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 40%, #1A0A33 0%, #0F0F1A 60%, #0A0A12 100%)' }}>

      {/* ═══ HEADER ═══ */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full border border-purple-700/40" />
          <div className="absolute inset-1 rounded-full border border-purple-600/30" />
          <div className="absolute inset-2 rounded-full border border-purple-500/20" />
          <div className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: isTargetStep ? '#06B6D4' : '#A855F7',
              boxShadow: isTargetStep ? '0 0 8px #06B6D4' : '0 0 8px #A855F7',
            }} />
        </div>
        <div className="flex-1 text-center">
          {isPenaltyStep ? (
            <>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-base">🎰</span>
                <span className="font-black text-base tracking-wider text-white">PHÁN QUYẾT</span>
              </div>
              <p className="text-xs font-bold tracking-widest"
                style={{ background: 'linear-gradient(90deg,#A855F7,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                VÒNG QUAY HÌNH PHẠT
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-base">🎯</span>
                <span className="font-black text-base tracking-wider text-white">TÌM ĐỒNG ĐỘI</span>
              </div>
              <p className="text-xs font-bold tracking-widest"
                style={{ background: 'linear-gradient(90deg,#06B6D4,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                VÒNG QUAY NGƯỜI CHƠI
              </p>
            </>
          )}
        </div>
        <div className="w-10 h-10 shrink-0" />
      </div>

      {/* ═══ SUBTITLE ═══ */}
      {victim && (
        <div className="px-5 pb-2 shrink-0">
          {isPenaltyStep ? (
            <p className="text-sm text-gray-300">
              Số phận của{' '}
              <span className="font-black" style={{ color: '#F472B6', textShadow: '0 0 8px rgba(244,114,182,0.6)' }}>
                {victim.name} {victim.emoji}
              </span> nằm ở đây... <span style={{ filter: 'drop-shadow(0 0 4px #F87171)' }}>🎯</span>
            </p>
          ) : (
            <div className="space-y-1">
              {/* Compact penalty result banner */}
              <div className="flex items-center justify-center gap-2 glass rounded-xl px-3 py-2 border border-cyan-500/20">
                <span className="text-lg">{resultPenalty?.icon}</span>
                <span className="text-cyan-300 font-black text-sm">{resultPenalty?.name.toUpperCase()}</span>
                <span className="text-gray-500 text-xs">—</span>
                <span className="text-pink-400 text-xs font-bold">Với ai đây?! 😏</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ DRUM AREA (flex-1 = fills remaining space) ═══ */}
      <div className="flex-1 flex flex-col justify-center overflow-hidden relative">

        {/* ── Penalty Wheel ── */}
        <div style={{
          opacity: isPenaltyStep && !transitioning ? 1 : 0,
          transition: 'opacity 0.3s ease',
          position: isPenaltyStep ? 'relative' : 'absolute',
          inset: isPenaltyStep ? undefined : 0,
          pointerEvents: isPenaltyStep ? 'auto' : 'none',
        }}
          className="flex-1 flex flex-col justify-center overflow-hidden">
          {mounted && list.length > 0 && (
            <DrumSpinner
              items={list}
              spinRef={penaltySpinRef}
              keyExtractor={(p, i) => `${p.id}-${i}`}
              renderItem={isSecret ? SecretRow : PenaltyRow}
              renderFocusOverlay={(item, idx) => PenaltyFocusOverlay(item, idx, isSecret)}
              onSpinEnd={handleSpinEnd}
            />
          )}
        </div>

        {/* ── Player Wheel ── */}
        <div style={{
          opacity: isTargetStep && !transitioning ? 1 : 0,
          transition: 'opacity 0.3s ease',
          position: isTargetStep ? 'relative' : 'absolute',
          inset: isTargetStep ? undefined : 0,
          pointerEvents: isTargetStep ? 'auto' : 'none',
        }}
          className="flex-1 flex flex-col justify-center overflow-hidden">
          {mounted && isTargetStep && eligible.length > 0 && (
            <DrumSpinner
              items={eligible}
              spinRef={playerSpinRef}
              keyExtractor={(p, i) => `${p.id}-${i}`}
              renderItem={PlayerRow}
              renderFocusOverlay={PlayerFocusOverlay}
              onSpinEnd={handlePlayerSpinEnd}
            />
          )}
        </div>

        {/* ═══ RESULT OVERLAYS (penalty step only) ═══ */}
        {isPenaltyStep && showResult && resultPenalty && (
          <div className="px-4 mt-3">
            {secretMode && !secretReveal ? (
              <div onClick={handleReveal}
                className="rounded-2xl border border-purple-500 p-6 text-center cursor-pointer select-none"
                style={{
                  background: 'linear-gradient(135deg,#1a0533,#0d1a33)', boxShadow: '0 0 28px rgba(168,85,247,0.5)',
                  transform: flipAnim ? 'rotateY(90deg)' : 'rotateY(0deg)', transition: 'transform 0.22s ease',
                }}>
                <div className="text-3xl mb-3 space-x-1">🔮 🔮 🔮</div>
                <p className="text-white font-black text-xl tracking-wide">CHẠM ĐỂ LẬT</p>
                <p className="text-purple-300 text-2xl mt-2 animate-pulse">❓❓❓</p>
              </div>
            ) : (
              <div className="rounded-2xl border p-5 text-center"
                style={{
                  background: 'linear-gradient(135deg,#1a0533,#0A0A1A)', borderColor: '#A855F780', boxShadow: '0 0 25px rgba(168,85,247,0.4)',
                  transform: flipAnim ? 'rotateY(90deg)' : 'rotateY(0deg)', transition: 'transform 0.22s ease',
                }}>
                <div className="text-5xl mb-2">{resultPenalty.icon}</div>
                <p className="text-2xl font-black text-white mb-1">{resultPenalty.name.toUpperCase()}!</p>
                {partner
                  ? <p className="text-purple-300 text-sm">Cùng với <strong>{partner.emoji} {partner.name}</strong></p>
                  : <p className="text-gray-500 text-xs italic">&ldquo;{victim?.name} ơi, chịu đi nha! 😈&rdquo;</p>}
              </div>
            )}
          </div>
        )}

        {/* ═══ PAIR RESULT (target step — after player spin) ═══ */}
        {isTargetStep && phase === 'result_pair_done' && resultPenalty && partner && (
          <div className="px-4 mt-3">
            <div className="rounded-2xl border p-5 text-center"
              style={{ background: 'linear-gradient(135deg,#0A1E2E,#0A0A1A)', borderColor: 'rgba(6,182,212,0.5)', boxShadow: '0 0 25px rgba(6,182,212,0.4)' }}>
              <div className="text-5xl mb-2">{resultPenalty.icon}</div>
              <p className="text-2xl font-black text-white mb-1">{resultPenalty.name.toUpperCase()}!</p>
              <p className="text-cyan-300 text-sm">
                <strong>{victim?.emoji} {victim?.name}</strong> cùng với <strong>{partner.emoji} {partner.name}</strong>
              </p>
            </div>
          </div>
        )}

        {/* ═══ TRANSITIONING indicator ═══ */}
        {transitioning && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-4xl mb-3 animate-bounce">🎯</div>
              <p className="text-cyan-400 font-black text-sm tracking-widest animate-pulse">TÌM ĐỒNG ĐỘI...</p>
            </div>
          </div>
        )}

        {/* ═══ MIX RESULTS (penalty step) ═══ */}
        {isPenaltyStep && phase === 'result_mix' && (
          <div className="px-4 mt-3 space-y-3">
            <div className="rounded-2xl border p-4 text-center"
              style={{ background: 'linear-gradient(135deg,#2d0a0a,#0A0A1A)', borderColor: '#DC262680' }}>
              <p className="text-xl font-black text-white">⚡ MIX {resultPenalty?.mixCount} — COMBO! ⚡</p>
            </div>
            {mixResults.length > 0 && (
              <div className="glass rounded-xl border border-purple-500/30 p-4">
                {mixResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-t border-white/5 first:border-0">
                    <span className="text-gray-500 text-xs">#{i + 1}</span>
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

      {/* ═══ FOOTER ═══ */}
      <div className="px-4 pb-6 pt-3 shrink-0 space-y-3" style={{ borderTop: `1px solid ${isTargetStep ? 'rgba(6,182,212,0.15)' : 'rgba(168,85,247,0.1)'}` }}>

        {/* tagline */}
        {isPenaltyStep && (
          <p className="text-center text-xs tracking-widest uppercase" style={{ color: 'rgba(156,163,175,0.5)' }}>
            Thua là phải chịu. Không chạy đâu được. 💀
          </p>
        )}

        {/* Secret toggle — only in penalty step idle */}
        {isPenaltyStep && (
          <div className="flex items-center justify-center gap-2" suppressHydrationWarning>
            <span className="text-base">🤫</span>
            <span className={`text-sm font-bold ${mounted && secretMode ? 'text-white' : 'text-gray-600'}`} suppressHydrationWarning>BÍ MẬT</span>
            <button onClick={phase === 'idle' ? toggleSecretMode : undefined}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ml-1 ${phase !== 'idle' ? 'pointer-events-none opacity-60' : ''}`}
              style={{ background: mounted && secretMode ? 'linear-gradient(90deg,#7C3AED,#EC4899)' : 'rgba(75,85,99,0.6)', boxShadow: mounted && secretMode ? '0 0 12px rgba(168,85,247,0.5)' : 'none' }}
              suppressHydrationWarning>
              <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
                style={{ left: mounted && secretMode ? '28px' : '4px' }} suppressHydrationWarning />
            </button>
          </div>
        )}

        {/* ── Penalty step buttons ── */}
        {isPenaltyStep && (phase === 'idle' || phase === 'spinning') && (
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

        {/* Secret reveal */}
        {isPenaltyStep && phase === 'result_secret' && (
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

        {/* ── Target step: Player spin button ── */}
        {isTargetStep && (phase === 'result_pair_select' || phase === 'result_pair_spinning') && (
          <button onClick={handlePlayerSpin}
            disabled={phase === 'result_pair_spinning'}
            className="w-full py-4 rounded-full font-black text-white text-base disabled:opacity-60 active:scale-95 transition"
            style={{
              background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 40%, #22D3EE 100%)',
              boxShadow: '0 4px 24px rgba(6,182,212,0.55)',
            }}>
            {phase === 'result_pair_spinning' ? '🌀 Đang tìm...' : '🎯 QUAY TÌM ĐỒNG ĐỘI'}
          </button>
        )}

        {/* ── Next button ── */}
        {showNext && (
          <button onClick={handleNext}
            className="w-full py-4 rounded-full font-black text-white text-base active:scale-95 transition"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', boxShadow: '0 4px 20px rgba(168,85,247,0.4)' }}>
            ĐẾN VÒNG CƠ HỘI ➡️
          </button>
        )}
      </div>
    </main>
  );
}
