'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import { useGameState } from '@/hooks/useGameState';
import { DEFAULT_PENALTIES } from '@/lib/constants';
import type { ExclusionRule } from '@/lib/types';

export default function ExclusionsPage() {
  const router = useRouter();
  const { gameState, updateState } = useGameState();
  const [showTransition, setShowTransition] = useState(false);

  const pairPenalties = DEFAULT_PENALTIES.filter(
    p => p.requiresPartner && gameState.selectedPenalties.includes(p.id)
  );

  const addRule = () => {
    if (pairPenalties.length === 0 || gameState.members.length < 2) return;
    const newRule: ExclusionRule = {
      id: `rule_${Date.now()}`,
      penaltyIds: [pairPenalties[0].id],
      player1Id: gameState.members[0].id,
      player2Id: gameState.members[1].id,
    };
    updateState({ exclusionRules: [...gameState.exclusionRules, newRule] });
  };

  const removeRule = (id: string) => {
    updateState({ exclusionRules: gameState.exclusionRules.filter(r => r.id !== id) });
  };

  const updateRule = (id: string, updates: Partial<ExclusionRule>) => {
    updateState({
      exclusionRules: gameState.exclusionRules.map(r =>
        r.id === id ? { ...r, ...updates } : r
      ),
    });
  };

  const handleStart = () => {
    setShowTransition(true);
    setTimeout(() => router.push('/play/select'), 2000);
  };

  if (showTransition) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-bg z-50">
        <div className="text-center animate-pulse">
          <div className="text-6xl mb-4">💀</div>
          <h2 className="text-4xl font-black text-white tracking-widest">LET THE</h2>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-widest">GAME BEGIN!</h2>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppHeader step={3} totalSteps={3} />

      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto pb-32">
        <div className="text-center">
          <h2 className="text-2xl font-black text-white">⚙️ Luật Ngầm</h2>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">Vùng Cấm Địa</h2>
          <p className="text-gray-500 text-sm mt-2 italic">
            &ldquo;Có những điều... không nên xảy ra.&rdquo;
          </p>
        </div>

        {/* Rules */}
        {gameState.exclusionRules.map(rule => (
          <div key={rule.id} className="glass rounded-2xl p-4 border border-red-500/20 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-red-400 font-bold uppercase">❌ Quy Tắc Loại Trừ</span>
              <button onClick={() => removeRule(rule.id)} className="text-gray-500 hover:text-red-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 min-w-fit">Hình phạt:</span>
                <select
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs"
                  value={rule.penaltyIds[0] || ''}
                  onChange={e => updateRule(rule.id, { penaltyIds: [e.target.value] })}
                >
                  {pairPenalties.map(p => (
                    <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 min-w-fit">Người 1:</span>
                <select
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs"
                  value={rule.player1Id}
                  onChange={e => updateRule(rule.id, { player1Id: e.target.value })}
                >
                  {gameState.members.map(m => (
                    <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 min-w-fit">Người 2:</span>
                <select
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs"
                  value={rule.player2Id}
                  onChange={e => updateRule(rule.id, { player2Id: e.target.value })}
                >
                  {gameState.members.filter(m => m.id !== rule.player1Id).map(m => (
                    <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        {pairPenalties.length > 0 && (
          <button
            onClick={addRule}
            className="w-full glass border border-dashed border-purple-500/40 rounded-2xl py-4 text-purple-400 text-sm flex items-center justify-center gap-2 hover:border-purple-500 transition"
          >
            <Plus className="w-4 h-4" />
            Thêm Quy Tắc
          </button>
        )}

        {pairPenalties.length === 0 && (
          <p className="text-center text-gray-500 text-sm">
            Không có hình phạt đôi nào được chọn
          </p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-gradient-to-t from-dark-bg to-transparent max-w-[480px] mx-auto">
        <Button variant="primary" size="lg" fullWidth onClick={handleStart}>
          🚀 Vào Trận!
        </Button>
      </div>
    </main>
  );
}
