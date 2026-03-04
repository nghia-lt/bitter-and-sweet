'use client';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ResultPage() {
  const router = useRouter();
  const { gameState, updateState } = useGameState();

  const victim = gameState.members.find(m => m.id === gameState.currentVictimId);
  const penalties = gameState.currentPenalties;

  const handleDone = () => {
    // Save round to session history
    const round = {
      id: `round_${Date.now()}`,
      victim: victim!,
      penalties,
      fateResult: 'CAM_CHIU' as const,
      timestamp: Date.now(),
    };

    const sessions = gameState.sessions;
    let currentSession = sessions[sessions.length - 1];
    const today = new Date().toLocaleDateString('vi-VN');

    if (!currentSession || currentSession.date !== today) {
      currentSession = { id: `session_${Date.now()}`, date: today, rounds: [] };
      updateState({ sessions: [...sessions, { ...currentSession, rounds: [round] }], currentPenalties: [], currentVictimId: null });
    } else {
      const updatedSessions = sessions.map((s, i) =>
        i === sessions.length - 1 ? { ...s, rounds: [...s.rounds, round] } : s
      );
      updateState({ sessions: updatedSessions, currentPenalties: [], currentVictimId: null });
    }

    router.push('/play/select');
  };

  const handleRestart = () => {
    router.push('/');
  };

  return (
    <main className="flex flex-col min-h-screen">
      <div className="px-4 py-4 border-b border-purple-900/30 text-center">
        <h1 className="text-lg font-black text-white">🏛️ PHÁN QUYẾT CUỐI CÙNG</h1>
        <p className="text-xs text-gray-500 italic mt-1">&ldquo;Không kháng cáo. Không thương lượng. Chỉ có CHỊU.&rdquo;</p>
      </div>

      <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto pb-40">
        {victim && (
          <Card glow="purple">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{victim.emoji}</span>
              <div>
                <p className="text-white font-black text-xl">{victim.name}</p>
                <p className="text-red-400 text-sm">💀 Nạn nhân</p>
              </div>
            </div>

            {/* Penalty table */}
            <div className="space-y-2">
              {penalties.map((result, idx) => (
                <div key={idx} className="flex items-start gap-3 py-2 border-t border-white/5">
                  <span className="text-gray-500 text-sm min-w-5">#{idx + 1}</span>
                  <span className="text-lg">{result.penalty.icon}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{result.penalty.name}</p>
                    {result.partnerName && (
                      <p className="text-purple-400 text-xs">Cùng: {result.partnerName}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {result.penalty.requiresPartner ? 'Đôi' : 'Tự chịu'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-gradient-to-t from-dark-bg to-transparent max-w-[480px] mx-auto space-y-3">
        <Button variant="primary" size="lg" fullWidth onClick={handleDone}>
          ✅ Đã Hoàn Thành!
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={handleRestart}>
          🔄 Chơi Lại Từ Đầu
        </Button>
      </div>
    </main>
  );
}
