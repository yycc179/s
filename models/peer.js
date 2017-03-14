const db = require('./db');
const Schema = db.Schema;

const schema = Schema({
    ip: { type: String, index: true, unique: true },
    city: { type: Schema.Types.ObjectId, index: true, ref: 'city' },
    snr: Number,
    times: Number,
}, {
        versionKey: false,
        timestamps: true
    }
);

schema.index({ city: 1, snr: 1, updatedAt: -1 })

schema.plugin(require('mongoose-paginate'));

const Peer = db.model('peer', schema);

module.exports = Peer
