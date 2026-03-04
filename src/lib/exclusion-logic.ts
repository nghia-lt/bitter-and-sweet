import type { Penalty, Player, ExclusionRule } from "./types";

/**
 * Check if a penalty between victim and a potential partner would violate any exclusion rule.
 * Returns true if there IS a conflict (they should NOT be paired).
 */
export function checkExclusion(
    penalty: Penalty,
    victim: Player | undefined,
    partner: Player,
    rules: ExclusionRule[],
): boolean {
    if (!victim) return false;
    return rules.some((rule) => {
        // Rule applies to this penalty?
        const penaltyMatches = rule.penaltyIds.includes(penalty.id);
        if (!penaltyMatches) return false;

        // The rule blocks victim+partner (in either order)?
        const pair1 =
            rule.player1Id === victim.id && rule.player2Id === partner.id;
        const pair2 =
            rule.player1Id === partner.id && rule.player2Id === victim.id;
        return pair1 || pair2;
    });
}

/**
 * Filter out players that would violate exclusion rules for a given penalty and victim.
 */
export function getEligiblePartners(
    penalty: Penalty,
    victim: Player | undefined,
    allPlayers: Player[],
    rules: ExclusionRule[],
): Player[] {
    if (!victim) return allPlayers;
    return allPlayers.filter(
        (player) =>
            player.id !== victim.id &&
            !checkExclusion(penalty, victim, player, rules),
    );
}
