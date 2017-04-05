const db = require('./db');
const Schema = db.Schema;


const schema = Schema({
    _id: { type: String, unique: true, default: require('shortid').generate },
    mac: { type: String, index: true, unique: true },
    ip: { type: String },
    manual: {
        target: { type: Number},
        step: { type: Number},
        step_time: { type: Number },
    },
    auto: { type: Boolean, default: true },
    city: { type: Schema.Types.ObjectId, ref: 'city' },
    // updatedAt: Date,
}, {
        versionKey: false,
        timestamps: true
    }
);

const Qos = db.model('qos', schema);

module.exports = Qos