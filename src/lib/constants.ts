import type { Penalty, IngredientId } from "./types";

// =====================
//    INGREDIENTS
// =====================
export const INGREDIENTS: { id: IngredientId; name: string; icon: string }[] = [
    { id: "chanh", name: "Chanh", icon: "🍋" },
    { id: "ot", name: "Ớt", icon: "🌶️" },
    { id: "gung", name: "Gừng", icon: "🥔" },
    { id: "toi", name: "Tỏi", icon: "🧄" },
    { id: "muop_dang", name: "Mướp đắng", icon: "🥒" },
];

// =====================
//  DEFAULT PENALTIES
// =====================
export const DEFAULT_PENALTIES: Penalty[] = [
    // --- ĂN UỐNG (food) ---
    {
        id: "chanh_1",
        name: "1/8 quả chanh",
        icon: "🍋",
        type: "food",
        ingredient: "chanh",
        slots: 3,
        requiresPartner: false,
        quantity: "1/8 quả",
    },
    {
        id: "chanh_2",
        name: "1/4 quả chanh",
        icon: "🍋",
        type: "food",
        ingredient: "chanh",
        slots: 2,
        requiresPartner: false,
        quantity: "1/4 quả",
    },
    {
        id: "chanh_3",
        name: "1/2 quả chanh",
        icon: "🍋",
        type: "food",
        ingredient: "chanh",
        slots: 1,
        requiresPartner: false,
        quantity: "1/2 quả",
    },
    {
        id: "ot_1",
        name: "1 lát ớt",
        icon: "🌶️",
        type: "food",
        ingredient: "ot",
        slots: 3,
        requiresPartner: false,
        quantity: "1 lát",
    },
    {
        id: "ot_2",
        name: "2 lát ớt",
        icon: "🌶️",
        type: "food",
        ingredient: "ot",
        slots: 1,
        requiresPartner: false,
        quantity: "2 lát",
    },
    {
        id: "gung_1",
        name: "1 lát gừng",
        icon: "🥔",
        type: "food",
        ingredient: "gung",
        slots: 3,
        requiresPartner: false,
        quantity: "1 lát",
    },
    {
        id: "gung_2",
        name: "2 lát gừng",
        icon: "🥔",
        type: "food",
        ingredient: "gung",
        slots: 2,
        requiresPartner: false,
        quantity: "2 lát",
    },
    {
        id: "gung_3",
        name: "3 lát gừng",
        icon: "🥔",
        type: "food",
        ingredient: "gung",
        slots: 1,
        requiresPartner: false,
        quantity: "3 lát",
    },
    {
        id: "toi_1",
        name: "1 lát tỏi",
        icon: "🧄",
        type: "food",
        ingredient: "toi",
        slots: 2,
        requiresPartner: false,
        quantity: "1 lát",
    },
    {
        id: "toi_2",
        name: "2 lát tỏi",
        icon: "🧄",
        type: "food",
        ingredient: "toi",
        slots: 1,
        requiresPartner: false,
        quantity: "2 lát",
    },
    {
        id: "muop_1",
        name: "1 miếng mướp đắng",
        icon: "🥒",
        type: "food",
        ingredient: "muop_dang",
        slots: 3,
        requiresPartner: false,
        quantity: "1 miếng",
    },
    {
        id: "muop_2",
        name: "2 miếng mướp đắng",
        icon: "🥒",
        type: "food",
        ingredient: "muop_dang",
        slots: 2,
        requiresPartner: false,
        quantity: "2 miếng",
    },
    {
        id: "muop_3",
        name: "3 miếng mướp đắng",
        icon: "🥒",
        type: "food",
        ingredient: "muop_dang",
        slots: 1,
        requiresPartner: false,
        quantity: "3 miếng",
    },

    // --- MIX ---
    {
        id: "mix_2",
        name: "Mix 2",
        icon: "🎲",
        type: "mix",
        slots: 2,
        requiresPartner: false,
        isMix: true,
        mixCount: 2,
    },
    {
        id: "mix_3",
        name: "Mix 3",
        icon: "🎲",
        type: "mix",
        slots: 1,
        requiresPartner: false,
        isMix: true,
        mixCount: 3,
    },

    // --- THỂ XÁC - ĐÔI (physical_pair) ---
    {
        id: "tet_tay_1",
        name: "Tét tay 1 cái",
        icon: "✋",
        type: "physical_pair",
        slots: 4,
        requiresPartner: true,
        quantity: "1 cái",
    },
    {
        id: "tet_tay_2",
        name: "Tét tay 2 cái",
        icon: "✋",
        type: "physical_pair",
        slots: 3,
        requiresPartner: true,
        quantity: "2 cái",
    },
    {
        id: "tet_tay_3",
        name: "Tét tay 3 cái",
        icon: "✋",
        type: "physical_pair",
        slots: 2,
        requiresPartner: true,
        quantity: "3 cái",
    },
    {
        id: "tet_tay_4",
        name: "Tét tay 4 cái",
        icon: "✋",
        type: "physical_pair",
        slots: 1,
        requiresPartner: true,
        quantity: "4 cái",
    },
    {
        id: "tet_dui_1",
        name: "Tét đùi 1 cái",
        icon: "🦵",
        type: "physical_pair",
        slots: 2,
        requiresPartner: true,
        quantity: "1 cái",
    },
    {
        id: "tet_dui_2",
        name: "Tét đùi 2 cái",
        icon: "🦵",
        type: "physical_pair",
        slots: 1,
        requiresPartner: true,
        quantity: "2 cái",
    },
    {
        id: "bung_tai_1",
        name: "Búng tai 1 cái",
        icon: "👂",
        type: "physical_pair",
        slots: 3,
        requiresPartner: true,
        quantity: "1 cái",
    },
    {
        id: "bung_tai_2",
        name: "Búng tai 2 cái",
        icon: "👂",
        type: "physical_pair",
        slots: 2,
        requiresPartner: true,
        quantity: "2 cái",
    },
    {
        id: "bung_tai_3",
        name: "Búng tai 3 cái",
        icon: "👂",
        type: "physical_pair",
        slots: 1,
        requiresPartner: true,
        quantity: "3 cái",
    },

    // --- THỂ LỰC - ĐƠN (physical_solo) ---
    {
        id: "squat_10",
        name: "Squat 10 cái",
        icon: "🏋️",
        type: "physical_solo",
        slots: 3,
        requiresPartner: false,
        quantity: "10 cái",
    },
    {
        id: "squat_20",
        name: "Squat 20 cái",
        icon: "🏋️",
        type: "physical_solo",
        slots: 2,
        requiresPartner: false,
        quantity: "20 cái",
    },
    {
        id: "squat_30",
        name: "Squat 30 cái",
        icon: "🏋️",
        type: "physical_solo",
        slots: 1,
        requiresPartner: false,
        quantity: "30 cái",
    },
    {
        id: "plank_30",
        name: "Plank 30 giây",
        icon: "💪",
        type: "physical_solo",
        slots: 3,
        requiresPartner: false,
        quantity: "30s",
    },
    {
        id: "plank_45",
        name: "Plank 45 giây",
        icon: "💪",
        type: "physical_solo",
        slots: 2,
        requiresPartner: false,
        quantity: "45s",
    },
    {
        id: "plank_60",
        name: "Plank 60 giây",
        icon: "💪",
        type: "physical_solo",
        slots: 1,
        requiresPartner: false,
        quantity: "60s",
    },
    {
        id: "pushup_5",
        name: "Hít đất 5 cái",
        icon: "💪",
        type: "physical_solo",
        slots: 3,
        requiresPartner: false,
        quantity: "5 cái",
    },
    {
        id: "pushup_10",
        name: "Hít đất 10 cái",
        icon: "💪",
        type: "physical_solo",
        slots: 2,
        requiresPartner: false,
        quantity: "10 cái",
    },
    {
        id: "pushup_15",
        name: "Hít đất 15 cái",
        icon: "💪",
        type: "physical_solo",
        slots: 1,
        requiresPartner: false,
        quantity: "15 cái",
    },

    // --- NHẠY CẢM - ĐÔI (sensitive) ---
    {
        id: "hon_tay",
        name: "Hôn tay",
        icon: "💋",
        type: "sensitive",
        slots: 2,
        requiresPartner: true,
    },
    {
        id: "hon_ma",
        name: "Hôn má",
        icon: "😘",
        type: "sensitive",
        slots: 1,
        requiresPartner: true,
    },

    // --- XÃ HỘI - ĐƠN (social) ---
    {
        id: "dang_status_24",
        name: "Đăng story tự luyến 24h",
        icon: "📲",
        type: "social",
        slots: 3,
        requiresPartner: false,
    },
    {
        id: "dang_status_48",
        name: "Đăng story tự luyến 48h",
        icon: "📲",
        type: "social",
        slots: 2,
        requiresPartner: false,
    },
    {
        id: "dang_status_72",
        name: "Đăng story tự luyến 72h",
        icon: "📲",
        type: "social",
        slots: 1,
        requiresPartner: false,
    },
];

// =====================
//  PENALTY GROUPS
// =====================
export const PENALTY_GROUPS: {
    type: string;
    label: string;
    icon: string;
    color: string;
}[] = [
    { type: "food", label: "Ăn Uống 🍽️", icon: "🍽️", color: "purple" },
    { type: "mix", label: "Mix 🎲", icon: "🎲", color: "red" },
    {
        type: "physical_pair",
        label: "Thể Xác (Đôi) 💥",
        icon: "💥",
        color: "cyan",
    },
    {
        type: "physical_solo",
        label: "Thể Lực (Đơn) 💪",
        icon: "💪",
        color: "green",
    },
    { type: "sensitive", label: "Nhạy Cảm 😘", icon: "😘", color: "pink" },
    { type: "social", label: "Xã Hội 📱", icon: "📱", color: "amber" },
];

// =====================
//  FATE WEIGHTS
// =====================
export const FATE_WEIGHTS = {
    CAM_CHIU: 75,
    CHET_CHUM: 15,
    THOAT_KIP: 7,
    KIM_THIEN: 3,
};

export const FATE_CONFIG = {
    CAM_CHIU: {
        label: "😩 Cam Chịu",
        color: "#6B7280",
        description: "Nhân phẩm hết rồi bạn ơi 😩",
        probability: 75,
    },
    CHET_CHUM: {
        label: "💀 Chết Chùm",
        color: "#06B6D4",
        description: "Kéo thêm 1 người chết chung! 💀",
        probability: 15,
    },
    THOAT_KIP: {
        label: "🏃 Thoát Kíp",
        color: "#22C55E",
        description: "THOÁT! Nhưng ai đó phải chết thay...",
        probability: 7,
    },
    KIM_THIEN: {
        label: "✨ Kim Thiền",
        color: "#EAB308",
        description: "HUYỀN THOẠI! Chuyển toàn bộ hình phạt!",
        probability: 3,
    },
};

// =====================
//  PLAYER EMOJIS
// =====================
export const PLAYER_EMOJIS = [
    "😎",
    "🦋",
    "🤡",
    "💀",
    "🔥",
    "⚡",
    "🌈",
    "🎭",
    "🦊",
    "🐺",
    "🎯",
    "💎",
    "🌙",
    "☀️",
    "🌊",
    "🌸",
    "🌺",
    "🍎",
    "🍂",
    "💩",
    "🐯",
    "☠️",
    "🐶",
    "🐱",
    "🐱‍👤",
    "🐴",
    "🦄",
    "🦅",
    "🐔",
    "🐧",
    "🐦",
    "🐸",
];

// =====================
//  INITIAL GAME STATE
// =====================
export const DEFAULT_GAME_STATE = {
    members: [],
    selectedIngredients: [
        "chanh",
        "ot",
        "gung",
        "toi",
        "muop_dang",
    ] as IngredientId[],
    selectedPenalties: DEFAULT_PENALTIES.map((p) => p.id),
    exclusionRules: [],
    currentVictimId: null,
    currentPenalties: [],
    sessions: [],
    secretMode: false,
    penaltySlots: {} as Record<string, number>,
    fateWeights: {
        CAM_CHIU: 75,
        CHET_CHUM: 15,
        THOAT_KIP: 7,
        KIM_THIEN: 3,
    } as Record<string, number>,
};
