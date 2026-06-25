/* =========================================================
   DỮ LIỆU TOUR · Ninh Chữ - Vĩnh Hy 2N2Đ
   Company Trip 2026 · Đoàn Vina Takeuchi · Đêm 13 – 15/8/2026
   Nguồn: Chương trình chính thức Viet Sun Travel (PDF)
   - order: thứ tự hiển thị (1..8)
   - leg:   'go' (lượt đi) | 'back' (lượt về) | 'pivot' (resort - giao điểm)
   - boat:  true nếu chặng tới điểm này đi bằng tàu (không vẽ đường bộ)
   - lat/lng: tọa độ tương đối, kiểm tra lại với đối tác nếu cần độ chính xác cao
   ========================================================= */
const TOUR_DATA = [
  {
    order: 1,
    title: "Khởi hành từ TP.HCM",
    time: "Đêm 13/8 · 23:00",
    lat: 10.84905,
    lng: 106.62598,
    leg: "go",
    icon: "fa-bus",
    short:
      "Điểm đón: Tòa nhà Anna, cổng Quốc lộ 1A, Công viên phần mềm Quang Trung, Quận 12.",
    detail:
      "23:00 đêm 13/8, xe và HDV Việt Sun đón Quý khách tại điểm hẹn – Tòa nhà Anna, cổng Quốc lộ 1A, Công viên phần mềm Quang Trung (QTSC), Quận 12. Đoàn khởi hành đi Ninh Thuận, nghỉ ngơi qua đêm trên xe và tham gia các chương trình đố vui & giải trí cùng HDV để giữ năng lượng cho hành trình 'Chạm Miền Biển Ngọc' vào sáng hôm sau.",
    images: [
      "https://www.galaxyoffice.vn/wp-content/uploads/images/building/2021-09-toa-nha-anna-building-quan-12-1.jpg",
      "https://niceoffice.com.vn/wp-content/uploads/2024/11/van-phong-cho-thue-quan-12-toa-nha-anna-building-600x450.jpg",
      "https://www.galaxyoffice.vn/wp-content/uploads/images/building/2021-09-sanh-le-tan-anna-building.jpg",
      "https://www.galaxyoffice.vn/wp-content/uploads/images/building/2021-09-ben-trong-toa-nha-anna-building-1.jpg",
    ],
  },
  {
    order: 2,
    title: "Hang Rái, Ninh Thuận",
    time: "Ngày 14/8 · Sáng sớm (sau 05:30)",
    lat: 11.6462,
    lng: 109.1558,
    leg: "go",
    icon: "fa-mountain-sun",
    short:
      'Tham quan bãi đá san hô cổ, hiện tượng "thác nước trên biển" độc đáo.',
    detail:
      "Sau bữa sáng tại nhà hàng lúc 05:30, đoàn di chuyển đến Hang Rái – tuyệt tác thiên nhiên của Ninh Thuận, nổi tiếng với bãi đá san hô cổ, khung cảnh biển trời hùng vĩ và hiện tượng 'thác nước trên biển' độc đáo. Đây là điểm check-in không thể bỏ qua khi đến với vùng đất đầy nắng và gió Ninh Thuận, mang đến cho du khách những khoảnh khắc chụp ảnh vô cùng ấn tượng.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Hang_R%C3%A1i_in_Ninh_Thuan_Province%2C_Vietnam.jpg/960px-Hang_R%C3%A1i_in_Ninh_Thuan_Province%2C_Vietnam.jpg",
      "https://i.ytimg.com/vi/1i3K8yuhhT8/hqdefault.jpg",
      "https://bizweb.dktcdn.net/100/342/038/articles/tour-hang-rai-vuon-nho-2a916e54-5ff5-4b9d-86a4-4ac96c32d127.jpg?v=1766908381033",
    ],
  },
  {
    order: 3,
    title: "Vịnh Vĩnh Hy",
    time: "Ngày 14/8 · 08:30 – 11:00",
    lat: 11.7092,
    lng: 109.2038,
    leg: "go",
    icon: "fa-water",
    short: "Tàu đáy kính tham quan vịnh, lặn ngắm san hô, chèo SUP.",
    detail:
      "08:30 đoàn khởi hành đến bến tàu Vĩnh Hy – một trong những vịnh đẹp nhất Việt Nam. Tàu đáy kính đưa đoàn tham quan các thắng cảnh nổi bật như Mũi Cá Ông, Đá Robot, Hang Yến hoặc Hòn Rùa (tùy điều kiện thời tiết). Sau đó, đội ngũ HDV trang bị kính lặn, ống thở, áo phao và hướng dẫn kỹ năng lặn biển, chèo SUP an toàn để Quý khách chiêm ngưỡng những rạn san hô rực rỡ cùng hệ sinh thái biển phong phú đặc trưng của Vịnh Vĩnh Hy.",
    images: [
      "https://imagevietnam.vnanet.vn//MediaUpload/Org/2023/05/26/226-9-31-34.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Vinh_hy_bay.jpg/960px-Vinh_hy_bay.jpg",
      "https://vinhhydiscovery.com/wp-content/uploads/2024/11/tour-lan-bien-ngam-san-ho-vinh-hy.jpg",
    ],
  },
  {
    order: 4,
    title: "Bãi Cóc (Vĩnh Hy)",
    time: "Ngày 14/8 · 11:00 – 13:30",
    lat: 11.702,
    lng: 109.214,
    leg: "go",
    boat: true,
    icon: "fa-umbrella-beach",
    short: "Tắm biển, thư giãn và thưởng thức bữa trưa hải sản trên bè.",
    detail:
      "Tàu đưa đoàn vào Bãi Cóc – bãi tắm hoang sơ với làn nước trong xanh nằm trong khu vực Vịnh Vĩnh Hy. Quý khách tự do tắm biển, thư giãn giữa không gian biển trời trong lành. 12:30 đoàn thưởng thức bữa trưa với các món hải sản tươi sống đặc trưng được phục vụ ngay trên bè nổi giữa Vịnh – một trải nghiệm ẩm thực khó quên. (Tọa độ Bãi Cóc là tương đối, điểm đến bằng tàu từ bến Vĩnh Hy.)",
    images: [
      "https://mia.vn/media/uploads/blog-du-lich/bai-coc-vinh-hy-tam-bien-1755053209.jpg",
      "https://vinhhydiscovery.com/wp-content/uploads/2024/11/tour-lan-bien-ngam-san-ho-vinh-hy-3.jpg",
      "https://vinhhydiscovery.com/wp-content/uploads/2024/12/tau-day-kinh-vinh-hy-discovery-25-600x400.jpg",
      "https://mia.vn/media/uploads/blog-du-lich/bai-coc-vinh-hy-cheo-thuyen-1755053209.jpg",
      "https://mia.vn/media/uploads/blog-du-lich/bai-coc-vinh-hy-nuoc-bien-1755053209.jpg",
      "https://mia.vn/media/uploads/blog-du-lich/bai-coc-vinh-hy-du-lich-1755053209.jpg",
    ],
  },
  {
    order: 5,
    title: "Sài Gòn - Ninh Chữ Resort 4★",
    time: "Ngày 14/8 · 16:00 → Ngày 15/8 · 11:00",
    lat: 11.5838,
    lng: 109.0296,
    leg: "pivot",
    icon: "fa-hotel",
    short:
      'Teambuilding 2026 & Gala Dinner "Bước Đệm Vững Vàng – Tăng Tốc Tương Lai".',
    detail:
      "16:00 đoàn về Resort 4 sao Sài Gòn – Ninh Chữ nghỉ ngơi, sau đó tập trung tại bãi biển tham gia chương trình 'TEAMBUILDING 2026' với chuỗi trò chơi gắn kết, giải thưởng phong phú. 18:00 tham dự đêm Gala Dinner 'Bước Đệm Vững Vàng – Tăng Tốc Tương Lai': MC hoạt náo, BLĐ phát biểu khui champagne khai tiệc, gameshow, trao giải teambuilding & rút thăm may mắn, giao lưu văn nghệ – karaoke. 22:00 kết thúc chương trình, tự do khám phá Vĩnh Hy về đêm. Quý khách nghỉ đêm tại resort và dùng buffet sáng (07:00) trước khi trả phòng lúc 11:00.",
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
    order: 6,
    title: "Vườn Nho Ba Mọi (Ninh Phước)",
    time: "Ngày 15/8 · Trưa (sau khi trả phòng)",
    lat: 11.5443,
    lng: 108.9526,
    leg: "back",
    icon: "fa-seedling",
    short:
      "Điểm ghé bắt buộc: tham quan, chụp ảnh và thưởng thức nho tươi tại vườn.",
    detail:
      "Sau khi trả phòng và dùng cơm trưa, trên đường về đoàn ghé thăm vườn nho trĩu quả đặc trưng của vùng đất nắng gió Ninh Thuận. Quý khách tự do tham quan, check-in giữa những giàn nho xanh mướt, tìm hiểu quy trình trồng và chăm sóc nho, đồng thời thưởng thức nho tươi hái tại vườn. Đây cũng là dịp mua đặc sản địa phương như nho khô, mật nho, rượu vang nho và táo Ninh Thuận làm quà cho người thân.",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/V%C6%B0%E1%BB%9Dn_Nho_%E1%BB%9F_Phan_Rang%2C_Ninh_Thu%E1%BA%ADn.JPG/960px-V%C6%B0%E1%BB%9Dn_Nho_%E1%BB%9F_Phan_Rang%2C_Ninh_Thu%E1%BA%ADn.JPG",
      "https://media.vietravel.com/images/Content/vuon-nho-ninh-thuan-4.jpg",
      "https://media.vietravel.com/images/Content/vuon-nho-ninh-thuan-7.jpg",
    ],
  },
  {
    order: 7,
    title: "Bò Sữa Long Thành, Đồng Nai",
    time: "Ngày 15/8 · Buổi chiều",
    lat: 10.8918763,
    lng: 107.3663439,
    leg: "back",
    icon: "fa-mug-hot",
    short: "Trạm dừng chân mua đặc sản, thưởng thức sữa bò tươi.",
    detail:
      "Tiếp tục hành trình về lại TP.HCM, đoàn dừng chân tại Bò Sữa Long Thành – trạm nghỉ quen thuộc trên cung đường. Quý khách có thể thư giãn, dùng các sản phẩm từ sữa bò tươi nổi tiếng như sữa thanh trùng, sữa chua, bánh sữa và kẹo sữa. Đây cũng là nơi lý tưởng để mua đặc sản làm quà và nạp lại năng lượng trước chặng cuối của hành trình.",
    images: [
      "https://posapp.vn/wp-content/uploads/2021/01/tram-dung-chan-bo-sua-long-thanh-2.jpg",
      "https://statics.vntrip.vn/data-v2/data-guide/img_content/1461749091_long-thanh-vung-tau-4.jpg",
      "https://statics.vntrip.vn/data-v2/data-guide/img_content/1461749091_long-thanh-vung-tau-3.jpg",
    ],
  },
  {
    order: 8,
    title: "Về đến TP.HCM",
    time: "Ngày 15/8 · 18:30",
    lat: 10.84905,
    lng: 106.62598,
    leg: "back",
    icon: "fa-flag-checkered",
    short: "Trả khách về lại điểm đón ban đầu. Chia tay đoàn – hẹn gặp lại.",
    detail:
      "18:30 xe đưa đoàn về đến điểm đón ban đầu – Tòa nhà Anna, Công viên phần mềm Quang Trung, Quận 12. HDV Việt Sun chia tay đoàn, hẹn gặp lại Quý khách Vina Takeuchi trong những chương trình tiếp theo. Kết thúc hành trình Company Trip 2026 'Ninh Chữ – Vĩnh Hy: Chạm Miền Biển Ngọc' với tinh thần 'Bước Đệm Vững Vàng – Tăng Tốc Tương Lai'.",
    images: [
      "https://niceoffice.com.vn/wp-content/uploads/2024/11/toa-nha-anna-building-khu-pham-mem-quang-trung-quan-12-600x450.jpg",
      "https://www.galaxyoffice.vn/wp-content/uploads/images/building/2021-09-toa-nha-anna-building-quan-12-1.jpg",
      "https://niceoffice.com.vn/wp-content/uploads/2024/11/van-phong-cho-thue-quan-12-toa-nha-anna-building-600x450.jpg",
    ],
  },
];

/* =========================================================
   CẤU HÌNH CHẶNG (SEGMENTS)
   Mô tả từng đoạn nối 2 điểm liên tiếp (index theo TOUR_DATA):
   - mode: 'drive' (đường bộ - lấy thời gian từ Directions) | 'boat' (đường tàu)
   - route: 'go' | 'back' (thuộc lượt nào, để bật/tắt theo tuyến)
   - legIdx: vị trí của chặng trong mảng legs[] mà Directions trả về cho tuyến đó
   GO_STOPS / BACK_STOPS: các điểm đi đường bộ của mỗi tuyến (dùng gọi Directions)
   ========================================================= */
const GO_STOPS = [0, 1, 2, 4]; // HCM → Hang Rái → Vĩnh Hy → Resort (bỏ Bãi Cóc vì đi tàu)
const BACK_STOPS = [4, 5, 6, 7]; // Resort → Ba Mọi → Long Thành → HCM

const SEGMENTS = [
  { from: 0, to: 1, mode: "drive", route: "go", legIdx: 0 },
  { from: 1, to: 2, mode: "drive", route: "go", legIdx: 1 },
  { from: 2, to: 3, mode: "boat", route: "go" }, // Vĩnh Hy → Bãi Cóc (tàu)
  { from: 3, to: 4, mode: "drive", route: "go", legIdx: 2 }, // Vĩnh Hy → Resort (đường bộ)
  { from: 4, to: 5, mode: "drive", route: "back", legIdx: 0 },
  { from: 5, to: 6, mode: "drive", route: "back", legIdx: 1 },
  { from: 6, to: 7, mode: "drive", route: "back", legIdx: 2 },
];
