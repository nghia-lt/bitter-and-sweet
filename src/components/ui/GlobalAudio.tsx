'use client';
import { useGameAudio } from '@/hooks/useGameAudio';

/**
 * Invisible client component that boots the BGM for the whole app.
 * Drop inside RootLayout so music plays on every page.
 */
export function GlobalAudio() {
  useGameAudio();   // side-effect: starts BGM, registers click listener
  return null;
}
