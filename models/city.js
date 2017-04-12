const db = require('./db');

const Schema = db.Schema({
    name: { type: String, index: true},
    country: { type: String, index: true },
    peer: { type: Number, default: 0 },
    pos: Array,
})

const City = db.model('city', Schema);

module.exports = City
