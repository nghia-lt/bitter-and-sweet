# 🎰 Implementation Plan: Vòng Quay Tới Số — Web App

## Mục tiêu

Xây dựng game "Vòng Quay Tới Số" dưới dạng web app fullstack sử dụng **Next.js 14 (App Router)** + **Tailwind CSS**, responsive cho cả **PC** và **mobile**. Dữ liệu lưu trữ hoàn toàn trên thiết bị (localStorage), không cần backend/database.

> **IMPORTANT:** Thiết kế tham khảo từ các màn hình đã dựng trên **Stitch** (project ID: `3374752040350383833`). Theme: **dark neon** (#0A0A1A), accent purple (#A855F7), font Inter.

---

## Proposed Changes

### 1. Project Setup

#### [NEW] Khởi tạo Next.js + Tailwind CSS

```bash
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

- Cài thêm: `framer-motion` (animation), `canvas-confetti` (confetti effects), `lucide-react` (icons)
- Tailwind config: custom colors, dark theme, Inter font từ Google Fonts

---

### 2. Cấu Trúc Thư Mục

```
src/
├── app/
│   ├── layout.tsx            # Root layout (dark theme, Inter font)
│   ├── page.tsx              # Screen 1.1 — Chào Mừng
│   ├── setup/
│   │   ├── members/page.tsx  # Screen 1.2 — Nhập Thành Viên
│   │   ├── penalties/page.tsx # Screen 1.3 — Chọn Hình Phạt
│   │   └── exclusions/page.tsx # Screen 1.4 — Ngoại Lệ
│   ├── play/
│   │   ├── select/page.tsx   # Screen 2.1 — Chọn Nạn Nhân
│   │   ├── spin/page.tsx     # Screen 2.2 — Vòng Quay Hình Phạt
│   │   └── fate/page.tsx     # Screen 2.3 — Vòng Quay Nhân Phẩm
│   ├── result/page.tsx       # Screen 3.1 — Kết Quả Cuối
│   └── history/page.tsx      # Screen 3.2 — Sổ Đen
├── components/
│   ├── layout/
│   │   ├── AppHeader.tsx     # Header chung (← VÒNG QUAY TỚI SỐ [BƯỚC x/3])
│   │   └── GameHeader.tsx    # Header cho Phase 2-3 (không step badge)
│   ├── ui/
│   │   ├── Button.tsx        # Nút gradient (primary/secondary)
│   │   ├── Toggle.tsx        # Toggle switch (dùng cho Secret Mode)
│   │   ├── Card.tsx          # Glass-morphism card
│   │   ├── Modal.tsx         # Dialog/modal xác nhận
│   │   └── Badge.tsx         # Badge nhỏ (×3, BƯỚC 1/3...)
│   ├── wheel/
│   │   ├── SpinWheel.tsx     # Vòng quay chính (CSS animation)
│   │   ├── FateWheel.tsx     # Vòng quay Nhân Phẩm (4 ô)
│   │   ├── PlayerWheel.tsx   # Vòng quay chọn người (cho Đôi/Chết Chùm)
│   │   └── WheelItem.tsx     # Ô trên vòng quay
│   ├── penalty/
│   │   ├── PenaltyGroup.tsx  # Accordion nhóm hình phạt
│   │   ├── PenaltyCard.tsx   # Card hiển thị 1 hình phạt
│   │   └── SecretCard.tsx    # Card "🔒 Bí mật ???" (Secret Mode)
│   ├── result/
│   │   ├── VerdictCard.tsx   # Card kết quả cuối cùng
│   │   ├── SplitTable.tsx    # Bảng chia hình phạt (Chết Chùm)
│   │   └── FlipCard.tsx      # Card lật (Secret Mode reveal)
│   └── effects/
│       ├── Confetti.tsx      # Hiệu ứng confetti
│       ├── GlowBurst.tsx     # Hiệu ứng nổ sáng
│       └── Particles.tsx     # Floating particles
├── hooks/
│   ├── useGameState.ts       # Hook quản lý state game chính
│   ├── useLocalStorage.ts    # Hook đọc/ghi localStorage
│   ├── useSpinWheel.ts       # Hook logic quay + animation
│   └── useExclusion.ts       # Hook kiểm tra ngoại lệ
├── lib/
│   ├── types.ts              # TypeScript types/interfaces
│   ├── penalties.ts          # Danh sách hình phạt mặc định
│   ├── wheel-logic.ts        # Logic quay, xác suất, weighted random
│   ├── fate-logic.ts         # Logic Nhân Phẩm (83/10/5/2%)
│   ├── split-logic.ts        # Logic chia hình phạt (Chết Chùm)
│   └── constants.ts          # Emoji list, colors, probabilities
└── styles/
    └── globals.css           # Tailwind + custom neon effects
```

---

### 3. Chi Tiết Từng Màn Hình

#### Screen 1.1 — Chào Mừng (`app/page.tsx`)

- Logo + tên app + tagline
- 2 nút: "Bắt Đầu Phiên Mới" + "Xem Lịch Sử"
- Nếu có dữ liệu cũ: hiện banner + nút Reset
- **Responsive**: Mobile = full screen, PC = centered card max-w-md

#### Screen 1.2 — Nhập Thành Viên (`app/setup/members/page.tsx`)

- Header đồng nhất (← VÒNG QUAY TỚI SỐ | BƯỚC 1/3)
- Input + nút ➕ THÊM
- Danh sách member cards (emoji avatar + tên + ❌)
- Validate: min 3 thành viên → nút "Tiếp Theo" active/disabled
- **State**: lưu `members[]` vào localStorage

#### Screen 1.3 — Chọn Hình Phạt (`app/setup/penalties/page.tsx`)

- Header (BƯỚC 2/3)
- 5 ingredient toggles (chanh, ớt, gừng, tỏi, mướp đắng)
- 6 nhóm accordion: Ăn Uống, Mix, Thể Xác, Thể Lực, Nhạy Cảm, Xã Hội
- Mỗi penalty có checkbox + slot count badge
- Auto-filter: tắt nguyên liệu → dim penalty liên quan
- **State**: lưu `ingredients[]` + `selectedPenalties[]`

#### Screen 1.4 — Ngoại Lệ (`app/setup/exclusions/page.tsx`)

- Header (BƯỚC 3/3)
- Danh sách exclusion rules (dropdown penalty + 2 dropdown person)
- Nút ➕ Thêm Quy Tắc
- Nút "🚀 VÀO TRẬN!" → transition "LET THE GAME BEGIN!"
- **State**: lưu `exclusionRules[]`

#### Screen 2.1 — Chọn Nạn Nhân (`app/play/select/page.tsx`)

- Grid 2 cột hiển thị player cards
- Mỗi card: emoji + tên + penalty count badge
- Tap → spotlight animation + "💀 [TÊN] đã bước lên đoạn đầu đài!"
- Nút "Quay Hình Phạt 🎰"

#### Screen 2.2 — Vòng Quay Hình Phạt (`app/play/spin/page.tsx`)

- **Phức tạp nhất** — nhiều sub-states:
    - Vòng quay chính (list-style hoặc actual wheel)
    - Nút QUAY! + XÀO TRỘN
    - Focus card hiển thị penalty đang highlighted
    - **Secret Mode toggle** (bottom): ON → tất cả hiện "🔒 Bí mật ???"
- **3 kết quả**:
    - A: Đơn → hiện result card → next
    - B: Đôi → secondary PlayerWheel (áp dụng ngoại lệ) → result card
    - C: Mix → quay thêm N lần (chỉ food penalties) → summary table
- **Secret Mode ON**: flip card animation khi reveal

#### Screen 2.3 — Vòng Quay Nhân Phẩm (`app/play/fate/page.tsx`)

- FateWheel 4 ô (83/10/5/2%)
- **4 kết quả**:
    - 😩 Cam Chịu → Phase 3
    - 💀 Chết Chùm → PlayerWheel → split table → Phase 3
    - 🏃 Thoát Kíp → PlayerWheel (all) → exclusion check → Phase 3
    - ✨ Kim Thiền → golden effects → PlayerWheel → Phase 3

#### Screen 3.1 — Kết Quả (`app/result/page.tsx`)

- VerdictCard: victim + penalty table + fate badge
- Optional: co-victim card (Chết Chùm)
- 2 nút: "✅ Đã Hoàn Thành" (→ 2.1) + "🔄 Chơi Lại" (→ 1.1)

#### Screen 3.2 — Sổ Đen (`app/history/page.tsx`)

- 2 tabs: 📜 Nhật Ký (chronological) + 📊 Thống Kê (leaderboard)
- Nhật Ký: session groups → round cards (tree-style penalties)
- Thống Kê: shame leaderboard 🥇🥈🥉

---

### 4. Logic Quan Trọng

#### Weighted Random (Vòng Quay)

```typescript
// Mỗi penalty có slot count (1-3)
// Tổng slots = sum of all active penalties
// Random index → map to penalty based on cumulative slots
function weightedRandom(penalties: Penalty[]): Penalty;
```

#### Exclusion Check (Ngoại Lệ)

```typescript
// Khi penalty là Đôi + victim + partner vi phạm rule
// → loại partner khỏi PlayerWheel
// → nếu đã được chọn (Thoát Kíp/Kim Thiền) → re-roll partner
function checkExclusion(
    penalty: Penalty,
    victim: Player,
    partner: Player,
    rules: ExclusionRule[],
): boolean;
```

#### Split Logic (Chết Chùm)

```typescript
// Đơn → chia đôi số lượng
// Đôi (không phải hôn) → chia đôi số lần
// Hôn → giữ nguyên cho nạn nhân gốc
function splitPenalties(
    penalties: PenaltyResult[],
    coVictim: Player,
): SplitResult;
```

#### Fate Probabilities (Nhân Phẩm)

```typescript
const FATE_WEIGHTS = {
    CAM_CHIU: 83, // 83%
    CHET_CHUM: 10, // 10%
    THOAT_KIP: 5, // 5%
    KIM_THIEN: 2, // 2%
};
```

---

### 5. Data Types

```typescript
interface Player {
    id: string;
    name: string;
    emoji: string;
    penaltyCount: number;
}

interface Penalty {
    id: string;
    name: string;
    icon: string;
    type:
        | "food"
        | "mix"
        | "physical_pair"
        | "physical_solo"
        | "sensitive"
        | "social";
    ingredient?: string; // nguyên liệu cần (nếu có)
    slots: number; // 1-3 ô trên vòng quay
    requiresPartner: boolean; // Đôi hay Đơn
    quantity?: number; // số lượng (lát, cái...)
}

interface ExclusionRule {
    id: string;
    penaltyIds: string[]; // áp dụng cho penalty nào
    player1Id: string;
    player2Id: string;
}

interface GameRound {
    victim: Player;
    penalties: PenaltyResult[];
    fateResult: FateType;
    coVictim?: Player;
    timestamp: number;
}
```

---

### 6. Responsive Strategy

| Breakpoint              | Layout                                                                |
| ----------------------- | --------------------------------------------------------------------- |
| **Mobile** (< 768px)    | Full width, stacked layout, touch-friendly buttons, 2-col player grid |
| **Tablet** (768-1024px) | Centered max-w-lg, slightly larger cards                              |
| **Desktop** (> 1024px)  | Centered max-w-md (phone-like), hoặc max-w-2xl với sidebar lịch sử    |

> **NOTE:** Vì đây là party game chơi trên điện thoại là chính, giao diện mobile-first. Desktop hiển thị dạng "phone preview" ở giữa màn hình.

---

### 7. Animations & Effects

| Effect           | Library                                  | Sử dụng ở                |
| ---------------- | ---------------------------------------- | ------------------------ |
| Page transitions | `framer-motion`                          | Chuyển phase, spotlight  |
| Spin animation   | CSS `@keyframes` + `transform: rotate()` | Vòng quay                |
| Flip card        | `framer-motion` `rotateY`                | Secret Mode reveal       |
| Confetti         | `canvas-confetti`                        | Kim Thiền, result reveal |
| Glow/pulse       | Tailwind `animate-pulse` + custom        | Neon borders, buttons    |
| Shake            | CSS keyframes                            | Khi vòng quay gần dừng   |

---

### 8. Thứ Tự Triển Khai (Sprint Plan)

| Sprint       | Task                                              | Files                                                    |
| ------------ | ------------------------------------------------- | -------------------------------------------------------- |
| **Sprint 1** | Project setup + design system + shared components | Layout, Button, Card, Toggle, Badge, Header, globals.css |
| **Sprint 2** | Phase 1: Setup flow (4 screens)                   | pages 1.1-1.4, localStorage hooks                        |
| **Sprint 3** | Phase 2: Core gameplay                            | Wheels, spin logic, exclusion logic, screens 2.1-2.3     |
| **Sprint 4** | Phase 3: Results + History                        | screens 3.1-3.2, history storage                         |
| **Sprint 5** | Secret Mode + Animations + Polish                 | FlipCard, Confetti, transitions, responsive tuning       |

---

## Verification Plan

### Automated Tests

- **Unit tests** (`vitest`): weighted random, exclusion check, split logic, fate probabilities
    - Command: `npm run test`

### Browser Tests

- Chạy dev server: `npm run dev`
- Mở browser test từng screen flow:
    1. Welcome → nhập 4 thành viên → chọn penalties → set exclusion → VÀO TRẬN
    2. Chọn nạn nhân → quay → kết quả đơn/đôi/mix
    3. Nhân Phẩm → 4 outcomes
    4. Kết quả → lưu lịch sử → xem sổ đen
    5. Secret Mode ON → quay → flip reveal

### Manual Verification

- Test responsive: resize browser từ 375px (mobile) → 1920px (desktop)
- Test localStorage: refresh page → dữ liệu vẫn còn
- Test Reset: xóa hết → fresh state
