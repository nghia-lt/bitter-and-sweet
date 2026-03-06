"use client";
import { useEffect, useRef, useState, useCallback } from "react";

// ── Module-level singletons (shared across all hook calls / pages) ──
const BGM_SRC = "/sound/xo-so.mp3";
const SFX_SRC = "/sound/spin.mp3";
const MUTE_KEY = "bittersweet_muted";

let bgm: HTMLAudioElement | null = null;
let sfx: HTMLAudioElement | null = null;
let bgmStarted = false;
let currentMuted = false;

function initAudio() {
    if (typeof window === "undefined") return;
    if (bgm) return; // already initialised

    currentMuted = localStorage.getItem(MUTE_KEY) === "1";

    bgm = new Audio(BGM_SRC);
    bgm.loop = true;
    bgm.volume = 0.21;
    bgm.muted = currentMuted;

    sfx = new Audio(SFX_SRC);
    sfx.volume = 0.55;
    sfx.muted = currentMuted;

    const startBGM = () => {
        if (bgmStarted) return;
        bgmStarted = true;
        bgm!.play().catch(() => {});
        window.removeEventListener("click", startBGM);
        window.removeEventListener("touchstart", startBGM);
    };

    // Try immediately; fall back to first-click
    bgm.play()
        .then(() => {
            bgmStarted = true;
        })
        .catch(() => {
            window.addEventListener("click", startBGM);
            window.addEventListener("touchstart", startBGM);
        });
}

/** Callbacks to notify all mounted hook instances when mute changes */
const muteListeners = new Set<(m: boolean) => void>();

function setGlobalMute(muted: boolean) {
    currentMuted = muted;
    if (bgm) bgm.muted = muted;
    if (sfx) sfx.muted = muted;
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    muteListeners.forEach((fn) => fn(muted));
}

// ─────────────────────────────────────────────────────────────────
export function useGameAudio() {
    const [muted, setMuted] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem(MUTE_KEY) === "1";
    });

    // Register this instance so it re-renders on global mute changes
    useEffect(() => {
        initAudio();
        muteListeners.add(setMuted);
        return () => {
            muteListeners.delete(setMuted);
        };
    }, []);

    const toggleMute = useCallback(() => setGlobalMute(!currentMuted), []);

    const playSpinSound = useCallback(() => {
        if (currentMuted || !sfx) return;
        sfx.currentTime = 0;
        sfx.play().catch(() => {});
    }, []);

    return { muted, toggleMute, playSpinSound };
}
