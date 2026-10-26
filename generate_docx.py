import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import os

def create_report():
    doc = docx.Document()

    # Set Margins (2.54 cm / 1 inch)
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Styling colors
    PRIMARY_COLOR = RGBColor(16, 44, 87)    # Deep Navy
    SECONDARY_COLOR = RGBColor(53, 89, 142) # Slate Blue
    TEXT_DARK = RGBColor(40, 40, 40)       # Charcoal text

    # Set Normal Style Font
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    font.color.rgb = TEXT_DARK

    # Add Header Info (Header Table)
    header_para = doc.add_paragraph()
    header_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_header1 = header_para.add_run("TRƯỜNG ĐẠI HỌC BÁCH KHOA - ĐẠI HỌC ĐÀ NẴNG\n")
    run_header1.font.bold = True
    run_header1.font.size = Pt(11)
    run_header1.font.color.rgb = SECONDARY_COLOR

    run_header2 = header_para.add_run("KHOA CÔNG NGHỆ THÔNG TIN\n-----------------------------------\n\n")
    run_header2.font.bold = True
    run_header2.font.size = Pt(11)
    run_header2.font.color.rgb = SECONDARY_COLOR

    # Title
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run("BÁO CÁO KẾT QUẢ THỰC HIỆN SPRINT 2\n")
    title_run.font.bold = True
    title_run.font.size = Pt(18)
    title_run.font.color.rgb = PRIMARY_COLOR

    sub_title = title_p.add_run("DỰ ÁN PBL6: NỀN TẢNG ĐÁNH GIÁ KỸ NĂNG THUYẾT TRÌNH TỰ ĐỘNG (AI MULTIMODAL)")
    sub_title.font.bold = True
    sub_title.font.italic = True
    sub_title.font.size = Pt(13)
    sub_title.font.color.rgb = SECONDARY_COLOR

    doc.add_paragraph() # Spacing

    # Metadata Info Box (Table)
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False

    meta_data = [
        ("Môn học / Đề tài:", "Đồ án chuyên ngành PBL6 (Hệ thống AI Đánh giá Thuyết trình)"),
        ("Giảng viên hướng dẫn:", "TS. Võ Đức Hoàng"),
        ("Người thực hiện:", "Võ Thành Nhân (Backend Lead & Quản trị mạng / DevOps)"),
        ("Thời gian hoàn thành:", "Sprint 2 (Tháng 09/2026)")
    ]

    for i, (label, val) in enumerate(meta_data):
        row = meta_table.rows[i]
        
        # Cell 0
        cell_0 = row.cells[0]
        cell_0.width = Inches(2.2)
        p0 = cell_0.paragraphs[0]
        r0 = p0.add_run(label)
        r0.font.bold = True
        r0.font.size = Pt(11)
        r0.font.color.rgb = PRIMARY_COLOR
        
        # Cell 1
        cell_1 = row.cells[1]
        cell_1.width = Inches(4.3)
        p1 = cell_1.paragraphs[0]
        r1 = p1.add_run(val)
        r1.font.size = Pt(11)

    doc.add_paragraph()

    # Section 1
    h1 = doc.add_heading(level=1)
    h1_run = h1.add_run("1. MỤC TIÊU SPRINT 2 & VAI TRÒ ĐẢM NHẬN")
    h1_run.font.bold = True
    h1_run.font.color.rgb = PRIMARY_COLOR
    h1_run.font.size = Pt(14)

    p_sec1 = doc.add_paragraph()
    p_sec1.add_run(
        "Trong giai đoạn Sprint 2, thành viên Võ Thành Nhân đảm nhận vai trò Backend Lead & Quản trị mạng / DevOps với mục tiêu xây dựng toàn bộ hạ tầng kỹ thuật, đóng gói môi trường Docker Compose, thiết kế Cơ sở dữ liệu và dựng khung hệ thống Web API phục vụ xử lý bất đồng bộ (Async Background Processing)."
    )

    # Section 2
    h2 = doc.add_heading(level=1)
    h2_run = h2.add_run("2. KẾT QUẢ CÁC CÔNG VIỆC ĐÃ HOÀN THÀNH")
    h2_run.font.bold = True
    h2_run.font.color.rgb = PRIMARY_COLOR
    h2_run.font.size = Pt(14)

    # 2.1
    h2_1 = doc.add_heading(level=2)
    h2_1_run = h2_1.add_run("2.1. Đóng gói Hạ tầng Docker Compose & Cấu hình Nginx (DevOps & Quản trị mạng)")
    h2_1_run.font.bold = True
    h2_1_run.font.color.rgb = SECONDARY_COLOR
    h2_1_run.font.size = Pt(12.5)

    doc.add_paragraph("• Đóng gói thành công toàn bộ hệ thống gồm 4 máy chủ container chạy độc lập qua docker-compose.yml:")
    
    # Bullet points
    bp1 = doc.add_paragraph(style='List Bullet')
    bp1.add_run("Database Server (db): ").bold = True
    bp1.add_run("Chạy PostgreSQL 15 Alpine với cơ chế lưu trữ dữ liệu bền vững (Persistent Volume).")

    bp2 = doc.add_paragraph(style='List Bullet')
    bp2.add_run("Cache & Queue Server (redis): ").bold = True
    bp2.add_run("Chạy Redis 7 Alpine làm hàng đợi tác vụ xử lý ngầm.")

    bp3 = doc.add_paragraph(style='List Bullet')
    bp3.add_run("Backend API Server (backend): ").bold = True
    bp3.add_run("Ứng dụng FastAPI chạy trên môi trường Python 3.10-slim.")

    bp4 = doc.add_paragraph(style='List Bullet')
    bp4.add_run("Reverse Proxy Server (nginx): ").bold = True
    bp4.add_run("Nginx đón truy cập cổng 80, chuyển tiếp kết quả và bảo mật server.")

    doc.add_paragraph("• Ứng dụng môn Quản trị mạng trên Nginx:")
    bp5 = doc.add_paragraph(style='List Bullet')
    bp5.add_run("Rate Limiting: ").bold = True
    bp5.add_run("Cấu hình giới hạn tối đa 5 lượt upload video trong 10 phút/IP (rate=5r/m) nhằm chống lại tấn công từ chối dịch vụ (DoS/Spam upload).")
    
    bp6 = doc.add_paragraph(style='List Bullet')
    bp6.add_run("Body Size Limit: ").bold = True
    bp6.add_run("Giới hạn dung lượng tải file tối đa client_max_body_size 100M bảo vệ RAM server.")

    # 2.2
    h2_2 = doc.add_heading(level=2)
    h2_2_run = h2_2.add_run("2.2. Xây dựng Bộ khung Mã nguồn Backend & API (FastAPI Framework)")
    h2_2_run.font.bold = True
    h2_2_run.font.color.rgb = SECONDARY_COLOR
    h2_2_run.font.size = Pt(12.5)

    doc.add_paragraph("• Xây dựng mã nguồn Backend theo kiến trúc Clean Modular Architecture:")
    bp7 = doc.add_paragraph(style='List Bullet')
    bp7.add_run("Authentication APIs (/api/v1/auth): ").bold = True
    bp7.add_run("Hoàn thiện các API /register, /login và /me. Mật khẩu được mã hóa băm Bcrypt, xác thực qua chuẩn JWT Access Token (HS256).")

    bp8 = doc.add_paragraph(style='List Bullet')
    bp8.add_run("Presentation APIs (/api/v1/presentations): ").bold = True
    bp8.add_run("Xây dựng các API /upload (tiếp nhận file .mp4/.webm), /{id}/status (trả về % tiến độ 0% -> 100%), /{id}/report (trả về JSON biểu đồ Radar & Timeline errors) và /history.")

    bp9 = doc.add_paragraph(style='List Bullet')
    bp9.add_run("Async Background Processing (video_processor.py): ").bold = True
    bp9.add_run("Giải phóng HTTP response ngay lập tức trong 0.5s sau khi upload file, đưa tiến trình phân tích AI vào xử lý ngầm mà không làm treo ứng dụng.")

    # 2.3
    h2_3 = doc.add_heading(level=2)
    h2_3_run = h2_3.add_run("2.3. Thiết kế Cơ sở dữ liệu ERD & Tích hợp Context Type (Presentation Scenario)")
    h2_3_run.font.bold = True
    h2_3_run.font.color.rgb = SECONDARY_COLOR
    h2_3_run.font.size = Pt(12.5)

    doc.add_paragraph("• Thiết kế các thực thể CSDL (Users, Presentations, AnalysisResults) và xây dựng ORM Models với Async SQLAlchemy.")
    doc.add_paragraph("• Tích hợp Enum context_type (PresentationScenario) với 3 ngữ cảnh thuyết trình thực tế:")
    
    c1 = doc.add_paragraph(style='List Bullet')
    c1.add_run("ACADEMIC: ").bold = True
    c1.add_run("Thuyết trình Đồ án / Học thuật (Tiêu chuẩn phong thái đĩnh đạc, tốc độ 130-150 WPM).")

    c2 = doc.add_paragraph(style='List Bullet')
    c2.add_run("PITCHING: ").bold = True
    c2.add_run("Pitching Khởi nghiệp / Gọi vốn (Yêu cầu năng lượng cao, cử chỉ tay linh hoạt).")

    c3 = doc.add_paragraph(style='List Bullet')
    c3.add_run("INTERVIEW: ").bold = True
    c3.add_run("Phỏng vấn xin việc (Yêu cầu tập trung ánh mắt, điềm tĩnh).")

    # 2.4
    h2_4 = doc.add_heading(level=2)
    h2_4_run = h2_4.add_run("2.4. Repository GitHub & Unit Tests (Software Testing)")
    h2_4_run.font.bold = True
    h2_4_run.font.color.rgb = SECONDARY_COLOR
    h2_4_run.font.size = Pt(12.5)

    bp10 = doc.add_paragraph(style='List Bullet')
    bp10.add_run("Cấu hình .gitignore: ").bold = True
    bp10.add_run("Loại bỏ file rác, biến môi trường nhạy cảm và ổ lưu trữ video khỏi Git Repository.")

    bp11 = doc.add_paragraph(style='List Bullet')
    bp11.add_run("Unit Testing (Pytest): ").bold = True
    bp11.add_run("Viết bộ kiểm thử tự động test_health.py và test_auth.py kiểm tra độ chính xác của các đường dẫn API.")

    # Section 3
    h3 = doc.add_heading(level=1)
    h3_run = h3.add_run("3. TỔNG KẾT VÀ KẾ HẠCH SPRINT 3")
    h3_run.font.bold = True
    h3_run.font.color.rgb = PRIMARY_COLOR
    h3_run.font.size = Pt(14)

    p_end = doc.add_paragraph()
    p_end.add_run(
        "Tất cả các mục tiêu của Sprint 2 đã được hoàn thành đúng tiến độ và kiểm thử chạy ổn định. Trong Sprint 3 tiếp theo, phân hệ Backend sẽ tiến hành phối hợp với thành viên Nguyễn Đỗ Thắng (AI Lead) để nhúng pipeline mô hình AI (MediaPipe, Librosa, Whisper, ONNX Model) vào Background Worker, đồng thời phối hợp với thành viên Đặng Quang Sơn (Frontend Lead) để hoàn thiện kết nối toàn trình (End-to-End)."
    )

    # Save Document
    output_dir = "d:/Semester7/PBL6/source/docs"
    os.makedirs(output_dir, exist_ok=True)
    docx_path = os.path.join(output_dir, "BAO_CAO_SPRINT_2_BACKEND_DEVOPS.docx")
    doc.save(docx_path)
    print(f"Report created successfully at: {docx_path}")

if __name__ == "__main__":
    create_report()
