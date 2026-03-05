'use client';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import { useGameState } from '@/hooks/useGameState';
import { DEFAULT_PENALTIES, PENALTY_GROUPS, INGREDIENTS } from '@/lib/constants';
import type { IngredientId } from '@/lib/types';

export default function PenaltiesPage() {
  const router = useRouter();
  const { gameState, updateState } = useGameState();

  const getSlots = (penaltyId: string, defaultSlots: number): number => {
    return (gameState.penaltySlots ?? {})[penaltyId] ?? defaultSlots;
  };

  const changeSlots = (penaltyId: string, defaultSlots: number, delta: number) => {
    const current = getSlots(penaltyId, defaultSlots);
    const next = Math.max(0, Math.min(5, current + delta));
    updateState({
      penaltySlots: { ...(gameState.penaltySlots ?? {}), [penaltyId]: next },
    });
  };

  const toggleIngredient = (id: IngredientId) => {
    const current = gameState.selectedIngredients;
    updateState({
      selectedIngredients: current.includes(id)
        ? current.filter(i => i !== id)
        : [...current, id],
    });
  };

  const togglePenalty = (id: string) => {
    const current = gameState.selectedPenalties;
    updateState({
      selectedPenalties: current.includes(id)
        ? current.filter(p => p !== id)
        : [...current, id],
    });
  };

  const isPenaltyEnabled = (penaltyId: string) => {
    const penalty = DEFAULT_PENALTIES.find(p => p.id === penaltyId);
    if (!penalty) return false;
    if (penalty.ingredient && !gameState.selectedIngredients.includes(penalty.ingredient)) {
      return false;
    }
    return true;
  };

  const canProceed = gameState.selectedPenalties.filter(id => isPenaltyEnabled(id)).length > 0;

  return (
    <main className="flex flex-col min-h-screen">
      <AppHeader step={2} totalSteps={3} />

      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto pb-32">
        <div className="text-center">
          <h2 className="text-2xl font-black text-white">🍹 Chọn Nguyên Liệu</h2>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">&amp; Hình Phạt</h2>
        </div>

        {/* Ingredient toggles */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Nguyên Liệu Có Sẵn</p>
          <div className="flex flex-wrap gap-2">
            {INGREDIENTS.map(ing => {
              const active = gameState.selectedIngredients.includes(ing.id);
              return (
                <button
                  key={ing.id}
                  onClick={() => toggleIngredient(ing.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition ${
                    active
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                      : 'bg-white/5 border-white/10 text-gray-500'
                  }`}
                >
                  <span>{ing.icon}</span>
                  <span>{ing.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Penalty groups */}
        {PENALTY_GROUPS.map(group => {
          const groupPenalties = DEFAULT_PENALTIES.filter(p => p.type === group.type);
          return (
            <div key={group.type} className="glass rounded-2xl p-4 border border-white/10">
              <h3 className="font-bold text-white mb-3">{group.label}</h3>
              <div className="space-y-2">
                {groupPenalties.map(penalty => {
                  const enabled = isPenaltyEnabled(penalty.id);
                  const selected = gameState.selectedPenalties.includes(penalty.id);
                  const slots = getSlots(penalty.id, penalty.slots);
                  return (
                    <div
                      key={penalty.id}
                      className={`flex items-center gap-3 ${!enabled ? 'opacity-30' : ''}`}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selected && enabled}
                        disabled={!enabled}
                        onChange={() => togglePenalty(penalty.id)}
                        className="accent-purple-500 w-4 h-4 shrink-0"
                      />
                      <span className="text-lg shrink-0">{penalty.icon}</span>
                      <span className="flex-1 text-sm text-gray-200 min-w-0">{penalty.name}</span>

                      {/* Slot stepper: − ×N + */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => changeSlots(penalty.id, penalty.slots, -1)}
                          disabled={!enabled || slots <= 0}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition active:scale-90 disabled:opacity-30"
                          style={{
                            background: 'rgba(168,85,247,0.15)',
                            border: '1px solid rgba(168,85,247,0.35)',
                            color: '#C084FC',
                          }}
                        >
                          −
                        </button>
                        <span
                          className="text-xs font-black w-7 text-center tabular-nums"
                          style={{ color: slots === 0 ? '#4B5563' : '#C084FC' }}
                        >
                          ×{slots}
                        </span>
                        <button
                          onClick={() => changeSlots(penalty.id, penalty.slots, +1)}
                          disabled={!enabled || slots >= 5}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition active:scale-90 disabled:opacity-30"
                          style={{
                            background: 'rgba(168,85,247,0.15)',
                            border: '1px solid rgba(168,85,247,0.35)',
                            color: '#C084FC',
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-gradient-to-t from-dark-bg to-transparent max-w-[480px] mx-auto">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canProceed}
          onClick={() => router.push('/setup/exclusions')}
        >
          Tiếp Theo →
        </Button>
      </div>
    </main>
  );
}
