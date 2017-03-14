const router = require('express').Router()
    , Admin = require('../../models/admin')
    , City = require('../../models/city')
    , config = require('../../config');

router.get('/snr', (req, res) => {
    City.find().sort({ peer: -1 }).exec((e, cities) => {
        if (e) return next(e);
        res.render('snr', { title: 'snr', user: req.user, cities});
    })
});


router.get('/peer', (req, res) => {
    City.getCountry()
    .then(datas => res.render('peer',
        { title: 'peer', user: req.user, 
        datas, 
        countries: datas, 
        current: null })
    )
    .catch(e => next(e))
});


router.get('/peer/:country', (req, res, next) => {
    var datas;
    const {country} = req.params;
    City.aggregate([
        { $match: { country } },
        { $group: { _id: '$city', count: { $sum: '$peer' } } },
        { $sort: { count: -1 } }])
        .limit(1000)
        .exec()
        .then(cities => {
            datas = cities
            return City.getCountry();
        })
        .then(countries => {
            res.render('peer', { title: 'peer', user: req.user, datas, countries, current: country });
        })
        .catch(e => next(e))
});

module.exports = router