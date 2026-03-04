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
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">& Hình Phạt</h2>
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
                  return (
                    <label
                      key={penalty.id}
                      className={`flex items-center gap-3 cursor-pointer ${!enabled ? 'opacity-30' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected && enabled}
                        disabled={!enabled}
                        onChange={() => togglePenalty(penalty.id)}
                        className="accent-purple-500 w-4 h-4"
                      />
                      <span className="text-lg">{penalty.icon}</span>
                      <span className="flex-1 text-sm text-gray-200">{penalty.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-400">
                        ×{penalty.slots}
                      </span>
                    </label>
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
