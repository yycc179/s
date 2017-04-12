const db = require('./db');

const Schema = db.Schema({
    name: { type: String, index: true, unique: true},
})

const Country = db.model('country', Schema);

module.exports = Country
