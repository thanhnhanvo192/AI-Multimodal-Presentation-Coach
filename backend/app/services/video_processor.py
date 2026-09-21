import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import async_session_maker
from app.models.presentation import Presentation, AnalysisResult, PresentationStatus

logger = logging.getLogger("video_processor")

async def process_video_background(presentation_id: int):
    """
    Background Task pipeline executing multimodal AI analysis on uploaded video.
    Updates progress percentage incrementally in DB.
    """
    async with async_session_maker() as session:
        try:
            # 1. Fetch presentation record
            result = await session.execute(select(Presentation).where(Presentation.id == presentation_id))
            presentation = result.scalar_one_or_none()
            if not presentation:
                logger.error(f"Presentation {presentation_id} not found for background processing.")
                return

            presentation.status = PresentationStatus.PROCESSING
            presentation.progress_percentage = 10
            await session.commit()

            # Stage 1: Extract audio & Vision frame processing (Simulated / AI Pipeline integration point)
            await asyncio.sleep(2)
            presentation.progress_percentage = 35
            await session.commit()

            # Stage 2: STT & Pitch Analysis & Gaze Estimation
            await asyncio.sleep(2)
            presentation.progress_percentage = 70
            await session.commit()

            # Stage 3: Fusion Model & LLM Feedback Generation
            await asyncio.sleep(1.5)

            # Generate Analysis Result Data
            mock_radar = {
                "eye_contact": 88.0,
                "body_language": 82.5,
                "speech_rate": 91.0,
                "pitch": 84.0,
                "content": 90.0
            }

            mock_timeline = [
                {"timestamp": 12.5, "type": "EYE_CONTACT_LOST", "message": "Cúi mặt nhìn tài liệu quá lâu (4s)"},
                {"timestamp": 45.0, "type": "FILLER_WORD", "message": "Sử dụng từ đệm 'ừm'"},
                {"timestamp": 78.2, "type": "SPEECH_RATE_HIGH", "message": "Tốc độ nói vọt lên 185 WPM (quá nhanh)"}
            ]

            mock_audio = {
                "wpm": 142,
                "pause_count": 3,
                "filler_words_count": 2,
                "pitch_variation": "Rất linh hoạt, có nhấn nhá tốt"
            }

            mock_transcript = {
                "full_text": "Xin chào thầy và các bạn, hôm nay em xin đại diện nhóm trình bày đề tài Nền tảng Đánh giá Kỹ năng Thuyết trình Tự động...",
                "words_count": 165
            }

            mock_feedback = {
                "strengths": [
                    "Ánh mắt tự tin, giữ giao tiếp mắt với camera đạt 88% thời lượng.",
                    "Tốc độ nói trung bình 142 WPM chuẩn phong thái diễn thuyết."
                ],
                "weaknesses": [
                    "Có khoảnh khắc cúi mặt nhìn slide/kịch bản tại giây thứ 12.",
                    "Một số đoạn tăng tốc ngắt câu hơi đột ngột."
                ],
                "action_items": [
                    "Luyện tập ngẩng cao đầu duy trì ánh mắt ngay cả khi cần nhớ lại dàn ý.",
                    "Đặt các mốc tạm dừng (pause) 1-2 giây sau mỗi ý chính."
                ]
            }

            analysis_result = AnalysisResult(
                presentation_id=presentation.id,
                total_score=87.5,
                badge_title="Diễn giả Tự Tin",
                radar_scores=mock_radar,
                timeline_errors=mock_timeline,
                audio_metrics=mock_audio,
                transcript=mock_transcript,
                ai_feedback=mock_feedback
            )

            session.add(analysis_result)

            presentation.status = PresentationStatus.COMPLETED
            presentation.progress_percentage = 100
            await session.commit()
            logger.info(f"Successfully processed presentation {presentation_id}.")

        except Exception as e:
            logger.exception(f"Error processing presentation {presentation_id}: {str(e)}")
            presentation.status = PresentationStatus.FAILED
            presentation.error_message = str(e)
            await session.commit()
