/* =========================================================
   SERVICE WORKER · Push Notification cho lịch trình tour
   Chained-setTimeout pattern
   ========================================================= */

let scheduledTimers = [];

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    const { type, events } = event.data || {};

    if (type === 'SCHEDULE_NOTIFICATIONS' && Array.isArray(events)) {
        const upcoming = events
            .filter(ev => ev.notifyAt > Date.now())
            .sort((a, b) => a.notifyAt - b.notifyAt);
        cancelAllTimers();
        scheduleChain(upcoming);
    }

    if (type === 'CANCEL_NOTIFICATIONS') {
        cancelAllTimers();
    }
});

function cancelAllTimers() {
    scheduledTimers.forEach(id => clearTimeout(id));
    scheduledTimers = [];
}

function scheduleChain(remaining) {
    if (!remaining.length) return;

    const next = remaining[0];
    const delay = Math.max(0, next.notifyAt - Date.now());

    const timerId = setTimeout(async () => {
        try {
            await self.registration.showNotification(next.title, {
                body: next.body,
                icon: '/images/vinh-hy.jpg',
                tag: next.id,
                requireInteraction: false,
                data: { url: '/schedule.html' }
            });
        } catch {}
        scheduleChain(remaining.slice(1));
    }, delay);

    scheduledTimers.push(timerId);
}

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = (event.notification.data && event.notification.data.url) || '/schedule.html';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
            for (const client of clients) {
                if (client.url.includes(url) && 'focus' in client) {
                    return client.focus();
                }
            }
            return self.clients.openWindow(url);
        })
    );
});
