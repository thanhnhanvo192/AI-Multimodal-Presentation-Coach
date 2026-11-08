"""
Unit Testing - Function 2: AI Scoring, Badge Allocation & Telemetry Formatting
Module: app.services.ai_engine_service
Tested Functions: calculate_badge_title, map_scenario_to_context, format_ai_result_for_db
Scope:
  - Badge allocation threshold boundaries (90, 80, 70, 55, <55)
  - Scenario to AI context mapping
  - Radar score mapping (5 axes)
  - Telemetry error classification (Eye contact, Posture, Filler word, Speech rate)
  - Error capping at 25 items for UI Seekbar safety
  - Audio metrics calculation (WPM, Pitch variation, Pause count, Filler count)
  - Empty / missing raw telemetry edge cases
"""

import pytest
from app.models.presentation import PresentationScenario
from app.services.ai_engine_service import (
    calculate_badge_title,
    map_scenario_to_context,
    format_ai_result_for_db,
)


class TestAIScoringAndFormatting:
    """Bộ kiểm thử đơn vị cho thuật toán tính điểm và chuẩn hóa dữ liệu AI."""

    @pytest.mark.parametrize(
        "score, expected_badge",
        [
            (100.0, "Diễn giả Xuất sắc"),
            (90.0, "Diễn giả Xuất sắc"),
            (89.9, "Diễn giả Tự tin"),
            (80.0, "Diễn giả Tự tin"),
            (79.9, "Diễn giả Triển vọng"),
            (70.0, "Diễn giả Triển vọng"),
            (69.9, "Người rèn luyện Chăm chỉ"),
            (55.0, "Người rèn luyện Chăm chỉ"),
            (54.9, "Người mới Bắt đầu"),
            (0.0, "Người mới Bắt đầu"),
        ],
    )
    def test_calculate_badge_title_thresholds(self, score: float, expected_badge: str):
        """Kiểm thử chính xác các ngưỡng tính danh hiệu diễn giả."""
        badge = calculate_badge_title(score, PresentationScenario.ACADEMIC)
        assert badge == expected_badge

    def test_map_scenario_to_context(self):
        """Kiểm thử ánh xạ đúng enum kịch bản thuyết trình sang context type của AI Engine."""
        assert map_scenario_to_context(PresentationScenario.ACADEMIC) == "do_an"
        assert map_scenario_to_context(PresentationScenario.PITCHING) == "pitching"
        assert map_scenario_to_context(PresentationScenario.INTERVIEW) == "hung_bien"

    def test_format_ai_result_structure(self):
        """Kiểm thử chuyển đổi dữ liệu AI đầy đủ sang cấu trúc DB và API response."""
        sample_raw_ai = {
            "overall_score": 86.4,
            "rubric_scores": {
                "eye_contact_score": 82.5,
                "head_posture_score": 79.0,
                "speech_rate_score": 88.0,
                "facial_expression_score": 84.0,
                "filler_control_score": 92.0,
            },
            "telemetry_timeseries": [
                {"timestamp_sec": 5.2, "is_violation": True, "violation_type": "Mất ánh mắt với người nghe", "wpm_instant": 140, "pitch_f0_hz": 120.0},
                {"timestamp_sec": 12.0, "is_violation": True, "violation_type": "Cúi đầu nhìn slide quá lâu", "wpm_instant": 145, "pitch_f0_hz": 125.0},
                {"timestamp_sec": 20.4, "is_violation": True, "violation_type": "Dùng từ đệm ờ à", "wpm_instant": 150, "pitch_f0_hz": 118.0},
                {"timestamp_sec": 35.1, "is_violation": True, "violation_type": "Tốc độ nói wpm tăng cao", "wpm_instant": 180, "pitch_f0_hz": 130.0},
                {"timestamp_sec": 42.0, "is_violation": False, "wpm_instant": 135, "pitch_f0_hz": 122.0},
            ],
            "xai_report": {
                "strengths": ["Giao tiếp mắt tự tin"],
                "weaknesses": ["Có lúc cúi đầu nhìn giấy"],
                "action_plan": [{"day": "Ngày 1", "exercise": "Luyện nhìn thẳng webcam 2 phút"}],
            },
            "shap_explanation": {
                "top_penalties": ["Điểm trừ từ đệm", "Điểm trừ tư thế đầu"]
            },
            "duration_sec": 45.0,
        }

        result = format_ai_result_for_db(sample_raw_ai, PresentationScenario.ACADEMIC)

        # 1. Total score & Badge
        assert result["total_score"] == 86.4
        assert result["badge_title"] == "Diễn giả Tự tin"

        # 2. Radar 5 axes
        radar = result["radar_scores"]
        assert radar["eye_contact"] == 82.5
        assert radar["body_language"] == 79.0
        assert radar["speech_rate"] == 88.0
        assert radar["pitch"] == 84.0
        assert radar["content"] == 92.0

        # 3. Timeline errors categorized correctly
        errors = result["timeline_errors"]
        assert len(errors) == 4
        assert errors[0]["type"] == "EYE_CONTACT_LOST"
        assert errors[1]["type"] == "POSTURE_VIOLATION"
        assert errors[2]["type"] == "FILLER_WORD"
        assert errors[3]["type"] == "SPEECH_RATE_HIGH"

        # 4. Audio metrics
        audio = result["audio_metrics"]
        assert audio["wpm"] == 150  # Mean of [140, 145, 150, 180, 135] = 150.0
        assert audio["duration_sec"] == 45.0
        assert "pitch_variation" in audio

        # 5. Transcript and AI Feedback
        assert "transcript" in result
        assert len(result["ai_feedback"]["strengths"]) > 0
        assert len(result["ai_feedback"]["action_items"]) > 0

    def test_timeline_errors_capping_at_25(self):
        """Kiểm thử giới hạn tối đa 25 mốc lỗi trên timeline để không gây quá tải giao diện Seekbar."""
        raw_ai_many_errors = {
            "overall_score": 60.0,
            "rubric_scores": {},
            "telemetry_timeseries": [
                {"timestamp_sec": float(i), "is_violation": True, "violation_type": "Mất ánh mắt", "wpm_instant": 120}
                for i in range(100)  # 100 lỗi liên tục
            ],
            "xai_report": {},
            "duration_sec": 120.0,
        }

        result = format_ai_result_for_db(raw_ai_many_errors, PresentationScenario.PITCHING)
        assert len(result["timeline_errors"]) <= 25

    def test_format_empty_ai_result_fallback(self):
        """Kiểm thử trường hợp kết quả AI rỗng hoặc thiếu trường vẫn trả về dữ liệu an toàn mặc định."""
        empty_raw_ai = {}
        result = format_ai_result_for_db(empty_raw_ai, PresentationScenario.INTERVIEW)

        assert isinstance(result["total_score"], float)
        assert result["total_score"] == 75.0
        assert result["badge_title"] == "Diễn giả Triển vọng"
        assert len(result["radar_scores"]) == 5
        assert result["timeline_errors"] == []
        assert result["audio_metrics"]["wpm"] == 138
        assert "ai_feedback" in result

