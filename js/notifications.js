(function () {
    const STORAGE_KEY = 'vt_notif';
    let appConfig = null;

    function isSupported() {
        return 'Notification' in window && 'serviceWorker' in navigator;
    }

    function isEnabled() {
        return !!localStorage.getItem(STORAGE_KEY) && Notification.permission === 'granted';
    }

    async function loadConfig() {
        if (appConfig) return appConfig;
        const res = await fetch('/api/config');
        appConfig = await res.json();
        return appConfig;
    }

    async function cleanOldSW() {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
            if (reg.active?.scriptURL?.endsWith('/sw.js')) {
                await reg.unregister();
            }
        }
    }

    async function enableNotifications() {
        if (!isSupported()) {
            alert('Trình duyệt không hỗ trợ thông báo.');
            return false;
        }

        const perm = await Notification.requestPermission();
        if (perm !== 'granted') return false;

        try {
            const config = await loadConfig();
            await cleanOldSW();

            const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            await navigator.serviceWorker.ready;

            if (!firebase.apps.length) {
                firebase.initializeApp(config.firebase);
            }
            const messaging = firebase.messaging();

            const token = await messaging.getToken({
                vapidKey: config.fcmVapidKey,
                serviceWorkerRegistration: reg
            });

            if (!token) return false;

            await fetch('/api/fcm-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            localStorage.setItem(STORAGE_KEY, token);

            messaging.onMessage((payload) => {
                const { title, body } = payload.notification || {};
                new Notification(title || 'Viet Sun Travel', {
                    body: body || '',
                    icon: '/images/vinh-hy.jpg'
                });
            });

            return true;
        } catch (err) {
            console.error('FCM registration failed:', err);
            return false;
        }
    }

    async function disableNotifications() {
        const token = localStorage.getItem(STORAGE_KEY);
        if (token) {
            try {
                await fetch('/api/fcm-token', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
            } catch (e) {}
        }
        localStorage.removeItem(STORAGE_KEY);
    }

    async function autoActivate() {
        if (!isSupported()) return;
        if (!isEnabled()) return;
        try { await enableNotifications(); } catch {}
    }

    window.NotificationManager = {
        isSupported,
        isEnabled,
        enableNotifications,
        disableNotifications,
        autoActivate,
        loadConfig
    };

    document.addEventListener('DOMContentLoaded', () => {
        autoActivate();
    });
})();
