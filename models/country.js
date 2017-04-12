const db = require('./db');

const Schema = db.Schema({
    _id: { type: String, unique: true, default: require('shortid').generate },
    name: { type: String, index: true, unique: true},
})

const Country = db.model('country', Schema);

module.exports = Country
