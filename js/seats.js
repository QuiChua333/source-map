/* =========================================================
   SẮP XẾP CHỖ NGỒI · Vina Takeuchi 2026
   Backend: Vercel Serverless + MongoDB Atlas
   Fallback: localStorage + seats-data.js
   ========================================================= */

const STORAGE_KEY    = 'vst_seats';
const TOTAL_SEATS    = 40;
const SEATS_PER_FLOOR = 20;
const API_URL        = '/api/seats';

/* ---------------------------------------------------------
   1. STATE
   --------------------------------------------------------- */
const state = {
    assignments: {},
    unlocked: false,
    modalSeatId: null,
    pin: null,
};

/* ---------------------------------------------------------
   2. DATA
   --------------------------------------------------------- */
function buildSeats() {
    const seats = [];
    for (let floor = 1; floor <= 2; floor++) {
        const offset = (floor - 1) * SEATS_PER_FLOOR;
        for (let row = 1; row <= 7; row++) {
            const base = offset + (row - 1) * 3 + 1;
            seats.push({ id: base,                      floor, row, col: 'A' });
            seats.push({ id: base + 1,                  floor, row, col: 'B' });
            seats.push({ id: row < 7 ? base + 2 : null, floor, row, col: 'C' });
        }
    }
    return seats;
}

const ALL_SEATS = buildSeats();

function seatsForFloor(floor) {
    return ALL_SEATS.filter(s => s.floor === floor);
}

function getSeat(id) {
    return ALL_SEATS.find(s => s.id === id) || null;
}

/* ---------------------------------------------------------
   3. STORAGE — MongoDB API + localStorage fallback
   --------------------------------------------------------- */
async function loadAssignments() {
    try {
        const res = await fetch(API_URL);
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return data;
        }
    } catch {}
    const base = window.SEAT_ASSIGNMENTS || {};
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? Object.assign({}, base, JSON.parse(saved)) : Object.assign({}, base);
    } catch {
        return Object.assign({}, base);
    }
}

async function saveAssignments() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.assignments));
    if (!state.pin) return;
    try {
        await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assignments: state.assignments, pin: state.pin })
        });
    } catch {}
}

async function clearAssignmentsAPI() {
    if (!state.pin) return;
    try {
        await fetch(API_URL, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: state.pin })
        });
    } catch {}
}


/* ---------------------------------------------------------
   4. RENDER
   --------------------------------------------------------- */
function renderAll() {
    renderGrid(1, 'seat-grid-t1');
    renderGrid(2, 'seat-grid-t2');
    renderStats();
}

function renderGrid(floor, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.classList.toggle('unlocked', state.unlocked);
    container.innerHTML = '';

    const seats = seatsForFloor(floor);
    const cols = ['A', 'B', 'C'];

    cols.forEach((col, i) => {
        if (i > 0) {
            const aisle = document.createElement('div');
            aisle.className = 'bus-aisle-v';
            container.appendChild(aisle);
        }

        const column = document.createElement('div');
        column.className = 'bus-col';

        seats.filter(s => s.col === col)
            .sort((a, b) => a.row - b.row)
            .forEach(seat => column.appendChild(buildSeatEl(seat)));

        container.appendChild(column);
    });
}

function buildSeatEl(seat) {
    const el = document.createElement('div');

    if (!seat || seat.id === null) {
        el.className = 'seat seat--none';
        return el;
    }

    const name = state.assignments[seat.id] || '';
    const occupied = name.trim() !== '';
    const floorClass = seat.floor === 2 ? 'seat--t2' : '';

    el.className = ['seat', occupied ? `seat--occupied ${floorClass}` : 'seat--empty'].join(' ');
    el.dataset.seatId = seat.id;
    el.innerHTML = `
        <div class="seat-info">
            <span class="seat-num">${String(seat.id).padStart(2, '0')}</span>
            <span class="seat-name">${occupied ? name : '—'}</span>
        </div>
    `;
    return el;
}

function renderStats() {
    const total = Object.values(state.assignments).filter(v => v && v.trim()).length;
    const el = document.getElementById('stat-count');
    if (el) el.textContent = `${total} / ${TOTAL_SEATS} ghế`;
    const bar = document.getElementById('stat-bar');
    if (bar) bar.style.width = `${Math.round(total / TOTAL_SEATS * 100)}%`;
    const summary = document.getElementById('stat-summary');
    if (summary) summary.textContent = `${total} / ${TOTAL_SEATS}`;
}

function renderLockUI() {
    const icon = document.getElementById('lock-icon');
    const banner = document.getElementById('edit-banner');
    if (icon) icon.className = state.unlocked ? 'fa-solid fa-lock-open text-amber-500' : 'fa-solid fa-lock';
    if (banner) banner.classList.toggle('visible', state.unlocked);
}

/* ---------------------------------------------------------
   5. MODAL
   --------------------------------------------------------- */
function openModal(seatId) {
    const seat = getSeat(seatId);
    if (!seat) return;

    state.modalSeatId = seatId;
    const name = state.assignments[seatId] || '';
    const viewOnly = !state.unlocked;

    document.getElementById('modal-seat-label').textContent =
        `Ghế ${String(seatId).padStart(2, '0')} · Tầng ${seat.floor}`;

    const input = document.getElementById('modal-name-input');
    const deleteBtn = document.getElementById('modal-delete-btn');
    const saveBtn = document.getElementById('modal-save-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');

    input.value = viewOnly ? (name || 'Chưa xếp') : name;
    input.readOnly = viewOnly;
    input.style.backgroundColor = viewOnly ? '#f8fafc' : '';
    input.style.cursor = viewOnly ? 'default' : '';

    deleteBtn.style.display = viewOnly ? 'none' : (name.trim() ? 'inline-flex' : 'none');
    saveBtn.style.display = viewOnly ? 'none' : '';
    cancelBtn.textContent = viewOnly ? 'Đóng' : 'Hủy';

    document.getElementById('seat-modal').classList.add('open');
    if (!viewOnly) input.focus();
}

function closeModal() {
    document.getElementById('seat-modal').classList.remove('open');
    state.modalSeatId = null;
}

/* ---------------------------------------------------------
   6. EVENTS
   --------------------------------------------------------- */
function onSeatClick(e) {
    const el = e.target.closest('[data-seat-id]');
    if (el) openModal(Number(el.dataset.seatId));
}

function onPinUnlock() {
    const pin = String(window.SEAT_PIN || '2026');
    const entered = prompt('Nhập PIN để mở chế độ chỉnh sửa:');
    if (entered === null) return;
    if (entered === pin) {
        state.unlocked = true;
        state.pin = entered;
        renderLockUI();
        renderGrid(1, 'seat-grid-t1');
        renderGrid(2, 'seat-grid-t2');
    } else {
        alert('PIN không đúng. Vui lòng thử lại.');
    }
}

function onPinLock() {
    state.unlocked = false;
    state.pin = null;
    renderLockUI();
    renderGrid(1, 'seat-grid-t1');
    renderGrid(2, 'seat-grid-t2');
}

async function onSave() {
    const id = state.modalSeatId;
    if (!id) return;
    const name = document.getElementById('modal-name-input').value.trim();
    if (name) {
        state.assignments[id] = name;
    } else {
        delete state.assignments[id];
    }
    closeModal();
    renderAll();
    await saveAssignments();
}

async function onDelete() {
    const id = state.modalSeatId;
    if (!id) return;
    delete state.assignments[id];
    closeModal();
    renderAll();
    await saveAssignments();
}

async function onClearAll() {
    if (!confirm(`Xóa toàn bộ ${TOTAL_SEATS} chỗ ngồi? Không thể hoàn tác.`)) return;
    state.assignments = {};
    localStorage.removeItem(STORAGE_KEY);
    renderAll();
    await clearAssignmentsAPI();
    showToast('Đã xóa tất cả.');
}

/* ---------------------------------------------------------
   7. TOAST
   --------------------------------------------------------- */
function showToast(msg) {
    let toast = document.getElementById('seat-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'seat-toast';
        toast.style.cssText =
            'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
            'background:#1e293b;color:#fff;padding:10px 20px;border-radius:12px;' +
            'font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.25);' +
            'transition:opacity .3s ease;';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

/* ---------------------------------------------------------
   8. EXPORT EXCEL
   --------------------------------------------------------- */
function exportExcel() {
    const a = state.assignments;
    const sid = (floor, row, col) => {
        const base = (floor - 1) * 20 + (row - 1) * 3 + 1;
        if (col === 'A') return base;
        if (col === 'B') return base + 1;
        if (col === 'C') return row < 7 ? base + 2 : null;
        return null;
    };

    const border = 'border:1.5px solid #999;';
    const noBorder = 'border:none;';
    const font = 'font-family:Segoe UI,sans-serif;';
    const seat = font + 'font-size:13pt;padding:12px 16px;text-align:center;height:36px;';
    const head = font + 'font-size:13pt;padding:10px 16px;font-weight:700;text-align:center;color:#fff;';
    const S = {
        title:  head + 'background:#4a8c5c;font-size:16pt;' + border,
        t1H:    head + 'background:#4a8c5c;' + border,
        t2H:    head + 'background:#d4956a;' + border,
        rowNum: seat + 'font-weight:700;color:#333;background:#f9f9f9;' + border,
        aisle:  font + 'background:#f5f5f5;width:20px;' + noBorder,
        gap:    font + 'background:#fff;width:28px;' + noBorder,
        t1Occ:  seat + 'background:#c8e6c9;color:#1b5e20;font-weight:600;' + border,
        t2Occ:  seat + 'background:#f8d1d1;color:#7f1d1d;font-weight:600;' + border,
        empty:  seat + 'background:#fff;color:#ccc;' + border,
        none:   seat + 'background:#f5f5f5;' + border,
        stat:   seat + 'font-weight:700;color:#333;font-style:italic;' + border,
    };

    const td = (val, s, cs, rs) => {
        let t = `<td style="${s}"`;
        if (cs) t += ` colspan="${cs}"`;
        if (rs) t += ` rowspan="${rs}"`;
        return t + `>${val}</td>`;
    };

    const seatTd = (floor, row, col) => {
        const id = sid(floor, row, col);
        if (id === null) return td('', S.none);
        const n = (a[id] || '').trim();
        return n ? td(n, floor === 1 ? S.t1Occ : S.t2Occ) : td('', S.empty);
    };

    let h = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="utf-8">
<style>
  td { mso-number-format:'\\@'; }
  @page { margin: .5in; }
</style>
</head><body>
<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
<col width="55">
<col width="140"><col width="20"><col width="140"><col width="20"><col width="140">
<col width="28">
<col width="140"><col width="20"><col width="140"><col width="20"><col width="140">
<col width="55">`;

    h += `<tr>${td('SƠ ĐỒ VỊ TRÍ CHỖ NGỒI TRÊN XE - Vina Takeuchi 2026', S.title, 13)}</tr>`;

    h += `<tr>`;
    h += td('STT', S.t1H);
    h += td('Tầng 1', S.t1H, 5);
    h += td('', S.gap);
    h += td('Tầng 2', S.t2H, 5);
    h += td('STT', S.t2H);
    h += `</tr>`;

    h += `<tr>`;
    h += td('Hàng', S.t1H);
    h += td('A', S.t1H); h += td('', S.aisle); h += td('B', S.t1H); h += td('', S.aisle); h += td('C', S.t1H);
    h += td('', S.gap, 1, 8);
    h += td('A', S.t2H); h += td('', S.aisle); h += td('B', S.t2H); h += td('', S.aisle); h += td('C', S.t2H);
    h += td('Hàng', S.t2H);
    h += `</tr>`;

    for (let row = 1; row <= 7; row++) {
        h += `<tr>`;
        h += td(row, S.rowNum);
        h += seatTd(1, row, 'A'); h += td('', S.aisle); h += seatTd(1, row, 'B'); h += td('', S.aisle); h += seatTd(1, row, 'C');
        h += seatTd(2, row, 'A'); h += td('', S.aisle); h += seatTd(2, row, 'B'); h += td('', S.aisle); h += seatTd(2, row, 'C');
        h += td(row, S.rowNum);
        h += `</tr>`;
    }

    const total = Object.values(a).filter(v => v && v.trim()).length;
    h += `<tr>${td(`Tổng: ${total} / ${TOTAL_SEATS} ghế đã xếp`, S.stat, 13)}</tr>`;
    h += `</table></body></html>`;

    const blob = new Blob([h], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'so-do-cho-ngoi-vina-takeuchi-2026.xls';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải file Excel!');
}

/* ---------------------------------------------------------
   9. BIND EVENTS
   --------------------------------------------------------- */
function bindEvents() {
    document.getElementById('seat-grid-t1').addEventListener('click', onSeatClick);
    document.getElementById('seat-grid-t2').addEventListener('click', onSeatClick);

    document.getElementById('lock-btn')
        .addEventListener('click', () => state.unlocked ? onPinLock() : onPinUnlock());

    document.getElementById('modal-save-btn').addEventListener('click', onSave);
    document.getElementById('modal-delete-btn').addEventListener('click', onDelete);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-backdrop').addEventListener('click', closeModal);

    document.getElementById('modal-name-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') onSave();
        if (e.key === 'Escape') closeModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });

    const excelBtn = document.getElementById('excel-btn');
    if (excelBtn) excelBtn.addEventListener('click', exportExcel);

    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) clearBtn.addEventListener('click', () => {
        if (!state.unlocked) { onPinUnlock(); return; }
        onClearAll();
    });
}

/* ---------------------------------------------------------
   9. SKELETON
   --------------------------------------------------------- */
function renderSkeleton(containerId, floor) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const cols = ['A', 'B', 'C'];
    cols.forEach((col, i) => {
        if (i > 0) {
            const aisle = document.createElement('div');
            aisle.className = 'bus-aisle-v';
            container.appendChild(aisle);
        }

        const column = document.createElement('div');
        column.className = 'bus-col';

        for (let row = 1; row <= 7; row++) {
            const el = document.createElement('div');
            if (row === 7 && col === 'C') {
                el.className = 'seat seat--none';
            } else {
                el.className = 'seat seat--skeleton';
                el.innerHTML = `
                    <div class="seat-info">
                        <div class="skeleton-bar skeleton-num"></div>
                        <div class="skeleton-bar skeleton-name"></div>
                    </div>
                `;
            }
            column.appendChild(el);
        }
        container.appendChild(column);
    });
}

/* ---------------------------------------------------------
   10. INIT
   --------------------------------------------------------- */
async function init() {
    renderSkeleton('seat-grid-t1', 1);
    renderSkeleton('seat-grid-t2', 2);

    state.assignments = await loadAssignments();
    renderLockUI();
    renderAll();
    bindEvents();
}

document.addEventListener('DOMContentLoaded', init);
