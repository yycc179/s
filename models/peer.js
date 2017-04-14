const db = require('./db');
const Schema = db.Schema;

const schema = Schema({
    mac: { type: String, index: true, unique: true },
    ip: { type: String },
    loc: { type: Schema.Types.ObjectId, index: true, ref: 'country' },
    city: { type: Schema.Types.ObjectId, index: true, ref: 'city' },
    snr: Number,
    times: { type: Number, default: 0 },
}, {
        versionKey: false,
        timestamps: true
    }
);

schema.index({ updatedAt: -1, loc: 1, snr: 1 })
schema.index({ snr: 1, loc: 1, updatedAt: 1 })

schema.plugin(require('mongoose-paginate'));

const Peer = db.model('peer', schema);

module.exports = Peer
