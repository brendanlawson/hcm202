# DẤU ẤN — Ba cánh tư tưởng

Triển lãm 3D về Chương 4, 5, 6 Tư tưởng Hồ Chí Minh. JavaScript + Three.js, không build, không backend, không đăng nhập. Trang chính mở `museum-3d.html`.

## Chạy local

Trong thư mục dự án: `python -m http.server 5174`, mở http://localhost:5174/ (không mở file://).

## Tính năng

- Ba cánh trưng bày, 10 ảnh thật lưu local, 9 khung không lặp ảnh. Camera chuyển khu có easing, OrbitControls cho kéo xoay/cuộn/pinch, nút xoay/zoom và bàn phím.
- 18 hồ sơ kiến thức (6/chương), tìm kiếm có/không dấu, lọc theo chương; từng hồ sơ có trang tham chiếu.
- Sơ đồ Đại đoàn kết sáu bước, dẫn chứng có nguồn, tác phẩm biểu tượng tập thể ở sảnh.
- Sổ tham quan, ghi chú tự lưu localStorage (350ms, lưu ngay khi chuyển hồ sơ/đóng), xuất TXT; không phải quiz/chấm điểm.
- Bố cục grid: phòng và bảng hồ sơ riêng, không chồng lên nhau; điện thoại có danh sách thu gọn. Có hướng dẫn, phóng to ảnh, focus/Escape, tìm kiếm không dấu, URL lưu chương/hồ sơ/bộ lọc.
- Chế độ nhẹ giảm DPR xuống 1 và tắt bóng đổ; giảm chuyển động theo thiết lập hệ thống. Khi WebGL lỗi, nội dung đọc và sổ vẫn hoạt động. `?mode=read` bỏ tải thư viện 3D hoàn toàn.
- Trang Nguồn có tác giả/quyền ảnh và liên kết tìm video YouTube (không phải video đã thẩm định).

## GitHub Pages

Giữ workflow `.github/workflows/static.yml`. Repository → Settings → Pages → Source: **GitHub Actions**. Push nhánh `main` sẽ tự deploy. Kiểm tra Actions có dấu xanh, sau đó mở https://brendanlawson.github.io/hcm202/ . Nếu thấy bản cũ, tải lại mạnh Ctrl+Shift+R. Không cần tạo deployment mới mỗi lần.

Chỉ triển khai GitHub Pages; không cần Vercel hoặc dịch vụ 3D bên thứ ba.

## Thao tác 3D

- Bấm **Hướng dẫn 3D** dưới phòng để thực hành 4 bước ngay trong không gian. Có thể đóng bất kỳ lúc nào; không tự chạy camera liên tục.
- Chạm một khung ảnh để tiến đến trước khung; chạm lại, dấu **+** hoặc **Đọc hồ sơ** để đọc. Viền vàng đánh dấu khung đang chọn.
- **‹ / ›** chuyển qua ba khung trong cánh hiện tại. Bấm tên khung để đặt lại góc gần; chọn lại chương để xem cả cánh; **Toàn cảnh** về sảnh.
- Kéo / cuộn / pinch hoặc dùng nút xoay, zoom. Khi focus trong canvas: **← / →**, **+ / −**, **[ / ]**, **Enter**, **Home**. Nút bấm là phương án thay thế cho cử chỉ.
- Giới hạn góc không bị nới sau mỗi lần kéo; thao tác nhiều ngón không mở nhầm hồ sơ. Camera ngừng nhận thao tác khi cửa sổ đọc mở. Zoom và xoay có thể ngắt chuyển góc; khung tự căn lại khi kích thước màn hình thay đổi.
- Hướng dẫn là hướng dẫn thao tác do nhóm viết, không phải tư liệu lịch sử. Không thêm game, chatbot hoặc nội dung kiến thức mới trong đợt chỉnh 3D này.

## Nguồn và phạm vi

Kiến thức được diễn giải từ PDF giáo trình người dùng cung cấp: Ch4 tr.72–97, Ch5 tr.99–117, Ch6 tr.120–150. Tham chiếu là số trang in trên trang, không phải vị trí trong PDF. Đây là tổng quan các mục, không sao chép toàn văn hay thay thế giáo trình. Không đưa PDF gốc vào repo. Phần vận dụng theo bối cảnh bản giáo trình, không được coi là pháp luật cập nhật.

Ảnh và quyền sử dụng: xem `MEDIA.md` và nút Nguồn trên trang. Ảnh minh họa chương, không khẳng định minh họa trực tiếp từng ý. Sơ đồ sáu bước và câu hỏi suy ngẫm là thiết kế/diễn giải của nhóm, tách khỏi trích dẫn lịch sử.

Không gian là mô hình ý niệm tự dựng, khác tham quan panorama/scan hiện vật của VR3D và Bảo tàng Hồ Chí Minh. Không lấy mô hình hay panorama của hai trang đó.

Three.js r170 + OrbitControls (MIT) được lưu tại `vendor/three`, có LICENSE. Font Be Vietnam Pro + Noto Serif (SIL OFL 1.1) lưu tại `assets/fonts`, có giấy phép. Không cần CDN/Google Fonts để chạy trang chính; Internet chỉ cần cho các liên kết ngoài. Chạy server local được khi offline; không phải PWA, không cam kết mở URL Pages khi không có mạng.

Renderer theo nhu cầu: dừng khi đứng yên hoặc tab ẩn, không đo layout trong vòng vẽ, chỉ dùng transform cho hotspot. Cache texture dùng chung; ảnh trong GPU giới hạn cạnh dài 512px, ảnh đọc/phóng to vẫn là bản local 960px. Bóng đổ tĩnh không tính lại liên tục. Giới hạn DPR 1.5 (chế độ nhẹ 1), shadow map 1024. Bộ điều khiển có giới hạn xoay/zoom để giảm khả năng xuyên tường; không phải trình mô phỏng đi bộ.

## Kiểm tra

`node tests/content.test.mjs` kiểm tra 18 hồ sơ, 10 ảnh/nguồn, 9 ảnh khác nhau trong phòng, file thư viện và font/giấy phép; kiểm tra logic tap/drag/pinch/hủy cử chỉ. Xem `QA.md` cho các kiểm tra trình duyệt. Không có benchmark FPS đa thiết bị.

Các file `exhibition.html`, `museum-2-5d.html`, `room.*` là bản thiết kế cũ, không dùng làm bản nội dung chính thức.
