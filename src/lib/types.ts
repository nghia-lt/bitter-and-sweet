// Core types for Vòng Quay Tới Số game

export type IngredientId = "chanh" | "ot" | "gung" | "toi" | "muop_dang";

export type PenaltyType =
    | "food"
    | "mix"
    | "physical_pair"
    | "physical_solo"
    | "sensitive"
    | "social";

export type FateType = "CAM_CHIU" | "CHET_CHUM" | "THOAT_KIP" | "KIM_THIEN";

export interface Player {
    id: string;
    name: string;
    emoji: string;
    penaltyCount: number;
}

export interface Penalty {
    id: string;
    name: string;
    icon: string;
    type: PenaltyType;
    ingredient?: IngredientId;
    slots: number; // 1-3 slots on wheel
    requiresPartner: boolean; // true = Đôi (requires 2nd person)
    quantity?: string; // e.g. "2 lát", "3 cái"
    isMix?: boolean; // triggers additional spins
    mixCount?: number; // how many additional spins
}

export interface ExclusionRule {
    id: string;
    penaltyIds: string[]; // applies to these penalties
    player1Id: string;
    player2Id: string;
}

export interface PenaltyResult {
    penalty: Penalty;
    partnerId?: string; // for Đôi penalties
    partnerName?: string;
}

export interface SplitResult {
    victim: Player;
    coVictim: Player;
    victimPenalties: SplitPenaltyItem[];
    coVictimPenalties: SplitPenaltyItem[];
}

export interface SplitPenaltyItem {
    penalty: Penalty;
    quantity: string;
    partnerId?: string;
    partnerName?: string;
}

export interface GameRound {
    id: string;
    victim: Player;
    penalties: PenaltyResult[];
    fateResult: FateType;
    coVictim?: Player;
    splitResult?: SplitResult;
    transferredToId?: string; // for Kim Thiền / Thoát Kíp
    timestamp: number;
}

export interface GameSession {
    id: string;
    date: string;
    rounds: GameRound[];
}

export interface PlayerStats {
    player: Player;
    totalPunishments: number;
    worstPunishment: string;
    lastDate: string;
}

// Fate round outcome — set by fate page when wheel completes
export interface FateContext {
    destinyCard: FateType; // which card was drawn
    originalVictimId: string; // the player who spun the fate wheel
    targetId?: string; // the player selected by secondary wheel (co-victim / escape target / transfer)
    newExecutionerId?: string; // set only if role-conflict was detected
    conflictMessage?: string; // the toast message to display if conflict
}

// Game state stored in localStorage
export interface GameState {
    members: Player[];
    selectedIngredients: IngredientId[];
    selectedPenalties: string[]; // penalty IDs
    penaltySlots: Record<string, number>; // custom slot overrides per penalty ID
    exclusionRules: ExclusionRule[];
    currentVictimId: string | null;
    currentPenalties: PenaltyResult[];
    sessions: GameSession[];
    secretMode: boolean;
    fateWeights: Record<string, number>; // configurable fate probability weights
    fateContext?: FateContext; // outcome from last fate wheel spin
}
