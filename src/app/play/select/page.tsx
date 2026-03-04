'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/ui/Button';

export default function SelectVictimPage() {
  const router = useRouter();
  const { gameState, updateState } = useGameState();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const selectedPlayer = gameState.members.find(m => m.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setConfirmed(false);
  };

  const handleConfirm = () => {
    if (!selectedId) return;
    setConfirmed(true);
    updateState({ currentVictimId: selectedId });
    setTimeout(() => router.push('/play/spin'), 1800);
  };

  const maxPenalties = Math.max(...gameState.members.map(m => m.penaltyCount), 1);

  return (
    <main className="flex flex-col min-h-screen">
      {/* Header simple for gameplay */}
      <div className="px-4 py-4 text-center border-b border-purple-900/30">
        <h1 className="text-xs font-black tracking-widest uppercase text-purple-400">🎰 Vòng Quay Tới Số</h1>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-black text-red-400">🔪 AI LÊN THỚT?</h2>
          <p className="text-gray-500 text-sm mt-1">Nhóm tự thống nhất ai thua rồi bấm vào tên người đó</p>
        </div>

        {/* Player grid */}
        {!confirmed ? (
          <div className="grid grid-cols-2 gap-3">
            {gameState.members.map(member => {
              const isSelected = selectedId === member.id;
              const penaltyRatio = member.penaltyCount / maxPenalties;
              return (
                <button
                  key={member.id}
                  onClick={() => handleSelect(member.id)}
                  className={`glass rounded-2xl p-4 border transition-all text-left relative overflow-hidden ${
                    isSelected
                      ? 'border-red-500 glow-pink scale-105'
                      : 'border-white/10 hover:border-purple-500/50'
                  }`}
                >
                  {/* Penalty count badge */}
                  {member.penaltyCount > 0 && (
                    <span className="absolute top-2 right-2 text-xs bg-red-500/80 text-white px-1.5 py-0.5 rounded-full font-bold">
                      ×{member.penaltyCount}
                    </span>
                  )}
                  <div className="text-4xl mb-2">{member.emoji}</div>
                  <div className="font-bold text-white text-sm">{member.name}</div>
                  {/* Mini penalty bar */}
                  <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${penaltyRatio * 100}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          // Spotlight reveal
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-7xl mb-4 animate-float">{selectedPlayer?.emoji}</div>
            <h2 className="text-3xl font-black text-red-400 mb-2">💀 {selectedPlayer?.name}</h2>
            <p className="text-gray-400">đã bước lên đoạn đầu đài!</p>
          </div>
        )}
      </div>

      <div className="px-4 pb-8 flex flex-col gap-3">
        {!confirmed ? (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selectedId}
            onClick={handleConfirm}
          >
            Quay Hình Phạt 🎰
          </Button>
        ) : null}
      </div>
    </main>
  );
}
