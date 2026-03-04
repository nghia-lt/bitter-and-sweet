'use client';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { Button } from '@/components/ui/Button';

export default function WelcomePage() {
  const router = useRouter();
  const { hasExistingData, resetGame } = useGameState();
  const existingData = hasExistingData();

  const handleNewGame = () => router.push('/setup/members');
  const handleHistory = () => router.push('/history');
  const handleReset = () => {
    if (confirm('Bạn chắc chưa? Xóa hết là hết đó nha! 😈')) {
      resetGame();
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8 animate-float">
        <div className="text-8xl mb-4">🎰</div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-glow-purple text-white mb-2">
          Vòng Quay
        </h1>
        <h1 className="text-4xl font-black uppercase tracking-tight text-glow-pink text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
          Tới Số
        </h1>
        <p className="text-gray-400 text-sm italic">
          &ldquo;Thua là phải chịu. Không chạy đâu được.&rdquo;
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="relative z-10 flex flex-col gap-4 w-full max-w-xs">
        <Button variant="primary" size="lg" fullWidth onClick={handleNewGame}>
          🎮 Bắt Đầu Phiên Mới
        </Button>
        <Button variant="secondary" size="lg" fullWidth onClick={handleHistory}>
          📖 Xem Lịch Sử
        </Button>
      </div>

      {/* Existing data warning */}
      {existingData && (
        <div className="relative z-10 mt-8 glass rounded-xl p-4 max-w-xs w-full border border-yellow-500/30">
          <p className="text-yellow-400 text-sm mb-3">
            ⚡ Dữ liệu phiên trước vẫn còn! Bắt đầu mới hoặc reset hoàn toàn.
          </p>
          <Button variant="danger" size="sm" onClick={handleReset}>
            🔄 Reset Tất Cả
          </Button>
        </div>
      )}
    </main>
  );
}
