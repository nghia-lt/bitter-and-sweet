# 🎭 Kịch Bản Trải Nghiệm: "Vòng Quay Tới Số"

> _Một trò chơi nơi tình bạn được thử thách bằng chanh, ớt, mướp đắng, và những nụ hôn bất đắc dĩ._

---

## 📋 Tổng Quan

**Thể loại:** Party Game / Trò chơi nhóm bạn thân
**Số người chơi:** 3 - 10 người
**Nền tảng:** Trình duyệt web (điện thoại / máy tính)
**Lưu trữ:** Tự động ghi nhớ trên thiết bị, không cần đăng nhập

---

## 🎬 PHASE 1: KHỞI TẠO PHIÊN CHƠI (Setup)

### Màn Hình 1.1 — Màn Hình Chào Mừng

Khi mở ứng dụng, người chơi được chào đón bằng một màn hình sặc sỡ với dòng chữ lớn:

> **🎰 VÒNG QUAY TỚI SỐ**
> _"Thua là phải chịu. Không chạy đâu được."_

Giữa màn hình có hai nút lớn:

| Nút                      | Mô tả                              |
| ------------------------ | ---------------------------------- |
| 🎮 **Bắt Đầu Phiên Mới** | Vào giao diện thiết lập phiên chơi |
| 📖 **Xem Lịch Sử**       | Mở nhật ký các phiên chơi cũ       |

Nếu đã từng chơi trước đó, phía dưới hiện dòng nhỏ:

> _"⚡ Dữ liệu phiên trước vẫn còn! Bấm 'Bắt Đầu Phiên Mới' để chơi tiếp, hoặc bấm 🔄 Reset để làm mới toàn bộ."_

Nút **🔄 Reset** nằm góc phải trên cùng, kèm xác nhận "Bạn chắc chưa? Xóa hết là hết đó nha!" trước khi thực hiện.

---

### Màn Hình 1.2 — Nhập Danh Sách Thành Viên

Tiêu đề: **👥 Hội Bạn Thân Hôm Nay Gồm Ai?**

- Một ô nhập tên lớn, kèm nút **➕ Thêm** hoặc bấm Enter để thêm nhanh.
- Mỗi tên vừa nhập hiện ra thành một "thẻ tên" (chip/tag) phía dưới, có nút ❌ để xóa.
- Mỗi thẻ tên có một avatar ngẫu nhiên (emoji khuôn mặt vui nhộn) để dễ phân biệt.
- Tối thiểu phải có **3 thành viên** mới được đi tiếp.

**Ví dụ hiển thị:**

```
[ Nghĩa 😎 ❌ ] [ Yến Nhi 🦋 ❌ ] [ Minh 🤡 ❌ ] [ Hùng 💀 ❌ ]
```

Nếu đã chơi lần trước, danh sách tên cũ được tự động điền sẵn — người chơi chỉ cần thêm/bớt.

Nút ở cuối: **Tiếp theo ➡️**

---

### Màn Hình 1.3 — Chọn Nguyên Liệu & Hình Phạt

Tiêu đề: **🧪 Kho Vũ Khí Hôm Nay**

Hiển thị danh sách các **nguyên liệu** thường gặp dưới dạng toggle/checkbox kèm icon:

| Nguyên liệu | Icon |
| ----------- | ---- |
| Chanh       | 🍋   |
| Ớt          | 🌶️   |
| Gừng        | 🫚   |
| Tỏi         | 🧄   |
| Mướp đắng   | �    |

Người chơi bật/tắt từng nguyên liệu có sẵn trên bàn.

Dựa trên nguyên liệu được chọn, hệ thống **tự động lọc** và hiển thị **Danh sách hình phạt khả dụng** chia thành các nhóm. Mỗi hình phạt có nhiều mức độ khác nhau, và số ô trên vòng quay tương ứng với tần suất xuất hiện (nhiều ô hơn = xác suất trúng cao hơn).

#### 🍽️ Nhóm Ăn Uống (Đơn — Tự chịu, cần nguyên liệu)

| Hình phạt            | Nguyên liệu | Số ô trên vòng quay |
| -------------------- | ----------- | ------------------- |
| 🍋 1/8 quả chanh     | Chanh       | 3 ô                 |
| 🍋 1/4 quả chanh     | Chanh       | 2 ô                 |
| 🍋 1/2 quả chanh     | Chanh       | 1 ô                 |
| 🫚 1 lát gừng        | Gừng        | 3 ô                 |
| 🫚 2 lát gừng        | Gừng        | 2 ô                 |
| 🫚 3 lát gừng        | Gừng        | 1 ô                 |
| 🌶️ 1 lát ớt          | Ớt          | 3 ô                 |
| 🌶️ 2 lát ớt          | Ớt          | 1 ô                 |
| 🧄 1 lát tỏi         | Tỏi         | 2 ô                 |
| 🧄 2 lát tỏi         | Tỏi         | 1 ô                 |
| 🥒 1 miếng mướp đắng | Mướp đắng   | 3 ô                 |
| 🥒 2 miếng mướp đắng | Mướp đắng   | 2 ô                 |
| 🥒 3 miếng mướp đắng | Mướp đắng   | 1 ô                 |

> _Ghi chú: Số lượng càng lớn thì số ô trên vòng quay càng ít → xác suất trúng thấp hơn nhưng "đau" hơn!_

#### 🎲 Nhóm Mix (Combo tử thần — chỉ áp dụng cho nhóm Ăn Uống)

| Hình phạt | Mô tả                                    | Số ô |
| --------- | ---------------------------------------- | ---- |
| 🎲 Mix 2  | Quay thêm 2 hình phạt ăn uống, chịu cả 2 | 2 ô  |
| 🎲 Mix 3  | Quay thêm 3 hình phạt ăn uống, chịu cả 3 | 1 ô  |

#### � Nhóm Thể Xác (Đôi — Cần thêm 1 người thực hiện cùng)

| Hình phạt                        | Số ô trên vòng quay |
| -------------------------------- | ------------------- |
| ✋ Tét tay 1 cái                 | 3 ô                 |
| ✋ Tét tay 2 cái                 | 3 ô                 |
| ✋ Tét tay 3 cái                 | 2 ô                 |
| ✋ Tét tay 5 cái                 | 1 ô                 |
| 🦵 Tét đùi 1 cái                 | 3 ô                 |
| 🦵 Tét đùi 2 cái                 | 2 ô                 |
| 👂 Búng tai 1 cái                | 3 ô                 |
| 👂 Búng tai 2 cái                | 2 ô                 |
| 👂 Búng tai 3 cái                | 1 ô                 |
| 💆 Bóp vai 30 giây               | 2 ô                 |
| 😐 Nhìn nhau không được cười 15s | 2 ô                 |

#### 💪 Nhóm Thể Lực (Đơn — Tự chịu, không cần nguyên liệu)

| Hình phạt            | Số ô trên vòng quay |
| -------------------- | ------------------- |
| 🏋️ Squat 10 cái      | 3 ô                 |
| 🏋️ Squat 20 cái      | 2 ô                 |
| 🏋️ Squat 30 cái      | 1 ô                 |
| 💪 Plank 45s         | 3 ô                 |
| 💪 Plank 60s         | 2 ô                 |
| 💪 Plank 75s         | 1 ô                 |
| 🦩 Đứng 1 chân 60s   | 3 ô                 |
| 🦩 Đứng 1 chân 90s   | 2 ô                 |
| 🦩 Đứng 1 chân 120s  | 1 ô                 |
| 🦘 Nhảy lò cò 1 vòng | 2 ô                 |

#### 😘 Nhóm Nhạy Cảm (Đôi — Cần thêm 1 người, CÓ áp dụng Ngoại lệ)

| Hình phạt  | Số ô trên vòng quay |
| ---------- | ------------------- |
| 💋 Hôn tay | 1 ô                 |
| 😘 Hôn má  | 1 ô                 |

#### 📱 Nhóm Xã Hội (Đơn — Tự chịu, không cần nguyên liệu)

| Hình phạt                            | Số ô trên vòng quay |
| ------------------------------------ | ------------------- |
| 📱 Đăng story "tự luyến" 24h         | 2 ô                 |
| 📱 Đăng story "tự luyến" 48h         | 1 ô                 |
| 📱 Đăng story "tự luyến" 72h         | 1 ô                 |
| 🎤 Hát 1 bài do nhóm chọn            | 2 ô                 |
| 💬 Nói "Em yêu anh/chị" với người lạ | 1 ô                 |

Mỗi hình phạt có checkbox để người chơi có thể **bỏ bớt** nếu không muốn. Các hình phạt không cần nguyên liệu luôn luôn khả dụng.

Nút ở cuối: **Tiếp theo ➡️**

---

### Màn Hình 1.4 — Thiết Lập Ngoại Lệ (Khu Vực Bí Mật 🤫)

Tiêu đề: **⚙️ Luật Ngầm — Vùng Cấm Địa**

Mô tả nhỏ bên dưới:

> _"Có những điều... không nên xảy ra. Cài đặt ở đây để hệ thống tự hiểu."_

Giao diện hiển thị dạng **danh sách quy tắc loại trừ**, mỗi quy tắc gồm:

```
Khi hình phạt là: [ Dropdown: Hôn tay / Hôn má / ... ]
Thì  [ Dropdown: Nghĩa ]  và  [ Dropdown: Yến Nhi ]
→ KHÔNG ĐƯỢC xuất hiện cùng nhau (dù ai phạt ai).
```

Nút **➕ Thêm Quy Tắc** cho phép thêm nhiều luật loại trừ khác nhau.

**Ví dụ quy tắc mặc định (nếu đã cài trước đó):**

- ❌ **Nghĩa** + **Yến Nhi** → Không được chung ở: _Hôn tay, Hôn má_

Tất cả thiết lập này được **hệ thống tự động ghi nhớ trên thiết bị** để lần sau không phải nhập lại.

Nút ở cuối: **🚀 Vào Trận!**

Khi bấm, màn hình chuyển cảnh với hiệu ứng kịch tính — chữ lớn hiện ra:

> **"LET THE GAME BEGIN! 💀"**

rồi mờ dần vào Phase 2.

---

## 🎮 PHASE 2: TIẾN HÀNH "HÀNH HẠ" (Gameplay)

### Màn Hình 2.1 — Lên Thớt (Chọn Nạn Nhân)

Tiêu đề: **🔪 AI LÊN THỚT?**

Toàn bộ thành viên hiện dưới dạng các **thẻ tên lớn** xếp thành lưới. Mỗi thẻ hiện:

- Tên + avatar emoji
- Số lần đã bị phạt (hiện con số nhỏ góc trên, ví dụ: "×3")

**Cách chọn nạn nhân:** Nhóm tự thống nhất ai thua, rồi bấm vào thẻ tên người đó.

Khi chọn xong, thẻ tên phóng to ra giữa màn hình kèm hiệu ứng "spotlight" rực rỡ:

> **💀 [TÊN NẠN NHÂN] đã bước lên đoạn đầu đài! 💀**

Nút: **Quay Hình Phạt 🎰**

---

### Màn Hình 2.2 — Phán Quyết (Vòng Quay Hình Phạt)

#### Giao diện Vòng Quay Chính

Giữa màn hình là một **vòng quay rực rỡ sắc màu**, mỗi ô là một hình phạt từ danh sách đã thiết lập ở Phase 1. Vòng quay được chia thành các phần bằng nhau, mỗi phần có màu sắc khác nhau kèm icon mô tả.

Phía trên vòng quay hiện tên nạn nhân:

> **Số phận của [Tên] nằm ở đây... 🎯**

Người chơi (hoặc chính nạn nhân) bấm nút **QUAY!** ở giữa vòng quay.

Vòng quay bắt đầu xoay nhanh → chậm dần → dừng lại kèm hiệu ứng rung nhẹ. Kim chỉ dừng ở một ô.

#### 🤫 Chế Độ Bí Mật (Secret Mode)

Ở góc trên phải màn hình có một **toggle "🤫 BÍ MẬT"**. Khi bật:

- **Trước khi quay:** Tất cả hình phạt trên vòng quay hiển thị **"❓❓❓"** thay vì tên thật — không ai biết ô nào là gì.
- **Đang quay:** Focus card bên dưới cũng hiện **"??? ĐANG QUAY... ???"** — không spoil kết quả.
- **Sau khi dừng:** Kết quả hiện dạng **lá bài úp** với text **"🔮 CHẠM ĐỂ LẬT"** — tạo suspense tối đa.
- **Khi người chơi chạm:** Card **flip animation 180°** như lật bài → hiện hình phạt thật kèm **hiệu ứng nổ tung** (confetti, glow burst).
- Nếu hình phạt là **Đôi** → sau khi lật, vòng quay chọn người cũng hiển thị dạng bí mật → lật lần 2 để lộ tên.

Khi **tắt** (mặc định): Hoạt động bình thường — nhìn thấy hết hình phạt như trước.

> _💡 Tính năng này giúp tăng suspense gấp nhiều lần — khoảnh khắc lật bài trở thành highlight của mỗi lượt chơi!_

---

#### 🅰️ Trường Hợp A: Trúng Hình Phạt Đơn

Ví dụ: Kim dừng ở **"🌶️ Ăn 1 trái ớt"**

Màn hình bùng nổ hiệu ứng:

> **🌶️🌶️🌶️ ĂN ỚT! ĂN ỚT! ĂN ỚT! 🌶️🌶️🌶️**
> _"[Tên] ơi, cay lắm đó nha! 😈"_

**→ Chốt kết quả.** Hình phạt được ghi nhận, chuyển sang Bước 2.3 (Vòng Quay Nhân Phẩm).

---

#### 🅱️ Trường Hợp B: Trúng Hình Phạt Đôi

Ví dụ: Kim dừng ở **"💋 Hôn tay"** và nạn nhân là **Yến Nhi**.

Màn hình hiện:

> **💋 HÔN TAY!**
> _"Ôi trời ơi! Nhưng hôn tay AI đây?!"_

Lập tức, một **Vòng Quay thứ 2** xuất hiện bên dưới — nhỏ hơn vòng quay chính. Vòng quay này chứa tên **tất cả thành viên còn lại** (trừ nạn nhân).

**⚠️ ÁP DỤNG LUẬT NGOẠI LỆ:**
Vì nạn nhân là **Yến Nhi** và hình phạt là **Hôn tay**, hệ thống kiểm tra quy tắc loại trừ → **Nghĩa** bị loại khỏi vòng quay thứ 2.

Vòng quay thứ 2 chỉ còn: `[ Minh 🤡 ] [ Hùng 💀 ] [ ... ]` — **không có Nghĩa**.

Người chơi bấm **QUAY!** lần nữa. Vòng quay xoay và dừng, ví dụ trúng **Hùng**.

Kết quả hiển thị:

> **💋 Yến Nhi phải HÔN TAY Hùng! 💋**
> _"Hùng ơi, đưa tay đây! 🤚😏"_

**→ Chốt kết quả.** Chuyển sang Bước 2.3.

---

#### 🅲️ Trường Hợp C: Trúng Hình Phạt Mix

Ví dụ: Kim dừng ở **"🎲 Mix 2"**

Màn hình hiện hiệu ứng sấm sét:

> **⚡ MIX 2 — COMBO TỬ THẦN! ⚡**
> _"Một cái chưa đủ đâu bạn ơi! Quay thêm 2 phát nữa nè!"_

Hệ thống tự động quay thêm **2 lần liên tiếp** trên vòng quay **chỉ chứa các hình phạt thuộc nhóm Ăn Uống** (chanh, ớt, gừng, tỏi, mướp đắng). Ô "Mix 2" và "Mix 3" được tạm loại ra khỏi vòng quay ở các lần quay bổ sung (tránh Mix lồng Mix).

**Lần quay bổ sung 1:** Trúng "🧄 2 lát tỏi" → Ghi nhận.
**Lần quay bổ sung 2:** Trúng "🥒 1 miếng mướp đắng" → Ghi nhận.

Sau khi hoàn tất tất cả các lần quay bổ sung, hiển thị **Bảng Tổng Hợp**:

> ### 📋 PHÁN QUYẾT CHO [TÊN NẠN NHÂN]:
>
> | #   | Hình phạt            | Đối tượng |
> | --- | -------------------- | --------- |
> | 1   | 🧄 2 lát tỏi         | Tự chịu   |
> | 2   | 🥒 1 miếng mướp đắng | Tự chịu   |

Nút: **Đã rõ! Tiếp tục ➡️** → Chuyển sang Bước 2.3.

---

### Màn Hình 2.3 — Vòng Quay Nhân Phẩm (Cơ Hội Cuối)

Tiêu đề kịch tính:

> **🎭 VÒNG QUAY NHÂN PHẨM**
> _"Số phận chưa kết thúc ở đây đâu..."_

Nạn nhân tưởng đã xong, nhưng BẤT NGỜ — màn hình mờ đi, rồi sáng lên với một vòng quay mới. Vòng quay này có **4 ô** với kích thước khác nhau tương ứng tỷ lệ xác suất:

```
┌────────────────────────────────────────────┐
│                                            │
│            😩 CAM CHỊU (83%)              │
│         "Chấp nhận số phận đi bạn"        │
│                                            │
├──────────────────────┬─────────────────────┤
│  💀 CHẾT CHÙM (10%) │  🏃 THOÁT KÍP (5%) │
│  "Kéo thêm 1 người" │  "Chọn lại nạn nhân"│
├──────────────────────┴─────────────────────┤
│      ✨ KIM THIỀN THOÁT XÁC (2%) ✨       │
│       "THẾ MẠNG — Đổi phận cho ai đó"     │
└────────────────────────────────────────────┘
```

Bấm **QUAY!** — Vòng quay xoay chậm rãi, kịch tính... Mỗi lần kim gần dừng ở ô hiếm, cả nhóm sẽ hét lên.

---

#### 🔹 Kết quả 1: **😩 Cam Chịu** (83%)

> **"Nhân phẩm hết rồi bạn ơi 😩"**
> _Giữ nguyên TOÀN BỘ hình phạt. Không thương lượng._

→ Chuyển thẳng sang Phase 3.

---

#### 🔹 Kết quả 2: **💀 Chết Chùm** (10%)

> **"HẢ HẢ! Cũng không thoát, nhưng kéo được thêm 1 người chết chung! 💀"**

Một vòng quay mới hiện ra, chứa tên TẤT CẢ thành viên (trừ nạn nhân hiện tại). Quay và chọn ra **1 người xui xẻo** phải chịu chung.

**📌 QUY TẮC CHIA HÌNH PHẠT KHI CHẾT CHÙM:**

| Loại hình phạt                                       | Cách xử lý                                       |
| ---------------------------------------------------- | ------------------------------------------------ |
| 🍽️ **Hình phạt Đơn** (ăn uống, thể lực, xã hội)      | **CHIA ĐÔI** giữa 2 người. Mỗi người chịu 1 nửa. |
| 💥 **Hình phạt Đôi** (tét tay, búng tai, bóp vai...) | **CHIA ĐÔI** — mỗi người chịu 1 nửa số lần.      |
| 💋 **Hình phạt Hôn** (hôn tay, hôn má)               | **KHÔNG chia sẻ** — chỉ nạn nhân gốc thực hiện.  |

**Ví dụ:** Minh thua và bị phạt: _2 lát tỏi, 3 lát chanh, tét tay 4 cái, hôn má Yến Nhi_. Quay Nhân Phẩm → Chết Chùm → Trúng **Nghĩa**.

Hệ thống tự động chia:

> | Hình phạt gốc     | Minh (nạn nhân)               | Nghĩa (chết chùm) |
> | ----------------- | ----------------------------- | ----------------- |
> | 🧄 2 lát tỏi      | 1 lát tỏi                     | 1 lát tỏi         |
> | 🍋 3 lát chanh    | 1,5 lát chanh                 | 1,5 lát chanh     |
> | ✋ Tét tay 4 cái  | Tét tay 2 cái                 | Tét tay 2 cái     |
> | 😘 Hôn má Yến Nhi | Hôn má Yến Nhi _(giữ nguyên)_ | _(không chịu)_    |

> **💀 NGHĨA ƠI! Cùng chịu nha! 💀**
> _"Minh và Nghĩa giờ là bạn nạn! Chia đều chia đẹp, không ai thiệt — trừ cái hôn thì Minh tự lo!"_

> _💡 Lưu ý: Nếu số lượng lẻ không chia đều được, hệ thống hiển thị gợi ý, nhóm tự thống nhất cách làm tròn._

→ Chuyển sang Phase 3 (với 2 nạn nhân, mỗi người có bảng hình phạt riêng).

---

#### 🔹 Kết quả 3: **🏃 Thoát Kíp** (5%)

> **"THOÁT! THOÁT THẬT RỒI! 🏃💨"**
> _"Nhưng ai đó phải chết thay..."_

Nạn nhân hiện tại được **tha bổng**! Vòng quay mới hiện ra chứa TẤT CẢ thành viên (kể cả người vừa thoát — vì công bằng mà, ai biết được) để chọn ra nạn nhân mới.

Vòng quay xoay → Trúng ai thì người đó phải chịu TOÀN BỘ hình phạt ban đầu.

> **⚠️ KIỂM TRA XUNG ĐỘT NGOẠI LỆ:** Nếu trong danh sách hình phạt có hình phạt đôi mà nạn nhân mới vi phạm quy tắc ngoại lệ với người thực hiện cùng → hệ thống tự động **quay lại người thực hiện cùng** cho riêng hình phạt bị xung đột đó.
>
> _Ví dụ: Minh thua, hình phạt là "Hôn tay Nghĩa". Minh thoát kíp, quay trúng Yến Nhi. Vì Yến Nhi + Nghĩa vi phạm ngoại lệ ở "Hôn tay" → hệ thống hiện vòng quay chọn người mới (loại Nghĩa) → Quay trúng Hùng → Kết quả: Yến Nhi hôn tay Hùng._ ✅

> **"🎯 [Tên mới] đã bị chọn! Tội nghiệp quá!"**

→ Chuyển sang Phase 3 (với nạn nhân mới).

---

#### 🔹 Kết quả 4: **✨ Kim Thiền Thoát Xác — Thế Mạng** (2%)

> **"✨✨✨ HUYỀN THOẠI! KIM THIỀN THOÁT XÁC! ✨✨✨"**

Đây là khoảnh khắc hiếm có — màn hình nổ tung hiệu ứng pháo hoa, confetti bay tứ tán, nhạc nền hoành tráng!

> _"[Nạn nhân] đã giác ngộ! Toàn bộ hình phạt sẽ được CHUYỂN THẲNG cho một người khác!"_

Vòng quay mới hiện ra — nhưng lần này, nạn nhân hiện tại **KHÔNG CÓ** trong vòng quay. Chỉ có các thành viên còn lại.

Quay → Trúng ai thì người đó nhận HẾT toàn bộ hình phạt.

> **⚠️ KIỂM TRA XUNG ĐỘT NGOẠI LỆ:** Tương tự như Thoát Kíp — nếu nạn nhân mới (kẻ thế mạng) vi phạm ngoại lệ với người thực hiện cùng trong hình phạt đôi → hệ thống tự động **quay lại người thực hiện cùng** cho riêng hình phạt bị xung đột đó (áp dụng ngoại lệ cho nạn nhân mới).

> **"💥 [Tên mới] nhận hết! [Nạn nhân cũ] cười trên nỗi đau người khác! 💥"**

→ Chuyển sang Phase 3 (với nạn nhân mới — kẻ thế mạng).

---

## 🏁 PHASE 3: KẾT THÚC & LƯU VẾT

### Màn Hình 3.1 — Kết Quả Cuối Cùng

Tiêu đề hoành tráng (hoặc bi đát tùy góc nhìn):

> ### 🏛️ PHÁN QUYẾT CUỐI CÙNG
>
> _"Không kháng cáo. Không thương lượng. Chỉ có CHỊU."_

Hiển thị bảng tổng kết:

> **Nạn nhân: [Tên] 💀**
>
> | #   | Hình phạt       | Chi tiết       |
> | --- | --------------- | -------------- |
> | 1   | 🌶️ Ăn 1 trái ớt | Tự chịu        |
> | 2   | 💋 Hôn tay      | Cùng với: Hùng |
>
> **Trạng thái Nhân Phẩm:** 😩 Cam Chịu

Nếu có "Chết Chùm", hiện thêm:

> **Bạn Nạn: [Tên người chết chùm] 💀**
> _(Chịu chung toàn bộ hình phạt trên)_

Phía dưới có hai nút:

| Nút                    | Chức năng                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| ✅ **Đã Hoàn Thành!**  | Xác nhận nạn nhân đã chịu phạt xong. Đóng án, lưu vào lịch sử. Làm mới màn hình về Bước 2.1 cho vòng chơi tiếp theo. |
| 🔄 **Chơi Lại Từ Đầu** | Quay về Phase 1 để thiết lập lại hoàn toàn.                                                                          |

---

### Màn Hình 3.2 — Nhật Ký / Lịch Sử (Sổ Đen 📓)

Truy cập từ nút **📖 Xem Lịch Sử** ở màn hình chào mừng, hoặc icon 📓 ở góc màn hình trong suốt phiên chơi.

Tiêu đề: **📓 SỔ ĐEN — Ai Nợ Ai, Ghi Hết!**

Hiển thị danh sách các lượt phạt đã diễn ra, sắp xếp theo thời gian (mới nhất ở trên):

```
╔══════════════════════════════════════════════╗
║  📅 Phiên chơi: 03/03/2026, 20:30           ║
╠══════════════════════════════════════════════╣
║  Lượt 1: Yến Nhi 💀                         ║
║  ├─ 🌶️ Ăn ớt (Tự chịu)                     ║
║  ├─ 💋 Hôn tay (Cùng Hùng)                  ║
║  └─ 😩 Cam Chịu                             ║
║                                              ║
║  Lượt 2: Minh 💀                             ║
║  ├─ 🧄 Ăn tỏi sống (Tự chịu)               ║
║  ├─ ✋ Tét tay (Cùng Nghĩa)                 ║
║  └─ ✨ Kim Thiền Thoát Xác → Hùng chết thay ║
║                                              ║
║  Lượt 3: Hùng 💀 (Thế mạng từ Minh)         ║
║  ├─ 🧄 Ăn tỏi sống (Tự chịu)               ║
║  ├─ ✋ Tét tay (Cùng Nghĩa)                 ║
║  └─ 😩 Cam Chịu                             ║
╚══════════════════════════════════════════════╝
```

Mỗi thành viên cũng có **bảng thống kê cá nhân**:

> **📊 Bảng Thành Tích (Thất Bại)**
> | Thành viên | Số lần bị phạt | Hình phạt nặng nhất | Lần gần nhất |
> |---|---|---|---|
> | Yến Nhi | 5 | Mix 3 (3 hình phạt) | 03/03/2026 |
> | Hùng | 4 | Kim Thiền → Thế mạng | 03/03/2026 |
> | Minh | 3 | Ăn ớt + Hôn má | 01/03/2026 |
> | Nghĩa | 2 | Squat 10 cái | 28/02/2026 |

Toàn bộ dữ liệu lịch sử **tự động lưu trên thiết bị**, tồn tại cho đến khi người chơi bấm Reset.

---

## 🔄 Luồng Tổng Thể (Sơ Đồ)

```
Phase 1: Setup
  ├─ 1.1 Chào mừng
  ├─ 1.2 Nhập thành viên
  ├─ 1.3 Chọn nguyên liệu & hình phạt
  └─ 1.4 Thiết lập ngoại lệ
         │
         ▼
Phase 2: Gameplay (Lặp lại mỗi vòng)
  ├─ 2.1 Chọn nạn nhân
  ├─ 2.2 Quay hình phạt
  │    ├─ A: Đơn → Chốt
  │    ├─ B: Đôi → Quay người + Ngoại lệ → Chốt
  │    └─ C: Mix → Quay thêm N lần → Chốt
  └─ 2.3 Vòng Quay Nhân Phẩm
       ├─ Cam Chịu (83%) → Phase 3
       ├─ Chết Chùm (10%) → Quay thêm 1 → Phase 3
       ├─ Thoát Kíp (5%) → Quay nạn nhân mới → Phase 3
       └─ Kim Thiền (2%) → Chuyển phạt → Phase 3
              │
              ▼
Phase 3: Kết thúc
  ├─ 3.1 Kết quả cuối cùng → Xác nhận hoàn thành
  └─ 3.2 Lưu vào lịch sử → Quay lại 2.1 cho vòng mới
```

---

## 📝 Ghi Chú Hệ Thống

- Toàn bộ dữ liệu (danh sách thành viên, nguyên liệu, ngoại lệ, lịch sử) được **hệ thống tự động ghi nhớ trên thiết bị** (trình duyệt). Không cần đăng nhập hay tạo tài khoản.
- Nút **🔄 Reset** có sẵn ở màn hình chào mừng để xóa toàn bộ dữ liệu và bắt đầu lại từ con số 0.
- Vòng quay có tính ngẫu nhiên thực sự, đảm bảo công bằng (hoặc bất công, tùy góc nhìn 😈).
