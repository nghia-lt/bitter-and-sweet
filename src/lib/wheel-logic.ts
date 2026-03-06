import type { Penalty, FateType } from "./types";
import { FATE_WEIGHTS, DEFAULT_PENALTIES } from "./constants";

/**
 * Weighted random selection from an array of penalties.
 * Each penalty has a `slots` value (1-3) acting as its weight.
 */
export function weightedRandom(penalties: Penalty[]): Penalty {
    const totalSlots = penalties.reduce((sum, p) => sum + p.slots, 0);
    let random = Math.random() * totalSlots;

    for (const penalty of penalties) {
        random -= penalty.slots;
        if (random <= 0) return penalty;
    }

    return penalties[penalties.length - 1];
}

/**
 * Spin the fate wheel using weighted probabilities.
 */
export function spinFateWheel(): FateType {
    const total = Object.values(FATE_WEIGHTS).reduce((a, b) => a + b, 0);
    let random = Math.random() * total;

    for (const [fate, weight] of Object.entries(FATE_WEIGHTS)) {
        random -= weight;
        if (random <= 0) return fate as FateType;
    }

    return "CAM_CHIU";
}

/**
 * Filter penalties: only food-type, excluding Mix results (to avoid infinite mix loops).
 */
export function filterFoodPenalties(penaltyIds: string[]): Penalty[] {
    return DEFAULT_PENALTIES.filter(
        (p) => penaltyIds.includes(p.id) && p.type === "food" && !p.isMix,
    );
}

/**
 * Get all active penalties from selected IDs.
 * Applies user's custom slot overrides if provided.
 * Also filters out penalties whose ingredient is not selected, and slots = 0.
 */
export function getActivePenalties(
    penaltyIds: string[],
    customSlots?: Record<string, number>,
    selectedIngredients?: string[],
): Penalty[] {
    return DEFAULT_PENALTIES.filter((p) => {
        // Must be selected
        if (!penaltyIds.includes(p.id)) return false;
        // Ingredient must be active (if penalty requires one)
        if (
            selectedIngredients &&
            p.ingredient &&
            !selectedIngredients.includes(p.ingredient)
        )
            return false;
        // Effective slots must be > 0
        const effectiveSlots = customSlots?.[p.id] ?? p.slots;
        if (effectiveSlots <= 0) return false;
        return true;
    }).map((p) => {
        if (customSlots && customSlots[p.id] !== undefined) {
            return { ...p, slots: customSlots[p.id] };
        }
        return p;
    });
}

/**
 * Calculate what angle to stop the wheel at for a given penalty index.
 * Returns degrees.
 */
export function calculateStopAngle(
    targetIndex: number,
    totalPenalties: number,
    extraSpins: number = 5,
): number {
    const segmentAngle = 360 / totalPenalties;
    const targetAngle = targetIndex * segmentAngle;
    // Add extra full rotations for dramatics
    return extraSpins * 360 + (360 - targetAngle);
}
