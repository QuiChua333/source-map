/* =========================================================
   GIAO DIỆN · Sidebar Timeline + Modal chi tiết
   Phụ thuộc: data.js (TOUR_DATA), map.js (focusPoint, infoWindow)
   ========================================================= */

/* ---------------------------------------------------------
   Render danh sách timeline ở sidebar
   --------------------------------------------------------- */
function renderTimeline() {
    const container = document.getElementById('timeline');
    container.innerHTML = '';

    TOUR_DATA.forEach((p, idx) => {
        const isBack = p.leg === 'back';
        const dotBg  = isBack ? 'bg-orange-500' : 'bg-brand-600';
        const accent = isBack ? 'text-orange-500' : 'text-brand-600';
        const linkClr = isBack ? 'text-orange-600 hover:text-orange-700' : 'text-brand-600 hover:text-brand-700';

        const item = document.createElement('div');
        item.className = 'timeline-item relative pl-1';

        item.innerHTML = `
            <div onclick="focusPoint(${idx})"
                 id="card-${idx}"
                 class="timeline-card relative z-10 cursor-pointer flex gap-4 bg-white border-2 border-slate-100 rounded-2xl p-3.5 hover:border-brand-300 hover:shadow-lg transition-all duration-200">

                <!-- Number badge -->
                <div class="shrink-0 relative">
                    <div class="${dotBg} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md">
                        <span class="font-extrabold text-lg">${p.order}</span>
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center text-[11px] ${accent}">
                        <i class="fa-solid ${p.icon}"></i>
                    </div>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                    <p class="text-[11px] font-semibold uppercase tracking-wide ${accent}">
                        <i class="fa-regular fa-clock mr-1"></i>${p.time}
                    </p>
                    <h3 class="font-bold text-slate-800 text-[15px] leading-snug mt-0.5">${p.title}</h3>
                    <p class="text-slate-500 text-[13px] mt-1 leading-relaxed line-clamp-2">${p.short}</p>

                    <button onclick="event.stopPropagation(); openModal(${idx})"
                        class="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-semibold ${linkClr} transition">
                        Xem chi tiết <i class="fa-solid fa-arrow-right-long text-xs"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(item);

        // Chèn chip chặng (thời gian di chuyển) giữa điểm này và điểm kế
        if (idx < TOUR_DATA.length - 1) {
            const seg = getSegment(idx);
            const segEl = document.createElement('div');
            segEl.id = 'seg-' + idx;
            segEl.className = 'segment' + (seg && seg.mode === 'boat' ? ' boat' : '');
            const initial = (seg && seg.mode === 'boat')
                ? '<i class="fa-solid fa-ship"></i> Đi tàu đáy kính · ~15 phút'
                : '<i class="fa-solid fa-spinner fa-spin"></i> Đang tính lộ trình…';
            segEl.innerHTML = `<span class="seg-text">${initial}</span>`;
            container.appendChild(segEl);
        }
    });
}

/* Lấy cấu hình chặng bắt đầu từ điểm fromIdx */
function getSegment(fromIdx) {
    return (typeof SEGMENTS !== 'undefined')
        ? SEGMENTS.find(s => s.from === fromIdx)
        : null;
}

/* Đổ nội dung thời gian vào chip chặng (gọi từ map.js sau khi Directions trả về) */
function setSegmentText(fromIdx, html) {
    const el = document.getElementById('seg-' + fromIdx);
    if (!el) return;
    const t = el.querySelector('.seg-text');
    if (t) t.innerHTML = html;
}

/* ---------------------------------------------------------
   Highlight card đang chọn trong sidebar
   --------------------------------------------------------- */
function highlightCard(idx) {
    document.querySelectorAll('.timeline-card').forEach(c => c.classList.remove('active'));
    const card = document.getElementById('card-' + idx);
    if (card) {
        card.classList.add('active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/* ---------------------------------------------------------
   Modal chi tiết
   --------------------------------------------------------- */
const modal = document.getElementById('modal');

function openModal(idx) {
    const p = TOUR_DATA[idx];

    document.getElementById('modal-num').textContent   = p.order;
    document.getElementById('modal-title').textContent = p.title;
    document.getElementById('modal-time').innerHTML    = `<i class="fa-regular fa-clock mr-1"></i>${p.time}`;
    document.getElementById('modal-desc').textContent  = p.detail;

    // Gallery động: ảnh đầu làm hero (full width), còn lại xếp lưới 2 cột
    const gallery = document.getElementById('modal-gallery');
    gallery.innerHTML = '';
    p.images.forEach((src, i) => {
        const wrap = document.createElement('div');
        wrap.className = (i === 0)
            ? 'col-span-2 overflow-hidden rounded-xl h-40 sm:h-52'
            : 'overflow-hidden rounded-xl h-28 sm:h-32';
        const img = document.createElement('img');
        img.src = src;
        img.alt = `${p.title} - ảnh ${i + 1}`;
        img.loading = 'lazy';
        img.className = 'gallery-img w-full h-full object-cover';
        img.onerror = () => wrap.remove();   // tự ẩn nếu ảnh không tải được
        wrap.appendChild(img);
        gallery.appendChild(wrap);
    });

    // Nút "Xem trên bản đồ"
    document.getElementById('modal-focus-btn').onclick = () => {
        closeModal();
        focusPoint(idx);
    };

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    // Đóng popup Mapbox đang mở (tránh chồng lớp)
    if (typeof popups !== 'undefined') popups.forEach(p => p.remove());
}

function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
}

/* ---------------------------------------------------------
   Sự kiện đóng modal + khởi chạy
   --------------------------------------------------------- */
document.getElementById('modal-backdrop').addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
});

// Render sidebar ngay khi script được nạp (DOM đã sẵn sàng vì script đặt cuối body)
renderTimeline();

// Khởi tạo bản đồ Mapbox (initMap định nghĩa trong js/map.js)
initMap();
