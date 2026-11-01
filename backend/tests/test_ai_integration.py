import os
import json
import pytest
from app.models.presentation import PresentationScenario
from app.services.ai_engine_service import (
    map_scenario_to_context,
    calculate_badge_title,
    format_ai_result_for_db
)
from app.schemas.presentation import AnalysisReportResponse, RadarScores, AudioMetrics, AIFeedback

def test_map_scenario_to_context():
    assert map_scenario_to_context(PresentationScenario.ACADEMIC) == "do_an"
    assert map_scenario_to_context(PresentationScenario.PITCHING) == "pitching"
    assert map_scenario_to_context(PresentationScenario.INTERVIEW) == "hung_bien"

def test_calculate_badge_title():
    assert calculate_badge_title(92.0, PresentationScenario.ACADEMIC) == "Diễn giả Xuất sắc"
    assert calculate_badge_title(84.0, PresentationScenario.PITCHING) == "Diễn giả Tự tin"
    assert calculate_badge_title(72.0, PresentationScenario.ACADEMIC) == "Diễn giả Triển vọng"
    assert calculate_badge_title(50.0, PresentationScenario.INTERVIEW) == "Người mới Bắt đầu"

def test_format_ai_result_from_real_sample():
    # Đọc file kết quả thực tế của video DA_001
    sample_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "data", "processed", "sample_assessment_outputs", "DA_001_full_assessment.json"
    )
    assert os.path.exists(sample_path), f"Không tìm thấy file mẫu: {sample_path}"

    with open(sample_path, "r", encoding="utf-8") as f:
        raw_ai_data = json.load(f)

    formatted = format_ai_result_for_db(raw_ai_data, PresentationScenario.ACADEMIC)

    # 1. Kiểm tra Total Score & Badge
    assert formatted["total_score"] == pytest.approx(73.9, 0.2)
    assert isinstance(formatted["badge_title"], str)
    assert len(formatted["badge_title"]) > 0

    # 2. Kiểm tra Radar Scores (5 trục bắt buộc của Frontend)
    radar = formatted["radar_scores"]
    for key in ["eye_contact", "body_language", "speech_rate", "pitch", "content"]:
        assert key in radar
        assert isinstance(radar[key], (int, float))
        assert 0 <= radar[key] <= 100

    # 3. Kiểm tra Timeline Errors (cho thanh tua Seekbar)
    errors = formatted["timeline_errors"]
    assert isinstance(errors, list)
    assert len(errors) > 0
    first_err = errors[0]
    assert "timestamp" in first_err
    assert "type" in first_err
    assert "message" in first_err
    assert isinstance(first_err["timestamp"], (int, float))

    # 4. Kiểm tra Audio Metrics
    audio = formatted["audio_metrics"]
    assert "wpm" in audio
    assert "pause_count" in audio
    assert "filler_words_count" in audio
    assert "pitch_variation" in audio
    assert "duration_sec" in audio
    assert audio["duration_sec"] > 0

    # 5. Kiểm tra AI Feedback
    feedback = formatted["ai_feedback"]
    assert "strengths" in feedback
    assert "weaknesses" in feedback
    assert "action_items" in feedback
    assert len(feedback["strengths"]) > 0
    assert len(feedback["action_items"]) > 0

    # 6. Kiểm tra tính tương thích với Pydantic Schemas của FastAPI
    validated_radar = RadarScores(**radar)
    validated_audio = AudioMetrics(**audio)
    validated_feedback = AIFeedback(**feedback)

    assert validated_radar.eye_contact == radar["eye_contact"]
    assert validated_audio.wpm == audio["wpm"]
    assert len(validated_feedback.action_items) == len(feedback["action_items"])

