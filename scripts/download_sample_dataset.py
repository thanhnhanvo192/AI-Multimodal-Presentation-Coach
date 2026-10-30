"""
Script tự động tải và tiền xử lý video mẫu cho bộ dữ liệu DUT-PresCorpus
Hỗ trợ:
- Tải từ YouTube bằng yt-dlp ở độ phân giải tối ưu (720p).
- Cắt (Trim) chính xác đoạn phát biểu của 1 diễn giả duy nhất bằng FFmpeg.
- Tùy chọn cắt trực tiếp từ file MP4 đã tải sẵn (--trim-existing).
- Tự động đồng bộ thông tin vào metadata.csv ở cả 2 repo (PBL6 và PBL6_TaiLieu).

Dự án PBL6 - Hệ thống Đánh giá Kỹ năng Thuyết trình Tự động Đa Phương thức
"""
import os
import sys
import argparse
import csv
import subprocess
import yt_dlp
import imageio_ffmpeg

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Thư mục lưu trữ video chính (bên repo PBL6)
PBL6_DATA_DIR = r"F:\DAIHOC\Nam4-ky1\PBL6\data"
RAW_DIR = os.path.join(PBL6_DATA_DIR, "raw", "DUT-PresCorpus")

# Danh sách các file metadata cần đồng bộ tự động
DOCS_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "DUT-PresCorpus"))
METADATA_FILES = [
    os.path.join(PBL6_DATA_DIR, "metadata.csv"),
    os.path.join(DOCS_DATA_DIR, "metadata.csv")
]


def parse_time_str(time_str):
    """
    Chuyển đổi chuỗi thời gian dạng 'MM:SS', 'HH:MM:SS' hoặc số giây thành float giây.
    Ví dụ: '01:30' -> 90.0, '00:02:15' -> 135.0, '120' -> 120.0
    """
    if not time_str:
        return None
    time_str = str(time_str).strip()
    parts = time_str.split(':')
    try:
        if len(parts) == 1:
            return float(parts[0])
        elif len(parts) == 2:
            return float(parts[0]) * 60 + float(parts[1])
        elif len(parts) == 3:
            return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
    except ValueError:
        pass
    raise ValueError(f"Định dạng thời gian không hợp lệ: '{time_str}'. Dùng định dạng MM:SS hoặc số giây (ví dụ: 01:30 hoặc 90).")


def format_seconds(seconds):
    """Đổi số giây thành chuỗi HH:MM:SS để truyền vào FFmpeg"""
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = seconds % 60
    return f"{hrs:02d}:{mins:02d}:{secs:05.2f}"


def get_next_filename(context, custom_id=None):
    """
    Tự động sinh mã file tiếp theo (ví dụ: da_001.mp4, hb_001.mp4, pt_001.mp4)
    """
    prefix_map = {
        'do_an': 'da',
        'hung_bien': 'hb',
        'pitching': 'pt'
    }
    prefix = prefix_map.get(context, 'vid')
    target_dir = os.path.join(RAW_DIR, context)
    os.makedirs(target_dir, exist_ok=True)

    if custom_id:
        custom_id_clean = custom_id.lower().strip()
        filename = f"{custom_id_clean}.mp4"
        video_id = custom_id.upper().strip()
        return filename, video_id, target_dir

    existing = [f for f in os.listdir(target_dir) if f.startswith(prefix) and f.endswith('.mp4')]
    next_num = len(existing) + 1
    filename = f"{prefix}_{next_num:03d}.mp4"
    video_id = f"{prefix.upper()}_{next_num:03d}"
    return filename, video_id, target_dir


def trim_video_with_ffmpeg(input_path, output_path, start_sec, end_sec):
    """
    Sử dụng FFmpeg cắt chính xác video và re-encode chuẩn H.264 / AAC
    """
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    start_fmt = format_seconds(start_sec)
    duration_sec = end_sec - start_sec

    print(f"[*] Đang cắt video từ {start_fmt} (Độ dài: {duration_sec:.1f}s)...")
    cmd = [
        ffmpeg_exe,
        "-y",
        "-ss", str(start_sec),
        "-to", str(end_sec),
        "-i", input_path,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "20",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        output_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if res.returncode != 0:
        raise RuntimeError(f"Lỗi FFmpeg khi cắt video: {res.stderr.decode('utf-8', errors='ignore')}")
    print(f"[OK] Cắt thành công và lưu vào: {output_path}")


def append_or_update_metadata(video_id, filename, context, topic, gender, duration, source_url):
    """
    Ghi nhận hoặc cập nhật thông tin video vào tất cả các file metadata.csv (đồng bộ 2 chiều)
    """
    header = ['video_id', 'filename', 'context', 'topic', 'speaker_gender', 'duration_sec', 'source_url', 'framing_quality', 'status']
    row_data = [video_id, filename, context, topic, gender, int(duration), source_url, 'Tot_WaistUp', 'Raw']

    for meta_path in METADATA_FILES:
        os.makedirs(os.path.dirname(meta_path), exist_ok=True)
        rows = []
        updated = False

        if os.path.exists(meta_path):
            with open(meta_path, mode='r', newline='', encoding='utf-8') as f:
                reader = csv.reader(f)
                rows = list(reader)

        if not rows:
            rows.append(header)
            rows.append(row_data)
            updated = True
        else:
            # Kiểm tra xem video_id đã tồn tại chưa để ghi đè (update)
            for idx, r in enumerate(rows):
                if len(r) > 0 and r[0].upper() == video_id.upper():
                    rows[idx] = row_data
                    updated = True
                    break
            if not updated:
                rows.append(row_data)

        with open(meta_path, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerows(rows)

        print(f"[OK] Đã đồng bộ metadata ({video_id}) vào: {meta_path}")


def download_and_process_video(url, context, topic="Thuyết trình mẫu", gender="KhongXacDinh",
                               start_str=None, end_str=None, custom_id=None):
    filename, video_id, target_dir = get_next_filename(context, custom_id=custom_id)
    final_out_path = os.path.join(target_dir, filename)

    print(f"\n=======================================================")
    print(f"[*] Bắt đầu xử lý: {video_id} ({context.upper()})")
    print(f"[*] Nguồn: {url}")
    print(f"[*] Chủ đề: {topic} | Giới tính: {gender}")
    print(f"=======================================================")

    start_sec = parse_time_str(start_str)
    end_sec = parse_time_str(end_str)

    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    # Tải video từ YouTube
    temp_download_path = os.path.join(target_dir, f"temp_{filename}") if (start_sec is not None and end_sec is not None) else final_out_path

    ydl_opts = {
        'format': 'bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best',
        'merge_output_format': 'mp4',
        'outtmpl': temp_download_path,
        'ffmpeg_location': ffmpeg_exe,
        'quiet': False,
        'no_warnings': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            video_title = info.get('title', topic)
            orig_duration = info.get('duration', 180)
    except Exception as e:
        # Xử lý đặc thù lỗi WinError 32 file lock khi yt-dlp merge video trên Windows
        temp_merged = temp_download_path + '.temp.mp4'
        if os.path.exists(temp_merged):
            import time
            time.sleep(2)
            try:
                if os.path.exists(temp_download_path):
                    os.remove(temp_download_path)
                os.rename(temp_merged, temp_download_path)
                print(f"[*] Đã tự động giải phóng lock và khôi phục file: {temp_download_path}")
                video_title = topic
                orig_duration = 180
            except Exception:
                print(f"[LỖI] Không thể giải phóng file lock: {e}")
                return None
        else:
            print(f"[LỖI] Không thể tải video ({video_id}): {e}")
            return None

    # Nếu có chỉ định cắt start - end
    if start_sec is not None and end_sec is not None:
        trim_video_with_ffmpeg(temp_download_path, final_out_path, start_sec, end_sec)
        actual_duration = end_sec - start_sec
        if os.path.exists(temp_download_path):
            try:
                os.remove(temp_download_path)
            except Exception:
                pass
    else:
        actual_duration = orig_duration

    file_size_mb = os.path.getsize(final_out_path) / (1024 * 1024)
    print(f"\n[HOÀN TẤT] File: {final_out_path} ({file_size_mb:.2f} MB - {actual_duration:.1f}s)")

    # Cập nhật metadata
    append_or_update_metadata(video_id, filename, context, video_title if topic == "Thuyết trình mẫu" else topic,
                              gender, actual_duration, url)
    return final_out_path


def trim_existing_video(input_path, context, topic, gender="KhongXacDinh",
                        start_str=None, end_str=None, custom_id=None, source_url=""):
    """
    Cắt lại một video đã có sẵn trên máy (không cần tải lại từ YouTube)
    """
    if not os.path.exists(input_path):
        print(f"[LỖI] Không tìm thấy file nguồn: {input_path}")
        return None

    start_sec = parse_time_str(start_str)
    end_sec = parse_time_str(end_str)

    if start_sec is None or end_sec is None:
        print("[LỖI] Cần truyền cả --start và --end để cắt video có sẵn.")
        return None

    filename, video_id, target_dir = get_next_filename(context, custom_id=custom_id)
    final_out_path = os.path.join(target_dir, filename)

    print(f"\n[*] Đang cắt từ file có sẵn: {input_path}")
    print(f"[*] Xuất ra: {final_out_path} (Mã: {video_id})")

    # Nếu input và output trùng nhau, FFmpeg sẽ báo lỗi "cannot edit existing files in-place"
    # Do đó xuất ra file tạm rồi ghi đè an toàn
    temp_out_path = os.path.join(target_dir, f"temp_trim_{filename}")

    # Nếu file gốc chưa có bản sao lưu dự phòng, tạo backup để có thể cắt tiếp các diễn giả khác
    backup_path = os.path.join(target_dir, f"backup_full_{filename}")
    if os.path.abspath(input_path) == os.path.abspath(final_out_path) and not os.path.exists(backup_path):
        import shutil
        shutil.copyfile(input_path, backup_path)
        print(f"[*] Đã sao lưu video gốc đầy đủ vào: {backup_path}")

    trim_video_with_ffmpeg(input_path, temp_out_path, start_sec, end_sec)
    actual_duration = end_sec - start_sec

    import shutil
    shutil.move(temp_out_path, final_out_path)
    print(f"[OK] Đã hoàn tất cắt và lưu vào: {final_out_path}")

    append_or_update_metadata(video_id, filename, context, topic, gender, actual_duration, source_url)
    return final_out_path


def download_playlist(playlist_url, context, max_videos=10, gender="KhongXacDinh"):
    """
    Tải hàng loạt video từ một Playlist YouTube
    """
    print(f"\n=======================================================")
    print(f"[*] Bắt đầu quét Playlist: {playlist_url}")
    print(f"[*] Bối cảnh: {context.upper()} | Số lượng tối đa: {max_videos}")
    print(f"=======================================================")

    ydl_opts_meta = {
        'extract_flat': True,
        'quiet': True,
        'no_warnings': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts_meta) as ydl:
        info = ydl.extract_info(playlist_url, download=False)
        entries = info.get('entries', [])
        playlist_title = info.get('title', 'Untitled Playlist')
        print(f"[*] Tìm thấy {len(entries)} video trong Playlist: '{playlist_title}'")

    success_count = 0
    selected_entries = entries[:max_videos]
    for idx, entry in enumerate(selected_entries):
        vid_id = entry.get('id')
        vid_url = entry.get('url') or f"https://www.youtube.com/watch?v={vid_id}"
        vid_title = entry.get('title', f"Video {idx+1}")
        print(f"\n---> [{idx+1}/{len(selected_entries)}] Đang xử lý: {vid_title}")
        res = download_and_process_video(vid_url, context, topic=vid_title, gender=gender)
        if res:
            success_count += 1

    print(f"\n=======================================================")
    print(f"[HOÀN TẤT PLAYLIST] Đã tải thành công {success_count}/{len(selected_entries)} video!")
    print(f"=======================================================")


def process_links_file(file_path, default_context='hung_bien'):
    """
    Đọc danh sách các link từ file văn bản và tự động tải/cắt hàng loạt
    Hỗ trợ cấu trúc linh hoạt:
    - [context, url, start, end, gender, topic]
    - [url, start, end, gender, topic]
    """
    if not os.path.exists(file_path):
        print(f"[LỖI] Không tìm thấy file: {file_path}")
        return

    print(f"\n=======================================================")
    print(f"[*] Đọc danh sách link từ: {file_path}")
    print(f"=======================================================")

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f if line.strip() and not line.strip().startswith('#')]

    print(f"[*] Tìm thấy {len(lines)} mục cần xử lý.")
    success_count = 0

    for idx, line in enumerate(lines):
        parts = [p.strip() for p in line.split(',')]
        if len(parts) == 0:
            continue

        valid_contexts = ['do_an', 'hung_bien', 'pitching']
        if parts[0].lower() in valid_contexts:
            context = parts[0].lower()
            url = parts[1] if len(parts) > 1 else ""
            start = parts[2] if len(parts) > 2 and parts[2] else None
            end = parts[3] if len(parts) > 3 and parts[3] else None
            gender = parts[4] if len(parts) > 4 and parts[4] else "KhongXacDinh"
            topic = parts[5] if len(parts) > 5 and parts[5] else "Thuyết trình mẫu"
        else:
            context = default_context
            url = parts[0]
            start = parts[1] if len(parts) > 1 and parts[1] else None
            end = parts[2] if len(parts) > 2 and parts[2] else None
            gender = parts[3] if len(parts) > 3 and parts[3] else "KhongXacDinh"
            topic = parts[4] if len(parts) > 4 and parts[4] else "Thuyết trình mẫu"

        if not url.startswith('http'):
            print(f"[CẢNH BÁO] Bỏ qua dòng {idx+1} do URL không hợp lệ: {url}")
            continue

        prefix_map = {
            'do_an': 'da',
            'hung_bien': 'hb',
            'pitching': 'pt'
        }
        prefix = prefix_map.get(context, 'vid')
        fixed_id = f"{prefix.upper()}_{idx+1:03d}"

        # Kiểm tra nếu file đích đã tồn tại và hợp lệ (> 5MB) thì bỏ qua để không tải lại
        target_dir = os.path.join(RAW_DIR, context)
        expected_file = os.path.join(target_dir, f"{prefix}_{idx+1:03d}.mp4")
        if os.path.exists(expected_file) and os.path.getsize(expected_file) > 5 * 1024 * 1024:
            print(f"\n---> [{idx+1}/{len(lines)}] Đã tồn tại sẵn: {expected_file} ({fixed_id}) -> Bỏ qua.")
            success_count += 1
            continue

        print(f"\n---> [{idx+1}/{len(lines)}] Đang xử lý: {topic} (Mã cố định: {fixed_id} - {context.upper()})")
        res = download_and_process_video(
            url=url,
            context=context,
            topic=topic,
            gender=gender,
            start_str=start,
            end_str=end,
            custom_id=fixed_id
        )
        if res:
            success_count += 1

    print(f"\n=======================================================")
    print(f"[HOÀN TẤT FILE LIST] Đã xử lý thành công {success_count}/{len(lines)} video!")
    print(f"=======================================================")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tải và cắt video mẫu cho bộ dữ liệu DUT-PresCorpus (PBL6)")
    parser.add_argument("--url", "-u", type=str, default="", help="Link YouTube video")
    parser.add_argument("--playlist", "-p", type=str, default="", help="Link Playlist YouTube để tải hàng loạt")
    parser.add_argument("--file-list", "-f", type=str, default="", help="Đường dẫn file text/csv chứa danh sách link (ví dụ links.txt)")
    parser.add_argument("--max-videos", "-m", type=int, default=10, help="Số lượng video tối đa khi tải playlist (mặc định 10)")
    parser.add_argument("--trim-existing", type=str, default="", help="Đường dẫn file MP4 có sẵn trên máy cần cắt lại")
    parser.add_argument("--context", "-c", type=str, choices=['do_an', 'hung_bien', 'pitching'], default='hung_bien', help="Bối cảnh thuyết trình")
    parser.add_argument("--topic", "-t", type=str, default="Thuyết trình mẫu", help="Tên chủ đề bài nói")
    parser.add_argument("--gender", "-g", type=str, choices=['Nam', 'Nu', 'KhongXacDinh'], default='KhongXacDinh', help="Giới tính diễn giả (Nam / Nu)")
    parser.add_argument("--start", "-s", type=str, default=None, help="Mốc bắt đầu (ví dụ: '01:30' hoặc '90')")
    parser.add_argument("--end", "-e", type=str, default=None, help="Mốc kết thúc (ví dụ: '04:15' hoặc '255')")
    parser.add_argument("--id", type=str, default=None, help="Mã định danh tùy chọn (ví dụ: HB_002, DA_005)")
    parser.add_argument("--source-url", type=str, default="", help="Link nguồn (dùng kèm với --trim-existing)")

    args = parser.parse_args()

    if args.file_list:
        process_links_file(
            file_path=args.file_list,
            default_context=args.context
        )
    elif args.playlist:
        download_playlist(
            playlist_url=args.playlist,
            context=args.context,
            max_videos=args.max_videos,
            gender=args.gender
        )
    elif args.trim_existing:
        trim_existing_video(
            input_path=args.trim_existing,
            context=args.context,
            topic=args.topic,
            gender=args.gender,
            start_str=args.start,
            end_str=args.end,
            custom_id=args.id,
            source_url=args.source_url or args.url
        )
    elif args.url:
        download_and_process_video(
            url=args.url,
            context=args.context,
            topic=args.topic,
            gender=args.gender,
            start_str=args.start,
            end_str=args.end,
            custom_id=args.id
        )
    else:
        parser.print_help()
