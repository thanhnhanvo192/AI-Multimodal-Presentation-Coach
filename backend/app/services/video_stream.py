import os
from fastapi import Request, Response, status

def get_video_media_type(file_path: str) -> str:
    """Xác định MIME type chuẩn cho video dựa trên phần mở rộng file."""
    ext = os.path.splitext(file_path)[1].lower()
    media_types = {
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".avi": "video/x-msvideo",
        ".mov": "video/quicktime",
        ".mkv": "video/x-matroska",
        ".ogg": "video/ogg",
    }
    return media_types.get(ext, "video/mp4")

def stream_video_partial(
    request: Request,
    file_path: str,
    content_type: str = None
) -> Response:
    """
    Hỗ trợ phát video chuẩn HTTP 206 Partial Content (Range Request) và CORS.
    Cho phép trình duyệt tua seekbar mượt mà, đồng bộ âm thanh và hình ảnh.
    """
    if not os.path.exists(file_path):
        return Response(content="File not found", status_code=status.HTTP_404_NOT_FOUND)

    if not content_type:
        content_type = get_video_media_type(file_path)

    file_size = os.path.getsize(file_path)
    range_header = request.headers.get("range")

    # Nếu trình duyệt không yêu cầu Range, trả về toàn bộ với Accept-Ranges
    if not range_header:
        with open(file_path, "rb") as f:
            content = f.read()
        return Response(
            content=content,
            status_code=status.HTTP_200_OK,
            headers={
                "Content-Type": content_type,
                "Content-Length": str(file_size),
                "Accept-Ranges": "bytes",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
                "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
                "Cache-Control": "public, max-age=3600",
            }
        )

    # Phân tích cú pháp Range: bytes=start-end
    try:
        range_str = range_header.replace("bytes=", "").strip()
        parts = range_str.split("-")
        start = int(parts[0]) if parts[0] else 0
        end = int(parts[1]) if len(parts) > 1 and parts[1] else file_size - 1
    except Exception:
        start = 0
        end = file_size - 1

    start = max(0, start)
    end = min(file_size - 1, end)
    
    # Giới hạn kích thước mỗi chunk khoảng 4MB để tối ưu streaming
    max_chunk = 1024 * 1024 * 4
    if end - start + 1 > max_chunk:
        end = start + max_chunk - 1

    content_length = end - start + 1

    with open(file_path, "rb") as f:
        f.seek(start)
        data = f.read(content_length)

    headers = {
        "Content-Range": f"bytes {start}-{end}/{file_size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(content_length),
        "Content-Type": content_type,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
        "Cache-Control": "public, max-age=3600",
    }

    return Response(
        content=data,
        status_code=status.HTTP_206_PARTIAL_CONTENT,
        headers=headers
    )

