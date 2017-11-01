const db = require('./db');
const Schema = db.Schema;

const schema = Schema({
    _id: { type: String, unique: true, default: require('shortid').generate },
    name: { type: String, unique: true},
    lnb: {
        type: { type: Number, default: 0 },
        freq: { type: Number, default: 0 }
    },
    tp: {
        freq: { type: Number, default: 0 },
        rate: { type: Number, default: 0 },
        polar: { type: Number, default: 0 },
    },
    k22: {type: Boolean, default: false},
    disc10: {type: Number, default: 0},
});

module.exports = db.model('sat', schema)