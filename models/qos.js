const db = require('./db');
const Schema = db.Schema;


const schema = Schema({
    _id: { type: String, unique: true, default: require('shortid').generate },
    mac: { type: String, index: true, unique: true },
    ip: { type: String },
    loc: { type: Schema.Types.ObjectId, ref: 'country' },
    loc_s: { type: String },
    snr_local: Number,
    att_aim: { type: Number, default: 3 },
    att_inv: { type: Number, default: 5 },
    att_step: { type: Number, default: 0.25 },
    manual: { type: Boolean, default: false },
    updatedAt: {type: Date, default: Date.now}
});

const Qos = db.model('qos', schema);

module.exports = Qos