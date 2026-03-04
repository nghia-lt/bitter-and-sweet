'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { spinFateWheel } from '@/lib/wheel-logic';
import { splitPenalties } from '@/lib/split-logic';
import { FATE_CONFIG } from '@/lib/constants';
import type { FateType, Player } from '@/lib/types';

type FateState = 'idle' | 'spinning' | 'result';

export default function FatePage() {
  const router = useRouter();
  const { gameState, updateState } = useGameState();

  const [fateState, setFateState] = useState<FateState>('idle');
  const [fateResult, setFateResult] = useState<FateType | null>(null);
  const [coVictim, setCoVictim] = useState<Player | null>(null);
  const [newVictim, setNewVictim] = useState<Player | null>(null);

  const victim = gameState.members.find(m => m.id === gameState.currentVictimId);
  const otherPlayers = gameState.members.filter(m => m.id !== gameState.currentVictimId);

  const handleSpin = () => {
    setFateState('spinning');
    setTimeout(() => {
      const result = spinFateWheel();
      setFateResult(result);
      setFateState('result');
    }, 2500);
  };

  const handleSelectCoVictim = (player: Player) => {
    setCoVictim(player);
    const split = splitPenalties(gameState.currentPenalties, victim!, player);
    updateState({ currentPenalties: gameState.currentPenalties });
    router.push('/result');
  };

  const handleSelectNewVictim = (player: Player) => {
    setNewVictim(player);
    updateState({ currentVictimId: player.id });
    router.push('/result');
  };

  const handleDirectNext = () => {
    router.push('/result');
  };

  const config = fateResult ? FATE_CONFIG[fateResult] : null;

  return (
    <main className="flex flex-col min-h-screen">
      <div className="px-4 py-4 border-b border-purple-900/30 text-center">
        <h1 className="text-sm font-black tracking-widest uppercase text-purple-400">🎭 Vòng Quay Nhân Phẩm</h1>
        <p className="text-xs text-gray-500 italic mt-1">&ldquo;Số phận chưa kết thúc ở đây đâu...&rdquo;</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 space-y-6">
        {/* Fate wheel visual */}
        {fateState !== 'result' ? (
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(FATE_CONFIG).map(([key, cfg]) => (
                <Card
                  key={key}
                  className={`text-center py-4 ${fateState === 'spinning' ? 'animate-pulse' : ''}`}
                  glow={fateState === 'spinning' ? 'purple' : 'none'}
                >
                  <div className="text-2xl font-black" style={{ color: cfg.color }}>
                    {cfg.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{cfg.probability}%</div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Result
          <div className="text-center space-y-4 w-full">
            <div
              className="text-5xl font-black"
              style={{ color: config?.color }}
            >
              {config?.label}
            </div>
            <Card glow="purple">
              <p className="text-white text-center font-semibold">{config?.description}</p>
            </Card>

            {/* Chết Chùm — pick co-victim */}
            {fateResult === 'CHET_CHUM' && (
              <div className="space-y-2 w-full">
                <p className="text-sm text-gray-400">Chọn người chết chung:</p>
                {otherPlayers.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectCoVictim(p)}
                    className="w-full glass border border-cyan-500/30 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-cyan-500 transition"
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-white">{p.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Thoát Kíp — pick new victim (all members) */}
            {fateResult === 'THOAT_KIP' && (
              <div className="space-y-2 w-full">
                <p className="text-sm text-gray-400">Chọn nạn nhân mới:</p>
                {gameState.members.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectNewVictim(p)}
                    className="w-full glass border border-green-500/30 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-green-500 transition"
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-white">{p.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Kim Thiền — pick scapegoat (others only) */}
            {fateResult === 'KIM_THIEN' && (
              <div className="space-y-2 w-full">
                <div className="text-center text-yellow-400 text-sm font-bold">✨ Chọn kẻ thế mạng:</div>
                {otherPlayers.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectNewVictim(p)}
                    className="w-full glass border border-yellow-500/30 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-yellow-500 transition"
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-white">{p.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Cam Chịu */}
            {fateResult === 'CAM_CHIU' && (
              <Button variant="primary" size="lg" fullWidth onClick={handleDirectNext}>
                Chấp nhận số phận 😩
              </Button>
            )}
          </div>
        )}
      </div>

      {fateState === 'idle' && (
        <div className="px-4 pb-8">
          <Button variant="primary" size="lg" fullWidth onClick={handleSpin}>
            🎭 Quay Nhân Phẩm!
          </Button>
        </div>
      )}

      {fateState === 'spinning' && (
        <div className="px-4 pb-8 text-center text-purple-400 animate-pulse font-bold">
          Đang quay... số phận đang định đoạt... 🎭
        </div>
      )}
    </main>
  );
}
