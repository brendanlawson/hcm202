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
