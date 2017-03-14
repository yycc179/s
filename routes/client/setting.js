const router = require('express').Router()
    , Admin = require('../../models/admin')
    , config = require('../../config');




router.get('/', (req, res) => {
    res.render('setting', {
        title: 'setting',
        user: req.user,
        config: config.client,
        // info: req.query.ok
    });

});

router.post('/', (req, res, next) => {
    var client = config.client;

    for (key in client) {
        client[key] = req.body[key] || client[key];
    }

    res.status(200);
    res.end();

});

module.exports = router