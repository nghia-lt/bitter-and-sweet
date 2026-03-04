import type {
    Player,
    PenaltyResult,
    SplitResult,
    SplitPenaltyItem,
} from "./types";

/**
 * Split penalties between original victim and co-victim (Chết Chùm scenario).
 *
 * Rules:
 * - 'food' & 'physical_solo' & 'social' & 'physical_pair' → split quantity evenly
 * - 'sensitive' (hôn) → stays with original victim only
 * - 'mix' → should already be resolved before this, treat as food
 */
export function splitPenalties(
    penalties: PenaltyResult[],
    victim: Player,
    coVictim: Player,
): SplitResult {
    const victimItems: SplitPenaltyItem[] = [];
    const coVictimItems: SplitPenaltyItem[] = [];

    for (const result of penalties) {
        const { penalty } = result;

        if (penalty.type === "sensitive") {
            // Hôn: only victim keeps it
            victimItems.push({
                penalty,
                quantity: penalty.quantity || "—",
                partnerId: result.partnerId,
                partnerName: result.partnerName,
            });
            // co-victim gets nothing
            continue;
        }

        // All other types: split
        if (penalty.requiresPartner) {
            // Physical pair: split number of repetitions
            const original = penalty.quantity || "?";
            const num = parseInt(original, 10);
            if (!isNaN(num)) {
                const half = Math.ceil(num / 2);
                const unit = original.replace(/\d+\s*/, "").trim();
                victimItems.push({
                    penalty,
                    quantity: `${half} ${unit}`,
                    partnerId: result.partnerId,
                    partnerName: result.partnerName,
                });
                coVictimItems.push({
                    penalty,
                    quantity: `${half} ${unit}`,
                    partnerId: result.partnerId,
                    partnerName: result.partnerName,
                });
            } else {
                victimItems.push({ penalty, quantity: original });
                coVictimItems.push({ penalty, quantity: original });
            }
        } else {
            // Solo types: split quantity
            const original = penalty.quantity || "1 phần";
            const num = parseFloat(original);
            if (!isNaN(num)) {
                const half = num / 2;
                const unit = original.replace(/[\d.]+\s*/, "").trim();
                victimItems.push({ penalty, quantity: `${half} ${unit}` });
                coVictimItems.push({ penalty, quantity: `${half} ${unit}` });
            } else {
                // Can't split numerically, note it
                victimItems.push({
                    penalty,
                    quantity: `${original} (chia đôi)`,
                });
                coVictimItems.push({
                    penalty,
                    quantity: `${original} (chia đôi)`,
                });
            }
        }
    }

    return {
        victim,
        coVictim,
        victimPenalties: victimItems,
        coVictimPenalties: coVictimItems,
    };
}
