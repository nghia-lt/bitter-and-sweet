'use client';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface AppHeaderProps {
  step?: number;
  totalSteps?: number;
  showBack?: boolean;
}

export function AppHeader({ step, totalSteps, showBack = true }: AppHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between px-4 py-4 border-b border-purple-900/30">
      {showBack ? (
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 transition"
        >
          <ChevronLeft className="w-5 h-5 text-gray-300" />
        </button>
      ) : (
        <div className="w-9 h-9" />
      )}

      <div className="flex-1 text-center">
        <h1 className="text-sm font-black tracking-widest uppercase italic text-glow-purple text-purple-300">
          🎰 Vòng Quay Tới Số
        </h1>
      </div>

      {step && totalSteps ? (
        <span className="text-xs font-bold px-3 py-1 rounded-full border border-purple-500/50 text-purple-400">
          BƯỚC {step}/{totalSteps}
        </span>
      ) : (
        <div className="w-16" />
      )}
    </header>
  );
}
