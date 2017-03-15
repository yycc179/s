const db = require('./db');
const Schema = db.Schema;


const schema = Schema({
    _id: { type: String, unique: true, default: require('shortid').generate },
    ip: { type: String, index: true, unique: true },
    city: { type: Schema.Types.ObjectId, ref: 'city' },
    // updatedAt: Date,
}, {
        versionKey: false,
        timestamps: true
    }
);

const Qos = db.model('qos', schema);

module.exports = Qos