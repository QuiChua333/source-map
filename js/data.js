/* =========================================================
   DỮ LIỆU TOUR · Ninh Chữ - Vĩnh Hy 2N2Đ
   Company Trip 2026 · Đoàn Vina Takeuchi · Đêm 13 – 15/8/2026
   Nguồn: Chương trình chính thức Viet Sun Travel (PDF)
   - order: thứ tự hiển thị (1..13)
   - leg:   'go' (lượt đi) | 'back' (lượt về) | 'pivot' (resort - giao điểm)
   - boat:  true nếu là điểm tham quan bằng tàu trong Vịnh Vĩnh Hy
   - detail: MẢNG các ý (mỗi phần tử là 1 gạch đầu dòng)
   - lat/lng: tọa độ tương đối; các điểm trong vịnh có thể tự chỉnh theo bản đồ vệ tinh.
   ========================================================= */
const TOUR_DATA = [
  {
    order: 1,
    title: "Khởi hành từ TP.HCM",
    time: "Đêm 13/8 · 23:00",
    lat: 10.851644,
    lng: 106.6293273,
    leg: "go",
    icon: "fa-bus",
    short:
      "Điểm đón: Tòa nhà Anna, cổng Quốc lộ 1A, Công viên phần mềm Quang Trung, Quận 12.",
    detail: [
      "23:00 đêm 13/8: xe và HDV Việt Sun đón Quý khách tại điểm hẹn – Tòa nhà Anna, cổng Quốc lộ 1A, Công viên phần mềm Quang Trung (QTSC), Quận 12.",
      "Ổn định chỗ ngồi, sắp xếp hành lý và khởi hành đi Ninh Thuận.",
      "Nghỉ đêm trên xe; tham gia chương trình đố vui & giải trí cùng HDV để giữ năng lượng cho hành trình 'Chạm Miền Biển Ngọc'.",
    ],
    images: [
      "https://www.galaxyoffice.vn/wp-content/uploads/images/building/2021-09-toa-nha-anna-building-quan-12-1.jpg",
    ],
  },
  {
    order: 2,
    title: "Hang Rái, Ninh Thuận",
    time: "Ngày 14/8 · Sáng sớm (sau 05:30)",
    lat: 11.6776331,
    lng: 109.1817122,
    leg: "go",
    icon: "fa-mountain-sun",
    short:
      'Tham quan bãi đá san hô cổ, hiện tượng "thác nước trên biển" độc đáo.',
    detail: [
      "05:30: dùng bữa sáng tại nhà hàng, sau đó di chuyển đến Hang Rái.",
      "Tham quan bãi đá san hô cổ – tuyệt tác thiên nhiên của Ninh Thuận.",
      "Ngắm hiện tượng 'thác nước trên biển' độc đáo khi sóng tràn qua ghềnh đá.",
      "Check-in khung cảnh biển – núi hùng vĩ, vùng đất đầy nắng và gió.",
    ],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Hang_R%C3%A1i_in_Ninh_Thuan_Province%2C_Vietnam.jpg/960px-Hang_R%C3%A1i_in_Ninh_Thuan_Province%2C_Vietnam.jpg",
      "https://i.ytimg.com/vi/1i3K8yuhhT8/hqdefault.jpg",
      "https://bizweb.dktcdn.net/100/342/038/articles/tour-hang-rai-vuon-nho-2a916e54-5ff5-4b9d-86a4-4ac96c32d127.jpg?v=1766908381033",
    ],
  },
  {
    order: 3,
    title: "Bến tàu Vịnh Vĩnh Hy",
    time: "Ngày 14/8 · 08:30 (khởi hành tàu)",
    lat: 11.7238384,
    lng: 109.1971013,
    leg: "go",
    icon: "fa-anchor",
    short: "Lên tàu đáy kính tại bến Vĩnh Hy, bắt đầu khám phá vịnh.",
    detail: [
      "08:30: đoàn đến bến tàu Vĩnh Hy – một trong những vịnh biển đẹp nhất Việt Nam.",
      "Nhận áo phao và nghe HDV hướng dẫn an toàn.",
      "Lên tàu đáy kính bắt đầu hành trình chạy vòng quanh vịnh (các điểm tiếp theo).",
    ],
    images: [
      "https://imagevietnam.vnanet.vn//MediaUpload/Org/2023/05/26/226-9-31-34.jpg",
      "https://divui.com/content/images/thumbs/0026978_tour-01-tham-quan-vinh-va-ngam-san-ho-bang-tau-day-kinh.jpeg",
      "https://vinhhydiscovery.com/wp-content/uploads/2024/11/tour-lan-bien-ngam-san-ho-vinh-hy.jpg",
    ],
  },
  {
    order: 4,
    title: "Mũi Cá Ông",
    time: "Ngày 14/8 · ~09:00",
    lat: 11.7145351,
    lng: 109.2059522,
    leg: "go",
    boat: true,
    icon: "fa-camera",
    short: "Tàu vòng vịnh ngắm Mũi Cá Ông và Đá Robot từ phía biển.",
    detail: [
      "Tàu chạy dọc cửa vịnh, ngắm Mũi Cá Ông – mũi đá nhô ra biển với hình thù độc đáo.",
      "Ngắm Đá Robot – khối đá tự nhiên giống hình người máy.",
      "Chiêm ngưỡng làng chài Vĩnh Hy và những lồng bè nuôi cá từ phía biển.",
      "Điểm check-in mở đầu cho hành trình khám phá vịnh.",
    ],
    images: [
      "https://resortvinhhy.com/wp-content/uploads/2025/04/z5879651979625_99cd82bac97491d4560875135912fe90.jpg",
    ],
  },
  {
    order: 5,
    title: "Hang Yến",
    time: "Ngày 14/8 · ~09:15",
    lat: 11.7062394,
    lng: 109.2027207,
    leg: "go",
    boat: true,
    icon: "fa-dove",
    short: "Hang đá ven vách núi nơi chim yến làm tổ tự nhiên.",
    detail: [
      "Tàu ghé khu vực Hang Yến – hang đá ven vách núi nơi chim yến làm tổ tự nhiên.",
      "Chiêm ngưỡng hàng trăm tổ yến trên vách đá dựng đứng.",
      "Trên cung đường thấp thoáng khu nghỉ dưỡng Amanoi 6 sao trên sườn núi.",
    ],
    images: [
      "https://live.staticflickr.com/4448/37606048361_6e813eee3f_b.jpg",
      "https://datviettour.com.vn/uploads/images/mien-trung/ninh-chu/hinh-danh-thang/vinh-hy-hang-yen.jpg",
    ],
  },
  {
    order: 6,
    title: "Hòn Rùa",
    time: "Ngày 14/8 · ~09:30 – 11:00",
    lat: 11.7170344,
    lng: 109.2203565,
    leg: "go",
    boat: true,
    icon: "fa-fish",
    short: "Hòn Rùa chắn cửa vịnh; lặn ngắm san hô, chèo SUP ở Bãi Câu.",
    detail: [
      "Phía ngoài cửa vịnh là Hòn Rùa – đảo đá hình con rùa khổng lồ trườn ra biển.",
      "Hòn Rùa chắn sóng gió, tạo nên vùng nước lặng cho cả vịnh.",
      "Dưới chân là Bãi Câu – vùng nước lặng nhất vịnh, lý tưởng để chèo SUP.",
      "Lặn ngắm rạn san hô khu bảo tồn Vườn Quốc gia Núi Chúa (hơn 350 loài) bằng kính lặn, ống thở (~30–45 phút).",
    ],
    images: [
      "https://cdn3.ivivu.com/2024/10/bai-hon-rua-ivivu-7.jpg",
      "https://lalago.vn/wp-content/uploads/2025/07/hon-rua-1.jpg",
      "https://static-images.vnncdn.net/files/publish/2023/10/15/48h-o-vinh-hy-di-tim-vien-ngoc-tho-mau-ngoc-bich-cam-trai-don-binh-minh-1205.jpg?width=0&s=7tM0MFEzKFLTuMrMIMw6sA",
    ],
  },
  {
    order: 7,
    title: "Bãi Cóc (Vĩnh Hy)",
    time: "Ngày 14/8 · ~11:00",
    lat: 11.7200311,
    lng: 109.2038915,
    leg: "go",
    boat: true,
    icon: "fa-umbrella-beach",
    short: "Bãi tắm đẹp nhất vịnh, nước nông trong xanh – tự do tắm biển.",
    detail: [
      "Tàu đưa đoàn vào Bãi Cóc – được xem là bãi tắm đẹp nhất Vịnh Vĩnh Hy.",
      "Làn nước nông trong xanh (chỉ khoảng 1–1.5m), an toàn cho mọi người.",
      "Tự do tắm biển, thư giãn và check-in giữa khung cảnh biển trời trong lành.",
    ],
    images: [
      "https://mia.vn/media/uploads/blog-du-lich/bai-coc-vinh-hy-tam-bien-1755053209.jpg",
      "https://vinhhydiscovery.com/wp-content/uploads/2024/11/tour-lan-bien-ngam-san-ho-vinh-hy-3.jpg",
      "https://mia.vn/media/uploads/blog-du-lich/bai-coc-vinh-hy-nuoc-bien-1755053209.jpg",
    ],
  },
  {
    order: 8,
    title: "Nhà Bè nổi Vĩnh Hy (Bữa trưa)",
    time: "Ngày 14/8 · 12:30",
    lat: 11.7178249,
    lng: 109.2041031,
    leg: "go",
    boat: true,
    icon: "fa-utensils",
    short: "Bữa trưa hải sản tươi sống trên nhà bè nổi giữa vịnh.",
    detail: [
      "12:30: dùng bữa trưa ngay trên nhà bè nổi neo giữa Vịnh Vĩnh Hy.",
      "Thưởng thức các món hải sản tươi sống đặc trưng của vùng biển Vĩnh Hy.",
      "Không gian bè nổi sát khu nuôi cá lồng bè, view non nước hữu tình.",
      "Sau bữa trưa, tàu đưa đoàn quay về bến.",
    ],
    images: [
      "https://vietnamjour.com/wp-content/uploads/2025/06/nha-be-ut-thanh-vinh-hy.webp",
      "https://ticotravel.com.vn/wp-content/uploads/2024/12/nha-hang-vinh-hy-10.jpg",
    ],
  },
  {
    order: 9,
    title: "Về lại bến tàu Vĩnh Hy",
    time: "Ngày 14/8 · ~13:30",
    lat: 11.7238384,
    lng: 109.1971013,
    leg: "go",
    icon: "fa-anchor",
    short: "Tàu cập bến, kết thúc hành trình tham quan vịnh, lên xe về resort.",
    detail: [
      "Kết thúc hành trình trên Vịnh Vĩnh Hy, tàu đưa đoàn quay lại bến tàu.",
      "Đoàn lên xe, tạm biệt 'miền biển ngọc' để về resort nghỉ ngơi.",
    ],
    images: [
      "https://imagevietnam.vnanet.vn//MediaUpload/Org/2023/05/26/226-9-31-34.jpg",
      "https://divui.com/content/images/thumbs/0026978_tour-01-tham-quan-vinh-va-ngam-san-ho-bang-tau-day-kinh.jpeg",
      "https://vinhhydiscovery.com/wp-content/uploads/2024/11/tour-lan-bien-ngam-san-ho-vinh-hy.jpg",
    ],
  },
  {
    order: 10,
    title: "Sài Gòn - Ninh Chữ Resort 4★",
    time: "Ngày 14/8 · 16:00 → Ngày 15/8 · 11:00",
    lat: 11.5838,
    lng: 109.0296,
    leg: "pivot",
    icon: "fa-hotel",
    short:
      'Teambuilding 2026 & Gala Dinner "Bước Đệm Vững Vàng – Tăng Tốc Tương Lai".',
    detail: [
      "16:00: về Resort 4★ Sài Gòn – Ninh Chữ nghỉ ngơi, nhận phòng.",
      "Teambuilding bãi biển 'TEAMBUILDING 2026' với chuỗi trò chơi gắn kết, giải thưởng phong phú.",
      "18:00: Gala Dinner 'Bước Đệm Vững Vàng – Tăng Tốc Tương Lai' – MC hoạt náo, BLĐ khui champagne, gameshow, trao giải teambuilding & rút thăm may mắn, văn nghệ – karaoke.",
      "22:00: tự do khám phá Vĩnh Hy về đêm; nghỉ đêm tại resort.",
      "Ngày 15/8: buffet sáng (07:00), tự do nghỉ ngơi và trả phòng lúc 11:00.",
    ],
    images: [
      "https://saigontourist.com.vn/files/images/luu-tru/luu-tru-mien-trung/saigonninhchuhotel-1.jpg",
      "https://saigontourist.com.vn/files/images/luu-tru/luu-tru-mien-trung/saigonninhchuhotel-3.jpg",
      "https://saigonninhchuhotel.com.vn/wp-content/uploads/2021/05/DJI_0344-choose.jpg",
      "https://saigonninhchuhotel.com.vn/wp-content/uploads/2021/05/R6_3588-choose-770x678.jpg",
      "https://saigontourist.com.vn/files/images/luu-tru/luu-tru-mien-trung/saigonninhchuhotel-2.jpg",
      "https://saigontourist.com.vn/files/images/luu-tru/luu-tru-mien-trung/saigonninhchuhotel-4.jpg",
      "https://saigontourist.com.vn/files/images/luu-tru/luu-tru-mien-trung/saigonninhchuhotel-5.jpg",
      "https://saigonninhchuhotel.com.vn/wp-content/uploads/2019/06/Hotel-landscape-1.jpg",
    ],
  },
  {
    order: 11,
    title: "Vườn Nho",
    time: "Ngày 15/8 · Trưa (sau khi trả phòng)",
    lat: 11.5443,
    lng: 108.9526,
    leg: "back",
    icon: "fa-seedling",
    short:
      "Điểm ghé bắt buộc: tham quan, chụp ảnh và thưởng thức nho tươi tại vườn.",
    detail: [
      "Sau khi trả phòng và dùng cơm trưa, trên đường về đoàn ghé thăm vườn nho.",
      "Tham quan, check-in giữa những giàn nho xanh mướt trĩu quả đặc trưng Ninh Thuận.",
      "Thưởng thức nho tươi hái tại vườn.",
      "Mua đặc sản làm quà: nho khô, mật nho, rượu vang nho, táo Ninh Thuận.",
    ],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/V%C6%B0%E1%BB%9Dn_Nho_%E1%BB%9F_Phan_Rang%2C_Ninh_Thu%E1%BA%ADn.JPG/960px-V%C6%B0%E1%BB%9Dn_Nho_%E1%BB%9F_Phan_Rang%2C_Ninh_Thu%E1%BA%ADn.JPG",
      "https://media.vietravel.com/images/Content/vuon-nho-ninh-thuan-4.jpg",
      "https://media.vietravel.com/images/Content/vuon-nho-ninh-thuan-7.jpg",
    ],
  },
  {
    order: 12,
    title: "Bò Sữa Long Thành, Đồng Nai",
    time: "Ngày 15/8 · Buổi chiều",
    lat: 10.8918763,
    lng: 107.3663439,
    leg: "back",
    icon: "fa-mug-hot",
    short: "Trạm dừng chân mua đặc sản, thưởng thức sữa bò tươi.",
    detail: [
      "Tiếp tục hành trình về lại TP.HCM, đoàn dừng chân tại trạm Bò Sữa Long Thành.",
      "Thưởng thức các sản phẩm sữa bò tươi: sữa thanh trùng, sữa chua, bánh sữa, kẹo sữa.",
      "Mua đặc sản làm quà và nạp lại năng lượng trước chặng cuối của hành trình.",
    ],
    images: [
      "https://posapp.vn/wp-content/uploads/2021/01/tram-dung-chan-bo-sua-long-thanh-2.jpg",
      "https://statics.vntrip.vn/data-v2/data-guide/img_content/1461749091_long-thanh-vung-tau-4.jpg",
      "https://statics.vntrip.vn/data-v2/data-guide/img_content/1461749091_long-thanh-vung-tau-3.jpg",
    ],
  },
  {
    order: 13,
    title: "Về đến TP.HCM",
    time: "Ngày 15/8 · 18:30",
    lat: 10.851644,
    lng: 106.6293273,
    leg: "back",
    icon: "fa-flag-checkered",
    short: "Trả khách về lại điểm đón ban đầu. Chia tay đoàn – hẹn gặp lại.",
    detail: [
      "18:30: xe đưa đoàn về đến điểm đón ban đầu – Tòa nhà Anna, QTSC, Quận 12.",
      "HDV Việt Sun chia tay đoàn, hẹn gặp lại Quý khách Vina Takeuchi trong những chương trình tiếp theo.",
      "Kết thúc Company Trip 2026 'Ninh Chữ – Vĩnh Hy: Chạm Miền Biển Ngọc' với tinh thần 'Bước Đệm Vững Vàng – Tăng Tốc Tương Lai'.",
    ],
    images: [
      "https://niceoffice.com.vn/wp-content/uploads/2024/11/toa-nha-anna-building-khu-pham-mem-quang-trung-quan-12-600x450.jpg",
      "https://www.galaxyoffice.vn/wp-content/uploads/images/building/2021-09-toa-nha-anna-building-quan-12-1.jpg",
      "https://niceoffice.com.vn/wp-content/uploads/2024/11/van-phong-cho-thue-quan-12-toa-nha-anna-building-600x450.jpg",
    ],
  },
];

/* =========================================================
   CẤU HÌNH CHẶNG (SEGMENTS) & TUYẾN  (index theo TOUR_DATA, 0..12)
   - mode: 'drive' (đường bộ - lấy thời gian từ Directions) | 'boat' (đường tàu trong vịnh)
   - route: 'go' | 'back'
   - legIdx: vị trí chặng trong mảng legs[] mà Directions trả về cho tuyến đó
   GO_STOPS / BACK_STOPS: các điểm đi ĐƯỜNG BỘ của mỗi tuyến (gọi Directions, bỏ qua điểm tàu)
   BOAT_PATH: chuỗi điểm trong vịnh, nối bằng đường tàu nét đứt (vòng khép kín bến → ... → bến)
   ========================================================= */
const GO_STOPS = [0, 1, 2, 9];        // HCM → Hang Rái → bến Vĩnh Hy → Resort (bỏ các điểm tàu)
const BACK_STOPS = [9, 10, 11, 12];   // Resort → Vườn Nho → Long Thành → HCM
const BOAT_PATH = [2, 3, 4, 5, 6, 7, 8]; // bến → Mũi Cá Ông → Hang Yến → Hòn Rùa → Bãi Cóc → bè nổi → về bến

const SEGMENTS = [
  { from: 0, to: 1, mode: "drive", route: "go", legIdx: 0 },    // HCM → Hang Rái
  { from: 1, to: 2, mode: "drive", route: "go", legIdx: 1 },    // Hang Rái → bến Vĩnh Hy
  { from: 2, to: 3, mode: "boat", route: "go" },                // bến → Mũi Cá Ông
  { from: 3, to: 4, mode: "boat", route: "go" },                // Mũi Cá Ông → Hang Yến
  { from: 4, to: 5, mode: "boat", route: "go" },                // Hang Yến → Hòn Rùa
  { from: 5, to: 6, mode: "boat", route: "go" },                // Hòn Rùa → Bãi Cóc
  { from: 6, to: 7, mode: "boat", route: "go" },                // Bãi Cóc → bè nổi
  { from: 7, to: 8, mode: "boat", route: "go" },                // bè nổi → về bến
  { from: 8, to: 9, mode: "drive", route: "go", legIdx: 2 },    // bến Vĩnh Hy → Resort (đường bộ)
  { from: 9, to: 10, mode: "drive", route: "back", legIdx: 0 }, // Resort → Vườn Nho
  { from: 10, to: 11, mode: "drive", route: "back", legIdx: 1 },// Vườn Nho → Long Thành
  { from: 11, to: 12, mode: "drive", route: "back", legIdx: 2 },// Long Thành → HCM
];
