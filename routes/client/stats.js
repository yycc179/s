const router = require('express').Router()
    , Admin = require('../../models/admin')
    , Join = require("bluebird").join
    , client = require('../../models/settings')
    , City = require('../../models/city');

router.get('/snr', (req, res) => {
    Join(City.find().sort({ peer: -1 }).exec(),
        client.hgetAsync('config', 'valid_time'),
        (cities, time) => {
            res.render('snr', { title: 'snr', user: req.user, cities, time });
        })
       .catch(e => next(e))
});


function getCountry() {
    return City.aggregate([
        { $group: { _id: '$country', count: { $sum: '$peer' } } },
        { $sort: { count: 1 } }]).exec();
}

router.get('/peer', (req, res) => {
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
        { $group: { _id: '$city', count: { $sum: '$peer' } } },
        { $sort: { count: -1 } }])
        .limit(1000)
        .exec()
        .then(cities => {
            datas = cities
            return getCountry();
        })
        .then(countries => {
            res.render('peer', { title: 'peer', user: req.user, datas, countries, current: country });
        })
        .catch(e => next(e))
});

module.exports = router