const router = require('express').Router()
    , client = require('../../models/settings')
    , Qos = require('../../models/qos');


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

router.get('/qos', (req, res, next) => {
    Qos.find({}, (e, datas) => {
        res.render('qos', {
            title: 'qos',
            user: req.user,
            datas,
        });
    })
});

router.post('/qos/:id', (req, res, next) => {
    Qos.findByIdAndUpdate(req.params.id, req.body, (e, raw) => {
        if(e) return next(e);
        res.json({ok:1})
    })
});

module.exports = router