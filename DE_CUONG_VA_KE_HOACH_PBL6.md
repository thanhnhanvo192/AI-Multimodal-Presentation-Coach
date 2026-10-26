# KẾ HOẠCH & MÔ TẢ DỰ ÁN PBL6
# NỀN TẢNG ĐÁNH GIÁ KỸ NĂNG THUYẾT TRÌNH TỰ ĐỘNG (AI MULTIMODAL)

---

**TRƯỜNG ĐẠI HỌC BÁCH KHOA - ĐẠI HỌC ĐÀ NẴNG**  
**KHOA CÔNG NGHỆ THÔNG TIN**

* **Đề tài:** Nghiên cứu và Xây dựng Nền tảng Đánh giá Kỹ năng Thuyết trình Tự động Dựa trên Phân tích Thị giác và Nội dung Lời nói.
* **Thời gian:** 12 tuần (Tháng 09/2026 – Cuối tháng 11/2026).
* **Giảng viên hướng dẫn:** TS. Võ Đức Hoàng.
* **Thành viên thực hiện:**
  1. **Nguyễn Đỗ Thắng** — Trưởng nhóm (AI Lead: Computer Vision & Machine Learning)
  2. **Võ Thành Nhân** — Thành viên (Backend Lead & Quản trị mạng / DevOps)
  3. **Đặng Quang Sơn** — Thành viên (Frontend Lead & Kiểm thử phần mềm / QA)

---

## 1. Ý TƯỞNG CỐT LÕI (DỰ ÁN LÀM CÁI GÌ?)

Một nền tảng web giống như một **"Huấn luyện viên thuyết trình ảo (AI Presentation Coach)"**:
1. Người dùng vào trang web: **Bật Webcam quay trực tiếp bài nói (1 - 3 phút)** hoặc **Tải video có sẵn lên**.
2. Hệ thống xử lý ngầm (chạy AI đa kênh hình ảnh + âm thanh).
3. Trả về một **Trang Báo cáo (Dashboard)** trực quan:
   * Video phát đồng bộ với dòng thời gian: bấm vào lỗi (ngập ngừng, cúi mặt nhìn slide) thì video tự tua đến đúng giây đó.
   * Biểu đồ Radar đánh giá: Ánh mắt, Ngữ điệu, Cử chỉ, Độ trôi chảy, Nội dung.
   * Lời khuyên cụ thể từ AI (Điểm mạnh, điểm cần sửa).

```
[ Người dùng: Quay Webcam / Upload Video ]
                    │
                    ▼
          [ Hệ thống Web FastAPI ]
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
[ Phân tích Thị giác ]    [ Phân tích Giọng nói ]
• Nhìn thẳng hay lệch?     • Nói nhanh hay chậm?
• Biểu cảm tự tin không?   • Có ngập ngừng "ờ, à"?
• Cử chỉ tay ra sao?       • Giọng đều đều buồn ngủ?
       │                         │
       └────────────┬────────────┘
                    ▼
       [ MÔ HÌNH HỢP NHẤT AI ] ──> Đưa ra Điểm tổng & Nhận xét chi tiết
```

---

## 2. ĐÁP ỨNG YÊU CẦU 4 MÔN HỌC CHUYÊN NGÀNH CỦA THẦY

Thầy yêu cầu tích hợp 4 môn học và phải **có model huấn luyện hoặc cải tiến/so sánh, không bê y nguyên**. Dự án sẽ giải quyết như sau:

| Môn học | Ứng dụng thực tế trong đề tài | Người làm chính |
| :--- | :--- | :--- |
| **1. Thị giác máy tính (Computer Vision)** | Trích xuất khuôn mặt, tính góc quay đầu (Head Pose), nhận diện hướng nhìn mắt (Eye Contact) và cử chỉ tay từ video. | **Thắng** |
| **2. Học máy (Machine Learning)** | **Phần cần train/cải tiến:** Thay vì chỉ cộng điểm cảm tính, Thắng sẽ **huấn luyện một mô hình Hợp nhất (Fusion Model)** kết hợp giữa Thị giác và Âm thanh để phân loại mức độ tự tin. Có bảng thực nghiệm so sánh: *Chỉ nhìn (Vision-only) vs. Chỉ nghe (Audio-only) vs. Kết hợp cả 2*. | **Thắng** |
| **3. Quản trị mạng & DevOps** | Đóng gói toàn bộ hệ thống bằng **Docker Compose**; Cấu hình **Nginx** làm Reverse Proxy, mở HTTPS, cài đặt **Rate Limiting** (chống spam upload video làm treo server), cô lập mạng CSDL. | **Nhân** |
| **4. Kiểm thử phần mềm (Testing)** | Viết tài liệu **Test Plan / Test Cases**; Viết **Unit Test** API Backend (pytest); Viết kịch bản kiểm thử tự động toàn trình **E2E Test** trên giao diện Web (Playwright); Thử nghiệm video thiếu sáng, âm thanh ồn để kiểm tra độ chịu lỗi của AI. | **Sơn** |

---

## 3. DANH SÁCH CÁC CHỨC NĂNG CÓ TRÊN GIAO DIỆN WEB (WEB FEATURES)

Hệ thống Web được thiết kế theo luồng trải nghiệm người dùng khép kín với 6 màn hình/chức năng chính:

### ① Trang Chủ (Home / Landing Page)
* **Giới thiệu Nền tảng:** Banner giới thiệu công nghệ AI đánh giá thuyết trình đa phương thức (Thị giác & Âm thanh).
* **Quy trình 3 bước trực quan:** 1. Ghi hình $\rightarrow$ 2. AI phân tích $\rightarrow$ 3. Nhận báo cáo chi tiết.
* **Bài nói Demo mẫu:** Nút bấm "Xem thử báo cáo mẫu" để người dùng xem trước Dashboard tương tác (trên video của diễn giả TED Talks) mà chưa cần đăng nhập/nộp bài.
* **Nút bấm Hành động (CTA):** "Bắt đầu Luyện tập ngay".

### ② Quản lý Tài khoản & Hồ sơ (Authentication & Profile)
* Đăng ký, Đăng nhập, Đăng xuất (xác thực an toàn qua JWT Token).
* Trang cá nhân: Cập nhật thông tin, ảnh đại diện, xem thống kê số bài đã luyện tập và điểm số trung bình.

### ③ Phòng thu Luyện tập (Presentation Studio)
* **Tùy chọn 1: Quay video trực tiếp bằng Webcam:**
  * Cấp quyền truy cập Camera & Micro, xem trước khung hình.
  * Bộ đếm ngược 3-2-1 trước khi bắt đầu nói.
  * Đồng hồ bấm giờ (Timer: ví dụ 02:15 / 03:00) kèm nút Tạm dừng (Pause) / Kết thúc (Finish).
  * **Hộp gợi ý kịch bản (Teleprompter Mode):** Cho phép người dùng dán dàn ý/nội dung bài nói lên màn hình để vừa nhìn camera vừa theo dõi ý mà không bị quên bài!
  * **Realtime HUD (Đèn báo nhẹ):** Đèn tín hiệu nhỏ góc màn hình: 🟢 *Giao tiếp mắt tốt*, 🟡 *Nói hơi nhanh*, 🔴 *Âm lượng nhỏ*.
* **Tùy chọn 2: Tải video có sẵn từ máy tính (Upload Video):**
  * Kéo thả file (`.mp4`, `.webm`), giới hạn thời lượng 1 - 5 phút.
  * Trình phát xem trước video (Preview) trước khi xác nhận gửi.
* **Chọn Ngữ cảnh Thuyết trình (Presentation Scenario):**
  * *Thuyết trình Đồ án / Học thuật:* Cần phong thái đĩnh đạc, tốc độ vừa phải, rõ ràng.
  * *Pitching Khởi nghiệp / Gọi vốn:* Cần năng lượng cao, nụ cười, cử chỉ tay linh hoạt.
  * *Phỏng vấn xin việc:* Cần giao tiếp mắt tập trung, điềm tĩnh.

### ④ Màn hình Chờ Phân tích (Live Processing Progress)
* Thanh tiến trình phần trăm (%) chuyển động mượt mà (báo từng giai đoạn cụ thể: *Đang trích xuất âm thanh $\rightarrow$ Đang nhận diện văn bản $\rightarrow$ Đang phân tích cử chỉ $\rightarrow$ AI đang chấm điểm*).
* Hiển thị xoay vòng các **"Tips thuyết trình chuyên nghiệp"** giúp người dùng đọc giải trí trong 30 - 45 giây chờ AI xử lý.

### ⑤ Màn hình Báo cáo Chi tiết (Interactive Report Dashboard - MÀN HÌNH THEN CHỐT)
* **Khung Điểm Tổng thể & Huy hiệu:** Điểm số trên thang 100 và danh hiệu (ví dụ: *92/100 - Diễn giả Tự Tin*).
* **Trình phát Video Đồng bộ Dòng thời gian (Timeline Video Sync):**
  * Video phát song song với thanh dòng thời gian bên dưới.
  * Các mốc thời gian mắc lỗi được đánh dấu rõ ràng (ví dụ: *00:45 - Mất giao tiếp mắt*; *01:20 - Tốc độ nói vọt lên 190 WPM*; *02:10 - Im lặng lúng túng 4 giây*).
  * **Tính năng ăn điểm:** Người dùng bấm vào bất kỳ mốc lỗi nào, video sẽ **tự động nhảy (seek) đến đúng giây đó** để người dùng xem lại khoảnh khắc mình làm chưa tốt.
* **Biểu đồ Radar 5 Cạnh Đa Chiều:**
  * So sánh 5 kỹ năng: Giao tiếp mắt, Ngôn ngữ cơ thể, Tốc độ nhịp điệu, Ngữ điệu giọng nói, Nội dung bài nói.
* **Báo cáo Chi tiết Âm thanh & Từ ngữ:**
  * Biểu đồ sóng âm và biến thiên cao độ (Pitch).
  * Đồng hồ tốc độ nói (WPM: báo mức Nhanh / Vừa / Chậm).
  * Danh sách từ đệm: Thống kê số lần dùng từ *"ờ", "ừm", "kiểu như", "thì là"*.
  * Transcript toàn bài nói: Văn bản bóc băng đầy đủ, các từ đệm được tô màu nổi bật.
* **Lời khuyên Cá nhân hóa từ AI Coach (LLM):**
  * *Điểm mạnh nổi bật:* Những điều bạn đã làm rất tốt.
  * *Điểm cần cải thiện:* 2 - 3 lỗi lớn nhất cần sửa.
  * *Hành động cụ thể:* Lời khuyên bài tập luyện tập cho lần sau.
* **Xuất Báo cáo (Export PDF):** Cho phép tải xuống file PDF bản báo cáo tóm tắt để lưu lại hoặc gửi cho giảng viên xem.

### ⑥ Lịch sử Luyện tập & Biểu đồ Tiến bộ (History & Analytics)
* Danh sách tất cả các bài thuyết trình đã từng thực hiện (ngày giờ, điểm số, xem lại video và báo cáo cũ).
* **Biểu đồ theo dõi tiến bộ (Growth Chart):** Thể hiện sự cải thiện qua các lần luyện tập (ví dụ: Điểm tổng tăng từ 65 $\rightarrow$ 82, mật độ từ đệm giảm từ 5% xuống 1.5%).

---

## 4. MÔ TẢ CHI TIẾT CÁC CHỨC NĂNG KỸ THUẬT CẦN LÀM

### A. Module AI (Nguyễn Đỗ Thắng)
1. **Phân tích Khuôn mặt & Ánh mắt (Vision):**
   * Xác định người nói có nhìn thẳng vào camera/khán giả không (tính theo %).
   * Phát hiện góc nghiêng đầu: cúi mặt nhìn giấy quá lâu, ngửa mặt lên trần, liếc ngang liếc dọc.
   * Đo biểu cảm khuôn mặt: tự tin, căng thẳng, hay tươi cười.
2. **Phân tích Âm thanh & Lời nói (Audio & Speech):**
   * Tính tốc độ nói (WPM - Words Per Minute): Chuẩn là 130 - 160 từ/phút. Cảnh báo khi nói quá nhanh hoặc quá chậm.
   * Phát hiện khoảng lặng (Pause detection): Phân biệt khoảng dừng ngắt câu tự nhiên (1-2s) với khoảng lặng lúng túng do quên bài (> 3s).
   * Đo độ biến thiên ngữ điệu: Giọng có nhấn nhá năng lượng không, hay bị đều đều (Monotone).
   * Chuyển giọng nói sang chữ (STT) và đếm tần suất từ đệm ("à, ừm, ờ, kiểu như").
3. **Mô hình Huấn luyện & So sánh (Điểm nhấn để báo cáo):**
   * Huấn luyện mạng phân loại mức độ tự tin từ dữ liệu hình ảnh + âm thanh.
   * Tạo bảng thực nghiệm so sánh khoa học: Chứng minh kết hợp cả nhìn và nghe cho kết quả chính xác hơn hẳn khi chỉ dùng 1 kênh đơn lẻ.
   * Kết nối LLM (Gemini API) để sinh lời nhận xét thông minh, tự nhiên theo ngữ cảnh bài nói.

---

### B. Module Backend & Quản trị mạng (Võ Thành Nhân)
1. **Chức năng Backend (FastAPI):**
   * API Đăng ký / Đăng nhập tài khoản (JWT).
   * API Nhận file video upload từ người dùng (hỗ trợ .mp4, .webm).
   * **Hàng đợi xử lý nền (Async Task Queue):** Video 2-3 phút mất khoảng 30s-45s để AI chạy xong, nên Backend phải xử lý ngầm (Background Task / Redis Worker), không để web bị đơ.
   * API trả tiến độ xử lý (0% $\rightarrow$ 50% $\rightarrow$ 100%) theo thời gian thực về cho Web.
   * CSDL PostgreSQL lưu trữ kết quả phân tích theo từng giây.
2. **Chức năng Quản trị mạng & DevOps:**
   * Cấu hình **Nginx**:
     * Làm cổng đón (Reverse Proxy) chuyển tiếp request về đúng Frontend và Backend.
     * Cài đặt **Rate Limiting**: Giới hạn tối đa 5 lần upload video trong 10 phút / IP để chống spam làm sập server.
     * Cấu hình giới hạn dung lượng upload (`client_max_body_size 100M`).
   * Viết file `docker-compose.yml`: Cả nhóm chỉ cần gõ đúng 1 câu lệnh `docker compose up` là toàn bộ Web, Backend, Database, Nginx tự chạy trên máy tính.

---

### C. Module Frontend & Kiểm thử (Đặng Quang Sơn)
1. **Chức năng Giao diện Web (React / Next.js + Tailwind):**
   * **Phòng thu (Studio):** Có nút Bật Webcam để quay trực tiếp (có đếm ngược 3-2-1), hoặc kéo thả file video từ máy tính vào.
   * **Màn hình chờ xử lý:** Có thanh phần trăm tiến trình mượt mà kèm các mẹo thuyết trình xoay vòng giúp người dùng không chán khi chờ.
   * **Dashboard Kết quả (Quan trọng nhất):**
     * Video phát song song với biểu đồ dòng thời gian: Bấm vào cảnh báo lỗi ở phút 01:15 thì video tự nhảy đến phút 01:15.
     * Biểu đồ Radar 5 cạnh (Ánh mắt, Cử chỉ, Giọng điệu, Tốc độ, Nội dung).
     * Khung thẻ nhận xét của AI: Điểm mạnh cần phát huy, Điểm yếu cần khắc phục.
2. **Chức năng Kiểm thử phần mềm (QA/Testing):**
   * Lập bảng kế hoạch kiểm thử (**Test Plan**) và danh sách các ca kiểm thử (**Test Cases**).
   * Viết kịch bản kiểm thử tự động (**E2E Test**) bằng Playwright: Tự động mở web $\rightarrow$ nộp video $\rightarrow$ kiểm tra xem biểu đồ có hiện đầy đủ không.
   * Thu thập 10-15 video điều kiện đặc biệt để kiểm tra độ bền của AI (ví dụ: phòng tối, video bị ồn, góc quay lệch).

---

## 5. PHÂN CÔNG CÔNG VIỆC RÕ RÀNG CHO 3 NGƯỜI

| Thành viên | Đảm nhận chính | Công việc cụ thể | Sản phẩm bàn giao |
| :--- | :--- | :--- | :--- |
| **Nguyễn Đỗ Thắng**<br>*(Leader)* | **AI & Machine Learning** | • Viết code trích xuất khuôn mặt, ánh mắt, âm thanh.<br>• Huấn luyện mô hình phân loại đa phương thức.<br>• Làm thực nghiệm so sánh các mô hình.<br>• Viết prompt LLM sinh feedback. | • File mã nguồn AI trích xuất đặc trưng.<br>• File model đã train (`.onnx` hoặc `.pth`).<br>• Biểu đồ kết quả thực nghiệm (Accuracy, Confusion Matrix). |
| **Võ Thành Nhân** | **Backend & Quản trị mạng** | • Viết API FastAPI và quản lý CSDL Postgres.<br>• Làm hàng đợi xử lý ngầm (tránh đơ server).<br>• Cấu hình Nginx (Rate Limiting, Reverse Proxy).<br>• Đóng gói Docker Compose toàn hệ thống. | • Hệ thống Backend API hoàn chỉnh.<br>• File cấu hình `nginx.conf` và `docker-compose.yml`.<br>• Bộ Unit Test phía Backend. |
| **Đặng Quang Sơn** | **Frontend & Kiểm thử QA** | • Làm giao diện Web: Webcam Studio & Dashboard báo cáo.<br>• Làm tính năng Video nhảy đến giây bị lỗi.<br>• Lập Test Plan, viết kịch bản Test tự động (Playwright).<br>• Thu thập các video mẫu để kiểm thử. | • Giao diện Web mượt mà, trực quan.<br>• Bảng Test Plan & danh sách Test Cases.<br>• Kịch bản chạy Test tự động E2E. |

---

## 6. NGUỒN TÀI NGUYÊN, THƯ VIỆN, PRE-TRAINED MODELS & DATASETS

Nhóm không cần mất công tìm kiếm lan man, đây là các nguồn chuẩn sẵn dùng cho từng bạn:

### A. Nguồn cho phần AI (Thắng tham khảo)
* **Thị giác khuôn mặt & ánh mắt:**
  * [MediaPipe Face Mesh](https://github.com/google/mediapipe) (Trích xuất 468 điểm mốc khuôn mặt cực nhẹ, chạy realtime trên CPU).
  * [SixDRepNet](https://github.com/thohemp/6DRepNet) (Ước lượng góc quay đầu 3D Pitch, Yaw, Roll siêu chuẩn).
* **Âm thanh & Speech:**
  * [OpenAI Whisper](https://github.com/openai/whisper) (Model `base` hoặc `small` chuyển đổi giọng nói tiếng Việt thành text có timestamp từng từ).
  * [Librosa](https://librosa.org/) (Thư viện Python trích xuất Pitch F0, WPM, khoảng lặng âm thanh).
* **Dataset tham khảo để nghiên cứu & huấn luyện:**
  * **RAVDESS Dataset** (Bộ dữ liệu cảm xúc giọng nói & video chuẩn học thuật).
  * **TED-LIUM / TED Talks Clips** (Bộ dữ liệu video thuyết trình thực tế từ YouTube để lấy mẫu người nói tự tin).
  * Nhóm tự quay 30 - 40 clip ngắn của chính các thành viên và bạn bè (với các tình huống cố tình: nói nhanh, nói lắp "ờ/à", cúi gằm mặt nhìn giấy) để làm tập Test set thực tế.

### B. Nguồn cho phần Backend & Quản trị mạng (Nhân tham khảo)
* **Framework:** [FastAPI Documentation](https://fastapi.tiangolo.com/) (Hỗ trợ Async cực nhanh và tự sinh Swagger UI để Sơn xem API).
* **Deploy Model:** [ONNX Runtime Python](https://onnxruntime.ai/) (Giúp chạy model AI nhanh gấp 2-3 lần so với PyTorch thô khi chạy trên Server).
* **Mạng & Docker:** Tài liệu cấu hình [Nginx Rate Limiting](https://www.nginx.com/blog/rate-limiting-nginx/) và mẫu Docker Compose cho FastAPI + Postgres.

### C. Nguồn cho phần Frontend & Testing (Sơn tham khảo)
* **Giao diện & Biểu đồ:**
  * [Recharts](https://recharts.org/) hoặc [Chart.js](https://www.chartjs.org/) (Vẽ biểu đồ Radar và biểu đồ sóng âm cực đẹp).
  * [Tailwind CSS](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/) (Bộ icon và giao diện hiện đại).
* **Kiểm thử tự động:**
  * [Playwright for Python/Node.js](https://playwright.dev/) (Công cụ tự động hóa kiểm thử web hàng đầu hiện nay, quay video test và chụp ảnh báo cáo tự động).

### D. Tài liệu Khoa học trích dẫn cho Báo cáo (Cả nhóm tham khảo)
1. **Nghiên cứu về từ đệm ("ậm ờ"):**
   * *Clark, H. H., & Fox Tree, J. E. (2002). Using uh and um in spontaneous speaking. Cognition, 84(1), 73-111.*
2. **Nghiên cứu về hệ thống huấn luyện thuyết trình:**
   * *Hoque, M. E., et al. (2013). MACH: My Automated Conversation Coach. ACM UbiComp / IEEE Transactions on Affective Computing.* (Bài báo kinh điển của MIT Media Lab về đánh giá giao tiếp đa kênh).

---

## 7. LỘ TRÌNH 12 TUẦN RÚT GỌN (DỄ THEO DÕI)

```
[ Tháng 9: Dựng khung & Viết Core AI ]
  • Tuần 1 - 2: Thống nhất chức năng, Sơn vẽ giao diện Figma, Nhân dựng khung FastAPI & Docker, Thắng chạy thử MediaPipe & Librosa trên Jupyter Notebook.
  • Tuần 3 - 4: Thắng hoàn thành code trích xuất hình ảnh/âm thanh; Nhân làm API Upload video; Sơn làm màn hình Webcam quay video.

[ Tháng 10: Huấn luyện Model & Ghép nối Hệ thống ]
  • Tuần 5 - 6: Thắng huấn luyện xong mô hình Fusion và chạy so sánh; Sơn làm màn hình Dashboard biểu đồ.
  • Tuần 7 - 8: Nhân ghép nối code AI của Thắng vào Backend chạy ngầm; Sơn kết nối Frontend với Backend; chạy thử từ A đến Z.

[ Tháng 11: Kiểm thử, Tinh chỉnh & Viết Báo cáo ]
  • Tuần 9 - 10: Sơn chạy bộ Test tự động (Playwright) và test các video điều kiện xấu; Thắng lấy số liệu vẽ biểu đồ; Nhân tối ưu tốc độ xử lý video.
  • Tuần 11: Cả nhóm hoàn thiện quyển Báo cáo PBL6; đóng gói Docker chạy mượt không lỗi.
  • Tuần 12: Làm slide, tập thuyết trình và BẢO VỆ ĐỒ ÁN.
```
