"""
=============================================================================
 BỘ CÔNG CỤ TẢI VÀ CHUẨN HÓA DATASET MẠNG (ACADEMIC / PUBLIC DATASETS)
 
 Đề tài: Nền tảng Đánh giá Kỹ năng Thuyết trình Tự động (PBL6 - ĐHBK Đà Nẵng)
 AI & Data Lead: Nguyễn Đỗ Thắng (23T_Nhat1)
 
 Hỗ trợ 2 bộ dữ liệu học thuật chuẩn quốc tế & tiếng Việt (Cách 2):
 1. VIVOS (AILab VNU-HCM): Âm thanh tiếng Việt chuẩn 16kHz + Transcripts (Tầng 2 STT & Audio Prosody)
 2. CMU-MOSEI (Carnegie Mellon University): Đánh giá kỹ năng thuyết trình đa phương thức (Tầng 3 Scoring & XAI)
=============================================================================
"""

import os
import sys
import io
import argparse
import pandas as pd
import soundfile as sf
from pathlib import Path

# Đảm bảo UTF-8 cho Windows Terminal
if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Thư mục đích lưu trữ dataset: Tập trung toàn bộ vào dự án chính PBL6
MAIN_PROJECT_ROOT = Path(r"F:\DAIHOC\Nam4-ky1\PBL6")

TARGET_DIRS = [
    MAIN_PROJECT_ROOT / "data" / "public_datasets"
]

AVAILABLE_DATASETS = {
    "vivos": {
        "name": "VIVOS Vietnamese Speech Corpus (AILab VNU-HCM)",
        "source": "Hugging Face (ademax/vivos-vie-speech2text / AILAB-VNUHCM/vivos)",
        "role": "Tầng 2 (STT & Audio Prosody: WER Faster-Whisper, F0 Pitch, Jitter, Shimmer, Pauses)",
        "format": "Audio WAV 16kHz Mono + Ground Truth Transcripts",
        "total_samples": 1000
    },
    "cmu_mosei": {
        "name": "CMU-MOSEI Multimodal Opinion & Delivery Corpus (Carnegie Mellon)",
        "source": "Hugging Face (vintp/CMU-Mosei-text)",
        "role": "Tầng 3 (Tabular Scoring & XAI: Đánh giá cảm xúc, phong thái, đa phương thức)",
        "format": "Multimodal Labels (Sentiment, Emotion, Confidence, Timestamps)",
        "total_samples": 4653
    }
}


def print_available_datasets():
    print("\n" + "=" * 80)
    print("  DANH MỤC CÁC BỘ DỮ LIỆU MẠNG / HỌC THUẬT CHUẨN HÓA (CÁCH 2) - PBL6")
    print("=" * 80)
    for key, info in AVAILABLE_DATASETS.items():
        print(f"\n[*] Mã dataset: {key.upper()}")
        print(f"    - Tên đầy đủ: {info['name']}")
        print(f"    - Nguồn học thuật: {info['source']}")
        print(f"    - Vai trò trong PBL6: {info['role']}")
        print(f"    - Định dạng: {info['format']}")
        print(f"    - Tổng số mẫu có sẵn: {info['total_samples']:,} mẫu")
    print("\n" + "=" * 80)
    print("Cách sử dụng nhanh:")
    print("  python scripts/download_public_dataset.py --dataset vivos --num-samples 50")
    print("  python scripts/download_public_dataset.py --dataset cmu_mosei --num-samples 100")
    print("  python scripts/download_public_dataset.py --dataset all --quick")
    print("=" * 80 + "\n")


def download_and_extract_vivos(num_samples: int = 50, extract_all: bool = False):
    """
    Tải và trích xuất tập dữ liệu VIVOS chuẩn âm thanh tiếng Việt 16kHz + transcripts.
    """
    from huggingface_hub import hf_hub_download

    print(f"\n[+] Đang tải / lấy VIVOS từ Hugging Face Hub (ademax/vivos-vie-speech2text)...")
    try:
        parquet_file = hf_hub_download(
            repo_id="ademax/vivos-vie-speech2text",
            filename="data/test-00000-of-00001-dc934696ee903158.parquet",
            repo_type="dataset"
        )
    except Exception as e:
        print(f"[-] Lỗi khi tải file VIVOS từ Hugging Face: {e}")
        return False

    print(f"[+] Đọc dữ liệu từ cache: {parquet_file}")
    df = pd.read_parquet(parquet_file)
    total_in_df = len(df)
    limit = total_in_df if extract_all or num_samples >= total_in_df else num_samples
    sub_df = df.iloc[:limit].copy()

    print(f"[+] Trích xuất {limit} mẫu âm thanh WAV 16kHz chuẩn và tạo metadata...")

    for base_dir in TARGET_DIRS:
        vivos_dir = base_dir / "vivos"
        waves_dir = vivos_dir / "waves"
        waves_dir.mkdir(parents=True, exist_ok=True)

        metadata_rows = []
        for idx, row in sub_df.iterrows():
            audio_id = f"VIVOS_TEST_{idx+1:04d}"
            filename = f"{audio_id}.wav"
            file_path = waves_dir / filename

            # Trích xuất và lưu file WAV 16kHz
            audio_bytes = row["audio"]["bytes"]
            audio_data, sr = sf.read(io.BytesIO(audio_bytes))
            dur = len(audio_data) / sr if sr > 0 else 0

            # Ghi ra đĩa nếu chưa có
            if not file_path.exists():
                sf.write(str(file_path), audio_data, sr)

            metadata_rows.append({
                "audio_id": audio_id,
                "filename": filename,
                "dataset": "VIVOS",
                "sampling_rate": sr,
                "duration_sec": round(dur, 2),
                "transcript": row["transcription"],
                "raw_transcript": row.get("raw_transcription", ""),
                "status": "Ready_16kHz"
            })

        meta_df = pd.DataFrame(metadata_rows)
        meta_csv_path = vivos_dir / "metadata.csv"
        meta_df.to_csv(meta_csv_path, index=False, encoding="utf-8-sig")
        print(f"    [OK] Đã xuất {limit} audio + metadata tại: {vivos_dir}")

    print(f"[VIVOS] Hoàn tất chuẩn bị {limit} mẫu âm thanh 16kHz và metadata đồng bộ!\n")
    return True


def download_and_extract_cmu_mosei(num_samples: int = 100, extract_all: bool = False):
    """
    Tải bộ nhãn đa phương thức và đánh giá kỹ năng thuyết trình chuẩn quốc tế CMU-MOSEI.
    """
    from huggingface_hub import hf_hub_download

    print(f"\n[+] Đang tải CMU-MOSEI metadata từ Hugging Face (vintp/CMU-Mosei-text)...")
    try:
        csv_file = hf_hub_download(
            repo_id="vintp/CMU-Mosei-text",
            filename="test.csv",
            repo_type="dataset"
        )
    except Exception as e:
        print(f"[-] Lỗi khi tải CMU-MOSEI từ Hugging Face: {e}")
        return False

    df = pd.read_csv(csv_file)
    total_in_df = len(df)
    limit = total_in_df if extract_all or num_samples >= total_in_df else num_samples
    sub_df = df.iloc[:limit].copy()

    # Thêm cột duration và id chuẩn
    sub_df["sample_id"] = [f"MOSEI_{i+1:04d}" for i in range(len(sub_df))]
    sub_df["duration_sec"] = (sub_df["end_time"] - sub_df["start_time"]).round(2)
    sub_df["youtube_url"] = "https://www.youtube.com/watch?v=" + sub_df["video"]

    for base_dir in TARGET_DIRS:
        mosei_dir = base_dir / "cmu_mosei"
        mosei_dir.mkdir(parents=True, exist_ok=True)

        meta_csv_path = mosei_dir / "metadata.csv"
        sub_df.to_csv(meta_csv_path, index=False, encoding="utf-8-sig")
        print(f"    [OK] Đã xuất {limit} nhãn đa phương thức tại: {meta_csv_path}")

    print(f"[CMU-MOSEI] Hoàn tất xuất {limit} bản ghi đa phương thức và metadata đồng bộ!\n")
    return True


def create_readme_docs():
    """Tạo file README hướng dẫn sử dụng bộ dữ liệu mạng cho cả 2 workspace"""
    readme_content = """# BỘ DỮ LIỆU MẠNG & CHUẨN HỌC THUẬT QUỐC TẾ (CÁCH 2 - PBL6)

> **Đề tài:** Nền tảng Đánh giá Kỹ năng Thuyết trình Tự động Đa Phương thức & Đa Bối cảnh  
> **Sinh viên thực hiện:** Nguyễn Đỗ Thắng (AI & Data Lead - 23T_Nhat1) - ĐHBK Đà Nẵng  
> **Giảng viên hướng dẫn:** TS. Lê Minh Trí  

---

## 1. Cấu trúc thư mục dữ liệu mạng (`data/public_datasets/`)

```text
data/public_datasets/
├── vivos/                       # Dữ liệu giọng nói tiếng Việt chuẩn 16kHz
│   ├── waves/                   # Các file .wav đơn kênh 16kHz (VIVOS_TEST_0001.wav...)
│   └── metadata.csv             # Bảng nhãn: audio_id, transcript, duration_sec, sr
└── cmu_mosei/                   # Dữ liệu thuyết trình đa phương thức quốc tế (CMU)
    └── metadata.csv             # Bảng nhãn: sample_id, video, start_time, end_time, sentiment, emotions
```

---

## 2. Vai trò trong Kiến trúc AI 4 Tầng

| Bộ dữ liệu | Đơn vị công bố | Tầng ứng dụng trong PBL6 | Giá trị thực tiễn |
| :--- | :--- | :--- | :--- |
| **VIVOS** | AILab - VNUHCM | **Tầng 2: Audio & Speech** | Benchmark đo WER thực tế của Faster-Whisper INT8 vs Wav2Vec2 trên giọng người thật tiếng Việt; đo đạc cao độ Pitch F0, Jitter, Shimmer, Pauses. |
| **CMU-MOSEI** | Carnegie Mellon Univ (CMU) | **Tầng 3: Tabular Scoring & XAI** | Bộ dữ liệu chuẩn quốc tế hàng đầu về thuyết trình & cảm xúc monologue; kiểm chứng thuật toán CatBoost Regression & SHAP trước hội đồng. |

---

## 3. Lệnh sử dụng qua CLI

```powershell
# Xem danh mục và thông số các bộ dữ liệu
python scripts/download_public_dataset.py --list

# Tải nhanh 50 mẫu âm thanh tiếng Việt VIVOS (16kHz WAV + Transcript)
python scripts/download_public_dataset.py --dataset vivos --num-samples 50

# Tải 100 mẫu nhãn đa phương thức quốc tế CMU-MOSEI
python scripts/download_public_dataset.py --dataset cmu_mosei --num-samples 100

# Tải nhanh cả 2 bộ (Quick Setup)
python scripts/download_public_dataset.py --dataset all --quick

# Trích xuất toàn bộ (Full)
python scripts/download_public_dataset.py --dataset vivos --all
```
"""
    for base_dir in TARGET_DIRS:
        base_dir.mkdir(parents=True, exist_ok=True)
        readme_file = base_dir / "README.md"
        with open(readme_file, "w", encoding="utf-8") as f:
            f.write(readme_content)


def main():
    parser = argparse.ArgumentParser(
        description="PBL6 - Công cụ tải và đồng bộ Dataset mạng học thuật chuẩn hóa (Cách 2)"
    )
    parser.add_argument("--list", "-l", action="store_true", help="Hiển thị danh mục các dataset học thuật có sẵn")
    parser.add_argument("--dataset", "-d", choices=["vivos", "cmu_mosei", "all"], default=None,
                        help="Chọn bộ dữ liệu cần tải: vivos, cmu_mosei, hoặc all")
    parser.add_argument("--num-samples", "-n", type=int, default=50,
                        help="Số lượng mẫu muốn trích xuất (Mặc định: 50)")
    parser.add_argument("--all", "-a", action="store_true", help="Trích xuất toàn bộ tập dữ liệu")
    parser.add_argument("--quick", "-q", action="store_true", help="Chế độ nhanh: 30 mẫu VIVOS + 100 mẫu CMU-MOSEI")

    args = parser.parse_args()

    # Tạo tài liệu README
    create_readme_docs()

    if args.list or (args.dataset is None and not args.quick):
        print_available_datasets()
        return

    num_samples = args.num_samples
    if args.quick:
        print("\n[*] Chế độ tải nhanh (Quick Mode):")
        download_and_extract_vivos(num_samples=30, extract_all=False)
        download_and_extract_cmu_mosei(num_samples=100, extract_all=False)
        print("[SUCCESS] Đã thiết lập xong toàn bộ dữ liệu mạng chuẩn hóa cho PBL6!")
        return

    if args.dataset in ["vivos", "all"]:
        download_and_extract_vivos(num_samples=num_samples, extract_all=args.all)

    if args.dataset in ["cmu_mosei", "all"]:
        download_and_extract_cmu_mosei(num_samples=num_samples, extract_all=args.all)

    print("[SUCCESS] Hoàn tất quá trình đồng bộ dataset mạng!")


if __name__ == "__main__":
    main()
