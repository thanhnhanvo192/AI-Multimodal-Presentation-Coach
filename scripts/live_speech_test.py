# -*- coding: utf-8 -*-
"""
=============================================================================
 CHƯƠNG TRÌNH KIỂM THỬ GIỌNG NÓI & TỪ ĐỆM TRỰC TIẾP TỪ MICRO (LIVE STT TEST)
 Đề tài: Nền tảng Đánh giá Kỹ năng Thuyết trình Tự động (PBL6 - ĐHBK Đà Nẵng)
 AI & Data Lead: Nguyễn Đỗ Thắng
 Tech Lead Đồng hành: Trần Gia Bách (Bách)

 Nâng cấp v2.0:
 1. Hiển thị thang đo âm lượng Real-time (VU Meter) khi đang nói để biết mic có vào không.
 2. Tự động chuẩn hóa biên độ (Dynamic Gain Normalization) chống tiếng mic bị quá nhỏ.
 3. Tắt bộ lọc Silero VAD quá gắt làm nuốt tiếng người nói.
 4. Tự động lưu file WAV để kiểm tra lại chất lượng thu âm.
=============================================================================
"""

import os
import sys
import time
import argparse
import threading
import numpy as np
import sounddevice as sd
import soundfile as sf

# Đảm bảo in UTF-8 không lỗi trên Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

FILLER_WORDS = [
    "ờ", "à", "ừm", "ừ", "kiểu như", "thì là", "như là",
    "ờm", "thì", "kiểu", "ấy", "nói chung là"
]

TEMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "processed", "temp_live_speech")
os.makedirs(TEMP_DIR, exist_ok=True)
LAST_RECORDING_PATH = os.path.join(TEMP_DIR, "last_recording.wav")


def load_model(model_size="base", device="cpu", compute_type="int8"):
    from faster_whisper import WhisperModel
    print(f"[*] Đang nạp mô hình Faster-Whisper '{model_size}' ({compute_type}) trên {device.upper()}...")
    t0 = time.perf_counter()
    model = WhisperModel(model_size, device=device, compute_type=compute_type, cpu_threads=4)
    print(f"[OK] Nạp mô hình thành công trong {time.perf_counter() - t0:.2f}s!\n")
    return model


def record_until_keypress(sample_rate=16000, device_index=None):
    """Thu âm giọng nói kèm VU meter thời gian thực cho đến khi nhấn Enter."""
    recorded_frames = []
    stop_event = threading.Event()
    current_rms = [0.0]

    def audio_callback(indata, frames, time_info, status):
        if not stop_event.is_set():
            recorded_frames.append(indata.copy())
            # Tính RMS để làm thước đo âm lượng thời gian thực
            rms = np.sqrt(np.mean(indata**2))
            current_rms[0] = rms

    stream = sd.InputStream(
        samplerate=sample_rate,
        channels=1,
        dtype='float32',
        device=device_index,
        callback=audio_callback
    )

    def vu_meter_worker():
        meter_len = 24
        while not stop_event.is_set():
            rms_val = current_rms[0]
            # Chuẩn hóa giá trị RMS từ 0.0 -> 0.15 thành mức hiển thị 0 -> meter_len
            scaled = min(int((rms_val / 0.10) * meter_len), meter_len)
            bar = "█" * scaled + "░" * (meter_len - scaled)
            pct = min(int((rms_val / 0.10) * 100), 100)
            status_text = "🟢 Đang nghe rõ" if scaled > 1 else "⚪ Chưa có tiếng"
            sys.stdout.write(f"\r🎙️ [MIC LIVE] [{bar}] {pct:3d}% | {status_text} (Nhấn ENTER để dừng)...")
            sys.stdout.flush()
            time.sleep(0.08)

    with stream:
        print("\n" + "=" * 75)
        print("🔴 MICROPHONE BẮT ĐẦU THU ÂM! HÃY NÓI TỰ NHIÊN...")
        print("   >> Thắng hãy nói bình thường, chêm từ đệm hoặc thuật ngữ tuỳ ý.")
        print("   >> Quan sát thanh mức âm lượng bên dưới để chắc chắn mic nhận tín hiệu.")
        print("   >> KHI NÓI XONG, NHẤN PHÍM [ENTER] ĐỂ BÓC BĂNG NGAY!")
        print("=" * 75)

        meter_thread = threading.Thread(target=vu_meter_worker, daemon=True)
        meter_thread.start()

        t_start = time.perf_counter()
        input()  # Chờ người dùng nhấn Enter
        stop_event.set()
        duration_sec = time.perf_counter() - t_start
        print("\n")

    if not recorded_frames:
        return None, 0.0

    audio_data = np.concatenate(recorded_frames, axis=0).flatten()
    return audio_data, duration_sec


def normalize_audio(audio_data):
    """Khuếch đại âm lượng phần mềm nếu mic thu âm quá nhỏ."""
    peak = float(np.max(np.abs(audio_data)))
    rms = float(np.sqrt(np.mean(audio_data**2)))
    
    # Nếu tín hiệu quá bé nhưng vẫn có âm thanh (> 0.0001)
    if peak > 1e-4:
        # Scale đưa peak lên 0.90 để Whisper nghe chuẩn nhất
        boost_factor = 0.90 / peak
        # Giới hạn hệ số nhân tối đa 100x tránh khuếch đại nhiễu trắng
        boost_factor = min(boost_factor, 100.0)
        normalized_data = audio_data * boost_factor
        return normalized_data, peak, rms, boost_factor
    else:
        return audio_data, peak, rms, 1.0


def analyze_transcript(text, duration_sec):
    """Phân tích văn bản, đếm từ đệm và tính tốc độ WPM."""
    words = text.strip().split()
    word_count = len(words)
    minutes = max(duration_sec / 60.0, 0.05)
    wpm = int(round(word_count / minutes))

    text_lower = text.lower()
    found_fillers = {}
    for fw in FILLER_WORDS:
        cnt = text_lower.count(fw)
        if cnt > 0:
            found_fillers[fw] = cnt

    return {
        "word_count": word_count,
        "wpm": wpm,
        "fillers": found_fillers,
        "total_fillers": sum(found_fillers.values())
    }


def live_push_to_talk(model_size="base", device_index=None):
    print("=" * 75)
    print("   CHƯƠNG TRÌNH TEST NÓI TRỰC TIẾP VỚI MICRO - PBL6 SPEECH ENGINE (v2.0)")
    print("=" * 75)

    model = load_model(model_size=model_size)

    session_count = 1
    while True:
        print(f"\n--- [LƯỢT NÓI #{session_count}] ---")
        print("👉 Nhấn [ENTER] để BẮT ĐẦU NÓI (hoặc gõ 'q' rồi Enter để thoát): ", end="")
        user_choice = input().strip()
        if user_choice.lower() == 'q':
            print("\n[+] Đã kết thúc phiên kiểm thử giọng nói. Chúc Thắng làm đồ án thật tốt!")
            break

        audio_raw, duration_sec = record_until_keypress(device_index=device_index)
        if audio_raw is None or duration_sec < 0.8:
            print("[!] Đoạn nói quá ngắn hoặc chưa thu được tín hiệu âm thanh. Vui lòng thử lại!")
            continue

        # Chuẩn hóa âm lượng chống mic nhỏ
        audio_norm, peak, rms, boost_factor = normalize_audio(audio_raw)
        
        # Lưu file WAV để kiểm tra lại khi cần
        try:
            sf.write(LAST_RECORDING_PATH, audio_norm, 16000)
            saved_msg = f" (Đã lưu tại: {os.path.basename(LAST_RECORDING_PATH)})"
        except Exception:
            saved_msg = ""

        print(f"[*] Thu âm: {duration_sec:.2f}s | Biên độ cực đại: {peak:.4f} | RMS: {rms:.4f} | Tự động cân bằng: {boost_factor:.1f}x{saved_msg}")
        
        if peak < 0.001:
            print("⚠️ CẢNH BÁO: Tín hiệu âm thanh từ Microphone quá nhỏ (< 0.001)!")
            print("   -> Thắng hãy kiểm tra xem mic laptop có đang bị tắt (Mute) hoặc âm lượng trong Windows Sound Settings đang ở mức thấp.")
            print("   -> Bách vẫn sẽ tiếp tục chuyển thành văn bản...")

        print("[*] Đang bóc băng bằng Faster-Whisper...")
        t_infer0 = time.perf_counter()

        # Tắt vad_filter=False để Whisper không nuốt từ khi mic thu âm nhỏ
        segments, info = model.transcribe(
            audio_norm,
            language="vi",
            beam_size=5,
            vad_filter=False,
            temperature=0.0,
            best_of=5
        )

        full_text = []
        for seg in segments:
            full_text.append(seg.text.strip())
        transcribed_text = " ".join(full_text)
        infer_time = time.perf_counter() - t_infer0
        rtf = infer_time / duration_sec if duration_sec > 0 else 0.0

        stats = analyze_transcript(transcribed_text, duration_sec)

        # In kết quả trực quan
        print("\n" + "=" * 75)
        print("               KẾT QUẢ BÓC BĂNG GIỌNG NÓI CỦA THẮNG")
        print("=" * 75)
        print(f"📝 NỘI DUNG NHẬN DIỆN:")
        if transcribed_text:
            print(f'   "{transcribed_text}"')
        else:
            print('   (Không nghe rõ từ ngữ nào - Vui lòng tăng âm lượng Microphone trong Windows hoặc nói to hơn một chút!)')
        print("-" * 75)
        print(f"⏱️ Thời lượng audio   : {duration_sec:.2f}s")
        print(f"⚡ Thời gian suy luận  : {infer_time:.2f}s (RTF: {rtf:.3f} - Nhanh gấp {1.0/max(rtf, 0.001):.1f}x thời gian thực)")
        print(f"📊 Tổng số từ         : {stats['word_count']} từ")
        print(f"🚀 Tốc độ nói         : {stats['wpm']} WPM", end="")
        if 115 <= stats['wpm'] <= 145:
            print(" (Chuẩn nhịp điệu thuyết trình Đồ án!)")
        elif stats['wpm'] > 155:
            print(" (Hơi nhanh - cần nói chậm rãi hơn!)")
        elif stats['wpm'] > 0:
            print(" (Hơi chậm - cần tăng nhịp độ lên một chút!)")
        else:
            print(" (Chưa nhận diện được từ)")

        if stats['fillers']:
            filler_detail = [f"'{k}': {v} lần" for k, v in stats['fillers'].items()]
            print(f"⚠️ Từ đệm phát hiện  : {stats['total_fillers']} lần ({', '.join(filler_detail)})")
        else:
            print("✅ Từ đệm phát hiện  : 0 lần (Xuất sắc, không bị ậm ờ!)")
        print("=" * 75)

        session_count += 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Live Speech-to-Text Test với Micro (v2.0)")
    parser.add_argument("--model", "-m", type=str, default="base", choices=["base", "small"],
                        help="Kích cỡ model Whisper ('base' siêu tốc, 'small' chính xác cao)")
    parser.add_argument("--device", "-d", type=int, default=None,
                        help="Device ID của Microphone (chạy python -c 'import sounddevice; print(sounddevice.query_devices())')")
    args = parser.parse_args()

    live_push_to_talk(model_size=args.model, device_index=args.device)
