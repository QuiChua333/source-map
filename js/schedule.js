/* =========================================================
   RENDER LỊCH TRÌNH · schedule.html
   Phụ thuộc: schedule-data.js, notifications.js
   ========================================================= */

let adminMode = false;
let adminPin = '';

function getEventStates() {
    const now = Date.now();
    const flat = [];
    window.SCHEDULE_DAYS.forEach(day => {
        day.events.forEach(ev => flat.push({ id: ev.id, ts: new Date(ev.isoVN).getTime() }));
    });
    flat.sort((a, b) => a.ts - b.ts);

    let activeId = null, nextId = null;
    for (let i = 0; i < flat.length; i++) {
        const end = i < flat.length - 1 ? flat[i + 1].ts : flat[i].ts + 3600000;
        if (now >= flat[i].ts && now < end) {
            activeId = flat[i].id;
            nextId = i < flat.length - 1 ? flat[i + 1].id : null;
            break;
        }
    }
    if (!activeId) {
        const first = flat.find(e => e.ts > now);
        if (first) nextId = first.id;
    }
    return { activeId, nextId };
}

function renderSchedule() {
    const container = document.getElementById('schedule-content');
    if (!container) return;
    container.innerHTML = '';

    const { activeId, nextId } = getEventStates();
    const now = Date.now();

    const COLORS = {
        purple: { dot: 'dot-purple', time: 'color-purple', header: 'day-purple', subitems: 'subitems-purple' },
        blue:   { dot: 'dot-blue',   time: 'color-blue',   header: 'day-blue',   subitems: 'subitems-blue' },
        orange: { dot: 'dot-orange', time: 'color-orange',  header: 'day-orange', subitems: 'subitems-orange' }
    };

    window.SCHEDULE_DAYS.forEach((day, dayIdx) => {
        const c = COLORS[day.color] || COLORS.blue;

        const section = document.createElement('div');
        section.className = 'day-group';

        const sidebar = document.createElement('div');
        sidebar.className = `day-sidebar ${c.header}`;
        sidebar.innerHTML = `<span class="day-sidebar-text">${day.label}<br>${day.date}</span>`;
        section.appendChild(sidebar);

        const body = document.createElement('div');
        body.className = 'day-body';

        const info = document.createElement('div');
        info.className = 'day-info';
        info.innerHTML = `
            <div class="flex-1 min-w-0">
                <h2 class="day-info-title">${day.subtitle}</h2>
                ${day.meals.length ? `
                    <div class="day-info-meals">
                        ${day.meals.map(m => `<span class="meal-chip-sm">${m}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            ${adminMode ? `
                <div class="admin-actions">
                    <button class="admin-btn admin-btn-add" onclick="addEvent(${dayIdx})" title="Thêm sự kiện">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                    <button class="admin-btn admin-btn-edit" onclick="showDayModal(${dayIdx})" title="Sửa ngày">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="admin-btn admin-btn-delete" onclick="deleteDay(${dayIdx})" title="Xoá ngày">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            ` : ''}
        `;
        body.appendChild(info);

        const timeline = document.createElement('div');
        timeline.className = 'timeline-events';

        day.events.forEach((ev, evIdx) => {
            const ts = new Date(ev.isoVN).getTime();
            const isActive = ev.id === activeId;
            const isNext = ev.id === nextId;
            const isPast = !isActive && !isNext && ts < now;
            const isFuture = !isActive && !isNext && !isPast;

            const item = document.createElement('div');
            item.className = 'timeline-item';
            if (isActive) item.classList.add('timeline-active');
            if (isNext) item.classList.add('timeline-next');

            let subitemsHTML = '';
            if (ev.subitems && ev.subitems.length) {
                subitemsHTML = `
                    <ul class="event-subitems ${c.subitems}">
                        ${ev.subitems.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                `;
            }

            const statusBadge = isActive
                ? `<span class="event-badge active-badge"><i class="fa-solid fa-location-dot"></i> Đang diễn ra</span>`
                : isNext
                ? `<span class="event-badge next-badge"><i class="fa-regular fa-clock"></i> Sắp tới</span>`
                : '';

            const trackState = isPast ? 'track-past' : isActive ? 'track-active' : isNext ? 'track-next' : isFuture ? 'track-future' : '';

            const adminBtns = adminMode ? `
                <div class="admin-event-actions">
                    <button class="admin-btn-sm admin-btn-edit" onclick="showEventModal(${dayIdx},${evIdx})" title="Sửa sự kiện">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="admin-btn-sm admin-btn-delete" onclick="deleteEvent(${dayIdx},${evIdx})" title="Xoá sự kiện">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            ` : '';

            item.innerHTML = `
                <div class="timeline-time ${c.time}" ${isPast ? 'style="opacity:0.4"' : ''}>${ev.timeDisplay}</div>
                <div class="timeline-track ${trackState}">
                    <div class="timeline-dot ${c.dot} ${isActive ? 'dot-active' : ''} ${isPast ? 'dot-past' : ''} ${isFuture || isNext ? 'dot-future' : ''}"></div>
                </div>
                <div class="timeline-content">
                    ${statusBadge}
                    <div class="event-header-row">
                        <h3 class="event-title" ${isPast ? 'style="opacity:0.45"' : ''}>${ev.title}</h3>
                        ${adminBtns}
                    </div>
                    <p class="event-detail" ${isPast ? 'style="opacity:0.35"' : ''}>${ev.detail}</p>
                    ${subitemsHTML}
                </div>
            `;

            timeline.appendChild(item);
        });

        body.appendChild(timeline);
        section.appendChild(body);
        container.appendChild(section);
    });

    if (!adminMode) scrollToActive();
}

function scrollToActive() {
    const el = document.querySelector('.timeline-active') || document.querySelector('.timeline-next');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ---------------------------------------------------------
   Admin Mode
   --------------------------------------------------------- */
function showPinModal() {
    if (document.getElementById('pin-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'pin-overlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-box" style="max-width:340px">
            <h3 class="modal-title"><i class="fa-solid fa-lock"></i> Admin Mode</h3>
            <p class="modal-desc">Nhập PIN để chỉnh sửa lịch trình</p>
            <input type="password" id="pin-input" class="modal-input" placeholder="PIN" maxlength="10" autocomplete="off" />
            <p id="pin-error" class="modal-error" style="display:none">PIN không đúng</p>
            <div class="modal-actions">
                <button class="modal-btn modal-btn-cancel" onclick="closePinModal()">Huỷ</button>
                <button class="modal-btn modal-btn-primary" onclick="verifyPin()">Xác nhận</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => {
        overlay.classList.add('show');
        document.getElementById('pin-input').focus();
    }, 10);

    document.getElementById('pin-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') verifyPin();
        if (e.key === 'Escape') closePinModal();
    });
}

function closePinModal() {
    const el = document.getElementById('pin-overlay');
    if (el) { el.classList.remove('show'); setTimeout(() => el.remove(), 200); }
}

async function verifyPin() {
    const input = document.getElementById('pin-input');
    const pin = input.value.trim();
    if (!pin) return;

    try {
        const res = await fetch('/api/schedule');
        if (res.ok) {
            const cfg = await fetch('/api/config').then(r => r.json());
            if (pin === cfg.seatPin) {
                adminPin = pin;
                adminMode = true;
                closePinModal();
                renderSchedule();
                showSaveBar();
                updateAdminToggle();
                return;
            }
        }
    } catch (e) { /* fall through */ }

    document.getElementById('pin-error').style.display = 'block';
    input.value = '';
    input.focus();
}

function enterAdminMode() {
    if (adminMode) {
        exitAdminMode();
    } else {
        showPinModal();
    }
}

function exitAdminMode() {
    adminMode = false;
    adminPin = '';
    hideSaveBar();
    updateAdminToggle();
    window.loadSchedule().then(() => renderSchedule());
}

function updateAdminToggle() {
    const btn = document.getElementById('admin-btn');
    const addDayBtn = document.getElementById('add-day-btn');
    if (btn) {
        if (adminMode) {
            btn.classList.add('admin-active');
            btn.title = 'Thoát chế độ quản trị';
        } else {
            btn.classList.remove('admin-active');
            btn.title = 'Chế độ quản trị';
        }
    }
    if (addDayBtn) {
        addDayBtn.style.display = adminMode ? 'flex' : 'none';
    }
}

function showSaveBar() {
    if (document.getElementById('admin-save-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'admin-save-bar';
    bar.className = 'admin-save-bar';
    bar.innerHTML = `
        <div class="admin-save-inner">
            <span class="admin-save-label"><i class="fa-solid fa-pen-ruler"></i> Chế độ quản trị</span>
            <div class="admin-save-btns">
                <button class="modal-btn modal-btn-cancel" onclick="exitAdminMode()">Huỷ</button>
                <button class="modal-btn modal-btn-save" onclick="saveSchedule()"><i class="fa-solid fa-floppy-disk"></i> Lưu</button>
            </div>
        </div>
    `;
    document.body.appendChild(bar);
    setTimeout(() => bar.classList.add('show'), 10);
}

function hideSaveBar() {
    const bar = document.getElementById('admin-save-bar');
    if (bar) { bar.classList.remove('show'); setTimeout(() => bar.remove(), 200); }
}

/* ---------------------------------------------------------
   Day / Event CRUD
   --------------------------------------------------------- */
function showDayModal(dayIdx) {
    const day = window.SCHEDULE_DAYS[dayIdx];
    if (!day) return;

    const allMeals = ['Sáng', 'Trưa', 'Tối'];

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-box">
            <h3 class="modal-title"><i class="fa-solid fa-calendar-day"></i> Sửa ngày</h3>
            <div class="modal-form">
                <label class="modal-label">Nhãn</label>
                <input type="text" class="modal-input" id="md-label" value="${day.label}" placeholder="VD: NGÀY 1" />

                <label class="modal-label">Ngày</label>
                <input type="date" class="modal-input" id="md-date" value="${vnDateToISO(day.date)}" />

                <label class="modal-label">Tiêu đề phụ</label>
                <input type="text" class="modal-input" id="md-subtitle" value="${day.subtitle}" />

                <label class="modal-label">Màu</label>
                <select class="modal-input" id="md-color">
                    <option value="purple" ${day.color === 'purple' ? 'selected' : ''}>Tím</option>
                    <option value="blue" ${day.color === 'blue' ? 'selected' : ''}>Xanh</option>
                    <option value="orange" ${day.color === 'orange' ? 'selected' : ''}>Cam</option>
                </select>

                <label class="modal-label">Bữa ăn</label>
                <div class="modal-checks">
                    ${allMeals.map(m => `
                        <label class="modal-check">
                            <input type="checkbox" value="${m}" ${day.meals.includes(m) ? 'checked' : ''} />
                            ${m}
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn modal-btn-cancel" onclick="this.closest('.modal-overlay').remove()">Huỷ</button>
                <button class="modal-btn modal-btn-primary" id="md-save">Lưu</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);

    overlay.querySelector('#md-save').onclick = () => {
        day.label = overlay.querySelector('#md-label').value.trim();
        day.date = isoToVnDate(overlay.querySelector('#md-date').value);
        day.subtitle = overlay.querySelector('#md-subtitle').value.trim();
        day.color = overlay.querySelector('#md-color').value;
        day.meals = Array.from(overlay.querySelectorAll('.modal-checks input:checked')).map(cb => cb.value);

        // Re-derive isoVN for all events in this day
        const dayISO = overlay.querySelector('#md-date').value;
        if (dayISO) {
            day.events.forEach(ev => {
                if (ev.timeDisplay) ev.isoVN = `${dayISO}T${ev.timeDisplay}:00+07:00`;
            });
        }

        sortDays();
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 200);
        renderSchedule();
    };
}

function showEventModal(dayIdx, evIdx) {
    const day = window.SCHEDULE_DAYS[dayIdx];
    if (!day) return;
    const isNew = evIdx === -1;
    const ev = isNew ? { id: 'ev-new-' + Date.now(), timeDisplay: '', isoVN: '', title: '', body: '', detail: '', subitems: [] } : day.events[evIdx];
    if (!ev) return;

    const timeVal = ev.timeDisplay || '';

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-box modal-box-lg">
            <h3 class="modal-title"><i class="fa-solid fa-clock"></i> ${isNew ? 'Thêm' : 'Sửa'} sự kiện</h3>
            <div class="modal-form">
                <label class="modal-label">Giờ</label>
                <input type="time" class="modal-input" id="me-time" value="${timeVal}" />

                <label class="modal-label">Tiêu đề</label>
                <input type="text" class="modal-input" id="me-title" value="${escapeAttr(ev.title)}" />

                <label class="modal-label">Mô tả ngắn</label>
                <input type="text" class="modal-input" id="me-body" value="${escapeAttr(ev.body)}" />

                <label class="modal-label">Chi tiết</label>
                <textarea class="modal-input modal-textarea" id="me-detail" rows="3">${escapeHTML(ev.detail)}</textarea>

                <label class="modal-label">Mục con <span class="text-slate-400 text-xs">(mỗi dòng = 1 mục)</span></label>
                <textarea class="modal-input modal-textarea" id="me-subitems" rows="4">${(ev.subitems || []).join('\n')}</textarea>

                <label class="modal-check" style="margin-top:14px">
                    <input type="checkbox" id="me-notify" ${ev.notify !== false ? 'checked' : ''} />
                    Gửi thông báo nhắc nhở trước 20 phút
                </label>
            </div>
            <div class="modal-actions">
                <button class="modal-btn modal-btn-cancel" onclick="this.closest('.modal-overlay').remove()">Huỷ</button>
                <button class="modal-btn modal-btn-primary" id="me-save">${isNew ? 'Thêm' : 'Lưu'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);

    overlay.querySelector('#me-save').onclick = () => {
        const time = overlay.querySelector('#me-time').value; // "HH:mm"
        const dayISO = vnDateToISO(day.date); // "yyyy-mm-dd"

        const updated = {
            id: ev.id,
            timeDisplay: time,
            isoVN: dayISO && time ? `${dayISO}T${time}:00+07:00` : ev.isoVN,
            title: overlay.querySelector('#me-title').value.trim(),
            body: overlay.querySelector('#me-body').value.trim(),
            detail: overlay.querySelector('#me-detail').value.trim(),
            subitems: overlay.querySelector('#me-subitems').value.split('\n').map(s => s.trim()).filter(Boolean),
            notify: overlay.querySelector('#me-notify').checked
        };

        if (isNew) {
            day.events.push(updated);
        } else {
            Object.assign(ev, updated);
        }

        day.events.sort((a, b) => a.timeDisplay.localeCompare(b.timeDisplay));

        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 200);
        renderSchedule();
    };
}

function escapeAttr(s) { return (s || '').replace(/"/g, '&quot;'); }
function escapeHTML(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function sortDays() {
    window.SCHEDULE_DAYS.sort((a, b) => {
        const da = vnDateToISO(a.date) || '9999';
        const db = vnDateToISO(b.date) || '9999';
        return da.localeCompare(db);
    });
}

function vnDateToISO(d) {
    if (!d) return '';
    const [day, month, year] = d.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
function isoToVnDate(d) {
    if (!d) return '';
    const [year, month, day] = d.split('-');
    return `${parseInt(day)}/${parseInt(month)}/${year}`;
}

function addDay() {
    const newDay = {
        id: 'day-new-' + Date.now(),
        label: '',
        date: '',
        subtitle: '',
        color: 'blue',
        meals: [],
        events: []
    };
    window.SCHEDULE_DAYS.push(newDay);
    showDayModal(window.SCHEDULE_DAYS.length - 1);
}

function addEvent(dayIdx) {
    showEventModal(dayIdx, -1);
}

function deleteDay(dayIdx) {
    const day = window.SCHEDULE_DAYS[dayIdx];
    if (!day) return;
    if (!confirm(`Xoá "${day.label} - ${day.subtitle}"?`)) return;
    window.SCHEDULE_DAYS.splice(dayIdx, 1);
    renderSchedule();
}

function deleteEvent(dayIdx, evIdx) {
    const ev = window.SCHEDULE_DAYS[dayIdx]?.events[evIdx];
    if (!ev) return;
    if (!confirm(`Xoá sự kiện "${ev.title}"?`)) return;
    window.SCHEDULE_DAYS[dayIdx].events.splice(evIdx, 1);
    renderSchedule();
}

async function saveSchedule() {
    const btn = document.querySelector('#admin-save-bar .modal-btn-save');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...'; }

    try {
        const res = await fetch('/api/schedule', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ days: window.SCHEDULE_DAYS, pin: adminPin })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Lỗi server');

        adminMode = false;
        adminPin = '';
        hideSaveBar();
        updateAdminToggle();
        await window.loadSchedule();
        renderSchedule();
        showToast('Đã lưu lịch trình thành công!', 'success');
    } catch (err) {
        showToast('Lỗi: ' + err.message, 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu'; }
    }
}

function showToast(msg, type) {
    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ---------------------------------------------------------
   Notification UI
   --------------------------------------------------------- */
function updateNotifUI() {
    const card = document.getElementById('notif-card');
    const icon = document.getElementById('notif-icon');
    const btn = document.getElementById('notif-enable-btn');
    if (!card || !window.NotificationManager) return;

    if (window.NotificationManager.isEnabled()) {
        card.className = 'notif-card enabled';
        card.querySelector('.font-bold').textContent = 'Thông báo đã bật';
        card.querySelector('.text-xs').textContent = 'Bạn sẽ nhận nhắc nhở 20 phút trước mỗi sự kiện';
        card.querySelector('.w-10').innerHTML = '<i class="fa-solid fa-bell-slash text-lg"></i>';
        card.querySelector('.w-10').className = 'w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0';
        btn.textContent = 'Tắt';
        btn.className = 'px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs font-semibold transition shrink-0';
        if (icon) icon.className = 'fa-solid fa-bell text-brand-600';
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
        card.className = 'notif-card denied';
        card.querySelector('.font-bold').textContent = 'Thông báo bị từ chối';
        card.querySelector('.text-xs').textContent = 'Vui lòng bật lại trong cài đặt trình duyệt';
        card.querySelector('.w-10').innerHTML = '<i class="fa-solid fa-bell-slash text-lg"></i>';
        card.querySelector('.w-10').className = 'w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-500 shrink-0';
        btn.style.display = 'none';
        if (icon) icon.className = 'fa-regular fa-bell text-slate-400';
    } else {
        card.className = 'notif-card';
        card.querySelector('.font-bold').textContent = 'Bật nhắc nhở hành trình';
        card.querySelector('.text-xs').textContent = 'Nhận thông báo 20 phút trước mỗi sự kiện';
        card.querySelector('.w-10').innerHTML = '<i class="fa-solid fa-bell text-lg"></i>';
        card.querySelector('.w-10').className = 'w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 shrink-0';
        btn.textContent = 'Bật ngay';
        btn.className = 'px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition shrink-0';
        btn.style.display = '';
        if (icon) icon.className = 'fa-regular fa-bell';
    }
}

function bindNotifEvents() {
    const btn = document.getElementById('notif-enable-btn');
    const headerBtn = document.getElementById('notif-btn');

    if (btn) {
        btn.addEventListener('click', async () => {
            if (window.NotificationManager.isEnabled()) {
                window.NotificationManager.disableNotifications();
            } else {
                await window.NotificationManager.enableNotifications();
            }
            updateNotifUI();
        });
    }

    if (headerBtn) {
        headerBtn.addEventListener('click', async () => {
            if (window.NotificationManager.isEnabled()) {
                window.NotificationManager.disableNotifications();
            } else {
                await window.NotificationManager.enableNotifications();
            }
            updateNotifUI();
        });
    }
}

/* ---------------------------------------------------------
   Init
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
    await window.loadSchedule();
    renderSchedule();
    updateNotifUI();
    bindNotifEvents();

    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) adminBtn.addEventListener('click', enterAdminMode);

    const addDayBtn = document.getElementById('add-day-btn');
    if (addDayBtn) addDayBtn.addEventListener('click', addDay);

    setInterval(async () => {
        if (!adminMode) {
            await window.loadSchedule();
            renderSchedule();
        }
    }, 60000);
});
