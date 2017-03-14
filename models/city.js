const db = require('./db');

const Schema = db.Schema({
    city: { type: String, index: true, unique: true },
    country: { type: String, index: true },
    peer: { type: Number, default: 0 },
    pos: Array,
})

const City = db.model('city', Schema);

City.getCountry = function () {
    return City.aggregate([
        { $group: { _id: '$country', count: { $sum: '$peer' } } },
        { $sort: { count: 1 } }]).exec();
}

module.exports = City
