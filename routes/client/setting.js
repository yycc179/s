const router = require('express').Router()
    , client = require('../../models/settings');


router.get('/', (req, res, next) => {
    client.hgetall('config', (e, obj) => {
        if (e) return next(e);
        res.render('setting', {
            title: 'setting',
            user: req.user,
            config: obj,
        });
    });
});

router.post('/', (req, res, next) => {
    client.hmset('config', req.body, e => {
        if(e) return next(e)
        res.status(200);
        res.end();
    });
});

module.exports = router