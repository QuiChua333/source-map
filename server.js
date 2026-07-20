require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
app.use(express.json());

// ── MongoDB ──
let mongoConnected = false;
async function connectDB() {
    if (mongoConnected) return;
    await mongoose.connect(process.env.MONGO_URI);
    mongoConnected = true;
    console.log('[MongoDB] Connected');
}

// ── Mongoose schemas ──
const seatSchema = new mongoose.Schema({
    assignments: { type: Map, of: String, default: new Map() },
    updatedAt: { type: Date, default: Date.now }
});
const Seat = mongoose.models.Seat || mongoose.model('Seat', seatSchema);

const tokenSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});
const FcmToken = mongoose.models.FcmToken || mongoose.model('FcmToken', tokenSchema);

const eventSchema = new mongoose.Schema({
    id: String, timeDisplay: String, isoVN: String,
    title: String, body: String, detail: String,
    subitems: [String],
    notify: { type: Boolean, default: true }
}, { _id: false });

const daySchema = new mongoose.Schema({
    id: String, label: String, date: String, subtitle: String,
    color: { type: String, default: 'blue' },
    meals: [String],
    events: [eventSchema]
}, { _id: false });

const scheduleSchema = new mongoose.Schema({
    days: [daySchema],
    updatedAt: { type: Date, default: Date.now }
});
const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);

// ── Firebase Admin ──
const serviceAccount = require('./firebase-adminsdk.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// ── Public config API (client-side keys from .env) ──
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

app.get('/api/config', (req, res) => {
    res.json({
        mapboxToken: process.env.MAPBOX_TOKEN,
        seatPin: process.env.SEAT_PIN,
        firebase: firebaseConfig,
        fcmVapidKey: process.env.FCM_VAPID_KEY
    });
});

// ── Dynamic firebase-messaging-sw.js (inject config from env) ──
app.get('/firebase-messaging-sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Service-Worker-Allowed', '/');
    res.send(`
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

firebase.initializeApp(${JSON.stringify(firebaseConfig)});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const { title, body } = payload.notification || {};
    self.registration.showNotification(title || 'Viet Sun Travel', {
        body: body || '',
        icon: '/images/vinh-hy.jpg',
        data: { url: payload.data?.url || '/schedule.html' }
    });
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/schedule.html';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
            for (const client of clients) {
                if (client.url.includes(url) && 'focus' in client) return client.focus();
            }
            return self.clients.openWindow(url);
        })
    );
});
    `.trim());
});

// ── Seats API ──
app.get('/api/seats', async (req, res) => {
    try {
        await connectDB();
        let doc = await Seat.findOne();
        if (!doc) doc = await Seat.create({});
        const obj = {};
        if (doc.assignments) doc.assignments.forEach((v, k) => { obj[k] = v; });
        res.json(obj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/seats', async (req, res) => {
    try {
        await connectDB();
        const { assignments, pin } = req.body || {};
        if (pin !== process.env.SEAT_PIN) {
            return res.status(403).json({ error: 'PIN không đúng' });
        }
        let doc = await Seat.findOne();
        if (!doc) doc = new Seat();
        doc.assignments = new Map(Object.entries(assignments || {}));
        doc.updatedAt = new Date();
        await doc.save();
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/seats', async (req, res) => {
    try {
        await connectDB();
        const { pin } = req.body || {};
        if (pin !== process.env.SEAT_PIN) {
            return res.status(403).json({ error: 'PIN không đúng' });
        }
        let doc = await Seat.findOne();
        if (doc) {
            doc.assignments = new Map();
            doc.updatedAt = new Date();
            await doc.save();
        }
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── FCM Token API ──
app.post('/api/fcm-token', async (req, res) => {
    try {
        await connectDB();
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token required' });
        await FcmToken.findOneAndUpdate(
            { token },
            { token, createdAt: new Date() },
            { upsert: true }
        );
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/fcm-token', async (req, res) => {
    try {
        await connectDB();
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token required' });
        await FcmToken.deleteOne({ token });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Schedule API ──
const DEFAULT_SCHEDULE = require('./js/schedule-seed.json');

app.get('/api/schedule', async (req, res) => {
    try {
        await connectDB();
        let doc = await Schedule.findOne();
        if (!doc) {
            doc = await Schedule.create({ days: DEFAULT_SCHEDULE });
        }
        res.json(doc.days);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

function parseDayDate(d) {
    if (!d) return Infinity;
    const [day, month, year] = d.split('/');
    return new Date(year, month - 1, day).getTime();
}

app.put('/api/schedule', async (req, res) => {
    try {
        await connectDB();
        const { days, pin } = req.body || {};
        if (pin !== process.env.SEAT_PIN) {
            return res.status(403).json({ error: 'PIN khong dung' });
        }
        // Auto-sort: events by time within each day, days by date
        days.forEach(day => {
            if (day.events) day.events.sort((a, b) => (a.timeDisplay || '').localeCompare(b.timeDisplay || ''));
        });
        days.sort((a, b) => {
            const da = parseDayDate(a.date);
            const db = parseDayDate(b.date);
            return da - db;
        });

        let doc = await Schedule.findOne();
        if (!doc) doc = new Schedule();
        doc.days = days;
        doc.updatedAt = new Date();
        await doc.save();
        res.json({ ok: true, days: doc.days });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Test push notification ──
app.post('/api/test-push', async (req, res) => {
    try {
        await connectDB();
        const { pin } = req.body || {};
        if (pin !== process.env.SEAT_PIN) {
            return res.status(403).json({ error: 'PIN khong dung' });
        }
        await sendPushToAll({
            id: 'test',
            title: 'Test thông báo',
            body: 'Đây là thông báo thử nghiệm từ Viet Sun Travel'
        });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Static files (sau API routes) ──
app.use(express.static(path.join(__dirname)));

// ── Cron: mỗi phút check event cần push (đọc từ DB) ──
const notifiedSet = new Set();

cron.schedule('* * * * *', async () => {
    try {
        await connectDB();
        const doc = await Schedule.findOne();
        if (!doc) return;

        const now = Date.now();
        const TWENTY_MIN = 20 * 60 * 1000;

        for (const day of doc.days) {
            for (const ev of day.events) {
                const eventTime = new Date(ev.isoVN).getTime();
                const notifyTime = eventTime - TWENTY_MIN;
                const diff = notifyTime - now;

                if (ev.notify === false) continue;
                if (diff >= -60000 && diff <= 60000 && !notifiedSet.has(ev.id)) {
                    notifiedSet.add(ev.id);
                    await sendPushToAll({ title: ev.title, body: ev.body });
                }
            }
        }
    } catch (err) {
        console.error('[Cron] Error:', err.message);
    }
});

async function sendPushToAll(event) {
    try {
        await connectDB();
        const tokens = await FcmToken.find();
        if (!tokens.length) {
            console.log(`[FCM] No tokens registered, skipping "${event.title}"`);
            return;
        }

        const tokenStrings = tokens.map(t => t.token);

        const response = await admin.messaging().sendEachForMulticast({
            tokens: tokenStrings,
            notification: {
                title: 'Sắp đến: ' + event.title,
                body: event.body
            },
            data: {
                url: '/schedule.html',
                eventId: String(event.id || '')
            },
            webpush: {
                fcmOptions: { link: '/schedule.html' }
            }
        });

        response.responses.forEach((resp, i) => {
            if (!resp.success) {
                console.error(`[FCM] Token ${i} error:`, resp.error?.code, resp.error?.message);
                const code = resp.error?.code;
                if (code === 'messaging/registration-token-not-registered' ||
                    code === 'messaging/invalid-registration-token') {
                    FcmToken.deleteOne({ token: tokenStrings[i] }).catch(() => {});
                }
            }
        });

        console.log(`[FCM] Push "${event.title}" → ${response.successCount}/${tokens.length} OK`);
    } catch (err) {
        console.error('[FCM] Error:', err.message);
    }
}

// ── Start server ──
const PORT = process.env.PORT || 4826;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('');
        console.log('  ==========================================');
        console.log('   VST Tour Map - Server is running');
        console.log('  ==========================================');
        console.log('');
        console.log(`  > Ban do:       http://localhost:${PORT}`);
        console.log(`  > Lich trinh:   http://localhost:${PORT}/schedule.html`);
        console.log(`  > Cho ngoi:     http://localhost:${PORT}/seat.html`);
        console.log(`  > API config:   http://localhost:${PORT}/api/config`);
        console.log('');
        console.log('  [Cron] Push notification check moi phut');
        console.log('  [Ctrl+C] de dung server');
        console.log('');
    });
}).catch(err => {
    console.error('[MongoDB] Connection failed:', err.message);
    process.exit(1);
});
