/* =========================================================
   MAPBOX GL JS · Marker đánh số, Routing 2 màu, Popup
   Toggle tuyến đi/về · Thời gian di chuyển từng chặng
   Phụ thuộc: data.js (TOUR_DATA, SEGMENTS, GO_STOPS, BACK_STOPS),
              ui.js (highlightCard, openModal, setSegmentText)
   ========================================================= */

/* Token được khai báo trong js/config.js (window.MAPBOX_TOKEN) — file đó
   không commit lên Git. Xem mẫu tại js/config.example.js. */
const MAPBOX_TOKEN = window.MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN';

let map;
let markers = [];   // mảng mapboxgl.Marker
let popups = [];    // mảng mapboxgl.Popup tương ứng
let legVisible = { go: true, back: true };   // trạng thái bật/tắt mỗi tuyến

/* ---------------------------------------------------------
   Màu theo chặng
   --------------------------------------------------------- */
function legColor(leg) {
    if (leg === 'back')  return '#f97316';   // cam
    if (leg === 'pivot') return '#7c3aed';   // tím (resort - giao điểm)
    return '#2563eb';                        // xanh dương
}

/* ---------------------------------------------------------
   Khởi tạo bản đồ
   --------------------------------------------------------- */
function initMap() {
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN') {
        showMapError('Chưa cấu hình Mapbox Token',
            'Mở js/map.js và thay biến MAPBOX_TOKEN bằng Access Token thật (pk.xxxx).');
        return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [108.0, 11.3],
        zoom: 6.5,
        attributionControl: true
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.on('load', () => {
        document.getElementById('map-loading').style.display = 'none';
        createMarkers();
        drawBoatLine();
        drawRoutes();
        fitToBounds();
    });

    // Bắt lỗi token sai / hết hạn
    map.on('error', (e) => {
        const msg = (e && e.error && e.error.message) ? e.error.message : '';
        console.error('Mapbox error:', msg || e);
        if (/401|token|access/i.test(msg)) {
            showMapError('Token Mapbox không hợp lệ',
                'Vui lòng kiểm tra lại MAPBOX_TOKEN trong js/map.js.');
        }
    });
}

/* ---------------------------------------------------------
   Tạo Marker có đánh số (HTML element + SVG)
   --------------------------------------------------------- */
function createMarkers() {
    TOUR_DATA.forEach((p, idx) => {
        const color = legColor(p.leg);

        const el = document.createElement('div');
        el.style.cursor = 'pointer';
        el.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 44 54">
                <path d="M22 0C9.85 0 0 9.85 0 22c0 14 22 32 22 32s22-18 22-32C44 9.85 34.15 0 22 0z" fill="${color}"/>
                <circle cx="22" cy="22" r="15" fill="white"/>
                <text x="22" y="28" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${color}" text-anchor="middle">${p.order}</text>
            </svg>`;

        const popup = new mapboxgl.Popup({
            offset: 30,
            closeButton: true,
            maxWidth: '260px'
        }).setLngLat([p.lng, p.lat]).setHTML(buildPopupHTML(p, idx));

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([p.lng, p.lat])
            .setPopup(popup)
            .addTo(map);

        el.addEventListener('click', () => highlightCard(idx));

        markers.push(marker);
        popups.push(popup);
    });
}

/* ---------------------------------------------------------
   Nội dung Popup (InfoWindow)
   --------------------------------------------------------- */
function buildPopupHTML(p, idx) {
    const accent = p.leg === 'back' ? '#f97316' : '#2563eb';
    return `
        <div style="width:240px;font-family:'Be Vietnam Pro',sans-serif;">
            <div style="position:relative;height:120px;overflow:hidden;">
                <img src="${p.images[0]}" style="width:100%;height:100%;object-fit:cover;" alt="${p.title}">
                <div style="position:absolute;top:8px;left:8px;background:${accent};color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${p.order}</div>
            </div>
            <div style="padding:12px 14px 14px;">
                <p style="margin:0;color:${accent};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;">${p.time}</p>
                <h3 style="margin:4px 0 0;font-size:15px;font-weight:800;color:#1e293b;line-height:1.3;">${p.title}</h3>
                <button onclick="openModal(${idx})" style="margin-top:10px;width:100%;background:${accent};color:white;border:none;padding:8px 0;border-radius:10px;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit;">
                    Xem chi tiết
                </button>
            </div>
        </div>`;
}

/* ---------------------------------------------------------
   Vẽ 2 tuyến đường phân màu (2 lần gọi Mapbox Directions API)
   --------------------------------------------------------- */
function drawRoutes() {
    drawRoute(GO_STOPS,   '#2563eb', 'route-go',   'go',   'Lượt đi');
    drawRoute(BACK_STOPS, '#f97316', 'route-back', 'back', 'Lượt về');
}

async function drawRoute(stops, color, id, routeName, label) {
    const pts = stops.map(i => TOUR_DATA[i]);
    const coords = pts.map(p => `${p.lng},${p.lat}`).join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`
              + `?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length) {
            addLineLayer(id, data.routes[0].geometry, color, false);
            fillSegmentTimes(routeName, data.routes[0].legs);
        } else {
            console.warn(label + ' - Directions không có kết quả:', data.message || '');
            addLineLayer(id, straightLine(pts), color, true);
            fillSegmentTimesFallback(routeName);
        }
    } catch (err) {
        console.warn(label + ' - Directions lỗi:', err);
        addLineLayer(id, straightLine(pts), color, true);
        fillSegmentTimesFallback(routeName);
    }
}

/* Đường tàu Vĩnh Hy → Bãi Cóc (nét đứt, không phải đường bộ) */
function drawBoatLine() {
    const a = TOUR_DATA[2], b = TOUR_DATA[3];
    addLineLayer('route-boat', {
        type: 'LineString',
        coordinates: [[a.lng, a.lat], [b.lng, b.lat]]
    }, '#0ea5e9', true);
}

/* Thêm 1 layer line vào bản đồ */
function addLineLayer(id, geometry, color, dashed) {
    const feature = { type: 'Feature', properties: {}, geometry: geometry };

    if (map.getSource(id)) {
        map.getSource(id).setData(feature);
        return;
    }

    map.addSource(id, { type: 'geojson', data: feature });
    map.addLayer({
        id: id,
        type: 'line',
        source: id,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
            'line-color': color,
            'line-width': dashed ? 3 : 5,
            'line-opacity': 0.85,
            ...(dashed ? { 'line-dasharray': [2, 2] } : {})
        }
    });
}

/* Đường thẳng dự phòng (GeoJSON) nếu Directions API lỗi */
function straightLine(points) {
    return {
        type: 'LineString',
        coordinates: points.map(p => [p.lng, p.lat])
    };
}

/* ---------------------------------------------------------
   Thời gian di chuyển từng chặng (đổ vào chip ở sidebar)
   --------------------------------------------------------- */
function fillSegmentTimes(routeName, legs) {
    if (!legs) { fillSegmentTimesFallback(routeName); return; }
    SEGMENTS.forEach(seg => {
        if (seg.route !== routeName || seg.mode !== 'drive') return;
        const leg = legs[seg.legIdx];
        if (!leg) return;
        const txt = `${formatDuration(leg.duration)} · ${formatDistance(leg.distance)}`;
        setSegmentText(seg.from, `<i class="fa-solid fa-car-side"></i> ${txt}`);
    });
}

/* Dự phòng: ước tính theo đường chim bay khi Directions lỗi */
function fillSegmentTimesFallback(routeName) {
    SEGMENTS.forEach(seg => {
        if (seg.route !== routeName || seg.mode !== 'drive') return;
        const a = TOUR_DATA[seg.from], b = TOUR_DATA[seg.to];
        const km = haversineKm(a, b);
        setSegmentText(seg.from, `<i class="fa-solid fa-car-side"></i> ≈ ${km.toFixed(0)} km (đường chim bay)`);
    });
}

function formatDuration(sec) {
    const m = Math.round(sec / 60);
    if (m < 60) return `${m} phút`;
    const h = Math.floor(m / 60), r = m % 60;
    return r ? `${h} giờ ${r} phút` : `${h} giờ`;
}

function formatDistance(m) {
    const km = m / 1000;
    return km >= 10 ? `${km.toFixed(0)} km` : `${km.toFixed(1)} km`;
}

function haversineKm(a, b) {
    const R = 6371, toRad = d => d * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
    const x = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/* ---------------------------------------------------------
   Bật/tắt hiển thị 1 tuyến (markers + line + boat + chip)
   --------------------------------------------------------- */
function toggleLeg(leg) {
    legVisible[leg] = !legVisible[leg];
    const show = legVisible[leg];
    const disp = show ? '' : 'none';

    // Markers thuộc tuyến (resort 'pivot' luôn hiển thị)
    TOUR_DATA.forEach((p, idx) => {
        if (p.leg === leg) markers[idx].getElement().style.display = disp;
    });

    // Đường tuyến
    const lineId = leg === 'go' ? 'route-go' : 'route-back';
    if (map.getLayer(lineId)) {
        map.setLayoutProperty(lineId, 'visibility', show ? 'visible' : 'none');
    }
    // Đường tàu gắn với lượt đi
    if (leg === 'go' && map.getLayer('route-boat')) {
        map.setLayoutProperty('route-boat', 'visibility', show ? 'visible' : 'none');
    }

    // Chip thời gian chặng thuộc tuyến
    SEGMENTS.forEach(seg => {
        if (seg.route !== leg) return;
        const el = document.getElementById('seg-' + seg.from);
        if (el) el.style.display = show ? '' : 'none';
    });

    // Đóng popup của tuyến bị ẩn
    if (!show) {
        popups.forEach((pop, idx) => { if (TOUR_DATA[idx].leg === leg) pop.remove(); });
    }

    // Cập nhật trạng thái nút
    const btn = document.getElementById('toggle-' + leg);
    if (btn) btn.classList.toggle('off', !show);
}

/* ---------------------------------------------------------
   Fit bounds - hiển thị toàn bộ điểm
   --------------------------------------------------------- */
function fitToBounds() {
    const bounds = new mapboxgl.LngLatBounds();
    TOUR_DATA.forEach(p => bounds.extend([p.lng, p.lat]));
    map.fitBounds(bounds, { padding: 60, duration: 1200 });
}

/* ---------------------------------------------------------
   Đồng bộ: click sidebar -> flyTo + zoom + mở popup
   --------------------------------------------------------- */
function focusPoint(idx) {
    if (!map) return;
    const p = TOUR_DATA[idx];
    map.flyTo({ center: [p.lng, p.lat], zoom: 13, speed: 1.2, essential: true });

    popups.forEach((pop, i) => { if (i !== idx) pop.remove(); });
    if (!popups[idx].isOpen()) markers[idx].togglePopup();
}

/* ---------------------------------------------------------
   Hiển thị thông báo lỗi trên vùng bản đồ
   --------------------------------------------------------- */
function showMapError(title, desc) {
    const box = document.getElementById('map-loading');
    box.style.display = 'flex';
    box.innerHTML =
        '<div class="text-center px-6"><i class="fa-solid fa-triangle-exclamation text-4xl text-amber-500"></i>' +
        '<p class="mt-4 text-slate-600 font-semibold">' + title + '</p>' +
        '<p class="text-sm text-slate-400 mt-1">' + desc + '</p></div>';
}
