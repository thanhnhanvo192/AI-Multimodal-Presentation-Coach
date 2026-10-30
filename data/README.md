# HƯỚNG DẪN QUẢN LÝ BỘ DỮ LIỆU DUT-PRESCORPUS (PBL6)

> **Bộ môn:** Khoa Công nghệ Thông tin - Trường Đại học Bách Khoa, Đại học Đà Nẵng  
> **Đề tài:** Nền tảng Đánh giá Kỹ năng Thuyết trình Tự động Đa Phương thức & Đa Bối cảnh

---

## 1. Vị trí lưu trữ dữ liệu tải về

Toàn bộ video tải về được gom vào thư mục `data/DUT-PresCorpus/raw_videos/` và phân loại trực tiếp theo 3 bối cảnh:

```text
data/DUT-PresCorpus/
├── raw_videos/
│   ├── do_an/                    # Nơi bỏ video thuyết trình đồ án, seminar CNTT
│   │   ├── da_001.mp4
│   │   ├── da_002.mp4
│   │   └── ...
│   ├── hung_bien/                # Nơi bỏ video TEDx, diễn thuyết, tranh biện
│   │   ├── hb_001.mp4
│   │   ├── hb_002.mp4
│   │   └── ...
│   └── pitching/                 # Nơi bỏ video Shark Tank, gọi vốn khởi nghiệp
│       ├── pt_001.mp4
│       ├── pt_002.mp4
│       └── ...
├── audio_wav/                    # Thư mục tự động tách âm thanh 16kHz
├── features_120d/                # Thư mục lưu ma trận vector đặc trưng 120D
├── annotations/                  # Thư mục lưu bảng điểm Rubric chấm độc lập
└── metadata.csv                  # File quản lý danh mục và thông tin từng video
```

---

## 2. Quy tắc đặt tên file (Naming Convention)

Để script xử lý tự động và ghép nhãn không bị nhầm lẫn, Thắng đặt tên file theo định dạng:

- **Đồ án:** `da_001.mp4`, `da_002.mp4`, ... `da_060.mp4`
- **Hùng biện:** `hb_001.mp4`, `hb_002.mp4`, ... `hb_060.mp4`
- **Pitching:** `pt_001.mp4`, `pt_002.mp4`, ... `pt_060.mp4`

---

## 3. Tiêu chí chọn video đạt chuẩn (Checklist kiểm duyệt)

- [ ] Góc quay trực diện ($\pm 15^\circ$), nhìn rõ mặt và nửa thân người (**Waist-up**).
- [ ] Âm thanh người nói rõ ràng, không bị nhạc nền quá to đè lên tiếng nói.
- [ ] Thời lượng cắt đoạn từ **$2 - 5$ phút**.
- [ ] Cập nhật dòng tương ứng vào file `metadata.csv` (Mã ID, Giới tính, Link gốc).
