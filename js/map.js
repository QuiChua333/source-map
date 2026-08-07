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
let coordGroups = {};  // 'lat,lng' -> [indices] — nhóm marker trùng toạ độ

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
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
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
        drawEveningLine();
        drawRoutes();
        fitToBounds();
        enableCoordPicker();   // bật chế độ lấy tọa độ nếu URL có #pick
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
    coordGroups = {};
    TOUR_DATA.forEach((p, idx) => {
        const key = `${p.lat},${p.lng}`;
        if (!coordGroups[key]) coordGroups[key] = [];
        coordGroups[key].push(idx);
    });

    TOUR_DATA.forEach((p, idx) => {
        const key = `${p.lat},${p.lng}`;
        const group = coordGroups[key];
        const isPrimary = group[0] === idx;
        const color = legColor(p.leg);

        const el = document.createElement('div');
        el.style.cursor = 'pointer';

        if (group.length > 1 && !isPrimary) {
            el.style.display = 'none';
        }

        if (isPrimary && group.length > 1) {
            const label = group.map(i => TOUR_DATA[i].order).join('+');
            el.innerHTML = buildMarkerSVG(label, color);
        } else {
            el.innerHTML = buildMarkerSVG(String(p.order), color);
        }

        const popupHTML = (isPrimary && group.length > 1)
            ? buildGroupPopupHTML(group)
            : buildPopupHTML(p, idx);

        const popup = new mapboxgl.Popup({
            offset: 30,
            closeButton: true,
            maxWidth: '280px'
        }).setLngLat([p.lng, p.lat]).setHTML(popupHTML);

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([p.lng, p.lat])
            .setPopup(popup)
            .addTo(map);

        el.addEventListener('click', () => highlightCard(isPrimary ? idx : group[0]));

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
                <div style="display:flex;align-items:stretch;gap:6px;margin-top:10px;">
                    <button onclick="focusPoint(${idx - 1})" ${idx === 0 ? 'disabled' : ''} title="Điểm trước"
                        style="flex:none;width:34px;border:1.5px solid ${accent};background:#fff;color:${accent};border-radius:10px;font-size:18px;font-weight:700;cursor:pointer;font-family:inherit;${idx === 0 ? 'opacity:.35;cursor:default;' : ''}">‹</button>
                    <button onclick="openModal(${idx})"
                        style="flex:1;background:${accent};color:white;border:none;padding:8px 0;border-radius:10px;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit;">Xem chi tiết</button>
                    <button onclick="focusPoint(${idx + 1})" ${idx === TOUR_DATA.length - 1 ? 'disabled' : ''} title="Điểm sau"
                        style="flex:none;width:34px;border:1.5px solid ${accent};background:#fff;color:${accent};border-radius:10px;font-size:18px;font-weight:700;cursor:pointer;font-family:inherit;${idx === TOUR_DATA.length - 1 ? 'opacity:.35;cursor:default;' : ''}">›</button>
                </div>
                <button onclick="navigateTo(${idx})"
                   style="display:flex;align-items:center;justify-content:center;gap:5px;width:100%;margin-top:8px;padding:6px 0;border:1.5px solid ${accent};border-radius:10px;color:${accent};background:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">
                   <i class="fa-solid fa-diamond-turn-right"></i> Chỉ đường
                </button>
            </div>
        </div>`;
}

function buildMarkerSVG(label, color) {
    const len = label.length;
    const fontSize = len <= 2 ? 18 : len <= 3 ? 13 : len <= 4 ? 11 : 9;
    const y = fontSize >= 14 ? 28 : 27;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 44 54">
        <path d="M22 0C9.85 0 0 9.85 0 22c0 14 22 32 22 32s22-18 22-32C44 9.85 34.15 0 22 0z" fill="${color}"/>
        <circle cx="22" cy="22" r="15" fill="white"/>
        <text x="22" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${color}" text-anchor="middle">${label}</text>
    </svg>`;
}

function buildGroupPopupHTML(group) {
    return `<div style="width:250px;font-family:'Be Vietnam Pro',sans-serif;">
        ${group.map((idx, i) => {
            const p = TOUR_DATA[idx];
            const accent = legColor(p.leg);
            return `${i > 0 ? '<div style="border-top:1.5px solid #e2e8f0;"></div>' : ''}
                <div style="padding:12px 14px;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                        <div style="background:${accent};color:white;min-width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;box-shadow:0 2px 6px rgba(0,0,0,.15);">${p.order}</div>
                        <div>
                            <p style="margin:0;color:${accent};font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;">${p.time}</p>
                            <h3 style="margin:2px 0 0;font-size:14px;font-weight:800;color:#1e293b;line-height:1.3;">${p.title}</h3>
                        </div>
                    </div>
                    <p style="margin:0 0 8px;font-size:12px;color:#64748b;line-height:1.5;">${p.short}</p>
                    <button onclick="openModal(${idx})"
                        style="width:100%;background:${accent};color:white;border:none;padding:7px 0;border-radius:10px;font-weight:600;font-size:12px;cursor:pointer;font-family:inherit;">Xem chi tiết</button>
                </div>`;
        }).join('')}
        <div style="border-top:1.5px solid #e2e8f0;padding:10px 14px 12px;">
            <button onclick="navigateTo(${group[0]})"
               style="display:flex;align-items:center;justify-content:center;gap:5px;width:100%;padding:7px 0;border:1.5px solid #7c3aed;border-radius:10px;color:#7c3aed;background:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">
               <i class="fa-solid fa-diamond-turn-right"></i> Chỉ đường đến đây
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

/* Đường tàu trong Vịnh Vĩnh Hy (nét đứt) — nối chuỗi điểm theo BOAT_PATH */
function drawBoatLine() {
    if (typeof BOAT_PATH === 'undefined' || !BOAT_PATH.length) return;
    const coords = BOAT_PATH.map(i => [TOUR_DATA[i].lng, TOUR_DATA[i].lat]);
    addLineLayer('route-boat', {
        type: 'LineString',
        coordinates: coords
    }, '#0ea5e9', true);
}

/* Đường đi-về buổi tối 14/8 (nét đứt tím) — resort → Nhà hàng Lộc Phú dự Gala → về lại resort */
async function drawEveningLine() {
    if (typeof EVENING_PATH === 'undefined' || !EVENING_PATH.length) return;
    const pts = EVENING_PATH.map(i => TOUR_DATA[i]);
    const coords = pts.map(p => `${p.lng},${p.lat}`).join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`
              + `?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length) {
            addLineLayer('route-evening', data.routes[0].geometry, '#7c3aed', true);
        } else {
            addLineLayer('route-evening', straightLine(pts), '#7c3aed', true);
        }
    } catch {
        addLineLayer('route-evening', straightLine(pts), '#7c3aed', true);
    }
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

    const processed = new Set();
    TOUR_DATA.forEach((p, idx) => {
        const key = `${p.lat},${p.lng}`;
        const group = coordGroups[key];

        if (group.length === 1) {
            if (p.leg === leg) markers[idx].getElement().style.display = show ? '' : 'none';
        } else if (!processed.has(key)) {
            processed.add(key);
            const visible = group.filter(i => {
                const l = TOUR_DATA[i].leg;
                return l === 'pivot' || legVisible[l] !== false;
            });
            const el = markers[group[0]].getElement();
            if (visible.length === 0) {
                el.style.display = 'none';
            } else {
                el.style.display = '';
                const label = visible.map(i => TOUR_DATA[i].order).join('+');
                el.innerHTML = buildMarkerSVG(label, legColor(TOUR_DATA[visible[0]].leg));
            }
        }
    });

    const lineId = leg === 'go' ? 'route-go' : 'route-back';
    if (map.getLayer(lineId)) {
        map.setLayoutProperty(lineId, 'visibility', show ? 'visible' : 'none');
    }
    if (leg === 'go' && map.getLayer('route-boat')) {
        map.setLayoutProperty('route-boat', 'visibility', show ? 'visible' : 'none');
    }

    SEGMENTS.forEach(seg => {
        if (seg.route !== leg) return;
        const el = document.getElementById('seg-' + seg.from);
        if (el) el.style.display = show ? '' : 'none';
    });

    if (!show) {
        popups.forEach((pop, idx) => { if (TOUR_DATA[idx].leg === leg) pop.remove(); });
    }

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
    const key = `${p.lat},${p.lng}`;
    const group = coordGroups[key];
    const primaryIdx = (group && group.length > 1) ? group[0] : idx;

    const zoom = p.boat ? 16 : 15;
    map.flyTo({ center: [p.lng, p.lat], zoom: zoom, speed: 1.8, curve: 1.3, essential: true });

    popups.forEach((pop, i) => { if (i !== primaryIdx) pop.remove(); });
    if (!popups[primaryIdx].isOpen()) markers[primaryIdx].togglePopup();

    if (typeof highlightCard === 'function') highlightCard(idx);
}

/* ---------------------------------------------------------
   Chỉ đường từ vị trí hiện tại đến điểm tour
   --------------------------------------------------------- */
const NAV_ROUTE_ID = 'nav-route';
const NAV_OFF_ROUTE_M = 200;
let navWatchId = null;
let navRouteCoords = null;
let navFitted = false;
let navRerouting = false;

function navigateTo(idx) {
    const dest = TOUR_DATA[idx];

    if (!navigator.geolocation) {
        alert('Trình duyệt không hỗ trợ GPS.');
        return;
    }

    if (navWatchId !== null) navigator.geolocation.clearWatch(navWatchId);

    if (typeof closeModal === 'function') closeModal();
    popups.forEach(p => p.remove());

    navRouteCoords = null;
    navFitted = false;

    navWatchId = navigator.geolocation.watchPosition(
        (pos) => onNavPosition(pos, dest),
        (err) => {
            if (err.code === 1) alert('Vui lòng cho phép truy cập vị trí.');
            else alert('Không thể xác định vị trí.');
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
    );
}

async function onNavPosition(pos, dest) {
    const { latitude: lat, longitude: lng } = pos.coords;

    if (!locateMarker) {
        const el = document.createElement('div');
        el.className = 'locate-dot';
        el.innerHTML = '<div class="locate-ping"></div><div class="locate-core"></div>';
        locateMarker = new mapboxgl.Marker({ element: el })
            .setLngLat([lng, lat]).addTo(map);
    } else {
        locateMarker.setLngLat([lng, lat]);
    }

    const needRoute = !navRouteCoords
        || minDistToRoute(lat, lng, navRouteCoords) > NAV_OFF_ROUTE_M;

    if (!needRoute || navRerouting) return;

    navRerouting = true;
    const coords = `${lng},${lat};${dest.lng},${dest.lat}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`
              + `?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (!data.routes || !data.routes.length) return;
        const route = data.routes[0];
        navRouteCoords = route.geometry.coordinates;
        addLineLayer(NAV_ROUTE_ID, route.geometry, '#10b981', false);

        if (!navFitted) {
            navFitted = true;
            const bounds = new mapboxgl.LngLatBounds();
            route.geometry.coordinates.forEach(c => bounds.extend(c));
            map.fitBounds(bounds, { padding: 80, duration: 1200 });
        }

        showNavInfo(dest, formatDuration(route.duration), formatDistance(route.distance));
    } catch (err) {
        console.error('Nav reroute error:', err);
    } finally {
        navRerouting = false;
    }
}

function minDistToRoute(lat, lng, coords) {
    let min = Infinity;
    for (const c of coords) {
        const d = haversineKm({ lat, lng }, { lat: c[1], lng: c[0] }) * 1000;
        if (d < min) min = d;
    }
    return min;
}

function showNavInfo(dest, duration, distance) {
    clearNavInfo();
    const div = document.createElement('div');
    div.id = 'nav-info';
    div.innerHTML = `
        <div class="nav-info-body">
            <div style="flex:1;min-width:0;">
                <p class="nav-title">${dest.title}</p>
                <p class="nav-meta"><i class="fa-solid fa-car-side"></i> ${duration} · ${distance}</p>
            </div>
            <button onclick="clearNav()" title="Đóng" class="nav-close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>`;
    document.getElementById('map-main').appendChild(div);
}

function clearNav() {
    if (navWatchId !== null) {
        navigator.geolocation.clearWatch(navWatchId);
        navWatchId = null;
    }
    navRouteCoords = null;
    navFitted = false;
    if (map.getLayer(NAV_ROUTE_ID)) map.removeLayer(NAV_ROUTE_ID);
    if (map.getSource(NAV_ROUTE_ID)) map.removeSource(NAV_ROUTE_ID);
    clearNavInfo();
}

function clearNavInfo() {
    const el = document.getElementById('nav-info');
    if (el) el.remove();
}

/* ---------------------------------------------------------
   CHẾ ĐỘ CHỌN TỌA ĐỘ (Dev) — bật bằng cách thêm #pick vào URL
   Click lên bản đồ → hiện + tự copy "lat/lng" đúng định dạng data.js
   --------------------------------------------------------- */
function enableCoordPicker() {
    if (!/pick/i.test(location.hash) && !/pick/i.test(location.search)) return;

    map.getCanvas().style.cursor = 'crosshair';

    // Nhãn hướng dẫn góc trên-trái
    const hint = document.createElement('div');
    hint.style.cssText = 'position:absolute;top:10px;left:10px;z-index:30;background:#1e293b;color:#fff;'
        + 'font:600 12px/1.4 sans-serif;padding:8px 12px;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,.3);max-width:240px;';
    hint.innerHTML = '📍 Chế độ chọn tọa độ<br><span style="font-weight:400;opacity:.85">Click lên bản đồ để lấy &amp; copy lat/lng</span>';
    document.getElementById('map').appendChild(hint);

    const pickPopup = new mapboxgl.Popup({ closeButton: true, maxWidth: '260px' });

    map.on('click', (e) => {
        const lat = e.lngLat.lat.toFixed(7);
        const lng = e.lngLat.lng.toFixed(7);
        const snippet = `lat: ${lat},\nlng: ${lng},`;

        // Copy vào clipboard
        if (navigator.clipboard) navigator.clipboard.writeText(snippet).catch(() => {});

        pickPopup.setLngLat(e.lngLat).setHTML(
            `<div style="font:13px/1.5 sans-serif;padding:10px 12px;">
                <div style="font-weight:700;color:#2563eb;margin-bottom:4px;">📋 Đã copy tọa độ</div>
                <code style="display:block;background:#f1f5f9;padding:6px 8px;border-radius:6px;white-space:pre;font-size:12px;">lat: ${lat},\nlng: ${lng},</code>
             </div>`
        ).addTo(map);

        console.log(snippet);
    });
}

/* ---------------------------------------------------------
   Vị trí hiện tại (GPS)
   --------------------------------------------------------- */
let locateMarker = null;
let locateWatchId = null;

function locateMe() {
    const btn = document.getElementById('locate-btn');
    if (!navigator.geolocation) {
        alert('Trình duyệt không hỗ trợ GPS.');
        return;
    }

    if (locateWatchId !== null) {
        navigator.geolocation.clearWatch(locateWatchId);
        locateWatchId = null;
        if (locateMarker) { locateMarker.remove(); locateMarker = null; }
        btn.classList.remove('text-blue-600', 'bg-blue-50');
        btn.classList.add('text-brand-700');
        return;
    }

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    locateWatchId = navigator.geolocation.watchPosition(
        (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;

            btn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
            btn.classList.remove('text-brand-700');
            btn.classList.add('text-blue-600', 'bg-blue-50');

            if (!locateMarker) {
                const el = document.createElement('div');
                el.className = 'locate-dot';
                el.innerHTML = '<div class="locate-ping"></div><div class="locate-core"></div>';
                locateMarker = new mapboxgl.Marker({ element: el })
                    .setLngLat([lng, lat])
                    .addTo(map);
                map.flyTo({ center: [lng, lat], zoom: 14, speed: 1.5 });
            } else {
                locateMarker.setLngLat([lng, lat]);
            }
        },
        (err) => {
            btn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
            locateWatchId = null;
            if (err.code === 1) alert('Vui lòng cho phép truy cập vị trí.');
            else alert('Không thể xác định vị trí.');
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
    );
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
