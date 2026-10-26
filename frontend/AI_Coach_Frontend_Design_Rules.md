# AI Coach — Frontend Design System & UI Rules

> Mục đích: Đây là tài liệu quy định giao diện dùng chung cho toàn bộ frontend của dự án AI Coach (PBL6). Đọc và tuân thủ tài liệu này trước khi tạo mới hoặc chỉnh sửa UI.
> 
> Nguyên tắc ưu tiên: **nhất quán, tự nhiên, dễ dùng, chuyên nghiệp**. Không thiết kế theo kiểu “AI futuristic” quá đà.

## 1. Bối cảnh kỹ thuật

- Framework: React 19 + TypeScript.
- Build tool: Vite 8.
- CSS framework: Tailwind CSS 4.
- Routing: React Router 7.
- Package manager: dùng package manager hiện có trong repository; không tự ý đổi npm/pnpm/yarn hoặc tạo thêm lockfile khác.
- Icon: ưu tiên `lucide-react` nếu đã được cài. Nếu chưa có, kiểm tra với người dùng hoặc chỉ cài khi cần; không dùng emoji làm icon giao diện.
- Trước khi sửa, kiểm tra cấu trúc dự án, CSS global, component dùng chung và cách định tuyến hiện có. Không giả định tên file/thư mục khi chưa kiểm tra.

## 2. Hướng thiết kế

Phong cách: **Modern SaaS, Calm, Professional, Minimal**.

Giao diện cần:
- Trông giống một sản phẩm phần mềm thực tế, đáng tin cậy và thân thiện.
- Ưu tiên nội dung và tác vụ chính; tránh trang trí không có giá trị sử dụng.
- Giữ khoảng trắng hợp lý, căn lề rõ ràng, phân cấp thị giác nhất quán.
- Dùng cùng một hệ thống màu, font, khoảng cách, bo góc, bóng đổ, nút, input và trạng thái trên mọi trang.
- Ưu tiên khả năng đọc và accessibility hơn hiệu ứng trang trí.
- Không tự ý đổi nhận diện thương hiệu hoặc cấu trúc nghiệp vụ nếu người dùng không yêu cầu.

Tránh:
- Quá nhiều màu xanh nổi bật trên cùng một màn hình.
- Gradient, glow, neon, glassmorphism hoặc hiệu ứng “AI” trang trí không cần thiết.
- Bóng đổ đậm, viền dày, card lồng card nhiều tầng.
- Quá nhiều badge, pill, chấm trạng thái và nhãn viết HOA.
- Dùng emoji thay icon; dùng nhiều kiểu icon khác nhau.
- Nút chính quá lớn chỉ để lấp khoảng trống.
- Tự thêm biểu đồ, chỉ số hoặc trạng thái AI không có dữ liệu thật.
- Tự tuyên bố mô hình đo được cảm xúc, độ tự tin, giao tiếp mắt… nếu logic/backend hiện tại không thực sự hỗ trợ.

## 3. Bảng màu chuẩn

Dùng các CSS variables/design tokens sau làm nguồn chuẩn. Nếu dự án đã có hệ thống token, hãy cập nhật hệ thống hiện tại thay vì tạo hệ thứ hai.

### Brand và surfaces
- Primary: `#276749` — xanh lá trầm, dùng cho hành động chính và trạng thái được chọn.
- Primary hover: `#1F553C`.
- Primary soft: `#E8F1EB`.
- Primary subtle border: `#D4E5D9`.
- App background: `#F5F7F6`.
- Surface/card: `#FFFFFF`.
- Main text: `#24312B`.
- Muted text: `#69766F`.
- Border: `#DCE5DF`.

### Status
- Success: `#276749`.
- Warning: `#B7791F`.
- Danger/error/stop recording: `#C24141`.
- Info: dùng xanh slate/neutral phù hợp với theme; không thêm màu nổi nếu không cần.

### Quy tắc sử dụng
- Xanh đậm chỉ dùng cho nút chính, mục menu được chọn, liên kết quan trọng và trạng thái tốt.
- Nền xanh nhạt dùng tiết chế cho vùng được chọn hoặc thông tin phụ.
- Thành phần trung tính mặc định dùng màu xám xanh; không tô tất cả icon thành xanh.
- Đỏ chỉ dùng cho lỗi, cảnh báo nghiêm trọng hoặc hành động dừng/ghi hình khi cần.
- Vàng chỉ dùng cho cảnh báo.
- Đảm bảo độ tương phản chữ/nền dễ đọc; không dùng chữ xám quá nhạt.

## 4. Typography

- Font chính: `Inter`, fallback `system-ui, sans-serif`.
- Chỉ dùng một họ font chính cho toàn bộ ứng dụng, trừ khi có lý do kỹ thuật rõ ràng.
- Không trộn font ngẫu nhiên giữa trang hoặc component.
- Không dùng quá nhiều chữ in hoa; ưu tiên sentence case tiếng Việt, ví dụ “Ngữ cảnh thuyết trình”, không phải “NGỮ CẢNH THUYẾT TRÌNH”.

### Cỡ chữ và weight
- Page title: `24px`, weight `600`.
- Section title: `18px`, weight `600`.
- Card title: `15–16px`, weight `600`.
- Body: `14–15px`, weight `400`.
- Sidebar/menu: `14–15px`, weight `500`.
- Secondary/helper text: `12–13px`, weight `400` hoặc `500`.
- KPI/metric value: `26–30px`, weight `600`.
- Button: `14–15px`, weight `600`.
- Line-height nội dung: khoảng `1.5–1.65`; tiêu đề khoảng `1.2–1.35`.
- Không dùng quá nhiều weight 700/800; chỉ dành cho trường hợp thật sự cần nhấn mạnh.

Nếu dùng font online, cần cân nhắc môi trường triển khai và kết nối mạng. Có thể self-host font nếu repository có quy trình phù hợp. Không thêm cách tải font thứ hai nếu dự án đã có cấu hình font.

## 5. Spacing, layout và kích thước

Dùng hệ spacing bội số 4/8px:
- `4px`: khoảng cách rất nhỏ.
- `8px`: khoảng cách giữa icon và label hoặc các phần tử liên quan.
- `12px`: khoảng cách nhỏ trong nhóm.
- `16px`: khoảng cách nội bộ thông dụng.
- `24px`: khoảng cách giữa các nhóm nội dung.
- `32px`: khoảng cách giữa các khu vực lớn.

Quy tắc component:
- Sidebar desktop: khoảng `224–240px`; không để tên người dùng bị cắt nếu có cách bố trí hợp lý.
- Header: khoảng `64–72px`.
- Button/input: chiều cao thường `40–44px`; nút hành động chính có thể `44–48px`.
- Card: padding thường `20–24px`; card nhỏ có thể `16px`.
- Border radius: control `8px`, card `12–16px`, badge/pill chỉ dùng khi đúng ngữ nghĩa.
- Border: `1px` màu trung tính.
- Shadow: nhẹ và nhất quán; nhiều khu vực không cần shadow.
- Main content: giới hạn độ rộng hợp lý, tránh nội dung trải quá rộng hoặc tập trung thành cột hẹp bất thường.
- Dùng CSS Grid/Flex theo nội dung; tránh fixed width/height không cần thiết.
- Tránh tạo khoảng trắng lớn không có mục đích hoặc kéo dài button/card chỉ để lấp chỗ trống.

## 6. Quy định riêng cho AI Coach

### Studio ghi hình trực tiếp
- Camera/video là vùng nội dung chính.
- Chỉ giữ những overlay cần thiết: trạng thái ghi hình, thời lượng và trạng thái thiết bị quan trọng.
- Không xếp chồng quá nhiều badge lên video.
- Đặt điều khiển ghi/dừng và gửi phân tích thành một nhóm rõ ràng, dễ phân biệt.
- Chỉ hiển thị waveform nếu dữ liệu âm thanh thực sự được cung cấp và nó hữu ích.
- Các chỉ số như giao tiếp mắt, tốc độ nói, từ đệm chỉ hiển thị khi có dữ liệu; trạng thái cập nhật phải phản ánh đúng logic thực tế.
- Nút “Gửi để phân tích” chỉ xuất hiện/được bật ở trạng thái hợp lệ theo luồng nghiệp vụ.

### Tải video lên
- Có tiêu đề trang và mô tả ngắn.
- Hiển thị bước quy trình gọn, không dùng nhiều badge trang trí.
- Ngữ cảnh thuyết trình là một vùng thiết lập đơn giản.
- Khu vực upload có đường viền nét đứt vừa phải, icon đơn sắc, hướng dẫn rõ và định dạng/dung lượng hỗ trợ.
- Sau khi chọn file, hiển thị tên, kích thước, thời lượng nếu có, cùng hành động xóa file.
- Chỉ hiển thị nút “Bắt đầu phân tích” khi phù hợp với trạng thái upload/validation.
- Hướng dẫn chuẩn bị video nên gọn, dễ quét; tránh quá nhiều card giống nhau.

### Báo cáo phân tích
- Ưu tiên kết luận, điểm số và các khuyến nghị cụ thể.
- Dùng biểu đồ khi có dữ liệu thật; có nhãn, đơn vị và ngữ cảnh rõ.
- Không chỉ dùng màu để truyền đạt trạng thái; kèm chữ/icon phù hợp.
- Không tạo điểm số hoặc nhận xét giả để làm giao diện trông đầy đủ.

### Dashboard, lịch sử và cài đặt
- Dùng cùng page header, khoảng cách, card, bảng, filter, input và trạng thái.
- Lịch sử cần có trạng thái rõ ràng: đang chờ, đang xử lý, hoàn thành, thất bại theo các giá trị backend hỗ trợ.
- Màn hình rỗng cần hướng dẫn hành động tiếp theo; màn hình lỗi cần thông báo dễ hiểu và cách thử lại nếu phù hợp.

## 7. Component và icon

- Tái sử dụng component dùng chung như Button, Input, Card, Badge, PageHeader, Sidebar thay vì định nghĩa lại style trên mỗi trang.
- Không tạo nhiều biến thể gần giống nhau nếu không có lý do rõ ràng.
- Icon nên lấy từ một bộ thống nhất, ưu tiên Lucide React nếu có.
- Icon thường có kích thước `16px` hoặc `20px`; icon trong vùng lớn có thể `24px`.
- Nút có icon cần khoảng cách nhất quán, thường `8px`.
- Mỗi nút phải có label rõ ràng; icon-only button cần accessible label/tooltip phù hợp.
- Trạng thái hover/focus/disabled/loading phải được thiết kế nhất quán.

## 8. Responsive và accessibility

- Không chỉ tối ưu cho một kích thước màn hình.
- Desktop: dùng sidebar và layout nhiều cột khi đủ không gian.
- Tablet/mobile: cho phép sidebar thu gọn; xếp cột hợp lý; không để nút hoặc nội dung bị tràn ngang.
- Không dùng kích thước chữ quá nhỏ cho nội dung quan trọng.
- Đảm bảo focus state nhìn thấy được khi dùng bàn phím.
- Form cần label; không chỉ dùng placeholder làm label.
- Nút, input và các điều khiển phải có trạng thái disabled/loading hợp lý.
- Không dùng màu làm dấu hiệu duy nhất cho lỗi/thành công.

## 9. Quy tắc an toàn khi sửa code

Bắt buộc tuân thủ:
1. Trước khi sửa, đọc cấu trúc thư mục, file style chính, router và component liên quan.
2. Giữ nguyên API, endpoint, request/response schema, authentication, role/permission và luồng nghiệp vụ, trừ khi người dùng yêu cầu thay đổi.
3. Không xóa hoặc viết lại webcam, microphone, upload video, phân tích, polling, WebSocket/MQTT hay state management chỉ để chỉnh UI.
4. Không đổi package manager, không tự tạo lockfile khác.
5. Không cài thư viện mới nếu CSS/Tailwind hiện có đáp ứng được; nếu cần thư viện mới, nêu lý do và phạm vi trước.
6. Không sửa file ngoài phạm vi cần thiết.
7. Không tạo dữ liệu giả để thay dữ liệu backend.
8. Không để lại TODO giả vờ đã hoàn thành hoặc các nút không hoạt động.
9. Giữ tương thích với React 19, TypeScript, Vite và Tailwind CSS 4.
10. Nếu chưa hiểu một luồng nghiệp vụ, tìm cách dùng code hiện tại làm nguồn chuẩn; không đoán và không thay đổi hành vi.

## 10. Quy trình thực hiện khi AI nhận yêu cầu UI

1. Khảo sát repository và xác định các trang/component/token hiện có.
2. Tóm tắt ngắn phạm vi sẽ sửa và các file dự kiến tác động.
3. Tạo hoặc cập nhật design tokens dùng chung trước.
4. Chuẩn hóa component dùng chung.
5. Áp dụng lần lượt cho các trang, không tạo phong cách riêng cho từng trang.
6. Chạy formatter và `pnpm build` hoặc lệnh tương ứng với package manager/ scripts hiện có.
7. Sửa lỗi TypeScript/build phát sinh từ thay đổi.
8. Kiểm tra các trạng thái loading, empty, error, disabled và responsive.
9. Báo cáo file đã sửa, thay đổi chính, lệnh kiểm tra đã chạy và vấn đề còn tồn tại. Không tuyên bố test thành công nếu chưa thực sự chạy.

## 11. Tiêu chí hoàn thành

Một thay đổi UI chỉ được xem là hoàn thành khi:
- Màu, font, kích thước và khoảng cách thống nhất với design system.
- Nội dung dễ đọc, không bị cắt/tràn hoặc chồng lấn.
- Các trạng thái và dữ liệu hiển thị đúng với logic hiện tại.
- Không làm hỏng routing, API, authentication hoặc chức năng ghi hình/tải video/phân tích.
- Responsive ở các kích thước hợp lý.
- Build thành công hoặc nêu rõ lỗi tồn tại và nguyên nhân.
- Không thêm hiệu ứng trang trí không cần thiết.

## 12. Chỉ dẫn ngắn cho AI

Trước mọi tác vụ giao diện trong dự án này, hãy đọc file này và tuân thủ như quy chuẩn bắt buộc. Ưu tiên sửa nhỏ, có kiểm soát và tái sử dụng; không viết lại toàn bộ ứng dụng nếu không cần. Nếu yêu cầu của người dùng mâu thuẫn với quy chuẩn này, hãy ưu tiên yêu cầu mới nhất của người dùng nhưng giữ nguyên an toàn nghiệp vụ và báo rõ các đánh đổi quan trọng.
