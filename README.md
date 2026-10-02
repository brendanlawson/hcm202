# DẤU ẤN — Ba cánh tư tưởng

Triển lãm 3D về Chương 4, 5, 6 Tư tưởng Hồ Chí Minh. JavaScript + Three.js, không build, không backend, không đăng nhập. Trang chính mở `museum-3d.html`.

## Chạy local

Trong thư mục dự án: `python -m http.server 5174`, mở http://localhost:5174/ (không mở file://).

## Tính năng

- Ba cánh trưng bày, ảnh tư liệu thật lưu local, camera chuyển khu, kéo nhìn quanh, zoom, 9 khung tương tác.
- 18 hồ sơ kiến thức (6/chương), tìm kiếm có/không dấu, lọc theo chương; từng hồ sơ có trang tham chiếu.
- Sơ đồ Đại đoàn kết sáu bước, dẫn chứng có nguồn, tác phẩm biểu tượng tập thể ở sảnh.
- Sổ tham quan, ghi chú cá nhân lưu localStorage, xuất TXT; không phải quiz/chấm điểm.
- Giao diện điện thoại, điều hướng bằng nút và bàn phím, giảm chuyển động theo thiết lập hệ thống. Khi CDN/WebGL lỗi, nội dung đọc và sổ vẫn hoạt động.
- Trang Nguồn có tác giả/quyền ảnh và liên kết tìm video YouTube (không phải video đã thẩm định).

## GitHub Pages

Giữ workflow `.github/workflows/static.yml`. Repository → Settings → Pages → Source: **GitHub Actions**. Push nhánh `main` sẽ tự deploy. Kiểm tra Actions có dấu xanh, sau đó mở https://brendanlawson.github.io/hcm202/ . Nếu thấy bản cũ, tải lại mạnh Ctrl+Shift+R. Không cần tạo deployment mới mỗi lần.

Vercel cũng hỗ trợ: Framework Other, không Build Command, Output Directory `.`.

## Nguồn và phạm vi

Kiến thức được diễn giải từ PDF giáo trình người dùng cung cấp: Ch4 tr.72–97, Ch5 tr.99–117, Ch6 tr.120–150. Tham chiếu là số trang in trên trang, không phải vị trí trong PDF. Đây là tổng quan các mục, không sao chép toàn văn hay thay thế giáo trình. Không đưa PDF gốc vào repo. Phần vận dụng theo bối cảnh bản giáo trình, không được coi là pháp luật cập nhật.

Ảnh và quyền sử dụng: xem `MEDIA.md` và nút Nguồn trên trang. Ảnh minh họa chương, không khẳng định minh họa trực tiếp từng ý. Sơ đồ sáu bước và câu hỏi suy ngẫm là thiết kế/diễn giải của nhóm, tách khỏi trích dẫn lịch sử.

Không gian là mô hình ý niệm tự dựng, khác tham quan panorama/scan hiện vật của VR3D và Bảo tàng Hồ Chí Minh. Không lấy mô hình hay panorama của hai trang đó.

Internet cần cho thư viện Three.js, font và liên kết ngoài; ảnh/kiến thức ở local. Muốn hoàn toàn offline cần tự lưu thư viện Three.js và font. Renderer chỉ vẽ lại khi camera/khung hình thay đổi; giới hạn DPR 1.5.

Các file `exhibition.html`, `museum-2-5d.html`, `room.*` là bản thiết kế cũ, không dùng làm bản nội dung chính thức.
