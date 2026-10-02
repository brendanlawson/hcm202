# DẤU ẤN — Bảo tàng tư tưởng

Demo không backend, không login. `museum-3d.html`: phòng 3D Three.js, ánh sáng, bóng đổ, camera chuyển ba khu, 9 điểm mở tư liệu và video. `museum-2-5d.html`: bản CSS phối cảnh. `exhibition.html`: triển lãm 2D (trang mặc định).

## Chạy
Chạy `python -m http.server 5174` trong thư mục này, truy cập http://localhost:5174/museum-3d.html. Bản 3D cần WebGL và Internet để tải Three.js, font, ảnh, video; không mở bằng file://.

## Deploy Vercel
Import repository, chọn Framework Preset **Other**, không có Build Command, Output Directory `.`. Mở đường dẫn `/museum-3d.html` sau deploy.

## Nội dung
Giáo trình người dùng cung cấp là nguồn chính. Chương 5 đối chiếu tr. 99–106. Chương 4/6 hiện là giới thiệu phạm vi, cần kiểm tra đầy đủ trước bản nộp. Ảnh BBC/Getty đang dùng chung để duyệt không gian, không mô tả sự kiện của từng hiện vật và chưa xác nhận quyền tái sử dụng. Video là tham khảo, chưa thẩm định toàn bộ. Đây là demo duyệt hình thức, chưa phải bản nội dung hoàn chỉnh.
