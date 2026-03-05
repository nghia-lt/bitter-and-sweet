"use client";
import { useLocalStorage } from "./useLocalStorage";
import type { GameState } from "@/lib/types";
import { DEFAULT_GAME_STATE } from "@/lib/constants";

const GAME_STATE_KEY = "vong-quay-toi-so-state";

export function useGameState() {
    const [gameState, setGameState] = useLocalStorage<GameState>(
        GAME_STATE_KEY,
        DEFAULT_GAME_STATE,
    );

    const updateState = (updates: Partial<GameState>) => {
        setGameState((prev) => ({ ...prev, ...updates }));
    };

    const toggleSecretMode = () => {
        setGameState((prev) => ({ ...prev, secretMode: !prev.secretMode }));
    };

    const resetGame = () => {
        setGameState({ ...DEFAULT_GAME_STATE });
    };

    const hasExistingData = () => {
        return gameState.members.length > 0;
    };

    return {
        gameState,
        updateState,
        toggleSecretMode,
        resetGame,
        hasExistingData,
    };
}
