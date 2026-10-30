# -*- coding: utf-8 -*-
"""
=============================================================================
 CHƯƠNG TRÌNH HUẤN LUYỆN TINH CHỈNH WHISPER BẰNG LORA (PEFT)
 Đề tài: Nền tảng Đánh giá Kỹ năng Thuyết trình Tự động (PBL6 - ĐHBK Đà Nẵng)
 AI & Data Lead: Nguyễn Đỗ Thắng
 
 - Mục đích: Chạy trên Google Colab GPU (Tesla T4) hoặc máy trạm có CUDA
 - Base Model: openai/whisper-small (hoặc openai/whisper-base)
 - Dataset: VIVOS (15 giờ tiếng Việt chuẩn)
=============================================================================
"""

import os
import sys
from dataclasses import dataclass
from typing import Any, Dict, List, Union

# Đảm bảo in UTF-8 không lỗi trên Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


@dataclass
class DataCollatorSpeechSeq2SeqWithPadding:
    processor: Any
    decoder_start_token_id: int

    def __call__(self, features: List[Dict[str, Union[List[int], Any]]]) -> Dict[str, Any]:
        import torch

        input_features = [{"input_features": feature["input_features"]} for feature in features]
        batch = self.processor.feature_extractor.pad(input_features, return_tensors="pt")

        label_features = [{"input_ids": feature["labels"]} for feature in features]
        labels_batch = self.processor.tokenizer.pad(label_features, return_tensors="pt")

        labels = labels_batch["input_ids"].masked_fill(labels_batch.attention_mask.ne(1), -100)

        if (labels[:, 0] == self.decoder_start_token_id).all().cpu().item():
            labels = labels[:, 1:]

        batch["labels"] = labels
        return batch


def check_dependencies():
    """Kiểm tra các thư viện Deep Learning cần thiết trước khi chạy."""
    missing_pkgs = []
    for pkg in ["torch", "transformers", "datasets", "evaluate", "peft", "soundfile"]:
        try:
            __import__(pkg)
        except ImportError:
            missing_pkgs.append(pkg)

    if missing_pkgs:
        print("\n" + "=" * 70)
        print("[!] THÔNG BÁO TỪ HỆ THỐNG:")
        print(f"    Môi trường hiện tại đang thiếu các thư viện: {', '.join(missing_pkgs)}")
        print("\n    >> NẾU ĐANG CHẠY TRÊN GOOGLE COLAB, HÃY CHẠY DÒNG NÀY TRƯỚC:")
        print("       !pip install -q transformers datasets evaluate peft bitsandbytes accelerate soundfile jiwer")
        print("=" * 70 + "\n")
        return False
    return True


def run_training():
    if not check_dependencies():
        return

    import torch
    import evaluate
    from datasets import load_dataset, Audio
    from transformers import (
        WhisperFeatureExtractor,
        WhisperTokenizer,
        WhisperProcessor,
        WhisperForConditionalGeneration,
        Seq2SeqTrainer,
        Seq2SeqTrainingArguments
    )
    from peft import LoraConfig, get_peft_model, TaskType

    print("=" * 70)
    print("      BẮT ĐẦU FINE-TUNING WHISPER LORA TRÊN DATASET VIVOS")
    print("=" * 70)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[*] Thiết bị tính toán: {device.upper()}")
    if device == "cuda":
        print(f"[*] GPU: {torch.cuda.get_device_name(0)}")

    MODEL_NAME = "openai/whisper-small"
    OUTPUT_DIR = "./whisper_lora_vietnamese"

    # 1. Nạp Processor
    print(f"[*] 1. Nạp Processor cho {MODEL_NAME}...")
    feature_extractor = WhisperFeatureExtractor.from_pretrained(MODEL_NAME)
    tokenizer = WhisperTokenizer.from_pretrained(MODEL_NAME, language="Vietnamese", task="transcribe")
    processor = WhisperProcessor.from_pretrained(MODEL_NAME, language="Vietnamese", task="transcribe")

    # 2. Tải Dataset VIVOS trực tiếp từ Cloud
    print("[*] 2. Tải Dataset VIVOS từ Hugging Face Cloud...")
    try:
        raw_dataset = load_dataset("vivos")
    except Exception:
        raw_dataset = load_dataset("ademax/vivos-vie-speech2text")

    raw_dataset = raw_dataset.cast_column("audio", Audio(sampling_rate=16000))

    def prepare_dataset(batch):
        audio = batch["audio"]
        batch["input_features"] = feature_extractor(audio["array"], sampling_rate=audio["sampling_rate"]).input_features[0]
        sentence = batch.get("sentence", batch.get("transcription", ""))
        batch["labels"] = tokenizer(sentence).input_ids
        return batch

    print("[*] 3. Tiền xử lý âm thanh Log-Mel spectrogram...")
    train_ds = raw_dataset["train"].map(prepare_dataset, remove_columns=raw_dataset["train"].column_names, num_proc=2)
    eval_ds = raw_dataset["test"].map(prepare_dataset, remove_columns=raw_dataset["test"].column_names, num_proc=2)

    # 3. Nạp Model & Cấu hình LoRA
    print("[*] 4. Áp dụng LoRA Adapter lên Whisper...")
    model = WhisperForConditionalGeneration.from_pretrained(MODEL_NAME)
    model.config.forced_decoder_ids = None
    model.config.suppress_tokens = []

    lora_config = LoraConfig(
        r=16,
        lora_alpha=32,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.05,
        bias="none"
    )

    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # 4. Metric WER
    metric = evaluate.load("wer")

    def compute_metrics(pred):
        pred_ids = pred.predictions
        label_ids = pred.label_ids
        label_ids[label_ids == -100] = tokenizer.pad_token_id
        pred_str = tokenizer.batch_decode(pred_ids, skip_special_tokens=True)
        label_str = tokenizer.batch_decode(label_ids, skip_special_tokens=True)
        wer = 100 * metric.compute(predictions=pred_str, references=label_str)
        return {"wer": wer}

    data_collator = DataCollatorSpeechSeq2SeqWithPadding(
        processor=processor,
        decoder_start_token_id=model.config.decoder_start_token_id,
    )

    training_args = Seq2SeqTrainingArguments(
        output_dir=OUTPUT_DIR,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=1e-4,
        warmup_steps=50,
        num_train_epochs=3,
        eval_strategy="epoch",
        save_strategy="epoch",
        fp16=(device == "cuda"),
        per_device_eval_batch_size=4,
        generation_max_length=128,
        logging_steps=25,
        remove_unused_columns=False,
        label_names=["labels"],
        load_best_model_at_end=True,
        metric_for_best_model="wer",
        greater_is_better=False,
        save_total_limit=2
    )

    trainer = Seq2SeqTrainer(
        args=training_args,
        model=model,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
        processing_class=processor.feature_extractor,
    )

    print("\n[*] Bắt đầu huấn luyện...")
    trainer.train()

    print(f"\n[+] Lưu trọng số LoRA vào {OUTPUT_DIR}")
    model.save_pretrained(OUTPUT_DIR)
    processor.save_pretrained(OUTPUT_DIR)
    print("\n[SUCCESS] HOÀN TẤT HUẤN LUYỆN TINH CHỈNH WHISPER LORA!")


if __name__ == "__main__":
    run_training()
