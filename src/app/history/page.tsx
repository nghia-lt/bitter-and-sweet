'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type Tab = 'log' | 'stats';

export default function HistoryPage() {
  const router = useRouter();
  const { gameState } = useGameState();
  const [activeTab, setActiveTab] = useState<Tab>('log');

  // Build stats
  const stats = gameState.members.map(member => {
    const totalPunishments = gameState.sessions
      .flatMap(s => s.rounds)
      .filter(r => r.victim.id === member.id).length;
    return { ...member, totalPunishments };
  }).sort((a, b) => b.totalPunishments - a.totalPunishments);

  const rankEmoji = ['🥇', '🥈', '🥉'];

  return (
    <main className="flex flex-col min-h-screen">
      <div className="px-4 py-4 border-b border-purple-900/30">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
          <h1 className="text-lg font-black text-white">📓 Sổ Đen</h1>
        </div>
        <p className="text-xs text-gray-500 italic mt-1">Ai Nợ Ai, Ghi Hết!</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(['log', 'stats'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              activeTab === tab ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-500'
            }`}
          >
            {tab === 'log' ? '📜 Nhật Ký' : '📊 Thống Kê'}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {activeTab === 'log' ? (
          gameState.sessions.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-4">📖</p>
              <p>Chưa có lịch sử nào</p>
            </div>
          ) : (
            [...gameState.sessions].reverse().map(session => (
              <div key={session.id}>
                <p className="text-xs text-purple-400 font-bold uppercase mb-2">
                  📅 {session.date}
                </p>
                {session.rounds.map((round, idx) => (
                  <Card key={round.id} className="mb-2">
                    <p className="font-bold text-white mb-2">
                      Lượt {idx + 1}: {round.victim.emoji} {round.victim.name} 💀
                    </p>
                    {round.penalties.map((r, i) => (
                      <p key={i} className="text-sm text-gray-400 ml-4">
                        ├─ {r.penalty.icon} {r.penalty.name}
                        {r.partnerName ? ` (cùng ${r.partnerName})` : ' (Tự chịu)'}
                      </p>
                    ))}
                  </Card>
                ))}
              </div>
            ))
          )
        ) : (
          // Stats tab
          stats.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-4">📊</p>
              <p>Chưa có thống kê</p>
            </div>
          ) : (
            stats.map((player, idx) => (
              <Card key={player.id} glow={idx === 0 ? 'purple' : 'none'} className="flex items-center gap-4">
                <span className="text-2xl">{rankEmoji[idx] || `#${idx + 1}`}</span>
                <span className="text-3xl">{player.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-white">{player.name}</p>
                  <p className="text-sm text-gray-500">{player.totalPunishments} lần bị phạt</p>
                </div>
                <span className="text-2xl font-black text-purple-400">{player.totalPunishments}</span>
              </Card>
            ))
          )
        )}
      </div>

      <div className="px-4 pb-8">
        <Button variant="secondary" size="md" fullWidth onClick={() => router.push('/')}>
          ← Về Trang Chủ
        </Button>
      </div>
    </main>
  );
}
