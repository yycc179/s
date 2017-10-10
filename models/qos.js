const db = require('./db');
const Schema = db.Schema;


const schema = Schema({
    _id: { type: String, unique: true, default: require('shortid').generate },
    mac: { type: String, index: true, unique: true },
    ip: { type: String },

    updatedAt: { type: Date, default: Date.now },

    loc: { type: Schema.Types.ObjectId, ref: 'country' },

    att: {
        factor: { type: Number, default: 0 },
        inv: { type: Number, default: 5 },
        step: { type: Number, default: 0.5 },
        snr_aim: { type: Number, default: 3 },
        att_aim: { type: Number, default: 3 },
        mode: { type: Number, default: 0 },
    },

    antenna: {
        manual: { type: Boolean, default: false },
        satellite: { type: String, ref: 'sat' },
    },

    status: {
        snr: Number,
        attenuator: Number,
        antenna: {
            locked: { type: Boolean, default: false },
        },
    }
});

const Qos = db.model('qos', schema);

module.exports = Qos