# 🎭 Master Prompt: Kịch Bản Trải Nghiệm "Vòng Quay Tới Số"

> **Vai trò:** Bạn là một Game Designer và Chuyên gia Trải nghiệm Người dùng (UX Writer).
> **Nhiệm vụ:** Viết một kịch bản chi tiết mô tả luồng thao tác và trải nghiệm của người chơi cho tựa game dạng "Vòng quay thử thách" của một hội bạn thân.
> **Quy tắc tối thượng:** TUYỆT ĐỐI KHÔNG đề cập đến các yếu tố kỹ thuật, ngôn ngữ lập trình, hay framework. Chỉ tập trung mô tả: màn hình hiển thị những gì, người chơi bấm vào đâu, luật game vận hành ra sao theo từng bước chuyển cảnh. (Chỉ ghi chú nhẹ việc "hệ thống tự động ghi nhớ vào thiết bị" khi cần).
> **Hãy viết kịch bản diễn biến chi tiết dựa trên sườn nội dung sau:**
> **BƯỚC 1: KHỞI TẠO PHIÊN CHƠI (SETUP)**
>
> - **Nhập liệu:** Màn hình cho phép điền tên các thành viên tham gia và đánh dấu các nguyên liệu hiện có (chanh, ớt, gừng, tỏi...). Từ đó, hệ thống sẽ tự động lọc và lên danh sách các nhóm hình phạt phù hợp.
> - **Thiết lập Ngoại lệ (Kịch tính):** Mô tả khu vực cài đặt các luật ngầm. Cụ thể: Với các hình phạt nhạy cảm (như Hôn tay, Hôn má), cài đặt quy tắc loại trừ. Ví dụ cốt lõi: "Nghĩa" và "Yến Nhi" là trường hợp đặc biệt, tuyệt đối không được xuất hiện cùng nhau trong tư cách Người phạt - Người chịu phạt ở các thử thách này.
> - _Lưu ý:_ Toàn bộ thiết lập này hệ thống phải tự ghi nhớ trên trình duyệt để lần sau chơi không phải nhập lại. Có sẵn một nút "Reset" để làm mới từ đầu.
>
> **BƯỚC 2: TIẾN HÀNH "HÀNH HẠ" (GAMEPLAY)**
>
> - **2.1. Lên Thớt:** Màn hình để chọn ra người vừa thua cuộc (nạn nhân).
> - **2.2. Phán Quyết (Quay hình phạt):** > \* Hiển thị vòng quay chứa danh sách hình phạt đã tạo ở Bước 1. Quay và ra kết quả.
> - _Trường hợp A (Hình phạt đơn):_ Các món như ăn chanh, ăn ớt, squat... -> Chốt luôn kết quả.
> - _Trường hợp B (Hình phạt đôi):_ Các món cần tương tác (tét tay, tét đùi, hôn...). Hệ thống lập tức hiện ra một Vòng quay thứ 2 chứa tên các thành viên còn lại để tìm người thực hiện cùng. **Bắt buộc áp dụng luật Ngoại lệ:** Nếu nạn nhân là Yến Nhi và hình phạt là Hôn tay, vòng quay thứ 2 tuyệt đối vắng bóng Nghĩa.
> - _Trường hợp C (Hình phạt Mix):_ Trúng ô "Mix 2" hoặc "Mix 3" -> Hệ thống tự động quay tiếp 2 hoặc 3 lần nữa cho đến khi thu thập đủ combo hình phạt.
> - _Chốt Bước 2.2:_ Bảng thông báo tổng hợp các hình phạt nạn nhân phải chịu.
> - **2.3. Vòng Quay Nhân Phẩm (Cơ hội cuối):** Bất ngờ hiện ra một vòng quay chốt hạ số phận với 4 lựa chọn (Mô tả rõ sự kịch tính khi quay vào các ô này):
>
> 1. _Cam chịu (83%):_ Giữ nguyên toàn bộ hình phạt.
> 2. _Chết chùm (10%):_ Được quyền kéo thêm 1 người chịu chung. (Hệ thống hiện danh sách để quay ngẫu nhiên chọn người xui xẻo thứ 2).
> 3. _Thoát kíp (5%):_ Chọn lại nạn nhân từ đầu. (Đưa toàn bộ thành viên vào vòng quay để tìm người "chết thay").
> 4. _Kim thiền thoát xác - Thế mạng (2%):_ Chuyển thẳng toàn bộ hình phạt cho một người khác. (Hiện vòng quay gồm các thành viên còn lại, loại trừ người đang thua, để chọn ra kẻ thế mạng).
>
> **BƯỚC 3: KẾT THÚC & LƯU VẾT**
>
> - Hiển thị màn hình Kết Quả Cuối Cùng thật hoành tráng (hoặc bi đát) để nạn nhân thực hiện.
> - Có nút "Đã hoàn thành" để xác nhận đóng án và làm mới màn hình cho vòng chơi tiếp theo.
> - Mô tả khu vực "Nhật ký/Lịch sử" nơi mọi người có thể xem lại ai đã bị phạt những gì để tiện "trả thù" về sau (dữ liệu tự lưu trên máy).
>
> **Định dạng đầu ra:** Trình bày mạch lạc, chia theo từng Màn hình (Screen) hoặc Giai đoạn (Phase). Ngôn từ vui vẻ, hài hước, mang đậm tính "troll" bạn bè.

# Yêu cầu

Ghi kịch bản chi tiết ra file 'scenario.md' và đưa ra những câu hỏi để tôi trả lời để hoàn thiện kịch bản nếu còn thiếu sót.
