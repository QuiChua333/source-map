/* =========================================================
   CẤU HÌNH · Load từ server API (/api/config)
   Tất cả keys nằm trong file .env, KHÔNG hardcode ở đây.
   Dùng sync XHR để đảm bảo config sẵn sàng trước các script khác.
   ========================================================= */
(function () {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/config', false);
    xhr.send();
    if (xhr.status === 200) {
        var config = JSON.parse(xhr.responseText);
        window.MAPBOX_TOKEN = config.mapboxToken;
        window.SEAT_PIN = config.seatPin;
    }
})();
