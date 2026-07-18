const mongoose = require('mongoose');

let cached = global._mongoConn || (global._mongoConn = { conn: null, promise: null });

async function connectDB() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

const seatSchema = new mongoose.Schema({
    assignments: { type: Map, of: String, default: new Map() },
    updatedAt: { type: Date, default: Date.now }
});

const Seat = mongoose.models.Seat || mongoose.model('Seat', seatSchema);

module.exports = async function handler(req, res) {
    await connectDB();

    if (req.method === 'GET') {
        let doc = await Seat.findOne();
        if (!doc) doc = await Seat.create({});
        const obj = {};
        if (doc.assignments) doc.assignments.forEach((v, k) => { obj[k] = v; });
        return res.json(obj);
    }

    if (req.method === 'PUT') {
        const { assignments, pin } = req.body || {};
        if (pin !== process.env.SEAT_PIN) {
            return res.status(403).json({ error: 'PIN không đúng' });
        }
        let doc = await Seat.findOne();
        if (!doc) doc = new Seat();
        doc.assignments = new Map(Object.entries(assignments || {}));
        doc.updatedAt = new Date();
        await doc.save();
        return res.json({ ok: true });
    }

    if (req.method === 'DELETE') {
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
        return res.json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
};
