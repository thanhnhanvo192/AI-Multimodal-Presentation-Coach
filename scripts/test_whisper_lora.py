# -*- coding: utf-8 -*-
"""
=============================================================================
 KIỂM THỬ MÔ HÌNH WHISPER LORA TIẾNG VIỆT ĐÃ HUẤN LUYỆN
 Đề tài: Nền tảng Đánh giá Kỹ năng Thuyết trình Tự động (PBL6 - ĐHBK Đà Nẵng)
 AI & Data Lead: Nguyễn Đỗ Thắng
 
 - Trọng số nạp từ: weights/whisper_lora_vietnamese
 - Chức năng: Phiên âm tiếng Việt, đếm từ đệm ('ờ', 'ừm', 'à', 'kiểu như')
=============================================================================
"""

import os
import sys
import time

# Đảm bảo in UTF-8
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
LORA_PATH = os.path.join(PROJECT_ROOT, "weights", "whisper_lora_vietnamese")

FILLER_WORDS = ["à", "ờ", "ừm", "ừ", "kiểu như", "thì là", "như là"]

def test_inference(audio_path=None):
    print("=" * 70)
    print("      KIỂM THỬ SUY LUẬN MÔ HÌNH WHISPER LORA TIẾNG VIỆT (PBL6)")
    print("=" * 70)
    
    if not os.path.exists(LORA_PATH):
        print(f"[!] Lỗi: Không tìm thấy thư mục trọng số LoRA tại: {LORA_PATH}")
        return

    print(f"[*] Đường dẫn trọng số LoRA: {LORA_PATH}")
    
    try:
        import torch
        from transformers import WhisperForConditionalGeneration, WhisperProcessor
        from peft import PeftModel
        import soundfile as sf
        import numpy as np
    except ImportError as e:
        print(f"\n[!] Môi trường máy tính chưa cài đủ thư viện để chạy test: {e}")
        print("    >> Để test trên máy cá nhân, Thắng có thể chạy: pip install peft transformers soundfile")
        return

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[*] Thiết bị tính toán (Device): {device.upper()}")

    BASE_MODEL = "openai/whisper-small"
    print(f"[*] 1. Đang nạp mô hình nền tảng: {BASE_MODEL}...")
    base_model = WhisperForConditionalGeneration.from_pretrained(BASE_MODEL)
    
    print(f"[*] 2. Đang gắn bộ não LoRA của nhóm Thắng vào...")
    model = PeftModel.from_pretrained(base_model, LORA_PATH)
    processor = WhisperProcessor.from_pretrained(LORA_PATH)
    model.to(device)
    model.eval()
    print("[+] NẠP THÀNH CÔNG MÔ HÌNH WHISPER LORA TIẾNG VIỆT!")

    # Tìm file audio test
    if audio_path is None or not os.path.exists(audio_path):
        candidates = [
            os.path.join(PROJECT_ROOT, "data", "public_datasets", "vivos", "waves", "VIVOS_TEST_0001.wav"),
            os.path.join(os.path.dirname(PROJECT_ROOT), "PBL6_TaiLieu", "experiments", "stt_benchmark", "sample_data", "sample_presentation_vi.wav")
        ]
        for c in candidates:
            if os.path.exists(c):
                audio_path = c
                break

    if not audio_path or not os.path.exists(audio_path):
        print("[!] Chưa tìm thấy file audio mẫu .wav để test.")
        return

    print(f"\n[*] 3. Đang xử lý file âm thanh: {os.path.basename(audio_path)}")
    audio_data, sr = sf.read(audio_path)
    if len(audio_data.shape) > 1:
        audio_data = np.mean(audio_data, axis=1)
    
    duration_sec = len(audio_data) / sr
    print(f"    - Thời lượng file âm thanh: {duration_sec:.2f} giây")

    start_time = time.perf_counter()
    input_features = processor(audio_data, sampling_rate=16000, return_tensors="pt").input_features.to(device)

    with torch.no_grad():
        predicted_ids = model.generate(input_features, language="vi", task="transcribe")
    
    transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
    latency = time.perf_counter() - start_time

    print("\n" + "=" * 70)
    print("      KẾT QUẢ BÓC BĂNG & PHÂN TÍCH BÀI NÓI (TRANSCRIPTION)")
    print("=" * 70)
    print(f"📝 Văn bản bóc băng: \"{transcription}\"")
    print(f"⏱️ Thời gian suy luận: {latency:.2f} giây (RTF: {latency/duration_sec:.3f})")

    # Đếm từ đệm
    found_fillers = []
    text_lower = transcription.lower()
    for fw in FILLER_WORDS:
        count = text_lower.count(fw)
        if count > 0:
            found_fillers.append(f"'{fw}': {count} lần")

    print(f"🔍 Thống kê từ đệm phát hiện: {', '.join(found_fillers) if found_fillers else 'Không phát hiện từ đệm'}")
    print("=" * 70)

if __name__ == "__main__":
    test_inference()
