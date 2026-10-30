# -*- coding: utf-8 -*-
"""
=============================================================================
 BƯỚC 2: HUẤN LUYỆN MÔ HÌNH CHẤM ĐIỂM ĐA PHƯƠNG THỨC CATBOOST 123D & SHAP XAI
 Đề tài: Nền tảng Đánh giá Kỹ năng Thuyết trình Tự động Đa Phương thức & Đa Bối cảnh
 Học phần: PBL6 - Khoa CNTT, Trường Đại học Bách Khoa - ĐHĐN
 AI & Data Lead: Nguyễn Đỗ Thắng

 Chức năng (Bước 2):
 1. Nạp bảng đặc trưng 123D thực tế từ data/features/dut_prescorpus_real_123d.csv
 2. Tăng cường dữ liệu đa phương thức có định hướng vật lý (Physics-Guided Multimodal
    Mixup & Gaussian Perturbation) từ các mẫu thực tế + cân bằng 3 bối cảnh
    (do_an, hung_bien, pitching) -> lưu tại data/features/dut_prescorpus_train_123d.csv
 3. Huấn luyện bộ mô hình CatBoost Regressor cho 5 tiêu chí Rubric + Điểm tổng thể
 4. Lưu trọn bộ trọng số (.cbm) vào weights/catboost_scoring/
 5. Chạy SHAP TreeExplainer cho từng video thực tế trong DUT-PresCorpus để sinh
    báo cáo giải thích XAI (data/processed/xai_reports/{video_id}_xai.json)
=============================================================================
"""

import os
import sys
import json
import time
import shutil
import numpy as np
import pandas as pd
from sklearn.model_selection import KFold
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from catboost import CatBoostRegressor
import shap

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
TAILIEU_ROOT = os.path.join(os.path.dirname(PROJECT_ROOT), "PBL6_TaiLieu")

split_path = os.path.join(PROJECT_ROOT, "scripts")
if split_path not in sys.path:
    sys.path.insert(0, split_path)

from extract_multimodal_features import compute_scientific_rubric_scores

FEATURES_DIR = os.path.join(PROJECT_ROOT, "data", "features")
XAI_REPORTS_DIR = os.path.join(PROJECT_ROOT, "data", "processed", "xai_reports")
CATBOOST_WEIGHTS_DIR = os.path.join(PROJECT_ROOT, "weights", "catboost_scoring")

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


def build_augmented_multimodal_corpus(df_real, target_total_samples=600, seed=42):
    """
    Khởi tạo tập huấn luyện 123D bám sát phân phối thực tế của các video đã trích xuất,
    đồng thời tự động bù đắp mẫu cho bối cảnh đang ít video (như 'do_an') để CatBoost
    học chuẩn xác cả 3 bối cảnh. Khi Thắng bỏ thêm video thật vào 'do_an/', hàm này sẽ
    tự động lấy trực tiếp các mẫu thật của 'do_an' làm hạt giống (Anchor Seeds)!
    """
    rng = np.random.default_rng(seed)

    meta_cols = ['video_id', 'presentation_context']
    ctx_cols = ['ctx_01_do_an', 'ctx_02_hung_bien', 'ctx_03_pitching']
    vis_cols = [c for c in df_real.columns if c.startswith('vis_')]
    aud_cols = [c for c in df_real.columns if c.startswith('aud_')]
    feature_123d_cols = ctx_cols + vis_cols + aud_cols
    assert len(feature_123d_cols) == 123, f"Expected 123 features, got {len(feature_123d_cols)}"

    # Tính độ lệch chuẩn thực tế của từng đặc trưng để nhiễu hóa hợp lý
    vis_stds = df_real[vis_cols].std().replace(0, 0.05).to_dict()
    aud_stds = df_real[aud_cols].std().replace(0, 0.05).to_dict()

    augmented_rows = []
    # Giữ nguyên 100% các video thực tế ở đầu bảng (is_real = 1)
    for _, row in df_real.iterrows():
        r_dict = row.to_dict()
        r_dict['is_real_video'] = 1
        augmented_rows.append(r_dict)

    contexts = ['do_an', 'hung_bien', 'pitching']
    samples_per_ctx = max(1, (target_total_samples - len(df_real)) // 3)

    for ctx in contexts:
        df_ctx = df_real[df_real['presentation_context'] == ctx]
        # Nếu bối cảnh chưa có video thật (ví dụ đang chờ Thắng thêm video do_an),
        # dùng toàn bộ df_real làm nền tảng và điều chỉnh kỳ vọng đặc trưng theo bối cảnh
        use_global_pool = len(df_ctx) == 0
        pool_df = df_real if use_global_pool else df_ctx

        for i in range(samples_per_ctx):
            base_row = pool_df.iloc[int(rng.integers(0, len(pool_df)))]
            second_row = pool_df.iloc[int(rng.integers(0, len(pool_df)))]
            alpha = float(rng.uniform(0.65, 0.95))

            vis_dict = {}
            for col in vis_cols:
                val = alpha * float(base_row[col]) + (1.0 - alpha) * float(second_row[col])
                noise = float(rng.normal(0.0, vis_stds[col] * 0.25))
                vis_dict[col] = val + noise

            aud_dict = {}
            for col in aud_cols:
                val = alpha * float(base_row[col]) + (1.0 - alpha) * float(second_row[col])
                noise = float(rng.normal(0.0, aud_stds[col] * 0.25))
                aud_dict[col] = val + noise

            # Điều chỉnh nhẹ các biến cốt lõi để bao phủ toàn dải điểm (từ bài nói yếu 50đ đến xuất sắc 95đ)
            vis_dict['vis_02_eye_contact_ratio'] = float(np.clip(vis_dict['vis_02_eye_contact_ratio'] + rng.normal(0, 0.14), 0.15, 0.98))
            vis_dict['vis_29_gaze_deviation_ratio'] = float(np.clip(1.0 - vis_dict['vis_02_eye_contact_ratio'] + rng.normal(0, 0.05), 0.02, 0.85))
            vis_dict['vis_17_posture_violation_ratio'] = float(np.clip(vis_dict['vis_17_posture_violation_ratio'] + rng.normal(0, 0.12), 0.0, 0.75))
            vis_dict['vis_10_smile_active_ratio'] = float(np.clip(vis_dict['vis_10_smile_active_ratio'] + rng.normal(0, 0.12), 0.02, 0.85))

            if ctx == 'do_an' and use_global_pool:
                aud_dict['aud_01_wpm_speech_rate'] = float(np.clip(rng.normal(122.0, 22.0), 75.0, 185.0))
                vis_dict['vis_10_smile_active_ratio'] = float(np.clip(rng.normal(0.22, 0.10), 0.02, 0.65))
            else:
                aud_dict['aud_01_wpm_speech_rate'] = float(np.clip(aud_dict['aud_01_wpm_speech_rate'] + rng.normal(0, 18.0), 75.0, 195.0))

            aud_dict['aud_05_filler_words_per_min'] = float(np.clip(aud_dict['aud_05_filler_words_per_min'] + rng.normal(0, 2.2), 0.2, 11.5))
            aud_dict['aud_04_dead_air_ratio'] = float(np.clip(aud_dict['aud_04_dead_air_ratio'] + rng.normal(0, 0.04), 0.0, 0.35))
            aud_dict['aud_08_f0_std_hz'] = float(np.clip(aud_dict['aud_08_f0_std_hz'] + rng.normal(0, 6.0), 8.0, 65.0))

            ctx_3d = {
                'ctx_01_do_an': 1.0 if ctx == 'do_an' else 0.0,
                'ctx_02_hung_bien': 1.0 if ctx == 'hung_bien' else 0.0,
                'ctx_03_pitching': 1.0 if ctx == 'pitching' else 0.0,
            }

            scores = compute_scientific_rubric_scores(vis_dict, aud_dict, ctx)

            aug_row = {
                'video_id': f"AUG_{ctx.upper()}_{i+1:03d}",
                'presentation_context': ctx,
                **ctx_3d,
                **vis_dict,
                **aud_dict,
                **scores,
                'is_real_video': 0
            }
            augmented_rows.append(aug_row)

    df_train_all = pd.DataFrame(augmented_rows)
    return df_train_all, feature_123d_cols


def train_and_save_catboost_models():
    print("=" * 80)
    print("   BƯỚC 2: HUẤN LUYỆN TRỌNG SỐ CATBOOST 123D & GIẢI THÍCH XAI (SHAP)")
    print("=" * 80)

    os.makedirs(CATBOOST_WEIGHTS_DIR, exist_ok=True)
    os.makedirs(XAI_REPORTS_DIR, exist_ok=True)

    real_csv = os.path.join(FEATURES_DIR, "dut_prescorpus_real_123d.csv")
    if not os.path.exists(real_csv):
        raise FileNotFoundError(f"Chưa tìm thấy file {real_csv}. Hãy chạy Bước 1 trước!")

    df_real = pd.read_csv(real_csv)
    print(f"[*] Đã nạp {len(df_real)} mẫu video thực tế từ: {real_csv}")

    df_train_all, feature_123d_cols = build_augmented_multimodal_corpus(df_real, target_total_samples=600)
    train_csv_path = os.path.join(FEATURES_DIR, "dut_prescorpus_train_123d.csv")
    df_train_all.to_csv(train_csv_path, index=False, encoding='utf-8-sig')
    print(f"[*] Đã lưu bộ dữ liệu huấn luyện 123D ({len(df_train_all)} mẫu) tại: {train_csv_path}")

    X = df_train_all[feature_123d_cols]
    kf = KFold(n_splits=5, shuffle=True, random_state=42)

    metrics_report = {}
    trained_models = {}

    for target in TARGET_COLS:
        y = df_train_all[target]
        fold_rmses, fold_maes, fold_r2s = [], [], []
        t0 = time.perf_counter()

        for train_idx, val_idx in kf.split(X):
            X_tr, y_tr = X.iloc[train_idx], y.iloc[train_idx]
            X_va, y_va = X.iloc[val_idx], y.iloc[val_idx]

            cb = CatBoostRegressor(
                iterations=350,
                learning_rate=0.06,
                depth=6,
                loss_function='RMSE',
                random_seed=42,
                verbose=0
            )
            cb.fit(X_tr, y_tr, eval_set=(X_va, y_va), early_stopping_rounds=35, verbose=0)
            preds = cb.predict(X_va)

            fold_rmses.append(float(np.sqrt(mean_squared_error(y_va, preds))))
            fold_maes.append(float(mean_absolute_error(y_va, preds)))
            fold_r2s.append(float(r2_score(y_va, preds)))

        # Huấn luyện mô hình cuối cùng trên toàn bộ tập dữ liệu để lưu trọng số .cbm
        final_model = CatBoostRegressor(
            iterations=400,
            learning_rate=0.06,
            depth=6,
            loss_function='RMSE',
            random_seed=42,
            verbose=0
        )
        final_model.fit(X, y, verbose=0)
        model_path = os.path.join(CATBOOST_WEIGHTS_DIR, f"catboost_{target}.cbm")
        final_model.save_model(model_path)
        trained_models[target] = final_model

        elapsed = time.perf_counter() - t0
        m_info = {
            "model_file": f"catboost_{target}.cbm",
            "cv5_rmse": round(float(np.mean(fold_rmses)), 3),
            "cv5_mae": round(float(np.mean(fold_maes)), 3),
            "cv5_r2": round(float(np.mean(fold_r2s)), 4),
            "train_time_sec": round(elapsed, 2)
        }
        metrics_report[target] = m_info
        print(
            f"  [+] Đã train & lưu {m_info['model_file']:<34} | "
            f"R² = {m_info['cv5_r2']:.4f} | MAE = ±{m_info['cv5_mae']:.2f}đ | RMSE = {m_info['cv5_rmse']:.2f}"
        )

    # Lưu metadata cấu hình 123 cột và báo cáo kết quả huấn luyện
    meta_json_path = os.path.join(CATBOOST_WEIGHTS_DIR, "model_metadata_123d.json")
    with open(meta_json_path, 'w', encoding='utf-8') as f:
        json.dump({
            "architecture": "CatBoost Multi-Criteria Regressor (123D Multimodal Vector)",
            "num_features": len(feature_123d_cols),
            "feature_columns_123d": feature_123d_cols,
            "target_columns": TARGET_COLS,
            "real_videos_count": len(df_real),
            "total_training_samples": len(df_train_all),
            "metrics_5fold_cv": metrics_report
        }, f, ensure_ascii=False, indent=2)

    # Đồng bộ thư mục trọng số sang PBL6_TaiLieu nếu tồn tại
    if os.path.exists(TAILIEU_ROOT):
        tl_weights_dir = os.path.join(TAILIEU_ROOT, "weights", "catboost_scoring")
        os.makedirs(tl_weights_dir, exist_ok=True)
        for fname in os.listdir(CATBOOST_WEIGHTS_DIR):
            shutil.copy2(os.path.join(CATBOOST_WEIGHTS_DIR, fname), os.path.join(tl_weights_dir, fname))

    # Chạy SHAP TreeExplainer cho toàn bộ video thực tế để xuất xai_reports
    print("\n[*] Đang chạy SHAP TreeExplainer cho từng video thực tế...")
    overall_model = trained_models['overall_score']
    explainer = shap.TreeExplainer(overall_model)
    X_real = df_real[feature_123d_cols]
    shap_vals = explainer.shap_values(X_real)
    base_val = float( np.array(explainer.expected_value).flatten()[0] )

    for idx, row in df_real.iterrows():
        vid_id = row['video_id']
        ctx = row['presentation_context']
        sv = shap_vals[idx]

        # Sắp xếp các đặc trưng theo độ đóng góp âm (Top Penalties) và dương (Top Strengths)
        sorted_indices = np.argsort(sv)
        penalties = []
        strengths = []

        for f_i in sorted_indices[:5]:
            impact = float(sv[f_i])
            if impact < -0.05:
                fname = feature_123d_cols[f_i]
                penalties.append({
                    "feature": fname,
                    "feature_vi": FEATURE_DESCRIPTIONS_VI.get(fname, fname),
                    "value": round(float(row[fname]), 3),
                    "shap_impact": round(impact, 2)
                })

        for f_i in sorted_indices[::-1][:5]:
            impact = float(sv[f_i])
            if impact > 0.05:
                fname = feature_123d_cols[f_i]
                strengths.append({
                    "feature": fname,
                    "feature_vi": FEATURE_DESCRIPTIONS_VI.get(fname, fname),
                    "value": round(float(row[fname]), 3),
                    "shap_impact": round(impact, 2)
                })

        pred_scores = {t: round(float(trained_models[t].predict(X_real.iloc[[idx]])[0]), 2) for t in TARGET_COLS}
        xai_doc = {
            "video_id": vid_id,
            "context": ctx,
            "base_score_phi0": round(base_val, 2),
            "predicted_scores": pred_scores,
            "ground_truth_scores": {t: round(float(row[t]), 2) for t in TARGET_COLS},
            "top_penalties_shap": penalties,
            "top_strengths_shap": strengths
        }
        out_xai = os.path.join(XAI_REPORTS_DIR, f"{vid_id}_xai.json")
        with open(out_xai, 'w', encoding='utf-8') as f:
            json.dump(xai_doc, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 80)
    print(f"[SUCCESS] ĐÃ HOÀN TẤT BƯỚC 2: HUẤN LUYỆN CATBOOST 123D & SHAP XAI!")
    print(f"  1. Thư mục Trọng số (.cbm) : {CATBOOST_WEIGHTS_DIR} (6 models + metadata)")
    print(f"  2. Báo cáo XAI từng video  : {XAI_REPORTS_DIR} ({len(df_real)} files)")
    print("=" * 80)


if __name__ == "__main__":
    train_and_save_catboost_models()
