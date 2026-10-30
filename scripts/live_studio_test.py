# -*- coding: utf-8 -*-
"""
=============================================================================
 CHƯƠNG TRÌNH THU TRỰC TIẾP TỪ WEBCAM & MIC ĐỂ CHẤM ĐIỂM NGAY LẬP TỨC
 Đề tài: Nền tảng Đánh giá Kỹ năng Thuyết trình Tự động (PBL6 - ĐHBK Đà Nẵng)
 AI & Data Lead: Nguyễn Đỗ Thắng
 
 Hướng dẫn:
 - Bật webcam và micro ghi âm bài nói thực tế của Thắng
 - Nhấn phím 'q' trên cửa sổ camera để kết thúc và xem kết quả chấm điểm tức thì!
=============================================================================
"""

import os
import sys
import time
import argparse
import threading
import queue
import cv2
import numpy as np
import sounddevice as sd
import soundfile as sf
import imageio_ffmpeg
import subprocess

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)

if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from ai_assessment_engine import MultimodalAIAssessmentEngine

TEMP_DIR = os.path.join(PROJECT_ROOT, "data", "processed", "temp_live_recording")
os.makedirs(TEMP_DIR, exist_ok=True)


def record_live_and_assess(duration_max=60, context="do_an"):
    print("=" * 75)
    print("      CHƯƠNG TRÌNH THỬ NGHIỆM THUYẾT TRÌNH TRỰC TIẾP (LIVE STUDIO)")
    print(f"      Bối cảnh kiểm thử: {context.upper()}")
    print("=" * 75)
    print("[*] Đang khởi động Webcam và Micro...")
    print("    >> HÃY NHÌN VÀO CAMERA VÀ THUYẾT TRÌNH BÌNH THƯỜNG")
    print("    >> KHI NÓI XONG, BẤM PHÍM 'q' TRÊN CỬA SỔ CAMERA ĐỂ CHẤM ĐIỂM NGAY!")
    print("=" * 75 + "\n")

    video_raw_path = os.path.join(TEMP_DIR, "live_video.avi")
    audio_wav_path = os.path.join(TEMP_DIR, "live_audio.wav")
    final_mp4_path = os.path.join(TEMP_DIR, "live_presentation.mp4")

    # 1. Khởi động Micro (16kHz Mono)
    sample_rate = 16000
    audio_frames = []
    stop_event = threading.Event()

    def audio_callback(indata, frames, time_info, status):
        if not stop_event.is_set():
            audio_frames.append(indata.copy())

    audio_stream = sd.InputStream(
        samplerate=sample_rate,
        channels=1,
        dtype='float32',
        callback=audio_callback
    )

    # 2. Khởi động Webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[!] Không thể mở Webcam của máy tính. Vui lòng kiểm tra quyền camera!")
        return

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 640)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 480)
    fps = 20.0

    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    video_writer = cv2.VideoWriter(video_raw_path, fourcc, fps, (width, height))

    audio_stream.start()
    t_start = time.time()
    frame_count = 0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            video_writer.write(frame)
            frame_count += 1
            elapsed = time.time() - t_start

            # Hiển thị HUD trên màn hình
            cv2.putText(frame, f"REC: {elapsed:.1f}s | Context: {context.upper()}", (20, 35),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            cv2.putText(frame, "Nhan phim 'q' de dung va xem diem", (20, 70),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 0), 2)

            cv2.imshow("PBL6 DUT - LIVE PRESENTATION STUDIO (BAM 'q' DE CHUAN BI CHAM DIEM)", frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("\n[*] Đã nhận lệnh dừng từ người dùng!")
                break

            if elapsed >= duration_max:
                print(f"\n[*] Đã đạt giới hạn tối đa {duration_max}s!")
                break
    finally:
        stop_event.set()
        cap.release()
        video_writer.release()
        cv2.destroyAllWindows()
        audio_stream.stop()
        audio_stream.close()

    actual_duration = time.time() - t_start
    if actual_duration < 3.0:
        print("[!] Thời gian nói quá ngắn (< 3 giây). Vui lòng thử lại và nói dài hơn!")
        return

    # Lưu file audio WAV
    if audio_frames:
        recorded_audio = np.concatenate(audio_frames, axis=0)
        sf.write(audio_wav_path, recorded_audio, sample_rate)
    else:
        print("[!] Không thu được tín hiệu âm thanh từ micro.")
        return

    # 3. Ghép Video và Audio thành file MP4 hoàn chỉnh bằng FFmpeg
    print(f"\n[*] Đang đóng gói video bài nói ({actual_duration:.1f}s)...")
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg_exe, "-y",
        "-i", video_raw_path,
        "-i", audio_wav_path,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-c:a", "aac",
        final_mp4_path
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # 4. Kích hoạt Bộ não AI chấm điểm ngay tức thì
    print("\n" + "=" * 75)
    print("      BỘ NÃO AI BẮT ĐẦU CHẤM ĐIỂM BÀI NÓI CỦA THẮNG")
    print("=" * 75)

    engine = MultimodalAIAssessmentEngine()
    result = engine.run_assessment(video_path=final_mp4_path, context_type=context)

    # Xóa file tạm
    for p in [video_raw_path, audio_wav_path]:
        if os.path.exists(p):
            try:
                os.remove(p)
            except Exception:
                pass

    print("\n[THÀNH CÔNG] Thắng vừa hoàn thành bài test nói trực tiếp!")
    print(f">> File video bài nói của Thắng đã được lưu tại: {final_mp4_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Live Studio test nói trực tiếp cho PBL6")
    parser.add_argument("--context", "-c", type=str, default="do_an", choices=["do_an", "hung_bien", "pitching"],
                        help="Bối cảnh thuyết trình ('do_an' | 'hung_bien' | 'pitching')")
    parser.add_argument("--max-time", "-m", type=int, default=120, help="Thời gian tối đa (giây)")
    args = parser.parse_args()

    record_live_and_assess(duration_max=args.max_time, context=args.context)

