'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { DrumSpinner, useDrumSpin } from '@/components/ui/DrumSpinner';
import { FATE_CONFIG, FATE_WEIGHTS } from '@/lib/constants';
import { checkExclusion } from '@/lib/exclusion-logic';
import type { FateType, Player } from '@/lib/types';

// ── Fate metadata ─────────────────────────────────────────────
const FATE_META: Record<FateType, { icon: string; label: string; glow: string; textColor: string }> = {
  CAM_CHIU:  { icon: '😩', label: 'CAM CHỊU',  glow: 'rgba(107,114,128,0.5)', textColor: '#9CA3AF' },
  CHET_CHUM: { icon: '💀', label: 'CHẾT CHÙM', glow: 'rgba(6,182,212,0.5)',   textColor: '#22D3EE' },
  THOAT_KIP: { icon: '🏃', label: 'THOÁT KÍP', glow: 'rgba(34,197,94,0.5)',  textColor: '#4ADE80' },
  KIM_THIEN: { icon: '✨', label: 'KIM THIỀN', glow: 'rgba(234,179,8,0.5)',  textColor: '#FACC15' },
};

// ── Config per fate: label for secondary wheel ─────────────────
const FATE_SECONDARY: Record<string, { prompt: string; borderColor: string }> = {
  CHET_CHUM: { prompt: '💀 Quay chọn người chết chung:', borderColor: '#22D3EE' },
  THOAT_KIP: { prompt: '🏃 Quay chọn nạn nhân mới:',    borderColor: '#4ADE80' },
  KIM_THIEN: { prompt: '✨ Quay chọn kẻ thế mạng:',     borderColor: '#FACC15' },
};

// ── Fisher-Yates ───────────────────────────────────────────────
function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildShuffledPool(weights: Record<string, number> = FATE_WEIGHTS): FateType[] {
  const pool: FateType[] = (Object.entries(weights) as [FateType, number][])
    .flatMap(([fate, weight]) => Array(Math.max(0, weight)).fill(fate));
  return pool.length > 0 ? fisherYates(pool) : fisherYates(
    // Fallback: at least 1 of each non-zero default
    (Object.keys(FATE_WEIGHTS) as FateType[])
  );
}

// ── Row renderers ──────────────────────────────────────────────
function FateRow(fate: FateType, _f: boolean, _a: boolean, _i: number) {
  const m = FATE_META[fate];
  return (
    <div className="relative flex items-center justify-center gap-3 px-5 h-full w-full text-center">
      <span className="text-2xl">{m.icon}</span>
      <span className="text-white font-semibold text-sm">{m.label}</span>
      <span className="absolute right-5 text-xs text-gray-600">{FATE_CONFIG[fate].probability}%</span>
    </div>
  );
}
function SecretFateRow(_fate: FateType, _f: boolean, _a: boolean, _i: number) {
  return (
    <div className="flex items-center justify-center gap-3 px-5 h-full w-full">
      <span className="text-2xl">🔒</span>
      <span className="text-gray-500 font-semibold text-sm">• • •</span>
    </div>
  );
}
function PlayerRow(p: Player, _f: boolean, _a: boolean, _i: number) {
  return (
    <div className="flex items-center justify-center gap-3 px-5 h-full w-full text-center">
      <span className="text-2xl">{p.emoji}</span>
      <span className="text-white font-semibold text-sm">{p.name}</span>
    </div>
  );
}

// ── Focus overlays ─────────────────────────────────────────────
function FateFocusOverlay(fate: FateType | null, _idx: number) {
  if (!fate) return null;
  const m = FATE_META[fate];
  return (
    <div className="h-full mx-1 rounded-2xl overflow-hidden relative pointer-events-none flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg,rgba(15,15,26,0.95),rgba(13,13,43,0.95))',
        border: `1.5px solid ${m.textColor}80`, boxShadow: `0 0 20px ${m.glow},0 0 6px ${m.glow}`, padding: '0 16px' }}>
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
function SecretFateFocusOverlay(_fate: FateType | null, _idx: number) {
  return (
    <div className="h-full mx-1 rounded-2xl overflow-hidden relative pointer-events-none flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg,rgba(15,15,26,0.95),rgba(13,13,43,0.95))',
        border: '1.5px solid rgba(168,85,247,0.5)', boxShadow: '0 0 20px rgba(168,85,247,0.3),0 0 6px rgba(168,85,247,0.2)', padding: '0 16px' }}>
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
function PlayerFocusOverlay(player: Player | null, _idx: number) {
  if (!player) return null;
  return (
    <div className="h-full mx-1 rounded-2xl overflow-hidden relative pointer-events-none flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,rgba(6,78,59,0.5),rgba(15,15,26,0.95))',
        border: '1.5px solid rgba(52,211,153,0.6)', boxShadow: '0 0 20px rgba(52,211,153,0.3)', padding: '0 16px' }}>
      <div className="flex items-center justify-between w-full">
        <span className="text-emerald-400 text-lg font-bold select-none">◀</span>
        <div className="flex items-center gap-2 justify-center flex-1">
          <span className="text-3xl">{player.emoji}</span>
          <p className="font-black text-xl text-white">{player.name}</p>
        </div>
        <span className="text-emerald-400 text-lg font-bold select-none">▶</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function FatePage() {
  const router = useRouter();
  const { gameState, updateState } = useGameState();

  const victim = gameState.members.find(m => m.id === gameState.currentVictimId);
  // Players excluding the current victim — for secondary wheel
  const otherPlayers = gameState.members.filter(m => m.id !== gameState.currentVictimId);

  // Executioner = partnerId from the current penalty (pair penalty)
  const currentExecutioner = gameState.currentPenalties?.[0]?.partnerId
    ? gameState.members.find(m => m.id === gameState.currentPenalties[0].partnerId)
    : null;

  // ── State ──────────────────────────────────────────────────
  const [pool, setPool] = useState<FateType[]>([]);
  const [shuffledPool, setShuffledPool] = useState<FateType[]>([]);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'result_secret' | 'result' | 'secondary_idle' | 'secondary_spinning' | 'secondary_done'>('idle');
  const [result, setResult] = useState<FateType | null>(null);
  const [mounted, setMounted] = useState(false);
  const [flipAnim, setFlipAnim] = useState(false);
  // Secondary wheel state
  const [secondaryPlayers, setSecondaryPlayers] = useState<Player[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<Player | null>(null);
  const [conflictToast, setConflictToast] = useState<string | null>(null);
  const [newExecutioner, setNewExecutioner] = useState<Player | null>(null);

  const secretMode = gameState.secretMode;
  const secretModeRef = useRef(secretMode);
  useEffect(() => { secretModeRef.current = secretMode; }, [secretMode]);

  const { spinRef, spin } = useDrumSpin();
  const { spinRef: playerSpinRef, spin: playerSpin } = useDrumSpin();

  // ── Mount: build shuffled fate pool ───────────────────────
  useEffect(() => {
    const weights = gameState.fateWeights ?? FATE_WEIGHTS;
    const initial = buildShuffledPool(weights);
    setPool(initial);
    setShuffledPool(initial);
    setMounted(true);
  }, []);

  // ── When result needs secondary wheel, shuffle players ────
  useEffect(() => {
    if (phase === 'result' && result && result !== 'CAM_CHIU') {
      // For THOAT_KIP allow victim to escape to ANY player including themselves
      const candidates = result === 'THOAT_KIP'
        ? fisherYates(gameState.members)
        : fisherYates(otherPlayers);
      setSecondaryPlayers(candidates);
      setSelectedTarget(null);
      setConflictToast(null);
      setNewExecutioner(null);
      setPhase('secondary_idle');
    }
  }, [phase, result]); // eslint-disable-line react-hooks/exhaustive-deps

  const activePool = shuffledPool.length > 0 ? shuffledPool : pool;
  const isSecret = mounted && secretMode && (phase === 'idle' || phase === 'spinning' || phase === 'result_secret');

  // ── Fate wheel handlers ────────────────────────────────────
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
    if (secretModeRef.current) { setPhase('result_secret'); } else { setPhase('result'); }
  }, []);

  const handleReveal = () => {
    setFlipAnim(true);
    setTimeout(() => { setPhase('result'); setTimeout(() => setFlipAnim(false), 250); }, 220);
  };

  const handleShuffle = () => {
    if (phase === 'spinning') return;
    setShuffledPool(buildShuffledPool(gameState.fateWeights ?? FATE_WEIGHTS));
    setPhase('idle');
    setResult(null);
    setFlipAnim(false);
  };

  // ── Secondary player wheel handlers ───────────────────────
  const handleSecondarySpinStart = useCallback(() => {
    if (phase === 'secondary_spinning' || secondaryPlayers.length === 0) return;
    const landIdx = Math.floor(Math.random() * secondaryPlayers.length);
    setPhase('secondary_spinning');
    playerSpin(landIdx);
  }, [phase, secondaryPlayers, playerSpin]);

  /**
   * Called when the secondary wheel stops on a player.
   * Handles role-conflict: if the selected target is the current executioner (partner),
   * the conflict must be resolved — a 3rd player is randomly chosen as the new executioner.
   */
  const handleSecondaryWheelEnd = useCallback((player: Player, _index: number) => {
    setSelectedTarget(player);

    // ── Determine the new victim based on result type ────────
    const isChetChum = result === 'CHET_CHUM';
    // For CHET_CHUM both share penalty; for THOAT_KIP/KIM_THIEN the selected player becomes the sole new victim
    const effectiveNewVictim = player;

    // ── 1. Role conflict: executioner === selected target ────
    const hasRoleConflict = !!(currentExecutioner && player.id === currentExecutioner.id);

    // ── 2. Exclusion rule violation: executioner + newVictim forbidden pairing ─
    const penalties = gameState.currentPenalties ?? [];
    const rules = gameState.exclusionRules ?? [];
    const hasExclusionViolation = !hasRoleConflict && !!currentExecutioner && penalties.some(
      pr => checkExclusion(pr.penalty, effectiveNewVictim, currentExecutioner, rules)
    );

    const needsNewExecutioner = hasRoleConflict || hasExclusionViolation;

    if (needsNewExecutioner) {
      // Build executioner pool:
      // - Never include the new victim (player)
      // - For CHET_CHUM also exclude original victim
      // - Also exclude anyone who would violate exclusion rules with the new victim
      const pool = gameState.members.filter(m => {
        if (m.id === player.id) return false; // can't execute on yourself
        if (isChetChum && m.id === gameState.currentVictimId) return false; // original victim also receiving penalty
        // Check exclusion rules for every current penalty
        if (penalties.some(pr => checkExclusion(pr.penalty, effectiveNewVictim, m, rules))) return false;
        return true;
      });

      let autoExecutioner: Player | null = null;
      if (pool.length > 0) {
        autoExecutioner = pool[Math.floor(Math.random() * pool.length)];
        setNewExecutioner(autoExecutioner);
      }

      // Dynamic toast based on WHY we needed a new executioner
      let toast: string;
      if (hasExclusionViolation) {
        // Forbidden rule triggered
        toast = autoExecutioner
          ? `⚠️ Luật cấm được kích hoạt! ${currentExecutioner!.name} và ${player.name} không thể ghép cặp. Hệ thống tự động chỉ định ${autoExecutioner.name} sẽ là người thực thi hình phạt cho ${player.name}!`
          : `⚠️ Luật cấm được kích hoạt! ${currentExecutioner!.name} và ${player.name} không thể ghép cặp. Không có ai đủ điều kiện thực thi! 😈`;
      } else if (isChetChum) {
        toast = autoExecutioner
          ? `⚠️ ${player.name} bị kéo vào! ${autoExecutioner.name} sẽ thực thi hình phạt cho cả ${victim?.name ?? 'nạn nhân'} và ${player.name}!`
          : `⚠️ ${player.name} bị kéo vào! Không có ai thực thi – cả hai tự xử nhé! 😈`;
      } else {
        toast = autoExecutioner
          ? `⚠️ ${player.name} bị thế mạng! ${autoExecutioner.name} sẽ thực thi hình phạt cho ${player.name}!`
          : `⚠️ ${player.name} bị thế mạng! Không có ai thực thi – tự xử đi nhé! 😈`;
      }
      setConflictToast(toast);
    }

    setPhase('secondary_done');
  }, [currentExecutioner, gameState.members, gameState.currentVictimId, gameState.currentPenalties, gameState.exclusionRules, victim, result]);

  // ── Navigation handlers ────────────────────────────────────
  const handleDirectNext = () => {
    // CAM_CHIU: victim accepts, no secondary selection needed
    updateState({
      fateContext: {
        destinyCard: result ?? 'CAM_CHIU',
        originalVictimId: gameState.currentVictimId ?? '',
      },
    });
    router.push('/result');
  };

  const handleSecondaryDone = () => {
    if (!selectedTarget || !result) return;

    // Build fateContext — always records originalVictim + what card + who was chosen
    const ctx = {
      destinyCard: result,
      originalVictimId: gameState.currentVictimId ?? '',
      targetId: selectedTarget.id,
      newExecutionerId: newExecutioner?.id,
      conflictMessage: conflictToast ?? undefined,
    };

    if (result === 'CHET_CHUM') {
      // Victim and selectedTarget both endure the penalty
      // Keep currentVictimId as-is (original victim stays)
      updateState({ fateContext: ctx });
      router.push('/result');
    } else if (result === 'THOAT_KIP') {
      // Victim escapes: selectedTarget becomes the new victim
      updateState({ currentVictimId: selectedTarget.id, fateContext: ctx });
      router.push('/result');
    } else if (result === 'KIM_THIEN') {
      // selectedTarget takes entire punishment
      updateState({ currentVictimId: selectedTarget.id, fateContext: ctx });
      router.push('/result');
    }
  };

  const isSecondaryPhase = phase === 'secondary_idle' || phase === 'secondary_spinning' || phase === 'secondary_done';

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

      {/* ── Fate status badge (shown when secondary phase is active) ── */}
      {isSecondaryPhase && result && FATE_SECONDARY[result] && (
        <div className="px-4 mb-1 shrink-0">
          <div className="rounded-xl border p-3 text-center"
            style={{ borderColor: FATE_SECONDARY[result].borderColor + '60', background: 'rgba(15,15,26,0.8)' }}>
            <p className="text-xs font-bold tracking-widest uppercase"
              style={{ color: FATE_SECONDARY[result].borderColor }}>
              {FATE_META[result].icon} {FATE_META[result].label}
            </p>
            <p className="text-gray-400 text-xs mt-1">{FATE_SECONDARY[result].prompt}</p>
          </div>
        </div>
      )}

      {/* ═══ DRUM AREA ═══ */}
      <div className="flex-1 flex flex-col justify-center overflow-hidden">

        {/* ── Fate wheel (hidden during secondary phase) ── */}
        {!isSecondaryPhase && mounted && activePool.length > 0 && (
          <DrumSpinner
            items={activePool}
            spinRef={spinRef}
            keyExtractor={(fate, i) => `${fate}-${i}`}
            renderItem={isSecret ? SecretFateRow : FateRow}
            renderFocusOverlay={isSecret ? SecretFateFocusOverlay : FateFocusOverlay}
            onSpinEnd={handleSpinEnd}
          />
        )}

        {/* ── Secondary player wheel ── */}
        {isSecondaryPhase && result && FATE_SECONDARY[result] && (
          <div className="flex-1 flex flex-col justify-center overflow-hidden">
            {/* Secondary DrumSpinner */}
            {secondaryPlayers.length > 0 && (
              <DrumSpinner
                items={secondaryPlayers}
                spinRef={playerSpinRef}
                keyExtractor={(p, i) => `${p.id}-${i}`}
                renderItem={PlayerRow}
                renderFocusOverlay={PlayerFocusOverlay}
                onSpinEnd={handleSecondaryWheelEnd}
              />
            )}

            {/* Conflict toast ── shown after secondary wheel stops */}
            {phase === 'secondary_done' && conflictToast && (
              <div className="px-4 mt-3">
                <div className="rounded-2xl border border-orange-500/60 p-4 text-center animate-pulse"
                  style={{ background: 'linear-gradient(135deg,rgba(120,53,15,0.4),rgba(15,15,26,0.9))', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }}>
                  <p className="text-orange-300 font-bold text-sm leading-relaxed">{conflictToast}</p>
                  {newExecutioner && (
                    <p className="text-white font-black text-base mt-2">{newExecutioner.emoji} {newExecutioner.name} sẽ thực thi! ⚡</p>
                  )}
                </div>
              </div>
            )}

            {/* Selected target display (no conflict) */}
            {phase === 'secondary_done' && selectedTarget && !conflictToast && (
              <div className="px-4 mt-3">
                <div className="rounded-2xl border border-emerald-500/60 p-4 text-center"
                  style={{ background: 'linear-gradient(135deg,rgba(6,78,59,0.3),rgba(15,15,26,0.9))', boxShadow: '0 0 20px rgba(52,211,153,0.2)' }}>
                  <p className="text-emerald-400 font-bold text-sm">Số phận chọn:</p>
                  <p className="text-white font-black text-xl mt-1">{selectedTarget.emoji} {selectedTarget.name}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ FOOTER ═══ */}
      <div className="px-4 pb-6 pt-3 shrink-0 space-y-3" style={{ borderTop: '1px solid rgba(168,85,247,0.1)' }}>
        <p className="text-center text-xs tracking-widest uppercase" style={{ color: 'rgba(156,163,175,0.5)' }}>
          SỐ PHẬN CHƯA KẾT THÚC Ở ĐÂY ĐÂU... 🎭
        </p>

        {/* BÍ MẬT toggle — only shown/enabled at idle */}
        <div className="flex items-center justify-center gap-2" suppressHydrationWarning>
          <span className="text-base">🤫</span>
          <span className={`text-sm font-bold ${mounted && secretMode ? 'text-white' : 'text-gray-600'}`} suppressHydrationWarning>BÍ MẬT</span>
          <button
            onClick={phase === 'idle' ? () => updateState({ secretMode: !secretMode }) : undefined}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ml-1 ${phase !== 'idle' ? 'pointer-events-none opacity-60' : ''}`}
            style={{ background: mounted && secretMode ? 'linear-gradient(90deg,#7C3AED,#EC4899)' : 'rgba(75,85,99,0.6)', boxShadow: mounted && secretMode ? '0 0 12px rgba(168,85,247,0.5)' : 'none' }}
            suppressHydrationWarning>
            <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
              style={{ left: mounted && secretMode ? '28px' : '4px' }} suppressHydrationWarning />
          </button>
        </div>

        {/* ── Fate wheel buttons ── */}
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
            style={{ background: 'linear-gradient(135deg,#B91C1C,#EA580C)', boxShadow: '0 0 32px rgba(239,68,68,0.7)', animation: 'pulse 1s cubic-bezier(0.4,0,0.6,1) infinite' }}>
            👀 MỞ KẾT QUẢ
          </button>
        )}

        {/* CAM_CHIU direct next */}
        {phase === 'result' && result === 'CAM_CHIU' && (
          <button onClick={handleDirectNext}
            className="w-full py-4 rounded-full font-black text-white text-base active:scale-95 transition"
            style={{ background: 'linear-gradient(135deg,#374151,#1F2937)', border: '1px solid rgba(156,163,175,0.3)' }}>
            😩 Cam Chịu... tiếp thôi
          </button>
        )}

        {/* ── Secondary wheel buttons ── */}
        {phase === 'secondary_idle' && (
          <button onClick={handleSecondarySpinStart}
            className="w-full py-4 rounded-full font-black text-white text-base active:scale-95 transition"
            style={{ background: 'linear-gradient(135deg,#0F766E,#065F46)', boxShadow: '0 4px 24px rgba(52,211,153,0.4)' }}>
            🎰 QUAY CHỌN NGƯỜI
          </button>
        )}
        {phase === 'secondary_spinning' && (
          <div className="w-full py-4 text-center">
            <p className="text-emerald-400 font-bold animate-pulse">🌀 Số phận đang chọn...</p>
          </div>
        )}
        {phase === 'secondary_done' && (
          <button onClick={handleSecondaryDone}
            className="w-full py-4 rounded-full font-black text-white text-base active:scale-95 transition"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#EC4899)', boxShadow: '0 4px 20px rgba(168,85,247,0.4)' }}>
            ⚡ XÁC NHẬN & TIẾP TỤC
          </button>
        )}
      </div>
    </main>
  );
}
