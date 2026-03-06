'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/ui/Button';
import type { FateType } from '@/lib/types';

// ── Fate badge config ──────────────────────────────────────────
const FATE_BADGE: Record<FateType, { label: string; bg: string; text: string; border: string }> = {
  CAM_CHIU:  { label: '😩 Cam Chịu',  bg: 'rgba(107,114,128,0.2)', text: '#9CA3AF', border: '#6B728040' },
  CHET_CHUM: { label: '💀 Chết Chùm', bg: 'rgba(234,179,8,0.15)',   text: '#FACC15', border: '#EAB30840' },
  THOAT_KIP: { label: '🏃 Thoát Kíp', bg: 'rgba(249,115,22,0.15)',  text: '#FB923C', border: '#F9731640' },
  KIM_THIEN: { label: '✨ Kim Thiền', bg: 'rgba(239,68,68,0.15)',    text: '#F87171', border: '#EF444440' },
};

export default function ResultPage() {
  const router = useRouter();
  const { gameState, updateState } = useGameState();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const victim = gameState.members.find(m => m.id === gameState.currentVictimId);
  const penalties = gameState.currentPenalties;
  const ctx = gameState.fateContext;

  // Resolve players from fateContext
  const originalVictim = ctx ? gameState.members.find(m => m.id === ctx.originalVictimId) : null;
  const targetPlayer   = ctx?.targetId ? gameState.members.find(m => m.id === ctx.targetId) : null;
  const newExecutioner = ctx?.newExecutionerId ? gameState.members.find(m => m.id === ctx.newExecutionerId) : null;

  if (!mounted) {
    return (
      <main className="flex flex-col min-h-screen"
        style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 30%, #1a0a33 0%, #0F0F1A 60%, #0a0a12 100%)' }} />
    );
  }

  const handleDone = () => {
    const round = {
      id: `round_${Date.now()}`,
      victim: victim!,
      penalties,
      fateResult: (ctx?.destinyCard ?? 'CAM_CHIU') as FateType,
      timestamp: Date.now(),
    };
    const sessions = gameState.sessions;
    let currentSession = sessions[sessions.length - 1];
    const today = new Date().toLocaleDateString('vi-VN');
    if (!currentSession || currentSession.date !== today) {
      currentSession = { id: `session_${Date.now()}`, date: today, rounds: [] };
      updateState({ sessions: [...sessions, { ...currentSession, rounds: [round] }], currentPenalties: [], currentVictimId: null, fateContext: undefined });
    } else {
      const updatedSessions = sessions.map((s, i) =>
        i === sessions.length - 1 ? { ...s, rounds: [...s.rounds, round] } : s
      );
      updateState({ sessions: updatedSessions, currentPenalties: [], currentVictimId: null, fateContext: undefined });
    }
    router.push('/play/select');
  };

  const handleRestart = () => router.push('/');

  const badge = ctx ? FATE_BADGE[ctx.destinyCard] : null;

  return (
    <main className="flex flex-col min-h-screen"
      style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 30%, #1a0a33 0%, #0F0F1A 60%, #0a0a12 100%)' }}>

      {/* Header */}
      <div className="px-4 py-4 border-b border-purple-900/30 text-center shrink-0">
        <h1 className="text-lg font-black text-white">🏛️ PHÁN QUYẾT CUỐI CÙNG</h1>
        <p className="text-xs text-gray-500 italic mt-1">&ldquo;Không kháng cáo. Không thương lượng. Chỉ có CHỊU.&rdquo;</p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 overflow-y-auto pb-40">

        {/* ── FATE CONTEXT BANNER ── shown whenever fate page was visited */}
        {ctx && badge && originalVictim && (
          <div className="rounded-2xl p-4 space-y-3"
            style={{ background: badge.bg, border: `1.5px solid ${badge.border}`, boxShadow: `0 0 16px ${badge.border}` }}>

            {/* Header: original victim + destiny card */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{originalVictim.emoji}</span>
                <div>
                  <p className="text-white font-black text-sm">{originalVictim.name}</p>
                  <p className="text-gray-400 text-xs">Nạn nhân gốc</p>
                </div>
              </div>
              <div className="ml-auto">
                <span className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                  {badge.label}
                </span>
              </div>
            </div>

            {/* Conflict message */}
            {ctx.conflictMessage && (
              <div className="rounded-xl p-3"
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
                <p className="text-orange-300 text-xs font-semibold">{ctx.conflictMessage}</p>
              </div>
            )}

            {/* Scenario detail rows */}
            {ctx.destinyCard === 'CHET_CHUM' && targetPlayer && (
              <div className="space-y-1.5 text-sm">
                <div className="flex gap-2"><span className="text-gray-500">😭 Người chịu phạt:</span>
                  <span className="font-bold" style={{ color: '#F87171' }}>{originalVictim.name} &amp; {targetPlayer.emoji} {targetPlayer.name}</span></div>
                {newExecutioner && (
                  <div className="flex gap-2 items-center"><span className="text-gray-500">🫵 Người thực thi:</span>
                    <span className="font-bold" style={{ color: '#A78BFA' }}>{newExecutioner.emoji} {newExecutioner.name}</span>
                    <span className="text-xs text-orange-400">🤖 Hệ thống chỉ định</span></div>
                )}
              </div>
            )}
            {ctx.destinyCard === 'THOAT_KIP' && targetPlayer && (
              <div className="space-y-1.5 text-sm">
                <div className="flex gap-2"><span className="text-gray-500">😭 Kẻ thế mạng:</span>
                  <span className="font-bold" style={{ color: '#F87171' }}>{targetPlayer.emoji} {targetPlayer.name}</span></div>
                {newExecutioner && (
                  <div className="flex gap-2 items-center"><span className="text-gray-500">🫵 Người thực thi:</span>
                    <span className="font-bold" style={{ color: '#A78BFA' }}>{newExecutioner.emoji} {newExecutioner.name}</span>
                    <span className="text-xs text-orange-400">🤖 Hệ thống chỉ định</span></div>
                )}
              </div>
            )}
            {ctx.destinyCard === 'KIM_THIEN' && targetPlayer && (
              <div className="space-y-1.5 text-sm">
                <div className="flex gap-2"><span className="text-gray-500">😭 Kẻ chịu tội thay:</span>
                  <span className="font-bold" style={{ color: '#F87171' }}>{targetPlayer.emoji} {targetPlayer.name}</span></div>
                {newExecutioner && (
                  <div className="flex gap-2 items-center"><span className="text-gray-500">🫵 Người thực thi:</span>
                    <span className="font-bold" style={{ color: '#A78BFA' }}>{newExecutioner.emoji} {newExecutioner.name}</span>
                    <span className="text-xs text-orange-400">🤖 Hệ thống chỉ định</span></div>
                )}
              </div>
            )}
            {ctx.destinyCard === 'CAM_CHIU' && (
              <div className="space-y-1.5 text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-500">😭 Tự chịu phạt:</span>
                  <span className="font-bold" style={{ color: '#F87171' }}>{originalVictim.name}</span>
                </div>
              </div>
            )}

            {/* Penalty list embedded in fate banner — ALL card types */}
            {penalties.length > 0 && (
              <div className="border-t mt-2 pt-2" style={{ borderColor: badge.border }}>
                <p className="text-xs text-gray-500 mb-1">🔨 Hình phạt:</p>
                <div className="space-y-1">
                  {penalties.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span>{r.penalty.icon}</span>
                      <span className="text-white font-semibold">{r.penalty.name}</span>
                      {r.partnerName
                        ? <span className="text-gray-500 text-xs">— do {r.partnerName}</span>
                        : <span className="text-gray-600 text-xs">— Tự xử</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PENALTY CARD —— only shown when fate page was NOT visited at all ── */}
        {victim && !ctx && (
          <div className="rounded-2xl p-4"
            style={{ background: 'rgba(15,15,26,0.8)', border: '1.5px solid rgba(168,85,247,0.35)', boxShadow: '0 0 20px rgba(168,85,247,0.15)' }}>

            {/* Victim header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{victim.emoji}</span>
              <div>
                <p className="text-white font-black text-xl">{victim.name}</p>
                <p className="text-red-400 text-sm">💀 Nạn nhân chịu phạt</p>
              </div>
            </div>

            {/* Penalty table */}
            <div className="space-y-2">
              {penalties.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-2">Không có hình phạt nào.</p>
              )}
              {penalties.map((result, idx) => (
                <div key={idx} className="flex items-start gap-3 py-2 border-t border-white/5">
                  <span className="text-gray-500 text-sm min-w-5">#{idx + 1}</span>
                  <span className="text-lg">{result.penalty.icon}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{result.penalty.name}</p>
                    {result.partnerName && (
                      <p className="text-purple-400 text-xs">🫵 Cùng: {result.partnerName}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">
                    {result.penalty.requiresPartner ? 'Đôi' : 'Tự chịu'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
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
