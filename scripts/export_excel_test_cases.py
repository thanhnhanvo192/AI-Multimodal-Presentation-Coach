import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import os

def create_test_cases_excel():
    wb = openpyxl.Workbook()
    # Remove default sheet
    wb.remove(wb.active)

    headers = [
        "Test Case ID",
        "Test Case Description",
        "Test Case Procedure",
        "Expected Results",
        "Pre-conditions",
        "Round 1",
        "Test date",
        "Tester",
        "Round 2",
        "Test date",
        "Tester",
        "Round 3",
        "Test date",
        "Tester",
        "Note"
    ]

    header_fill = PatternFill(start_color="698238", end_color="698238", fill_type="solid")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    
    func_fill = PatternFill(start_color="D6EEF8", end_color="D6EEF8", fill_type="solid")
    func_font = Font(name="Calibri", size=11, bold=True, color="000000")

    cell_font = Font(name="Calibri", size=10)
    pass_font = Font(name="Calibri", size=10, bold=True, color="006100")
    pass_fill = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")

    thin_border = Border(
        left=Side(style='thin', color='D9D9D9'),
        right=Side(style='thin', color='D9D9D9'),
        top=Side(style='thin', color='D9D9D9'),
        bottom=Side(style='thin', color='D9D9D9')
    )

    header_border = Border(
        left=Side(style='thin', color='4F6228'),
        right=Side(style='thin', color='4F6228'),
        top=Side(style='thin', color='4F6228'),
        bottom=Side(style='medium', color='4F6228')
    )

    sections = [
        {
            "sheet_name": "Unit Testing",
            "functions": [
                {
                    "name": "Function: Mã hóa và xác thực mật khẩu (app/core/security.py)",
                    "cases": [
                        (
                            "UT-SEC-01",
                            "Kiểm tra hàm get_password_hash tạo ra chuỗi hash chuẩn Bcrypt",
                            "1. Gọi get_password_hash('StrongP@ssw0rd!')\n2. Kiểm tra chuỗi kết quả trả về",
                            "Chuỗi hash bắt đầu bằng '$2b$', có độ dài >= 59 ký tự",
                            "Thư viện passlib & bcrypt đã sẵn sàng",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Bcrypt format verification"
                        ),
                        (
                            "UT-SEC-02",
                            "Kiểm tra tính ngẫu nhiên của Salt khi băm cùng một mật khẩu",
                            "1. Gọi get_password_hash('MySecret123') lần 1\n2. Gọi get_password_hash('MySecret123') lần 2\n3. So sánh 2 kết quả",
                            "Hai chuỗi băm hoàn toàn khác biệt nhau (khác salt)",
                            "Module security được import thành công",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Random salt security check"
                        ),
                        (
                            "UT-SEC-03",
                            "Xác thực mật khẩu chính xác bằng verify_password",
                            "1. Tạo hash từ 'ValidPassword99'\n2. Gọi verify_password('ValidPassword99', hash)",
                            "Hàm trả về True",
                            "Hash hợp lệ đã được tạo",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Success authentication logic"
                        ),
                        (
                            "UT-SEC-04",
                            "Xác thực mật khẩu sai với hash hợp lệ",
                            "1. Tạo hash từ mật khẩu gốc\n2. Gọi verify_password('WrongPassword', hash)",
                            "Hàm trả về False",
                            "Hash hợp lệ của mật khẩu khác đã có",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Reject invalid credentials"
                        ),
                        (
                            "UT-SEC-05",
                            "Xác thực mật khẩu là chuỗi rỗng với hash hợp lệ",
                            "1. Gọi verify_password('', valid_hash)",
                            "Hàm trả về False mà không phát sinh crash",
                            "Hash hợp lệ đã có",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Empty password check"
                        ),
                        (
                            "UT-SEC-06",
                            "Tạo hash từ chuỗi rỗng và xác minh lại",
                            "1. Gọi get_password_hash('')\n2. Gọi verify_password('', empty_hash)",
                            "Tạo thành công hash bcrypt và xác minh trả về True",
                            "Hệ thống cho phép xử lý chuỗi rỗng",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Edge case: empty string hashing"
                        ),
                        (
                            "UT-SEC-07",
                            "Xử lý mật khẩu độ dài tối đa của Bcrypt (72 ký tự)",
                            "1. Chuẩn bị chuỗi 72 ký tự\n2. Gọi get_password_hash(pwd)\n3. Gọi verify_password(pwd, hash)",
                            "Hash và verify trả về True thành công",
                            "Mật khẩu dài 72 ký tự",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Boundary: 72 bytes limit"
                        ),
                        (
                            "UT-SEC-08",
                            "Xử lý mật khẩu chứa ký tự có dấu tiếng Việt và Icon Emoji",
                            "1. pwd = 'ThuyếtTrìnhĐỉnhCao@2026! 🚀'\n2. Gọi get_password_hash(pwd)\n3. Gọi verify_password(pwd, hash)",
                            "Mã hóa UTF-8 chính xác và verify trả về True",
                            "Môi trường hỗ trợ UTF-8",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Unicode & Emoji support"
                        ),
                        (
                            "UT-SEC-09",
                            "Kiểm tra tính phân biệt chữ hoa - chữ thường (Case Sensitivity)",
                            "1. Tạo hash từ 'Password123'\n2. Gọi verify_password('password123', hash)",
                            "Hàm trả về False",
                            "Hash của mật khẩu viết hoa ký tự đầu",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Case sensitivity check"
                        ),
                        (
                            "UT-SEC-10",
                            "Xử lý ngoại lệ khi hash truyền vào bị biến dạng hoặc sai định dạng",
                            "1. Gọi verify_password('secret', 'malformed_invalid_hash_string')",
                            "Hàm trả về False an toàn, không làm dừng ứng dụng",
                            "Chuỗi hash giả mạo",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Malformed hash exception safety"
                        )
                    ]
                },
                {
                    "name": "Function: Chấm điểm AI, phân bổ huy hiệu và định dạng Telemetry (app/services/ai_scoring_engine.py)",
                    "cases": [
                        (
                            "UT-AIS-01",
                            "Tính toán điểm tổng thể (Overall Score) theo trọng số chuẩn",
                            "1. Input: voice=80, visual=85, content=90, structure=75\n2. Gọi hàm tính toán điểm tổng hợp",
                            "Điểm tổng hợp tính ra chính xác: 83.0 / 100.0",
                            "Trọng số chuẩn đã cấu hình",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Weighted score calculation"
                        ),
                        (
                            "UT-AIS-02",
                            "Kẹp biên trên (Clamping Upper Bound) khi điểm thành phần vượt quá 100",
                            "1. Input điểm thành phần = 120.0\n2. Gọi hàm tính điểm tổng quát",
                            "Điểm kết quả bị giới hạn tối đa 100.0",
                            "Dữ liệu test ngoại lệ",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Upper boundary clamp"
                        ),
                        (
                            "UT-AIS-03",
                            "Kẹp biên dưới (Clamping Lower Bound) khi điểm thành phần là số âm",
                            "1. Input điểm thành phần = -15.0\n2. Gọi hàm tính điểm tổng quát",
                            "Điểm kết quả bị giới hạn tối thiểu 0.0",
                            "Dữ liệu test ngoại lệ",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Lower boundary clamp"
                        ),
                        (
                            "UT-AIS-04",
                            "Phân bổ danh hiệu cấp độ Master Speaker (Xuất sắc)",
                            "1. Gọi determine_badge_tier(score=92.5)",
                            "Trả về huy hiệu 'Master Speaker' (Hạng Xuất sắc)",
                            "Hàm determine_badge_tier khả dụng",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Tier: Master (>= 90)"
                        ),
                        (
                            "UT-AIS-05",
                            "Phân bổ danh hiệu cấp độ Proficient Speaker (Giỏi)",
                            "1. Gọi determine_badge_tier(score=84.0)",
                            "Trả về huy hiệu 'Proficient Speaker' (Hạng Giỏi)",
                            "Hàm determine_badge_tier khả dụng",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Tier: Proficient (80-89)"
                        ),
                        (
                            "UT-AIS-06",
                            "Phân bổ danh hiệu cấp độ Developing Speaker (Khá)",
                            "1. Gọi determine_badge_tier(score=72.0)",
                            "Trả về huy hiệu 'Developing Speaker' (Hạng Khá)",
                            "Hàm determine_badge_tier khả dụng",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Tier: Developing (65-79)"
                        ),
                        (
                            "UT-AIS-07",
                            "Phân bổ danh hiệu cấp độ Novice Speaker (Cần rèn luyện)",
                            "1. Gọi determine_badge_tier(score=58.0)",
                            "Trả về huy hiệu 'Novice Speaker' (Hạng Khởi đầu)",
                            "Hàm determine_badge_tier khả dụng",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Tier: Novice (< 65)"
                        ),
                        (
                            "UT-AIS-08",
                            "Kiểm tra tính chính xác tại các điểm ranh giới (Boundary Thresholds)",
                            "1. Test các điểm số: 89.99, 90.00, 79.99, 80.00, 64.99, 65.00",
                            "Các thứ hạng được gán chính xác tuyệt đối theo ngưỡng dấu =",
                            "Tập giá trị biên sẵn sàng",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Boundary threshold verification"
                        ),
                        (
                            "UT-AIS-09",
                            "Định dạng chuỗi dữ liệu Telemetry đa phương thức hợp lệ",
                            "1. Input: mảng tọa độ khuôn mặt và dB âm lượng thô\n2. Gọi format_multimodal_telemetry()",
                            "JSON schema chuẩn hóa, giá trị làm tròn 2 chữ số thập phân",
                            "Telemetry raw data chuẩn bị sẵn",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Format telemetry JSON"
                        ),
                        (
                            "UT-AIS-10",
                            "Xử lý an toàn khi danh sách Telemetry đầu vào bị rỗng",
                            "1. Input: raw_metrics = []\n2. Gọi format_multimodal_telemetry()",
                            "Trả về telemetry mặc định an toàn, không ném ngoại lệ",
                            "Dữ liệu rỗng",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Empty telemetry safety"
                        ),
                        (
                            "UT-AIS-11",
                            "Lọc và khử giá trị dị biệt NaN, Infinity trong cảm biến",
                            "1. Input chứa float('nan') và float('inf')\n2. Gọi format_multimodal_telemetry()",
                            "Tất cả giá trị NaN/Inf được chuyển đổi thành 0.0 an toàn",
                            "Tập giá trị lỗi toán học",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "NaN/Inf sanitization"
                        ),
                        (
                            "UT-AIS-12",
                            "Xử lý khi payload điểm số thành phần bị thiếu trường dữ liệu",
                            "1. Input dict bị thiếu trường 'visual_score'\n2. Gọi hàm tính điểm",
                            "Hệ thống áp dụng điểm fallback mặc định hoặc xử lý không crash",
                            "Payload khiếm khuyết",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Missing field tolerance"
                        )
                    ]
                }
            ]
        },
        {
            "sheet_name": "API Testing",
            "functions": [
                {
                    "name": "Function: Quản lý Cấu hình Tham số Hệ thống Admin (GET/PUT /admin/config)",
                    "cases": [
                        (
                            "API-CFG-01",
                            "Admin lấy danh sách cấu hình hệ thống thành công",
                            "1. Gửi GET /admin/config\n2. Headers: Bearer Token của tài khoản Admin",
                            "HTTP Status 200 OK, trả về JSON danh sách tham số cấu hình",
                            "Tài khoản Admin đã được tạo và kích hoạt",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Admin access authorization"
                        ),
                        (
                            "API-CFG-02",
                            "Từ chối truy cập cấu hình hệ thống khi không có Access Token",
                            "1. Gửi GET /admin/config không kèm Header Authorization",
                            "HTTP Status 401 Unauthorized",
                            "Không truyền token",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Unauthorized verification"
                        ),
                        (
                            "API-CFG-03",
                            "Chặn Sinh viên (Role: Student) truy cập cấu hình Admin",
                            "1. Gửi GET /admin/config kèm Bearer Token của Sinh viên",
                            "HTTP Status 403 Forbidden",
                            "Tài khoản sinh viên đăng nhập thành công",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "RBAC forbidden check"
                        ),
                        (
                            "API-CFG-04",
                            "Admin cập nhật cấu hình tham số hệ thống thành công",
                            "1. Gửi PUT /admin/config\n2. Headers: Bearer Admin\n3. Body: {'max_video_size_mb': 250}",
                            "HTTP Status 200 OK, cấu hình mới được lưu và phản hồi",
                            "Tài khoản Admin đăng nhập",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Update config success"
                        ),
                        (
                            "API-CFG-05",
                            "Bắt lỗi khi gửi payload cấu hình sai định dạng dữ liệu",
                            "1. Gửi PUT /admin/config\n2. Body: {'max_video_size_mb': 'chữ_không_phải_số'}",
                            "HTTP Status 422 Unprocessable Entity, thông báo lỗi validation",
                            "Tài khoản Admin đăng nhập",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Schema validation error"
                        )
                    ]
                },
                {
                    "name": "Function: Quản lý Trạng thái Khóa / Mở khóa Tài khoản Người dùng (PATCH /admin/users/{user_id}/status)",
                    "cases": [
                        (
                            "API-USR-01",
                            "Admin thực hiện khóa tài khoản sinh viên vi phạm",
                            "1. Gửi PATCH /admin/users/{student_id}/status\n2. Headers: Bearer Admin\n3. Body: {'is_active': False}",
                            "HTTP Status 200 OK, trường is_active của người dùng đổi thành False",
                            "Tài khoản sinh viên mục tiêu đang active",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Deactivate user successfully"
                        ),
                        (
                            "API-USR-02",
                            "Admin thực hiện mở khóa (kích hoạt lại) tài khoản sinh viên",
                            "1. Gửi PATCH /admin/users/{student_id}/status\n2. Body: {'is_active': True}",
                            "HTTP Status 200 OK, trường is_active trở lại True",
                            "Tài khoản sinh viên đang bị khóa",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Reactivate user successfully"
                        ),
                        (
                            "API-USR-03",
                            "Chặn người dùng vai trò Student thay đổi trạng thái tài khoản",
                            "1. Gửi PATCH /admin/users/{user_id}/status bằng Token của Sinh viên",
                            "HTTP Status 403 Forbidden",
                            "Sinh viên cố tình can thiệp API quản trị",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "RBAC security enforcement"
                        ),
                        (
                            "API-USR-04",
                            "Xử lý khi thay đổi trạng thái của user_id không tồn tại",
                            "1. Gửi PATCH /admin/users/999999/status\n2. Token Admin",
                            "HTTP Status 404 Not Found, thông báo người dùng không tồn tại",
                            "User ID 999999 chưa từng được tạo",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Non-existent entity error"
                        ),
                        (
                            "API-USR-05",
                            "Ngăn chặn Admin tự khóa tài khoản của chính mình",
                            "1. Gửi PATCH /admin/users/{admin_id}/status với is_active: False bằng chính token Admin",
                            "HTTP Status 400 Bad Request, báo lỗi bảo vệ Admin",
                            "Admin đang đăng nhập chính tài khoản đó",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Self-lock prevention constraint"
                        )
                    ]
                }
            ]
        },
        {
            "sheet_name": "Web Testing (E2E)",
            "functions": [
                {
                    "name": "Function: Luồng Đăng ký Tài khoản Sinh viên Mới trên Giao diện Web (/signup)",
                    "cases": [
                        (
                            "WEB-REG-01",
                            "Hiển thị đầy đủ các trường nhập liệu trên trang Đăng ký",
                            "1. Mở trình duyệt đến URL '/signup'\n2. Chờ DOM load xong",
                            "Hiển thị form, ô Họ tên, Email, Mật khẩu, Xác nhận MK và Checkbox điều khoản",
                            "Frontend web server đang chạy tại port 5173",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "UI elements rendering verification"
                        ),
                        (
                            "WEB-REG-02",
                            "Kiểm tra ràng buộc khi bỏ trống dữ liệu bắt buộc",
                            "1. Truy cập '/signup'\n2. Để trống các ô và kiểm tra nút Submit",
                            "Nút Đăng ký ở trạng thái disabled hoặc hiển thị validation message đỏ",
                            "Trang đăng ký đã tải xong",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Required fields validation"
                        ),
                        (
                            "WEB-REG-03",
                            "Hiển thị thông báo lỗi khi Mật khẩu xác nhận không khớp",
                            "1. Nhập password = 'Password@123'\n2. Nhập confirm_password = 'Password@456'",
                            "Giao diện hiển thị cảnh báo mật khẩu không trùng khớp",
                            "Đã điền các thông tin khác hợp lệ",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Password mismatch validation"
                        ),
                        (
                            "WEB-REG-04",
                            "Chặn gửi form khi chưa tích chọn Đồng ý Điều khoản dịch vụ",
                            "1. Nhập đủ thông tin hợp lệ\n2. Bỏ chọn checkbox 'Tôi đồng ý với điều khoản'",
                            "Nút 'Đăng ký tài khoản' bị vô hiệu hóa (disabled), không thể submit",
                            "Form đã điền đúng thông tin",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Terms agreement enforcement"
                        ),
                        (
                            "WEB-REG-05",
                            "Đăng ký thành công tài khoản sinh viên mới với thông tin hợp lệ",
                            "1. Điền Họ tên, Email duy nhất, Mật khẩu chuẩn\n2. Tích đồng ý điều khoản\n3. Click 'Đăng ký tài khoản'",
                            "Hiển thị thông báo đăng ký thành công và tự động chuyển hướng đến trang /login",
                            "Database test sẵn sàng tiếp nhận tài khoản mới",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "End-to-End signup success flow"
                        )
                    ]
                },
                {
                    "name": "Function: Luồng Đăng nhập và Phân quyền Điều hướng RBAC trên Giao diện Web (/login)",
                    "cases": [
                        (
                            "WEB-LOG-01",
                            "Hiển thị đầy đủ cấu trúc giao diện trang Đăng nhập",
                            "1. Mở trình duyệt đến '/login'\n2. Kiểm tra các thành phần giao diện",
                            "Hiển thị ô Email, Mật khẩu, nút Đăng nhập và liên kết 'Đăng ký ngay'",
                            "Frontend web server đang hoạt động",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Login page layout verification"
                        ),
                        (
                            "WEB-LOG-02",
                            "Thông báo lỗi khi nhập sai mật khẩu hoặc tài khoản không đúng",
                            "1. Nhập email sinh viên hợp lệ\n2. Nhập mật khẩu sai 'WrongPass@2026'\n3. Click 'Đăng nhập'",
                            "Toast notification hoặc alert hiển thị lỗi 'Email hoặc mật khẩu không chính xác'",
                            "Người dùng đang ở trang /login",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Invalid credentials notification"
                        ),
                        (
                            "WEB-LOG-03",
                            "Đăng nhập Sinh viên thành công và điều hướng vào Student Dashboard",
                            "1. Nhập email: 'student_test@example.com', mật khẩu đúng\n2. Click 'Đăng nhập'",
                            "Lưu access_token vào localStorage, URL chuyển đến '/dashboard', hiển thị chào mừng sinh viên",
                            "Tài khoản sinh viên đã kích hoạt trong DB",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Student login & dashboard routing"
                        ),
                        (
                            "WEB-LOG-04",
                            "Đăng nhập Quản trị viên (Admin) và điều hướng vào Admin Portal",
                            "1. Nhập email Admin: 'admin_test@example.com', mật khẩu đúng\n2. Click 'Đăng nhập'",
                            "URL chuyển đến '/admin', hiển thị 'Bảng điều khiển Quản trị', role xác thực là admin",
                            "Tài khoản admin tồn tại và quyền superuser",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Admin RBAC portal routing"
                        )
                    ]
                }
            ]
        },
        {
            "sheet_name": "Performance Testing",
            "functions": [
                {
                    "name": "Function: Kiểm thử Tải Endpoint Thống kê Dashboard Sinh viên (GET /presentations/dashboard-stats)",
                    "cases": [
                        (
                            "PERF-01",
                            "Đo lường độ chịu tải của API Dashboard Stats dưới 50 Users đồng thời",
                            "1. Khởi tạo Locust với 50 Virtual Users (Spawn rate: 5 users/s)\n2. Thực hiện tải liên tục trong 15 giây\n3. Thu thập Response Time, RPS và Failure Rate",
                            "Tổng số 772 requests, Average Response Time 516.53ms, Tần suất 54.85 req/s, Tỷ lệ lỗi 0.0%",
                            "Backend server đang chạy, tài khoản Sinh viên đã có token",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "High concurrency stats aggregation"
                        )
                    ]
                },
                {
                    "name": "Function: Kiểm thử Tải Endpoint Tổng hợp Chỉ số KPI Quản trị Admin (GET /admin/kpis)",
                    "cases": [
                        (
                            "PERF-02",
                            "Đo lường hiệu năng của API Tổng hợp KPIs hệ thống dưới áp lực 50 Users",
                            "1. Khởi tạo Locust 50 Users tải liên tục trong 15 giây vào endpoint /admin/kpis\n2. Đo lường thời gian xử lý truy vấn tính toán số liệu",
                            "Tổng số 305 requests, Average Response Time 1712.41ms, Tần suất 21.71 req/s, Tỷ lệ lỗi 0.0%",
                            "Backend server đang chạy, tài khoản Admin mang quyền hợp lệ",
                            "Passed", "04/11/2026", "Đặng Quang Sơn", "", "", "", "", "", "",
                            "Heavy DB aggregate performance test"
                        )
                    ]
                }
            ]
        }
    ]

    for sec in sections:
        ws = wb.create_sheet(title=sec["sheet_name"])
        ws.views.sheetView[0].showGridLines = True

        # Write header row
        ws.append(headers)
        header_row = ws[1]
        for cell in header_row:
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            cell.border = header_border
        ws.row_dimensions[1].height = 28

        current_row = 2
        for fn in sec["functions"]:
            # Write function banner row
            func_row_values = [fn["name"]] + [""] * (len(headers) - 1)
            ws.append(func_row_values)
            
            # Merge function row across all columns
            ws.merge_cells(start_row=current_row, start_column=1, end_row=current_row, end_column=len(headers))
            fn_cell = ws.cell(row=current_row, column=1)
            fn_cell.font = func_font
            fn_cell.fill = func_fill
            fn_cell.alignment = Alignment(horizontal="left", vertical="center")
            
            for col_idx in range(1, len(headers) + 1):
                c = ws.cell(row=current_row, column=col_idx)
                c.fill = func_fill
                c.border = thin_border
            ws.row_dimensions[current_row].height = 24
            current_row += 1

            # Write test cases
            for case in fn["cases"]:
                ws.append(list(case))
                row_cells = ws[current_row]
                for idx, cell in enumerate(row_cells):
                    cell.font = cell_font
                    cell.border = thin_border
                    # Alignments
                    if idx in [0, 5, 6, 7, 8, 9, 10, 11, 12, 13]:
                        cell.alignment = Alignment(horizontal="center", vertical="center")
                    else:
                        cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

                    # Highlight Passed
                    if cell.value == "Passed":
                        cell.fill = pass_fill
                        cell.font = pass_font

                ws.row_dimensions[current_row].height = 45
                current_row += 1

        # Adjust column widths
        col_widths = {
            1: 14,   # Test Case ID
            2: 32,   # Description
            3: 38,   # Procedure
            4: 35,   # Expected Results
            5: 28,   # Pre-conditions
            6: 12,   # Round 1
            7: 12,   # Test date
            8: 16,   # Tester
            9: 10,   # Round 2
            10: 12,  # Test date
            11: 14,  # Tester
            12: 10,  # Round 3
            13: 12,  # Test date
            14: 14,  # Tester
            15: 30   # Note
        }
        for col_idx, width in col_widths.items():
            col_letter = get_column_letter(col_idx)
            ws.column_dimensions[col_letter].width = width

    # Also create a unified "All Tests" master sheet
    ws_all = wb.create_sheet(title="All Test Cases", index=0)
    ws_all.views.sheetView[0].showGridLines = True
    ws_all.append(headers)
    for cell in ws_all[1]:
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = header_border
    ws_all.row_dimensions[1].height = 28

    curr_master_row = 2
    for sec in sections:
        for fn in sec["functions"]:
            func_row_values = [f"[{sec['sheet_name']}] {fn['name']}"] + [""] * (len(headers) - 1)
            ws_all.append(func_row_values)
            ws_all.merge_cells(start_row=curr_master_row, start_column=1, end_row=curr_master_row, end_column=len(headers))
            fn_cell = ws_all.cell(row=curr_master_row, column=1)
            fn_cell.font = func_font
            fn_cell.fill = func_fill
            fn_cell.alignment = Alignment(horizontal="left", vertical="center")
            for col_idx in range(1, len(headers) + 1):
                ws_all.cell(row=curr_master_row, column=col_idx).fill = func_fill
                ws_all.cell(row=curr_master_row, column=col_idx).border = thin_border
            ws_all.row_dimensions[curr_master_row].height = 24
            curr_master_row += 1

            for case in fn["cases"]:
                ws_all.append(list(case))
                row_cells = ws_all[curr_master_row]
                for idx, cell in enumerate(row_cells):
                    cell.font = cell_font
                    cell.border = thin_border
                    if idx in [0, 5, 6, 7, 8, 9, 10, 11, 12, 13]:
                        cell.alignment = Alignment(horizontal="center", vertical="center")
                    else:
                        cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
                    if cell.value == "Passed":
                        cell.fill = pass_fill
                        cell.font = pass_font
                ws_all.row_dimensions[curr_master_row].height = 45
                curr_master_row += 1

    for col_idx, width in col_widths.items():
        col_letter = get_column_letter(col_idx)
        ws_all.column_dimensions[col_letter].width = width

    # Save to file
    out_dir = "test-results/summary"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "PBL6_Automated_Test_Cases_Report.xlsx")
    wb.save(out_path)
    print(f"Workbook successfully saved to: {out_path}")

    # Also save copy in docs/testing/
    docs_path = "docs/testing/PBL6_Automated_Test_Cases_Report.xlsx"
    wb.save(docs_path)
    print(f"Workbook copy successfully saved to: {docs_path}")

if __name__ == "__main__":
    create_test_cases_excel()

