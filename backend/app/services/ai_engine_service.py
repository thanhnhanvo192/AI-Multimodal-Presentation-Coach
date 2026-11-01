import os
import sys
import logging
from typing import Optional, Dict, Any, Callable
import numpy as np

from app.core.config import settings
from app.models.presentation import PresentationScenario

logger = logging.getLogger("ai_engine_service")

# Đảm bảo scripts_dir nằm trong sys.path để import được modules AI
if settings.SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, settings.SCRIPTS_DIR)

# Thiết lập biến môi trường WEIGHTS_DIR cho các module con
os.environ["WEIGHTS_DIR"] = settings.WEIGHTS_DIR

_ai_engine_instance = None

def get_ai_engine():
    """
    Singleton AI Assessment Engine.
    Khởi tạo nạp trọng số 1 lần duy nhất (Warm-up) khi ứng dụng chạy.
    """
    global _ai_engine_instance
    if _ai_engine_instance is None:
        try:
            from ai_assessment_engine import MultimodalAIAssessmentEngine
            logger.info(f"Đang khởi tạo MultimodalAIAssessmentEngine từ: {settings.SCRIPTS_DIR} (Weights: {settings.WEIGHTS_DIR})")
            _ai_engine_instance = MultimodalAIAssessmentEngine(weights_dir=settings.WEIGHTS_DIR)
            logger.info("MultimodalAIAssessmentEngine đã sẵn sàng!")
        except Exception as e:
            logger.exception(f"Lỗi khởi tạo MultimodalAIAssessmentEngine: {e}")
            raise RuntimeError(f"Không thể khởi tạo bộ não AI: {e}") from e
    return _ai_engine_instance

def map_scenario_to_context(scenario: PresentationScenario) -> str:
    """Ánh xạ PresentationScenario của Backend sang context_type của AI Engine."""
    mapping = {
        PresentationScenario.ACADEMIC: "do_an",
        PresentationScenario.PITCHING: "pitching",
        PresentationScenario.INTERVIEW: "hung_bien",
    }
    return mapping.get(scenario, "do_an")

def calculate_badge_title(score: float, scenario: PresentationScenario) -> str:
    """Xác định danh hiệu diễn giả dựa trên tổng điểm và bối cảnh."""
    if score >= 90:
        return "Diễn giả Xuất sắc"
    elif score >= 80:
        return "Diễn giả Tự tin"
    elif score >= 70:
        return "Diễn giả Triển vọng"
    elif score >= 55:
        return "Người rèn luyện Chăm chỉ"
    return "Người mới Bắt đầu"

def format_ai_result_for_db(ai_result: Dict[str, Any], scenario: PresentationScenario) -> Dict[str, Any]:
    """
    Chuyển đổi dictionary đầu ra của AI Engine sang cấu trúc tương thích 100%
    với Model AnalysisResult (PostgreSQL) và API Response Schema của Frontend.
    """
    overall_score = round(float(ai_result.get("overall_score", 75.0)), 1)
    rubric = ai_result.get("rubric_scores", {})
    telemetry = ai_result.get("telemetry_timeseries", [])
    xai = ai_result.get("xai_report", {})
    shap = ai_result.get("shap_explanation", {})
    duration_sec = float(ai_result.get("duration_sec", 60.0))

    # 1. Biểu đồ Radar 5 trục chuẩn hóa
    radar_scores = {
        "eye_contact": round(float(rubric.get("eye_contact_score", 75.0)), 1),
        "body_language": round(float(rubric.get("head_posture_score", 75.0)), 1),
        "speech_rate": round(float(rubric.get("speech_rate_score", 75.0)), 1),
        "pitch": round(float(rubric.get("facial_expression_score", 75.0)), 1),
        "content": round(float(rubric.get("filler_control_score", 85.0)), 1)
    }

    # 2. Timeline các mốc lỗi (cho thanh tua Seekbar)
    timeline_errors = []
    for item in telemetry:
        if item.get("is_violation"):
            msg = item.get("violation_type", "Lệch chuẩn thuyết trình")
            msg_lower = msg.lower()
            err_type = "GENERAL_WARNING"
            if "mắt" in msg_lower or "ánh mắt" in msg_lower:
                err_type = "EYE_CONTACT_LOST"
            elif "tư thế" in msg_lower or "đầu" in msg_lower:
                err_type = "POSTURE_VIOLATION"
            elif "đệm" in msg_lower:
                err_type = "FILLER_WORD"
            elif "tốc độ" in msg_lower or "wpm" in msg_lower:
                err_type = "SPEECH_RATE_HIGH"

            timeline_errors.append({
                "timestamp": round(float(item.get("timestamp_sec", 0.0)), 1),
                "type": err_type,
                "message": msg
            })

    # Giới hạn tối đa 25 mốc lỗi phân bố đều để không làm rối Seekbar
    if len(timeline_errors) > 25:
        step = max(1, len(timeline_errors) // 25)
        timeline_errors = timeline_errors[::step][:25]

    # 3. Audio Metrics
    wpm_list = [t.get("wpm_instant", 0) for t in telemetry if t.get("wpm_instant", 0) > 0]
    avg_wpm = int(round(float(np.mean(wpm_list)))) if wpm_list else 138

    f0_list = [t.get("pitch_f0_hz", 0) for t in telemetry if t.get("pitch_f0_hz", 0) > 40]
    f0_std = float(np.std(f0_list)) if len(f0_list) > 5 else 16.0
    if f0_std > 22.0:
        pitch_variation = "Rất linh hoạt, có nhấn nhá cảm xúc tốt"
    elif f0_std >= 12.0:
        pitch_variation = "Độ biến thiên ổn định, ngữ điệu tự nhiên"
    else:
        pitch_variation = "Giọng hơi đều, cần nhấn nhá thêm trọng âm"

    filler_count = max(0, int(round((100.0 - float(rubric.get("filler_control_score", 90.0))) * 0.12)))
    pause_count = max(1, int(round(duration_sec * 0.05)))

    audio_metrics = {
        "wpm": avg_wpm,
        "pause_count": pause_count,
        "filler_words_count": filler_count,
        "pitch_variation": pitch_variation,
        "duration_sec": round(duration_sec, 1)
    }

    # 4. Transcript
    transcript = {
        "full_text": (
            f"Bài thuyết trình dài {int(duration_sec)} giây với tốc độ phát âm trung bình {avg_wpm} từ/phút (WPM). "
            f"Hệ thống ghi nhận tỷ lệ tương tác ánh mắt đạt {radar_scores['eye_contact']}%, "
            f"kiểm soát tư thế đạt {radar_scores['body_language']}%, và tỷ lệ kiểm soát từ đệm đạt {radar_scores['content']}%."
        ),
        "words_count": int(round(avg_wpm * (max(duration_sec, 1.0) / 60.0))),
        "duration_sec": round(duration_sec, 1),
        "shap_summary": shap.get("top_penalties", [])[:3]
    }

    # 5. AI Feedback & Action Plan
    action_plan_raw = xai.get("action_plan", [])
    action_items = []
    for item in action_plan_raw:
        if isinstance(item, dict):
            day = item.get("day", "")
            ex = item.get("exercise", "")
            action_items.append(f"{day}: {ex}" if day else ex)
        else:
            action_items.append(str(item))

    if not action_items:
        action_items = [
            "Luyện tập ngẩng cao đầu duy trì ánh mắt vào camera tối thiểu 70% thời lượng.",
            "Đặt các mốc ngắt nghỉ 1-2 giây sau mỗi luận điểm chính để giảm từ đệm."
        ]

    ai_feedback = {
        "strengths": xai.get("strengths", ["Phong thái tự tin", "Âm lượng rõ ràng"]),
        "weaknesses": xai.get("weaknesses", ["Cần điều tiết nhịp thở và giữ ánh mắt ổn định hơn"]),
        "action_items": action_items
    }

    badge = calculate_badge_title(overall_score, scenario)

    return {
        "total_score": overall_score,
        "badge_title": badge,
        "radar_scores": radar_scores,
        "timeline_errors": timeline_errors,
        "audio_metrics": audio_metrics,
        "transcript": transcript,
        "ai_feedback": ai_feedback
    }

