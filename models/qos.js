const db = require('./db');
const Schema = db.Schema;


const schema = Schema({
    _id: { type: String, unique: true, default: require('shortid').generate },
    mac: { type: String, index: true, unique: true },
    ip: { type: String },

    updatedAt: {type: Date, default: Date.now},

    loc: { type: Schema.Types.ObjectId, ref: 'country' },
    loc_s: { type: String },

//old start, 
    att_aim: { type: Number, default: 3 },  
    att_inv: { type: Number, default: 5 },
    att_step: { type: Number, default: 0.25 },

    snr_local: Number,
    manual: { type: Boolean, default: false },
//old end

    att: {
        manual: { type: Boolean, default: false },
        aim: { type: Number, default: 3 },
        inv: { type: Number, default: 5 },
        step:  { type: Number, default: 0.25 },
    },

    antenna: {
        manual: { type: Boolean, default: false },
        lnb: {
            type: { type: Number, default: 0 },
            freq: { type: Number, default: 0 }
        },
        tp: {
            freq: { type: Number, default: 0 },
            rate: { type: Number, default: 0 },
            polar: { type: Number, default: 0 },
        },
    },

    status: {
        snr: Number,
        antenna: String,
    }
});

const Qos = db.model('qos', schema);

module.exports = Qos