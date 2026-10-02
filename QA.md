# Kiểm tra bản cải thiện UX

## Các vấn đề đã xử lý

- `museum-3d.html`: phòng và bảng thông tin nằm trong các vùng grid riêng, không còn bảng nổi che tác phẩm; hành động của chương ở trước danh sách.
- `museum3d.css`: tăng kích thước chữ/nút, dialog có nút đóng sticky, focus rõ, overscroll contain, safe areas, danh sách mobile mở/thu gọn; font có glyph tiếng Việt.
- `museum-scene.js`: OrbitControls thay kéo camera tự viết, easing 650ms có thể ngắt, giới hạn góc/zoom, render theo nhu cầu, ResizeObserver; không đọc layout mỗi frame, cache texture/bóng đổ tĩnh.
- `museum3d.js`: ảnh lớn, tự lưu ghi chú khi chuyển/đóng, giữ trạng thái URL, lọc đúng chương, phục hồi focus, fallback không tải WebGL.

## Đã kiểm tra trong trình duyệt

- Desktop, mobile 390×844 và 320×568: không tràn ngang; danh sách mobile đóng/mở và đọc hồ sơ được.
- Chọn chương, điểm mở trên khung 3D mở đúng hồ sơ, các nút zoom/xoay/toàn cảnh.
- Tìm `phap quyen` không dấu: một hồ sơ đúng; có thể mở và đọc.
- Duyệt đủ 18 hồ sơ: 18 tên khác nhau, 10 ảnh tải được, tất cả có tham chiếu giáo trình.
- Ảnh mở lớn rồi quay lại hồ sơ; ghi chú giữ lại sau chuyển hồ sơ và reload; ghi chú thử đã xóa.
- Kéo xoay không mở nhầm hồ sơ, chế độ nhẹ có canvas DPR 1; Escape đóng cửa sổ đọc.
- Chế độ đọc từ Hướng dẫn: không tạo canvas/WebGL, vẫn mở đủ 18 hồ sơ trong danh mục.

Chạy kiểm tra dữ liệu bằng `node tests/content.test.mjs`. Chưa đo FPS trên điện thoại vật lý hay kiểm chứng mọi trình đọc màn hình. Đây không phải chứng nhận toàn bộ WCAG.

## Đợt hoàn thiện 3D — 02/10/2026

- Desktop: đã đi qua 9 khung thuộc ba cánh; nút Đọc hồ sơ mở đúng tiêu đề tương ứng cả 9/9. Khung tiếp theo vòng từ 3 về 1; Home bỏ chế độ xem gần; Enter mở đúng hồ sơ.
- Bấm trực tiếp ảnh đưa camera đến trước khung, bấm ảnh lần hai mở hồ sơ. Kéo từ trên ảnh không mở cửa sổ đọc. Nút xoay/zoom/đặt lại góc hoạt động, không báo lỗi JavaScript trong kiểm tra.
- Guide thực hành đủ 4 bước: sảnh, cánh Ch5, khung đầu, khung kế tiếp. Đóng/hoàn tất/Escape trả focus về nút hướng dẫn. Khởi động guide từ cửa sổ trợ giúp cũng đúng focus.
- Kiểm tra responsive 390×844 và 320×568. Không tràn ngang; trên màn hình thấp, vùng tham quan cuộn để giữ đủ nút điều khiển, bảng hồ sơ không chồng lên thanh xoay/zoom. Khung ảnh tự căn lại sau đổi kích thước.
- Chế độ nhẹ vẫn đưa canvas về DPR 1. `?mode=read` không tạo canvas, vẫn mở được 18 hồ sơ.
- Kiểm tra tự động logic cử chỉ: tap nhẹ; kéo rồi trở về điểm đầu; dịch chuyển ở pointerup; pinch với cả hai thứ tự nhả ngón; pointercancel và tap mới sau hủy. Tất cả pass. Chưa thử pinch trên điện thoại vật lý.
- Không đổi nội dung giáo trình, ảnh hay nguồn; không thêm tính năng ngoài trải nghiệm 3D và hướng dẫn.

### Rà Web Interface Guidelines (các điểm đã sửa)

- `museum-3d.html:22` — nút khung trước/sau có tên trợ năng; có phương án bấm thay cử chỉ.
- `museum3d.css:29` — tăng vùng bấm điều khiển khung và đóng guide lên 44px.
- `museum3d.js:190` — phục hồi focus khi kết thúc; Escape đóng guide mà không xung đột dialog; nội dung guide có live region tại `museum-3d.html:20`.
- `museum-scene.js:116` — kéo/pinch không bị hiểu thành tap; keyboard tương đương điều khiển 3D; animation có thể ngắt và tôn trọng giảm chuyển động.

Không cam kết FPS đa thiết bị. Render vẫn theo nhu cầu, không có tour tự chạy vô hạn; thư viện/ảnh/font tiếp tục lưu cùng repo.
