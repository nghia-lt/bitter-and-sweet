'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Card } from '@/components/ui/Card';
import { weightedRandom, filterFoodPenalties, getActivePenalties } from '@/lib/wheel-logic';
import { getEligiblePartners } from '@/lib/exclusion-logic';
import type { Penalty, Player, PenaltyResult } from '@/lib/types';

type SpinState = 'idle' | 'spinning' | 'result_single' | 'result_pair_select' | 'result_pair_done' | 'result_mix';
type SecretReveal = 'hidden' | 'revealed';

export default function SpinPage() {
  const router = useRouter();
  const { gameState, updateState } = useGameState();

  const victim = gameState.members.find(m => m.id === gameState.currentVictimId);

  const [spinState, setSpinState] = useState<SpinState>('idle');
  const [currentPenalty, setCurrentPenalty] = useState<Penalty | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Player | null>(null);
  const [mixResults, setMixResults] = useState<PenaltyResult[]>([]);
  const [mixSpinsLeft, setMixSpinsLeft] = useState(0);
  const [secretReveal, setSecretReveal] = useState<SecretReveal>('hidden');
  const [isSpinning, setIsSpinning] = useState(false);

  const activePenalties = getActivePenalties(gameState.selectedPenalties);
  const secretMode = gameState.secretMode;

  const handleSpin = useCallback(() => {
    if (isSpinning || activePenalties.length === 0) return;
    setIsSpinning(true);
    setSecretReveal('hidden');

    // Simulate spin delay
    setTimeout(() => {
      const result = weightedRandom(activePenalties);
      setCurrentPenalty(result);
      setIsSpinning(false);

      if (result.isMix && result.mixCount) {
        setMixResults([]);
        setMixSpinsLeft(result.mixCount);
        setSpinState('result_mix');
      } else if (result.requiresPartner) {
        setSpinState('result_pair_select');
      } else {
        setSpinState('result_single');
      }
    }, 2000);
    setSpinState('spinning');
  }, [isSpinning, activePenalties]);

  const handleMixSpin = () => {
    const foodPenalties = filterFoodPenalties(gameState.selectedPenalties);
    const result = weightedRandom(foodPenalties);
    const newResults = [...mixResults, { penalty: result }];
    setMixResults(newResults);
    const remaining = mixSpinsLeft - 1;
    setMixSpinsLeft(remaining);
    if (remaining === 0) {
      // Done with mix
      updateState({ currentPenalties: newResults });
    }
  };

  const handleSelectPartner = (partner: Player) => {
    setSelectedPartner(partner);
    setSpinState('result_pair_done');
    updateState({
      currentPenalties: [{
        penalty: currentPenalty!,
        partnerId: partner.id,
        partnerName: partner.name,
      }],
    });
  };

  const handleNext = () => {
    // Update victim penalty count
    const updatedMembers = gameState.members.map(m =>
      m.id === victim?.id ? { ...m, penaltyCount: m.penaltyCount + 1 } : m
    );
    updateState({ members: updatedMembers });
    router.push('/play/fate');
  };

  const eligiblePartners = currentPenalty
    ? getEligiblePartners(currentPenalty, victim!, gameState.members, gameState.exclusionRules)
    : [];

  // Shuffle for visual variety
  const shuffledPenalties = [...activePenalties].sort(() => Math.random() - 0.5);

  return (
    <main className="flex flex-col min-h-screen">
      <div className="px-4 py-4 border-b border-purple-900/30">
        <div className="flex items-center justify-between">
          <span className="text-xs text-purple-400 font-bold uppercase tracking-widest">🎰 PHÁN QUYẾT</span>
          <span className="text-xs text-gray-500">Vòng Quay Hình Phạt</span>
        </div>
        {victim && (
          <p className="text-center text-sm text-gray-300 mt-2">
            Số phận của <span className="text-purple-300 font-bold">{victim.name} {victim.emoji}</span> nằm ở đây... 🎯
          </p>
        )}
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto pb-36">
        {/* Penalty List (scroll wheel style) */}
        <div className="space-y-2">
          {shuffledPenalties.map((penalty, idx) => {
            const isFocused = currentPenalty?.id === penalty.id;
            return (
              <Card
                key={penalty.id}
                glow={isFocused ? 'purple' : 'none'}
                className={`transition-all ${isFocused ? 'scale-105 border-purple-400' : 'opacity-70'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{secretMode && spinState === 'idle' ? '🔒' : penalty.icon}</span>
                  <span className="flex-1 font-semibold text-sm text-white">
                    {secretMode && spinState === 'idle' ? 'Bí mật ???' : penalty.name}
                  </span>
                  <span className="text-xs text-purple-400 opacity-60">×{penalty.slots}</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Pair partner selection */}
        {spinState === 'result_pair_select' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400 text-center">
              {currentPenalty?.icon} <strong className="text-white">{currentPenalty?.name}</strong> — Với ai?
            </p>
            {eligiblePartners.map(partner => (
              <button
                key={partner.id}
                onClick={() => handleSelectPartner(partner)}
                className="w-full glass border border-purple-500/30 rounded-xl px-4 py-3 flex items-center gap-3 text-left hover:border-purple-500 transition"
              >
                <span className="text-2xl">{partner.emoji}</span>
                <span className="text-white font-semibold">{partner.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Mix results */}
        {spinState === 'result_mix' && (
          <Card glow="purple">
            <p className="text-sm font-bold text-white mb-2">⚡ MIX {currentPenalty?.mixCount} — COMBO TỬ THẦN!</p>
            {mixResults.map((r, i) => (
              <div key={i} className="text-sm text-gray-300">
                #{i + 1} {r.penalty.icon} {r.penalty.name}
              </div>
            ))}
            {mixSpinsLeft > 0 && (
              <Button variant="secondary" size="sm" fullWidth onClick={handleMixSpin} className="mt-3">
                Quay tiếp ({mixSpinsLeft} lần còn lại)
              </Button>
            )}
          </Card>
        )}

        {/* Result display */}
        {(spinState === 'result_single' || spinState === 'result_pair_done') && currentPenalty && (
          <div className="text-center py-4">
            {secretMode && secretReveal === 'hidden' ? (
              <Card glow="purple" onClick={() => setSecretReveal('revealed')} className="cursor-pointer">
                <div className="py-6 text-center">
                  <div className="text-4xl mb-2">🔮</div>
                  <p className="text-white font-bold text-lg">CHẠM ĐỂ LẬT</p>
                  <p className="text-gray-500 text-sm mt-1">❓❓❓</p>
                </div>
              </Card>
            ) : (
              <Card glow="purple">
                <div className="py-4 text-center">
                  <div className="text-5xl mb-3">{currentPenalty.icon}</div>
                  <p className="text-2xl font-black text-white">{currentPenalty.name?.toUpperCase()}</p>
                  {selectedPartner && (
                    <p className="text-purple-300 mt-2">
                      Cùng với: <strong>{selectedPartner.emoji} {selectedPartner.name}</strong>
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-3 bg-gradient-to-t from-dark-bg to-transparent max-w-[480px] mx-auto space-y-3">
        {spinState === 'idle' && (
          <div className="flex gap-3">
            <Button variant="secondary" size="md" onClick={() => {/* shuffle */}}>
              ⚡ Xào Trộn
            </Button>
            <Button variant="primary" size="md" fullWidth onClick={handleSpin} disabled={isSpinning}>
              {isSpinning ? 'Đang quay...' : '🎰 Quay Ngay'}
            </Button>
          </div>
        )}

        {spinState === 'spinning' && (
          <div className="text-center text-purple-400 animate-pulse font-bold">
            Đang quay... 🌀
          </div>
        )}

        {(spinState === 'result_single' || spinState === 'result_pair_done' || (spinState === 'result_mix' && mixSpinsLeft === 0)) && (
          <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
            Đã rõ! Tiếp tục ➡️
          </Button>
        )}

        {/* Secret mode toggle */}
        <div className="flex justify-center">
          <Toggle
            checked={secretMode}
            onChange={val => updateState({ secretMode: val })}
            icon="🤫"
            label="BÍ MẬT"
          />
        </div>
      </div>
    </main>
  );
}
