const router = require('express').Router()
    , Admin = require('../../models/admin')
    , Join = require("bluebird").join
    , client = require('../../models/settings')
    , Country = require('../../models/country')
    , City = require('../../models/city');

router.get('/snr', (req, res, next) => {
    Join(Country.find().sort({ name: 1 }).lean().exec(),
        client.hgetAsync('config', 'valid_time'),
        (datas, time) => {
            res.render('snr', { title: 'snr', user: req.user, datas, time });
        })
       .catch(e => next(e))
});

function getCountry() {
    return City.aggregate([
        { $group: { _id: '$country', count: { $sum: '$peer' } } },
        { $sort: { count: 1 } }]).exec();
}

router.get('/peer', (req, res, next) => {
    getCountry()
        .then(datas => res.render('peer',
            {
                title: 'peer', user: req.user,
                datas,
                countries: datas,
                current: null
            })
        )
        .catch(e => next(e))
});

router.get('/peer/:country', (req, res, next) => {
    var datas;
    const { country } = req.params;
    City.aggregate([
        { $match: { country } },
        { $group: { _id: '$name', count: { $sum: '$peer' } } },
        { $sort: { count: -1 } }])
        .limit(1000)
        .exec()
        .then(cities => {
            datas = cities
            return Country.find().sort({ name: 1 }).lean().exec();
        })
        .then(countries => {
            countries.map(c => {c._id = c.name; delete c.name})
            res.render('peer', { title: 'peer', user: req.user, datas, countries, current: country });
        })
        .catch(e => next(e))
});

module.exports = router