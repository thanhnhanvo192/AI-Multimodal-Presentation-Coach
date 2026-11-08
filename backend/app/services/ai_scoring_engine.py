import math
from typing import Dict, Any, List

def calculate_overall_score(metrics: Dict[str, float]) -> float:
    """
    Tính điểm tổng thể theo trọng số Rubric SRS v1.1:
    Overall Score = (Eye Contact * 0.25) + (Head Posture * 0.20) + (Speech Rate/WPM * 0.20) + (Filler Words * 0.20) + (Voice Energy * 0.15)
    """
    w_eye = 0.25
    w_head = 0.20
    w_wpm = 0.20
    w_filler = 0.20
    w_energy = 0.15

    eye = min(100.0, max(0.0, metrics.get("eye_contact", 0.0)))
    head = min(100.0, max(0.0, metrics.get("head_posture", 0.0)))
    wpm = min(100.0, max(0.0, metrics.get("speech_rate", 0.0)))
    filler = min(100.0, max(0.0, metrics.get("filler_control", 0.0)))
    energy = min(100.0, max(0.0, metrics.get("voice_energy", 0.0)))

    total = (eye * w_eye) + (head * w_head) + (wpm * w_filler) + (filler * w_filler) + (energy * w_energy)
    return round(min(100.0, max(0.0, total)), 2)

def clamp_score(score: float) -> float:
    """Kẹp biên giá trị điểm trong đoạn [0.0, 100.0]"""
    if math.isnan(score) or math.isinf(score):
        return 0.0
    return min(100.0, max(0.0, float(score)))

def determine_badge_tier(score: float) -> str:
    """
    Phân bổ danh hiệu diễn giả theo 4 cấp độ:
    - Master Speaker: >= 85.0
    - Proficient Speaker: 70.0 - 84.99
    - Developing Speaker: 50.0 - 69.99
    - Novice Speaker: < 50.0
    """
    s = clamp_score(score)
    if s >= 85.0:
        return "Master Speaker"
    elif s >= 70.0:
        return "Proficient Speaker"
    elif s >= 50.0:
        return "Developing Speaker"
    else:
        return "Novice Speaker"

def map_scenario_to_context(scenario: str) -> str:
    """Ánh xạ tình huống thuyết trình sang ngữ cảnh đánh giá"""
    mapping = {
        "interview": "Phỏng vấn việc làm",
        "pitching": "Thuyết phục khách hàng",
        "academic": "Thuyết trình học thuật / Bảo vệ khóa luận",
        "casual": "Giao tiếp thuyết trình tự do"
    }
    return mapping.get(scenario.lower(), "Thuyết trình tiêu chuẩn")

def format_multimodal_telemetry(raw_metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Chuẩn hóa dữ liệu Telemetry đa phương thức và khống chế tối đa 25 sự kiện timeline"""
    if not raw_metrics:
        return {
            "status": "EMPTY_FALLBACK",
            "timeline_events": [],
            "total_events": 0,
            "average_eye_contact": 0.0
        }
    
    clean_events = []
    total_eye = 0.0
    valid_count = 0

    for item in raw_metrics[:25]:  # Kẹp trần tối đa 25 sự kiện
        eye_val = item.get("eye_contact_ratio", 0.0)
        if math.isnan(eye_val) or math.isinf(eye_val):
            eye_val = 0.0
        clean_events.append({
            "timestamp_ms": item.get("timestamp_ms", 0),
            "event_type": item.get("event_type", "INFO"),
            "eye_contact_ratio": round(eye_val, 2),
            "description": item.get("description", "")
        })
        total_eye += eye_val
        valid_count += 1

    avg_eye = round(total_eye / max(1, valid_count), 2)
    return {
        "status": "SUCCESS",
        "timeline_events": clean_events,
        "total_events": len(clean_events),
        "average_eye_contact": avg_eye
    }

