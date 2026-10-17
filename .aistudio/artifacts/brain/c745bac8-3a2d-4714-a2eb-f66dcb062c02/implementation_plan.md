# Hoàn Thiện Đồng Bộ Khung Ruy-Băng, Nâng Cấp Enzyme DNA Polymerase III Chuẩn PDB & Hiệu Ứng Laser Sinh Học

Kế hoạch giải quyết triệt để vấn đề 2 dải ruy-băng ăn khớp khít khao với các bậc thang ở giữa (tự động co giãn theo dải), tái thiết kế mô hình 3D Enzyme DNA Polymerase III sang chuẩn cấu trúc bậc 2 PDB (chuỗi xoắn alpha-helix và phiến gấp beta-sheet), cùng hệ thống hiệu ứng đặc biệt: tia laser sinh học quét dọc trục phân tử và trường hạt năng lượng phát quang.

---

## Quyết Định Người Dùng & Các Lựa Chọn Đã Xác Nhận

> [!IMPORTANT]
> Dựa trên phản hồi trong phiên phỏng vấn tương tác (Clarifying Answers):
> - **Cơ chế ăn khớp 2 dải ruy-băng Model 3**: Bậc thang base nitơ được neo trực tiếp vào 2 dải ruy-băng và tự động co giãn kích thước theo độ mở rộng của dải, đảm bảo luôn ăn khớp 100%, không bị hở hay lệch vị trí.
> - **Tạo hình Enzyme DNA Polymerase III**: Thiết kế theo chuẩn cấu trúc bậc hai PDB sinh học phân tử với các bó chuỗi xoắn lò xo **Alpha-Helix**, phiến gấp dải phẳng **Beta-Sheet** có mũi tên định hướng, kết hợp vòng kẹp trượt **Beta-Sliding Clamp** vàng kim loại sang trọng.
> - **Hiệu ứng đặc biệt giao diện**: Tích hợp mặt phẳng **Tia Laser Sinh Học (Bio-Laser Scanner)** quét tự động dọc thân DNA cùng trường **Hạt Năng Lượng Phát Quang (Bioluminescent Quantum Sparks)** và bảng giải mã quang phổ thời gian thực.

---

## 1. Tổng Quan & Trải Nghiệm Cốt Lõi

1. **Khắc Phục Ăn Khớp Dải Ruy-Băng & Bậc Thang (Model 3 Cartoon)**:
   - Tính toán điểm neo chính xác (`anchorA` và `anchorB`) trên đường cong của hai dải ruy-băng tương ứng với từng cặp base.
   - Bậc thang phân tử gồm 2 nửa gắn mộng trực tiếp vào dải, kéo dài hướng tâm gặp nhau ở trục giữa với khe liên kết hydro phát sáng. Khi người dùng kéo thanh trượt khoảng cách hoặc tách dải, các bậc thang tự động co giãn mượt mà theo thời gian thực mà không bao giờ bị hở mối nối.

2. **Mô Hình Enzyme DNA Polymerase III Đạt Chuẩn Tinh Thể PDB**:
   - Miền **Ngón tay (Fingers)**: Gồm các ống xoắn ốc alpha-helix đan xen, có chuyển động gập mở cơ học (conformational change) khi đón nhận nucleotide tự do dNTP.
   - Miền **Lòng bàn tay (Palm)**: Cấu trúc phiến gấp beta-sheet song song mang 2 ion xúc tác $Mg^{2+}$ điện tích xanh cyan rực rỡ và liên kết phối trí aspartate.
   - Miền **Ngón cái (Thumb)**: Bó xoắn alpha ôm trọn và dẫn hướng chuỗi duplex con vừa tổng hợp thoát ra ngoài.
   - Vòng **Kẹp trượt $\beta$ (Sliding Clamp)**: Dimer vành khuyên màu vàng hoàng kim bóng gương PBR, có bản lề đóng mở và rãnh trượt chuẩn 35Å.

3. **Hệ Thống Hiệu Ứng Tia Laser Sinh Học & Hạt Năng Lượng**:
   - Mặt phẳng quét quang học (Bio-Laser Scanning Plane) màu xanh ngọc/cyan phát quang quét tuần hoàn dọc trục Y của DNA.
   - Khi laser lướt qua cặp nucleotide nào, cặp nucleotide đó phát sáng kích hoạt hiệu ứng huỳnh quang kèm HUD hiển thị phân tích phổ: Cặp base, khoảng cách Van der Waals, số liên kết H, năng lượng liên kết $\Delta G$.
   - Trường hạt phát quang sinh học (Bioluminescent sparks) bay lơ lửng theo chuyển động Brown quanh chuỗi xoắn kép.

---

## 2. Kiến Trúc Kỹ Thuật & Sơ Đồ Hệ Thống

```
┌────────────────────────────────────────────────────────────────────────┐
│                          3D DNA STUDIO ENGINE                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                      Three.js Scene Root                       │   │
│   │                                                                │   │
│   │   ┌───────────────────┐    ┌───────────────────────────────┐   │   │
│   │   │   DNA Duplex      │    │   DNA Polymerase III (PDB)    │   │   │
│   │   │  - Ribbons A & B  │    │  - Coiled Alpha-Helices       │   │   │
│   │   │  - Dynamic Rungs  │    │  - Arrow Beta-Sheet Ribbons   │   │   │
│   │   │    (Self-Stretch) │    │  - Sliding Clamp (Gold Torus) │   │   │
│   │   │  - H-Bond Tethers │    │  - 2x Mg²⁺ Glowing Ions       │   │   │
│   │   └─────────┬─────────┘    │  - Dynamic dNTP Docking       │   │   │
│   │             │              └───────────────┬───────────────┘   │   │
│   │             ▼                              │                   │   │
│   │   ┌────────────────────────────────────────▼───────────────┐   │   │
│   │   │   Bio-Laser Scanner & Bioluminescent Spark System      │   │   │
│   │   │  - Sweeping Laser Plane (Cyan/Emerald Fresnel Glow)    │   │   │
│   │   │  - Real-time Height Intersect Detection                │   │   │
│   │   │  - Ambient Brownian Particle Field                     │   │   │
│   │   └────────────────────────────────────────────────────────┘   │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                   Interactive Scientific HUD                   │   │
│   │  - Laser Scanner Toggle & Speed Control                        │   │
│   │  - Polymerase PDB Subdomain Telemetry (Palm / Fingers / Thumb) │   │
│   │  - Real-time Scanning Spectral Analysis Overlay                │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Kế Hoạch Triển Khai Chi Tiết

### Giai Đoạn 1: Sửa Triệt Để Cơ Chế Ăn Khớp Dải Ruy-Băng & Bậc Thang (Model 3)
- Trích xuất tọa độ chính xác của Ribbon A (`ptA`) và Ribbon B (`ptB`) tại độ cao $Y$ tương ứng của từng cặp base trong chuỗi xoắn.
- Xây dựng lại hình học bậc thang (rungs):
  - Nửa bậc thang A bắt đầu đúng từ bề mặt Ribbon A và kéo dài đến tâm chuỗi.
  - Nửa bậc thang B bắt đầu đúng từ bề mặt Ribbon B và kéo dài đến tâm chuỗi.
  - Chiều dài của bậc thang được tính động: `rungLength = distance(ptA, ptB) / 2 - hBondGap / 2`.
  - Kết quả: Khi người dùng kéo tách 2 dải hoặc thay đổi hình thái (B-DNA, A-DNA, Z-DNA), bậc thang tự động co giãn tương thích hoàn toàn, không có bất kỳ khoảng hở nào.

### Giai Đoạn 2: Nâng Cấp Mô Hình Enzyme DNA Polymerase III Chuẩn PDB
- Tái cấu trúc module `DNAPolymerase3D.ts`:
  - **Alpha-Helix Geometries**: Tạo các đường cong xoắn lò xo 3D (`HelixCurve`) và bọc bằng `TubeGeometry` với vật liệu protein men ngọc cao cấp.
  - **Beta-Sheet Ribbons**: Tạo các dải ribbon dẹt uốn lượn có đầu nhọn hình mũi tên chỉ hướng $N \to C$ chuẩn sách giáo khoa sinh học phân tử quốc tế.
  - **Beta-Sliding Clamp**: Nâng cấp vành khuyên dimer kép với rãnh khóa liên kết và bề mặt phản chiếu kim loại vàng 24K chân thật.
  - **Miền Fingers linh hoạt**: Cập nhật góc gập mở ngón tay theo chu kỳ xúc tác bắt cặp nucleotide dNTP.
  - **Trung tâm hoạt động Mg²⁺**: Tăng cường hiệu ứng quầng sáng điện tích và tia liên kết phối trí với cơ chất dNTP.

### Giai Đoạn 3: Tích Hợp Tia Laser Quét Phân Tử & Trường Hạt Năng Lượng
- Xây dựng cụm đối tượng 3D `BioLaserScanner`:
  - Mặt phẳng quét bán trong suốt phát sáng với viền laser cyan/emerald quét lên xuống theo hàm $\sin(time)$.
  - Tích hợp phát hiện giao cắt (intersection) với cặp base đang được quét để làm bừng sáng nhẹ cặp base đó trong giây lát.
  - Bổ sung hiệu ứng âm thanh quét quang phổ vi mô khi laser đi qua các điểm mốc quan trọng (qua `soundFx`).
- Nâng cấp trường hạt năng lượng (Bioluminescent sparks) chuyển động lơ lửng xung quanh phân tử DNA tạo không gian phòng thí nghiệm sinh học lượng tử huyền ảo.
- Bổ sung nút chuyển đổi bật/tắt Laser Scanner trên thanh điều khiển đáy màn hình.

---

## 4. Kiểm Thử & Đảm Bảo Chất Lượng

- Kiểm tra trực quan cả 3 Model: Model 1 (Que & Bi Chrome), Model 2 (Không Gian Van der Waals), Model 3 (Dải Ruy-băng & Bậc thang co giãn) ở mọi mức độ tách dải từ 0% đến 100%.
- Kiểm tra độ mượt mà của hoạt ảnh DNA Polymerase III chuẩn PDB với tốc độ 60fps trên WebGL.
- Kiểm tra hoạt động quét của tia laser, độ tương phản ánh sáng và tính ổn định khi bật/tắt toàn bộ hiệu ứng.
- Chạy `compile_applet` và `lint_applet` để xác thực toàn bộ TypeScript code.
