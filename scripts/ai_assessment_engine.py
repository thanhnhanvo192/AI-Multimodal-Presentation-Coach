# -*- coding: utf-8 -*-
"""
=============================================================================
 BỘ NÃO SUY LUẬN AI TOÀN DIỆN (MULTIMODAL AI ASSESSMENT CORE ENGINE)
 Đề tài: Nền tảng Đánh giá Kỹ năng Thuyết trình Tự động Đa Phương thức & Đa Bối cảnh
 Học phần: PBL6 - Khoa CNTT, Trường Đại học Bách Khoa - ĐHĐN
 AI & Data Lead: Nguyễn Đỗ Thắng
 Backend Integration: Võ Thành Nhân | Frontend Integration: Đặng Quang Sơn

 Pipeline End-to-End (4 Tầng AI):
 1. Input: video_path (.mp4) + context_type ('do_an' | 'hung_bien' | 'pitching')
 2. Vision Sub-Engine: MediaPipe FaceLandmarker + solvePnP + 1-Euro Filter -> 55D Vision
 3. Audio & Speech Sub-Engine: Faster-Whisper/LoRA + Acoustic Prosody (F0, WPM, Pauses, Fillers) -> 65D Audio
 4. Tabular Scoring & XAI: Hợp nhất Vector 123D -> 6 mô hình CatBoost (.cbm) -> 5 điểm Rubric + Overall
    -> SHAP TreeExplainer bóc tách Top 5 lỗi kéo tụt điểm (Feature Attribution)
 5. AI Coach Orchestration: Google Gemini Flash (3 Persona) tạo Báo cáo Feedback + Action Plan
 6. Output: Cấu trúc JSON chuẩn 100% khớp với Database Schema & Giao diện Dashboard Next.js
=============================================================================
"""

import os
import sys
import json
import time
import argparse
import urllib.request
import urllib.error
import numpy as np
import pandas as pd
from catboost import CatBoostRegressor
import shap

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)

if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from extract_multimodal_features import (
    VisionFeatureExtractor55D,
    AudioFeatureExtractor65D,
    extract_audio_16k,
    build_telemetry_timeseries,
    ensure_directories_and_weights
)

WEIGHTS_DIR = os.path.join(PROJECT_ROOT, "weights")
CATBOOST_DIR = os.path.join(WEIGHTS_DIR, "catboost_scoring")
META_CONFIG_PATH = os.path.join(CATBOOST_DIR, "model_metadata_123d.json")

TARGET_COLS = [
    'eye_contact_score',
    'head_posture_score',
    'facial_expression_score',
    'speech_rate_score',
    'filler_control_score',
    'overall_score'
]

FEATURE_DESCRIPTIONS_VI = {
    'vis_02_eye_contact_ratio': 'Tỷ lệ duy trì giao tiếp ánh mắt với camera',
    'vis_29_gaze_deviation_ratio': 'Tỷ lệ thời gian nhìn lệch khỏi vùng trung tâm',
    'vis_15_head_deviation_mean': 'Độ lệch góc tư thế đầu trung bình (Yaw/Pitch/Roll)',
    'vis_17_posture_violation_ratio': 'Tỷ lệ thời gian nghiêng/cúi đầu vượt ngưỡng 15°',
    'vis_10_smile_active_ratio': 'Tần suất biểu cảm nụ cười tích cực (Action Unit AU12)',
    'vis_55_facial_energy_index': 'Chỉ số năng lượng biểu cảm cơ mặt tổng hợp',
    'vis_21_blink_rate_per_min': 'Tần số chớp mắt mỗi phút (Blink Rate)',
    'aud_01_wpm_speech_rate': 'Tốc độ nói trung bình (Words Per Minute - WPM)',
    'aud_03_pause_duration_ratio': 'Tỷ lệ thời gian ngắt nghỉ / khoảng lặng',
    'aud_04_dead_air_ratio': 'Tỷ lệ khoảng lặng chết (> 2.5 giây)',
    'aud_05_filler_words_per_min': 'Tần suất phát âm từ đệm (ờ, à, ừm) mỗi phút',
    'aud_08_f0_std_hz': 'Độ biến thiên ngữ điệu giọng nói (Pitch F0 SD)',
    'aud_09_jitter_local_pct': 'Độ rung bất ổn chu kỳ thanh quản (Jitter)',
    'aud_10_shimmer_local_pct': 'Độ biến thiên biên độ âm lượng (Shimmer)',
    'aud_11_hnr_mean_db': 'Tỷ lệ hài âm trên nhiễu (Harmonics-to-Noise Ratio)',
}

PERSONA_SYSTEM_PROMPTS = {
    'do_an': (
        "Bạn là Chủ tịch Hội đồng Phản biện Đồ án Tốt nghiệp ngành CNTT tại Trường Đại học Bách Khoa - ĐHĐN. "
        "Phong cách của bạn: Nghiêm túc, chuẩn mực học thuật, phân tích sắc bén nhưng khích lệ, tập trung vào phong thái đĩnh đạc, "
        "tốc độ trình bày mạch lạc, kiểm soát từ đệm kỹ thuật và khả năng tương tác với hội đồng."
    ),
    'hung_bien': (
        "Bạn là Giám khảo Trưởng Cuộc thi Hùng biện & Diễn thuyết trước Công chúng Quốc gia (Toastmasters / Trường Teen). "
        "Phong cách của bạn: Truyền cảm hứng, giàu năng lượng, chú trọng cao độ vào biểu cảm cơ mặt, ánh mắt thu hút khán phòng, "
        "ngữ điệu trầm bổng (Vocal Variety) và sự tự tin sân khấu."
    ),
    'pitching': (
        "Bạn là Nhà đầu tư mạo hiểm (Venture Capitalist / Shark Tank) dày dặn kinh nghiệm đầu tư vào các Startup Công nghệ. "
        "Phong cách của bạn: Thực tế, sắc bén, đánh giá cao sự tự tin, nụ cười thuyết phục, tốc độ nói dứt khoát quyết đoán, "
        "không ậm ờ ngập ngừng để bảo vệ dự án trước hội đồng đầu tư."
    )
}


class MultimodalAIAssessmentEngine:
    def __init__(self):
        ensure_directories_and_weights()
        print("[AI Core Engine] Đang khởi tạo các bộ trích xuất đặc trưng...")
        self.vis_extractor = VisionFeatureExtractor55D()
        self.aud_extractor = AudioFeatureExtractor65D()

        print("[AI Core Engine] Đang nạp bộ mô hình CatBoost 123D...")
        if not os.path.exists(META_CONFIG_PATH):
            raise FileNotFoundError(f"Chưa tìm thấy file cấu hình: {META_CONFIG_PATH}. Hãy chạy Bước 2 trước!")

        with open(META_CONFIG_PATH, 'r', encoding='utf-8') as f:
            self.metadata = json.load(f)

        self.feature_cols = self.metadata['feature_columns_123d']
        self.cat_models = {}
        for target in TARGET_COLS:
            m_path = os.path.join(CATBOOST_DIR, f"catboost_{target}.cbm")
            model = CatBoostRegressor()
            model.load_model(m_path)
            self.cat_models[target] = model

        # Khởi tạo SHAP TreeExplainer trên mô hình overall_score
        self.shap_explainer = shap.TreeExplainer(self.cat_models['overall_score'])
        print("[AI Core Engine] Hệ thống đã sẵn sàng đánh giá thuyết trình!\n")

    def run_assessment(self, video_path, context_type='do_an', sample_fps=1.5, gemini_api_key=None):
        """
        Thực hiện đánh giá toàn diện 1 video thuyết trình.
        Trả về dictionary chuẩn 100% với Database Schema (PostgreSQL JSONB).
        """
        start_total = time.perf_counter()
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Không tìm thấy file video: {video_path}")

        context_clean = context_type.lower().strip()
        if context_clean not in ['do_an', 'hung_bien', 'pitching']:
            context_clean = 'do_an'

        video_filename = os.path.basename(video_path)
        video_id = os.path.splitext(video_filename)[0].upper()

        print("=" * 80)
        print(f"[*] BẮT ĐẦU ĐÁNH GIÁ: {video_filename} | BỐI CẢNH: {context_clean.upper()}")
        print("=" * 80)

        # 1. Tách âm thanh 16kHz
        t_wav0 = time.perf_counter()
        temp_dir = os.path.join(PROJECT_ROOT, "data", "processed", "temp_eval")
        os.makedirs(temp_dir, exist_ok=True)
        wav_path = os.path.join(temp_dir, f"{video_id}_eval_16k.wav")
        ok_wav = extract_audio_16k(video_path, wav_path)
        if not ok_wav:
            raise RuntimeError(f"Không thể tách luồng âm thanh từ: {video_path}")
        time_wav = time.perf_counter() - t_wav0
        print(f"[1/4] Tách âm thanh 16kHz Mono: Hoàn tất ({time_wav:.2f}s)")

        # 2. Chạy Vision Sub-Engine (55D)
        t_vis0 = time.perf_counter()
        vis_55d, df_vis_frames = self.vis_extractor.process_video(video_path, sample_fps=sample_fps)
        time_vis = time.perf_counter() - t_vis0
        print(f"[2/4] Trích xuất 55D Vision (MediaPipe + solvePnP + 1-Euro Filter): Hoàn tất ({time_vis:.2f}s)")

        # 3. Chạy Audio Sub-Engine (65D)
        t_aud0 = time.perf_counter()
        aud_65d, sec_f0, sec_wpm, duration_sec = self.aud_extractor.process_audio(wav_path)
        time_aud = time.perf_counter() - t_aud0
        print(f"[3/4] Trích xuất 65D Audio (Acoustic Prosody + WPM + F0 + Fillers): Hoàn tất ({time_aud:.2f}s)")

        # 4. Hợp nhất Vector 123D
        ctx_3d = {
            'ctx_01_do_an': 1.0 if context_clean == 'do_an' else 0.0,
            'ctx_02_hung_bien': 1.0 if context_clean == 'hung_bien' else 0.0,
            'ctx_03_pitching': 1.0 if context_clean == 'pitching' else 0.0,
        }
        vector_123d = {}
        vector_123d.update(ctx_3d)
        vector_123d.update(vis_55d)
        vector_123d.update(aud_65d)

        # Chuyển thành DataFrame 1 hàng đúng thứ tự 123 cột
        df_row = pd.DataFrame([[vector_123d[c] for c in self.feature_cols]], columns=self.feature_cols)

        # 5. Chấm điểm qua 6 mô hình CatBoost (.cbm)
        t_cb0 = time.perf_counter()
        rubric_scores = {}
        for target in TARGET_COLS:
            pred_score = float(self.cat_models[target].predict(df_row)[0])
            rubric_scores[target] = round(float(np.clip(pred_score, 45.0, 98.5)), 2)

        overall_score = rubric_scores['overall_score']

        # 6. Giải thích SHAP XAI
        shap_values = self.shap_explainer.shap_values(df_row)[0]
        base_value = float(np.array(self.shap_explainer.expected_value).flatten()[0])

        sorted_idx = np.argsort(shap_values)
        top_penalties = []
        for idx in sorted_idx[:5]:
            imp = float(shap_values[idx])
            if imp < -0.05:
                fname = self.feature_cols[idx]
                top_penalties.append({
                    "feature": fname,
                    "description": FEATURE_DESCRIPTIONS_VI.get(fname, fname),
                    "impact": round(imp, 2),
                    "measured_value": round(float(df_row[fname].iloc[0]), 3)
                })

        top_strengths = []
        for idx in sorted_idx[::-1][:5]:
            imp = float(shap_values[idx])
            if imp > 0.05:
                fname = self.feature_cols[idx]
                top_strengths.append({
                    "feature": fname,
                    "description": FEATURE_DESCRIPTIONS_VI.get(fname, fname),
                    "impact": round(imp, 2),
                    "measured_value": round(float(df_row[fname].iloc[0]), 3)
                })

        time_cb = time.perf_counter() - t_cb0
        print(f"[4/4] Dự đoán CatBoost 123D & Giải thích SHAP XAI: Hoàn tất ({time_cb:.3f}s)")

        # 7. Xây dựng Telemetry Time-series (cho Seekbar)
        telemetry_timeseries = build_telemetry_timeseries(df_vis_frames, sec_f0, sec_wpm)

        # 8. Gọi LLM Coach (Google Gemini 1.5 Flash hoặc Smart Heuristic fallback)
        xai_report = self._orchestrate_ai_coach(
            context_type=context_clean,
            overall_score=overall_score,
            rubric_scores=rubric_scores,
            top_penalties=top_penalties,
            top_strengths=top_strengths,
            telemetry_timeseries=telemetry_timeseries,
            api_key=gemini_api_key
        )

        total_latency = time.perf_counter() - start_total

        # Đóng gói JSON cuối cùng
        assessment_result = {
            "presentation_id": video_id,
            "filename": video_filename,
            "context_type": context_clean,
            "duration_sec": round(duration_sec, 2),
            "status": "COMPLETED",
            "overall_score": overall_score,
            "rubric_scores": {
                "eye_contact_score": rubric_scores['eye_contact_score'],
                "head_posture_score": rubric_scores['head_posture_score'],
                "facial_expression_score": rubric_scores['facial_expression_score'],
                "speech_rate_score": rubric_scores['speech_rate_score'],
                "filler_control_score": rubric_scores['filler_control_score']
            },
            "shap_explanation": {
                "base_score_phi0": round(base_value, 2),
                "top_penalties": top_penalties,
                "top_strengths": top_strengths
            },
            "telemetry_timeseries": telemetry_timeseries,
            "xai_report": xai_report,
            "performance_metrics": {
                "total_latency_sec": round(total_latency, 2),
                "real_time_factor": round(total_latency / max(duration_sec, 1.0), 3),
                "features_analyzed": len(self.feature_cols)
            }
        }

        print("\n" + "=" * 80)
        print("                   KẾT QUẢ ĐÁNH GIÁ THUYẾT TRÌNH TỔNG HỢP")
        print("=" * 80)
        print(f"📊 ĐIỂM TỔNG KẾT: {overall_score:.2f} / 100")
        print(f"  • Ánh mắt (Gaze & Eye Contact)    : {rubric_scores['eye_contact_score']:.2f}")
        print(f"  • Phong thái & Tư thế (Head Pose) : {rubric_scores['head_posture_score']:.2f}")
        print(f"  • Biểu cảm & Nụ cười (AU12 Smile) : {rubric_scores['facial_expression_score']:.2f}")
        print(f"  • Tốc độ nói (Speech Rate WPM)    : {rubric_scores['speech_rate_score']:.2f}")
        print(f"  • Kiểm soát Từ đệm (Filler Words) : {rubric_scores['filler_control_score']:.2f}")
        print(f"⏱️ Tổng thời gian phân tích: {total_latency:.2f}s (RTF: {total_latency/duration_sec:.3f})")
        print("=" * 80)

        return assessment_result

    def _orchestrate_ai_coach(self, context_type, overall_score, rubric_scores,
                              top_penalties, top_strengths, telemetry_timeseries, api_key=None):
        """Điều phối AI Coach sinh Action Plan bằng Gemini Flash API hoặc Smart Coach Rules."""
        api_key = api_key or os.getenv("GEMINI_API_KEY")
        persona_desc = PERSONA_SYSTEM_PROMPTS.get(context_type, PERSONA_SYSTEM_PROMPTS['do_an'])

        # Lọc các mốc giây vi phạm thực tế để gia sư ảo chỉ điểm chính xác
        violation_timestamps = [
            f"{int(t['timestamp_sec'])}s ({t.get('violation_type', 'Lệch chuẩn')})"
            for t in telemetry_timeseries if t.get('is_violation')
        ][:5]
        violation_str = ", ".join(violation_timestamps) if violation_timestamps else "Không có vi phạm nghiêm trọng"

        if api_key:
            try:
                prompt_content = f"""
Vai trò của bạn: {persona_desc}
Đánh giá bài thuyết trình bối cảnh: {context_type.upper()}
Điểm tổng thể: {overall_score}/100.
Bảng điểm 5 tiêu chí Rubric:
- Ánh mắt: {rubric_scores['eye_contact_score']}
- Tư thế đầu: {rubric_scores['head_posture_score']}
- Biểu cảm: {rubric_scores['facial_expression_score']}
- Tốc độ nói: {rubric_scores['speech_rate_score']}
- Từ đệm: {rubric_scores['filler_control_score']}

Các nhân tố SHAP kéo tụt điểm lớn nhất:
{json.dumps(top_penalties, ensure_ascii=False, indent=2)}

Các mốc giây vi phạm tiêu biểu phát hiện trên video:
{violation_str}

Hãy đóng vai Persona trên và trả về đúng 1 đối tượng JSON (không bọc trong markdown codeblock) có cấu trúc:
{{
  "ai_coach_persona": "Tên Persona",
  "summary_feedback": "Lời nhận xét tổng quan 2-3 câu",
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "weaknesses": ["Điểm yếu 1 kèm mốc giây cụ thể", "Điểm yếu 2"],
  "action_plan": [
    {{"day": "Ngày 1-2", "exercise": "Bài tập luyện tập cụ thể"}},
    {{"day": "Ngày 3-4", "exercise": "Bài tập nâng cao"}},
    {{"day": "Ngày 5-7", "exercise": "Mục tiêu bài nói tiếp theo"}}
  ]
}}
"""
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                req_data = {
                    "contents": [{"parts": [{"text": prompt_content}]}],
                    "generationConfig": {"temperature": 0.4, "maxOutputTokens": 1000}
                }
                req = urllib.request.Request(
                    url,
                    data=json.dumps(req_data).encode('utf-8'),
                    headers={'Content-Type': 'application/json'}
                )
                with urllib.request.urlopen(req, timeout=12) as response:
                    res_body = json.loads(response.read().decode('utf-8'))
                    raw_text = res_body['candidates'][0]['content']['parts'][0]['text'].strip()
                    if raw_text.startswith("```json"):
                        raw_text = raw_text[7:]
                    if raw_text.startswith("```"):
                        raw_text = raw_text[3:]
                    if raw_text.endswith("```"):
                        raw_text = raw_text[:-3]
                    return json.loads(raw_text.strip())
            except Exception as e:
                print(f"[!] Chuyển sang Smart AI Coach nội bộ do Gemini API chưa phản hồi: {e}")

        # Smart Coach Fallback (Sinh phản hồi chuẩn mực khoa học theo đúng Rubric và SHAP)
        persona_titles = {
            'do_an': "Hội đồng Phản biện Đồ án Tốt nghiệp CNTT (Bách Khoa Đà Nẵng)",
            'hung_bien': "Huấn luyện viên Trưởng Diễn thuyết & Hùng biện Quốc tế",
            'pitching': "Hội đồng Thẩm định Đầu tư Mạo hiểm (Shark Tank VC)"
        }

        strengths_vi = [
            f"Duy trì điểm số tốt ở tiêu chí: {s['description']} (Tác động tích cực +{s['impact']} điểm)"
            for s in top_strengths[:2]
        ]
        if not strengths_vi:
            strengths_vi = ["Âm lượng giọng nói rõ ràng, âm thanh thu âm ổn định", "Tư thế bắt đầu bài nói tự tin"]

        weaknesses_vi = []
        for p in top_penalties[:3]:
            weaknesses_vi.append(f"{p['description']} (Kéo tụt điểm: {p['impact']} điểm)")
        if violation_timestamps:
            weaknesses_vi.append(f"Cần lưu ý các mốc thời gian vi phạm: {violation_str}")

        action_plan = []
        if rubric_scores['filler_control_score'] < 80:
            action_plan.append({
                "day": "Ngày 1-2",
                "exercise": "Kỹ thuật 'Khoảng lặng thay thế' (Pause instead of Filler): Luyện ngắt nghỉ 1 giây trước khi chuyển ý thay vì phát âm 'ờ, ừm'."
            })
        if rubric_scores['eye_contact_score'] < 75:
            action_plan.append({
                "day": "Ngày 3-4",
                "exercise": "Kỹ thuật Tam giác Ánh mắt: Nhìn thẳng camera tối thiểu 70% thời lượng, tập trung vào điểm ống kính máy quay."
            })
        if rubric_scores['speech_rate_score'] < 80:
            action_plan.append({
                "day": "Ngày 5-6",
                "exercise": "Điều tiết nhịp thở và nhịp điệu (Pacing): Sử dụng máy đập nhịp Metronome luyện nói ở ngưỡng chuẩn 125-135 WPM."
            })
        action_plan.append({
            "day": "Ngày 7",
            "exercise": "Ghi hình lại bài nói thử nghiệm 3 phút và nộp lại hệ thống để so sánh độ cải thiện trên biểu đồ Radar."
        })

        return {
            "ai_coach_persona": persona_titles.get(context_type, "Gia sư AI Đa phương thức"),
            "summary_feedback": (
                f"Bài thuyết trình bối cảnh {context_type.upper()} đạt tổng điểm {overall_score:.1f}/100. "
                f"Bạn thể hiện phong thái khá vững, tuy nhiên cần khắc phục các lỗi bị trừ điểm theo phân tích SHAP dưới đây."
            ),
            "strengths": strengths_vi,
            "weaknesses": weaknesses_vi,
            "action_plan": action_plan
        }


def main():
    parser = argparse.ArgumentParser(description="Chạy thử nghiệm Bộ não Đánh giá Thuyết trình AI Toàn diện (PBL6)")
    parser.add_argument("--video", "-v", type=str, default="", help="Đường dẫn file video .mp4")
    parser.add_argument("--context", "-c", type=str, choices=['do_an', 'hung_bien', 'pitching'], default='do_an', help="Bối cảnh thuyết trình")
    parser.add_argument("--output", "-o", type=str, default="", help="Đường dẫn file JSON xuất kết quả")
    args = parser.parse_args()

    engine = MultimodalAIAssessmentEngine()

    video_target = args.video
    if not video_target:
        # Mặc định lấy video đầu tiên trong thư mục do_an để chạy demo
        default_candidate = os.path.join(PROJECT_ROOT, "data", "raw", "DUT-PresCorpus", "do_an", "da_001.mp4")
        if os.path.exists(default_candidate):
            video_target = default_candidate
        else:
            print("[!] Chưa chỉ định video. Dùng cú pháp: python scripts/ai_assessment_engine.py --video <duong_dan_mp4>")
            return

    res = engine.run_assessment(video_path=video_target, context_type=args.context)

    out_file = args.output
    if not out_file:
        out_dir = os.path.join(PROJECT_ROOT, "data", "processed", "sample_assessment_outputs")
        os.makedirs(out_dir, exist_ok=True)
        out_file = os.path.join(out_dir, f"{res['presentation_id']}_full_assessment.json")

    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(res, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] Đã xuất toàn bộ kết quả báo cáo JSON ra: {out_file}\n")


if __name__ == "__main__":
    main()

