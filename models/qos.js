const db = require('./db');
const Schema = db.Schema;


const schema = Schema({
    _id: { type: String, unique: true, default: require('shortid').generate },
    mac: { type: String, index: true, unique: true },
    ip: { type: String },
    city: { type: Schema.Types.ObjectId, index: true, ref: 'city' },
    snr_local: Number,
    att_aim: { type: Number, default: 3 },
    att_inv: { type: Number, default: 5 },
    att_step: { type: Number, default: 0.25 },
    manual: { type: Boolean, default: false },
}, {
        versionKey: false,
        timestamps: true
    }
);

const Qos = db.model('qos', schema);

module.exports = Qos