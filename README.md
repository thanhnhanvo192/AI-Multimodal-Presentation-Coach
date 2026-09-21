<div align="center">

# 🎙️ NỀN TẢNG ĐÁNH GIÁ KỸ NĂNG THUYẾT TRÌNH TỰ ĐỘNG
### **AI Multimodal Presentation Coach**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-Reverse_Proxy-009639?style=for-the-badge&logo=nginx&logoColor=white)](https://nginx.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

*Một sản phẩm nghiên cứu ứng dụng Trí tuệ Nhân tạo Đa phương thức (Thị giác & Âm thanh) phục vụ nâng cao kỹ năng thuyết trình cho sinh viên và diễn giả.*

---

**TRƯỜNG ĐẠI HỌC BÁCH KHOA - ĐẠI HỌC ĐÀ NẴNG**  
**KHOA CÔNG NGHỆ THÔNG TIN**  
*Đồ án chuyên ngành PBL6 (Tháng 09/2026 – Tháng 11/2026)*

</div>

---

## 💡 1. GIỚI THIỆU Ý TƯỞNG CỐT LÕI

Hệ thống hoạt động như một **"Huấn luyện viên thuyết trình ảo (AI Presentation Coach)"**:
1. **Thu âm & Ghi hình:** Người dùng quay video trực tiếp bằng Webcam trên trang web hoặc tải video sẵn có (`.mp4`, `.webm`) lên hệ thống.
2. **Xử lý Đa kênh AI ngầm:** Hệ thống chạy song song 2 kênh phân tích:
   * **Thị giác (Vision):** Nhận diện khuôn mặt, hướng nhìn ánh mắt (Eye Contact %), góc nghiêng đầu (Head Pose 3D) và ngôn ngữ cơ thể.
   * **Âm thanh & Lời nói (Audio & Speech):** Đo tốc độ nói (WPM), phát hiện khoảng lặng lúng túng, bóc băng giọng nói (Whisper STT), tính biến thiên cao độ và đếm tần suất từ đệm (*"ờ, ừm, kiểu như"*).
3. **Màn hình Báo cáo Tương tác (Interactive Dashboard):** Trả về kết quả đánh giá đồng bộ dòng thời gian (Timeline Video Sync) cho phép bấm vào mốc lỗi để video tự động tua đến đúng giây xảy ra lỗi.

```
[ Người dùng: Quay Webcam / Upload Video ]
                    │
                    ▼ (Cổng HTTP Port 80)
          ┌──────────────────┐
          │  Nginx Security  │ ──> Rate Limiting: Chống spam 5 video/10 phút
          └────────┬─────────┘
                   │ Forward sang Port 8000
                   ▼
         ┌────────────────────┐
         │   FastAPI Server   │ ──> Tiếp nhận & tạo Async Task
         └─────────┬──────────┘
                   │
      ┌────────────┴────────────┐
      ▼                         ▼
[ Phân tích Thị giác ]    [ Phân tích Giọng nói ]
• Giao tiếp mắt %         • Tốc độ nói (WPM)
• Góc quay đầu 3D         • Khoảng lặng & Từ đệm
• Biểu cảm tự tin         • Ngữ điệu & Cao độ (Pitch)
      │                         │
      └────────────┬────────────┘
                   ▼
       [ MÔ HÌNH HỢP NHẤT AI (FUSION MODEL) ]
                   │
                   ▼
    [ BÁO CÁO DASHBOARD TRỰC QUAN & LỜI KHUYÊN LLM ]
```

---

## ✨ 2. CÁC CHỨC NĂNG NỔI BẬT

* 🎥 **Phòng thu Luyện tập (Presentation Studio):**
  * Quay trực tiếp qua Webcam kèm bộ đếm ngược 3-2-1.
  * Mode nhắc bài (Teleprompter Mode) cho phép dán dàn ý lên màn hình để nhìn camera tự nhiên hơn.
  * Tùy chọn **Ngữ cảnh Thuyết trình (Presentation Scenario)**: *Academic (Đồ án)*, *Pitching (Gọi vốn)*, *Interview (Phỏng vấn)*.
* ⌛ **Theo dõi Tiến độ Thời gian thực (Live Progress Tracking):**
  * Xử lý video bất đồng bộ (Async Background Processing), hiển thị phần trăm mượt mà 0% $\rightarrow$ 100% kèm mẹo luyện tập.
* 📊 **Trang Báo cáo Tương tác (Timeline Video Sync Dashboard):**
  * **Video Sync:** Bấm vào bất kỳ cảnh báo lỗi nào (mất ánh mắt, nói quá nhanh, từ đệm), video tự động nhảy (`seek`) đến đúng khoảnh khắc đó.
  * **Radar Chart 5 Cạnh:** Ánh mắt, Cử chỉ, Tốc độ nói, Ngữ điệu, Nội dung.
  * **Transcript Bóc băng:** Tô màu các từ đệm (*"ừm", "ờ", "kiểu như"*) và thống kê tần suất.
  * **Lời khuyên Cá nhân hóa từ AI Coach (LLM):** Đưa ra điểm mạnh, điểm yếu và các bài tập cải thiện cụ thể.

---

## 🛠️ 3. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

| Phân hệ | Công nghệ & Thư viện | Mô tả |
| :--- | :--- | :--- |
| **Backend & API** | **FastAPI**, Python 3.10 | Framework API bất đồng bộ tốc độ cao, tự động tạo Swagger Docs |
| **CSDL & Cache** | **PostgreSQL 15**, **Redis 7**, SQLAlchemy | CSDL quan hệ kết hợp Async Engine & Redis Task Queue |
| **Quản trị mạng & DevOps** | **Docker Compose**, **Nginx** | Containerize toàn hệ thống, Nginx Reverse Proxy & Rate Limiting |
| **AI & Machine Learning** | **MediaPipe**, **6DRepNet**, **Whisper**, **Librosa** | Trích xuất điểm mốc khuôn mặt, góc đầu 3D, bóc băng & phân tích âm thanh |
| **Kiểm thử phần mềm** | **Pytest**, **Playwright** | Viết Unit Test phía Backend và E2E Automated Testing |

---

## 📁 4. CẤU TRÚC MÃ NGUỒN (PROJECT STRUCTURE)

```text
source/
├── docker-compose.yml           # File cấu hình đóng gói Docker toàn hệ thống
├── README.md                    # Tài liệu giới thiệu dự án
├── .gitignore                   # Cấu hình bỏ qua file rác khi commit Git
├── docs/                        # Tài liệu báo cáo & Sơ đồ CSDL ERD
│   ├── DATABASE_ERD.md
│   └── BAO_CAO_SPRINT_2_BACKEND_DEVOPS.docx
├── nginx/                       # Nginx Reverse Proxy & Rate Limiting
│   ├── Dockerfile
│   └── nginx.conf
└── backend/                     # Mã nguồn Backend FastAPI
    ├── Dockerfile
    ├── requirements.txt
    ├── .env.example
    ├── app/
    │   ├── main.py              # Điểm khởi chạy ứng dụng FastAPI
    │   ├── core/                # Config, Async Database & JWT Security
    │   ├── models/              # SQLAlchemy ORM Models (User, Presentation, AnalysisResult)
    │   ├── schemas/             # Pydantic Schemas (Auth & Dashboard Report JSON)
    │   ├── services/            # Async Background Task (video_processor.py)
    │   └── api/v1/              # Endpoint Routers (/auth, /presentations)
    └── tests/                   # Bộ kiểm thử tự động (pytest)
```

---

## 🚀 5. HƯỚNG DẪN KHỞI CHẠY (QUICK START)

### Yêu cầu tiên quyết (Prerequisites)
* Đã cài đặt **Docker Desktop** và **Git** trên máy tính.

### Khởi chạy 1-lệnh bằng Docker Compose (Khuyên dùng)
```bash
# 1. Clone dự án về máy
git clone <URL_REPO_GITHUB_CUA_NHOM>
cd source

# 2. Khởi chạy toàn bộ hệ thống bằng Docker Compose
docker compose up --build -d
```

Sau khi khởi chạy thành công:
* 🌐 **Swagger UI API Documentation:** `http://localhost/docs` (hoặc `http://localhost:8000/docs`)
* 🟢 **Health Check API:** `http://localhost/health`
* 📤 **Video Upload API (Rate Limited):** `http://localhost/api/v1/presentations/upload`

---

<div align="center">
  <i>© 2026 PBL6 Team - Trường Đại học Bách khoa, Đại học Đà Nẵng. All rights reserved.</i>
</div>
