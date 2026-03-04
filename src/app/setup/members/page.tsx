'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/Button';
import { useGameState } from '@/hooks/useGameState';
import { PLAYER_EMOJIS } from '@/lib/constants';
import type { Player } from '@/lib/types';

export default function MembersPage() {
  const router = useRouter();
  const { gameState, updateState } = useGameState();
  const [inputName, setInputName] = useState('');

  const addMember = () => {
    const name = inputName.trim();
    if (!name) return;

    const existing = gameState.members.find(
      m => m.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      alert(`"${name}" đã có trong danh sách rồi!`);
      return;
    }

    const newMember: Player = {
      id: `player_${Date.now()}`,
      name,
      emoji: PLAYER_EMOJIS[gameState.members.length % PLAYER_EMOJIS.length],
      penaltyCount: 0,
    };
    updateState({ members: [...gameState.members, newMember] });
    setInputName('');
  };

  const removeMember = (id: string) => {
    updateState({ members: gameState.members.filter(m => m.id !== id) });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addMember();
  };

  const canProceed = gameState.members.length >= 3;

  return (
    <main className="flex flex-col min-h-screen">
      <AppHeader step={1} totalSteps={3} />

      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-black text-white">👥 Hội Bạn Thân</h2>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Hôm Nay Gồm Ai?
          </h2>
          <p className="text-gray-500 text-sm mt-2">Thêm ít nhất 3 thành viên để bắt đầu</p>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputName}
            onChange={e => setInputName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tên thành viên..."
            className="flex-1 bg-white/5 border border-purple-500/30 rounded-full px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
          />
          <button
            onClick={addMember}
            disabled={!inputName.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-5 py-3 rounded-full text-sm disabled:opacity-40 active:scale-95 transition"
          >
            + THÊM
          </button>
        </div>

        {/* Member List */}
        <div className="space-y-2">
          {gameState.members.map(member => (
            <div
              key={member.id}
              className="flex items-center justify-between glass rounded-xl px-4 py-3 border border-purple-500/20"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{member.emoji}</span>
                <span className="text-white font-semibold">{member.name}</span>
              </div>
              <button
                onClick={() => removeMember(member.id)}
                className="text-gray-500 hover:text-red-400 transition p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {gameState.members.length > 0 && (
          <p className="text-center text-gray-500 text-sm">
            {gameState.members.length} thành viên
          </p>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-4 pb-8">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canProceed}
          onClick={() => router.push('/setup/penalties')}
        >
          Tiếp Theo →
        </Button>
        {!canProceed && (
          <p className="text-gray-500 text-xs text-center mt-2">
            Cần ít nhất 3 thành viên
          </p>
        )}
      </div>
    </main>
  );
}
