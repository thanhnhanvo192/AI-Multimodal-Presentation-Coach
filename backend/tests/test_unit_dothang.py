import pytest
import math
from app.core.security import verify_password, get_password_hash
from app.services.ai_scoring_engine import (
    calculate_overall_score,
    clamp_score,
    determine_badge_tier,
    map_scenario_to_context,
    format_multimodal_telemetry
)

# =========================================================================
# PHẦN 1: 10 CA KIỂM THỬ BẢO MẬT BCRYPT (app/core/security.py)
# Khớp 1-1 với Slide 6, Báo cáo Word & Excel: UT-SEC-01 đến UT-SEC-10
# =========================================================================

def test_ut_sec_01_hash_generation():
    """UT-SEC-01: Kiểm tra hàm get_password_hash tạo ra chuỗi hash chuẩn Bcrypt ($2b$, độ dài >= 59)"""
    raw_pwd = "StrongP@ssw0rd!"
    hashed = get_password_hash(raw_pwd)
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
    assert len(hashed) >= 59
    assert verify_password(raw_pwd, hashed) is True

def test_ut_sec_02_random_salt():
    """UT-SEC-02: Kiểm tra tính ngẫu nhiên của Salt khi băm cùng một mật khẩu"""
    pwd = "MySecretPassword2026"
    hash1 = get_password_hash(pwd)
    hash2 = get_password_hash(pwd)
    assert hash1 != hash2
    assert verify_password(pwd, hash1) is True
    assert verify_password(pwd, hash2) is True

def test_ut_sec_03_verify_correct_password():
    """UT-SEC-03: Xác thực mật khẩu chính xác bằng verify_password"""
    hashed = get_password_hash("ValidPassword99")
    assert verify_password("ValidPassword99", hashed) is True

def test_ut_sec_04_reject_wrong_password():
    """UT-SEC-04: Xác thực mật khẩu sai với hash hợp lệ (kết quả từ chối)"""
    hashed = get_password_hash("ValidPassword99")
    assert verify_password("WrongPassword99", hashed) is False

def test_ut_sec_05_empty_password_with_valid_hash():
    """UT-SEC-05: Xác thực mật khẩu là chuỗi rỗng với hash hợp lệ"""
    hashed = get_password_hash("ValidPassword99")
    assert verify_password("", hashed) is False

def test_ut_sec_06_hash_and_verify_empty_string():
    """UT-SEC-06: Tạo hash từ chuỗi rỗng và xác minh lại"""
    empty_hash = get_password_hash("")
    assert verify_password("", empty_hash) is True
    assert verify_password("not_empty", empty_hash) is False

def test_ut_sec_07_bcrypt_boundary_72_bytes():
    """UT-SEC-07: Xử lý mật khẩu độ dài tối đa của Bcrypt (72 ký tự)"""
    long_pwd = "A" * 72
    hashed = get_password_hash(long_pwd)
    assert verify_password(long_pwd, hashed) is True
    assert verify_password("A" * 71 + "B", hashed) is False

def test_ut_sec_08_unicode_vietnamese_and_emoji():
    """UT-SEC-08: Xử lý mật khẩu chứa ký tự có dấu tiếng Việt và Icon Emoji"""
    pwd = "MậtKhẩuTiếngViệtKhóaBảoMật2026!🔒🚀"
    hashed = get_password_hash(pwd)
    assert verify_password(pwd, hashed) is True

def test_ut_sec_09_case_sensitivity():
    """UT-SEC-09: Kiểm tra tính phân biệt chữ hoa - chữ thường (Case Sensitivity)"""
    hashed = get_password_hash("SecretCaseSensitive")
    assert verify_password("SecretCaseSensitive", hashed) is True
    assert verify_password("secretcasesensitive", hashed) is False
    assert verify_password("SECRETCASEsENSITIVE", hashed) is False

def test_ut_sec_10_malformed_hash_exception_handling():
    """UT-SEC-10: Xử lý ngoại lệ an toàn khi hash truyền vào bị biến dạng hoặc sai định dạng"""
    assert verify_password("MyPassword", "invalid_malformed_hash_string") is False
    assert verify_password("MyPassword", "$2b$12$short") is False
    assert verify_password("MyPassword", None) is False


# =========================================================================
# PHẦN 2: 12 CA KIỂM THỬ CHẤM ĐIỂM AI & DỮ LIỆU TELEMETRY (app/services/ai_scoring_engine.py)
# Khớp 1-1 với Slide 7, Báo cáo Word & Excel: UT-AIS-01 đến UT-AIS-12
# =========================================================================

def test_ut_ais_01_calculate_overall_score_rubric():
    """UT-AIS-01: Tính toán điểm tổng thể (Overall Score) theo trọng số chuẩn"""
    metrics = {
        "eye_contact": 80.0,    # 80 * 0.25 = 20.0
        "head_posture": 85.0,   # 85 * 0.20 = 17.0
        "speech_rate": 85.0,    # 85 * 0.20 = 17.0
        "filler_control": 85.0, # 85 * 0.20 = 17.0
        "voice_energy": 80.0    # 80 * 0.15 = 12.0
    }
    assert calculate_overall_score(metrics) == 83.0

def test_ut_ais_02_clamping_upper_bound():
    """UT-AIS-02: Kẹp biên trên (Clamping Upper Bound) khi điểm thành phần vượt quá 100"""
    metrics = {"eye_contact": 150.0, "head_posture": 120.0, "speech_rate": 110.0, "filler_control": 105.0, "voice_energy": 130.0}
    assert calculate_overall_score(metrics) == 100.0
    assert clamp_score(150.0) == 100.0

def test_ut_ais_03_clamping_lower_bound():
    """UT-AIS-03: Kẹp biên dưới (Clamping Lower Bound) khi điểm thành phần là số âm"""
    metrics = {"eye_contact": -20.0, "head_posture": -10.0, "speech_rate": -5.0, "filler_control": -50.0, "voice_energy": -15.0}
    assert calculate_overall_score(metrics) == 0.0
    assert clamp_score(-25.5) == 0.0

def test_ut_ais_04_badge_tier_master_speaker():
    """UT-AIS-04: Phân bổ danh hiệu cấp độ Master Speaker (Xuất sắc >= 85.0)"""
    assert determine_badge_tier(92.0) == "Master Speaker"
    assert determine_badge_tier(100.0) == "Master Speaker"

def test_ut_ais_05_badge_tier_proficient_speaker():
    """UT-AIS-05: Phân bổ danh hiệu cấp độ Proficient Speaker (Giỏi 70.0 - 84.9)"""
    assert determine_badge_tier(75.0) == "Proficient Speaker"
    assert determine_badge_tier(80.5) == "Proficient Speaker"

def test_ut_ais_06_badge_tier_developing_speaker():
    """UT-AIS-06: Phân bổ danh hiệu cấp độ Developing Speaker (Khá 50.0 - 69.9)"""
    assert determine_badge_tier(55.0) == "Developing Speaker"
    assert determine_badge_tier(68.0) == "Developing Speaker"

def test_ut_ais_07_badge_tier_novice_speaker():
    """UT-AIS-07: Phân bổ danh hiệu cấp độ Novice Speaker (Cần rèn luyện < 50.0)"""
    assert determine_badge_tier(35.0) == "Novice Speaker"
    assert determine_badge_tier(15.0) == "Novice Speaker"

def test_ut_ais_08_badge_boundary_thresholds():
    """UT-AIS-08: Kiểm tra tính chính xác tại các điểm ranh giới nhạy cảm (50.0, 70.0, 85.0)"""
    # Biên 50.0: Novice <-> Developing
    assert determine_badge_tier(49.99) == "Novice Speaker"
    assert determine_badge_tier(50.00) == "Developing Speaker"
    # Biên 70.0: Developing <-> Proficient
    assert determine_badge_tier(69.99) == "Developing Speaker"
    assert determine_badge_tier(70.00) == "Proficient Speaker"
    # Biên 85.0: Proficient <-> Master
    assert determine_badge_tier(84.99) == "Proficient Speaker"
    assert determine_badge_tier(85.00) == "Master Speaker"

def test_ut_ais_09_format_multimodal_telemetry():
    """UT-AIS-09: Định dạng chuỗi dữ liệu Telemetry đa phương thức hợp lệ & ánh xạ ngữ cảnh"""
    assert map_scenario_to_context("interview") == "Phỏng vấn việc làm"
    assert map_scenario_to_context("academic") == "Thuyết trình học thuật / Bảo vệ khóa luận"
    
    raw_data = [
        {"timestamp_ms": 1000, "event_type": "LOOK_AWAY", "eye_contact_ratio": 45.678, "description": "Lệch mắt sang trái"},
        {"timestamp_ms": 2500, "event_type": "FILLER_WORD", "eye_contact_ratio": 80.123, "description": "Phát hiện từ đệm 'ờ'"}
    ]
    res = format_multimodal_telemetry(raw_data)
    assert res["status"] == "SUCCESS"
    assert res["total_events"] == 2
    assert res["timeline_events"][0]["eye_contact_ratio"] == 45.68
    assert res["timeline_events"][1]["eye_contact_ratio"] == 80.12

def test_ut_ais_10_empty_telemetry_fallback():
    """UT-AIS-10: Xử lý an toàn khi danh sách Telemetry đầu vào bị rỗng & giới hạn capping 25"""
    # Test fallback rỗng
    res_empty = format_multimodal_telemetry([])
    assert res_empty["status"] == "EMPTY_FALLBACK"
    assert res_empty["total_events"] == 0
    assert res_empty["timeline_events"] == []
    
    # Test giới hạn capping 25 lỗi
    raw_overflow = [{"timestamp_ms": i * 500, "event_type": "WARN", "eye_contact_ratio": 50.0} for i in range(50)]
    res_overflow = format_multimodal_telemetry(raw_overflow)
    assert res_overflow["total_events"] == 25
    assert len(res_overflow["timeline_events"]) == 25

def test_ut_ais_11_filter_nan_infinity_values():
    """UT-AIS-11: Lọc và khử giá trị dị biệt NaN, Infinity trong cảm biến"""
    assert clamp_score(float("nan")) == 0.0
    assert clamp_score(float("inf")) == 0.0
    assert clamp_score(float("-inf")) == 0.0

def test_ut_ais_12_missing_fields_payload_fallback():
    """UT-AIS-12: Xử lý khi payload điểm số thành phần bị thiếu trường dữ liệu"""
    partial_metrics = {"eye_contact": 80.0}
    assert calculate_overall_score(partial_metrics) == 20.0
