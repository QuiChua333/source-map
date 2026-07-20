/* =========================================================
   DỮ LIỆU LỊCH TRÌNH TOUR · Fetch từ API
   ========================================================= */

window.SCHEDULE_DAYS = [];
window.NOTIFICATION_EVENTS = [];

window.loadSchedule = async function () {
    const res = await fetch('/api/schedule');
    const days = await res.json();
    window.SCHEDULE_DAYS = days;
    window.NOTIFICATION_EVENTS = days.flatMap(day => day.events).map(ev => ({
        id: ev.id,
        title: 'Sap den: ' + ev.title,
        body: ev.timeDisplay + ' - ' + ev.body,
        eventAt: new Date(ev.isoVN).getTime(),
        notifyAt: new Date(ev.isoVN).getTime() - 20 * 60 * 1000
    }));
    return days;
};
