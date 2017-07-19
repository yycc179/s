const router = require('express').Router()
    , Promise = require('bluebird')
    , client = require('../../models/settings')
    , Qos = require('../../models/qos');

router.get('/', (req, res, next) => {
    res.render('qos', {
        title: 'qos',
        user: req.user,
    })
});

router.post('/:id', (req, res, next) => {
    var lnb = req.body.antenna.lnb;
    lnb.freq = (lnb.freq_h << 16) + lnb.freq_l;
    Qos.findByIdAndUpdate(req.params.id, req.body, e => {
        if (e) return next(e);
        res.json({ ok: 1 })
    })
});

router.post('/del/:id', (req, res, next) => {
    Qos.remove({ _id: req.params.id }, e => {
        if (e) return next(e);
        res.json({ ok: 1 })
    })
});

function wrapper_data(docs, next_query) {
    var now = new Date();
    now.setSeconds(now.getSeconds() - next_query - 5);
    docs.map(d => {
        d.active = d.updatedAt > now;
        var lnb = d.antenna && d.antenna.lnb;
        if (lnb) {
            lnb.freq_h = lnb.freq >> 16;
            lnb.freq_l = lnb.freq & 0xffff;
            delete lnb.freq;
        }

        delete d.updatedAt
    })
}

router.get('/list', (req, res, next) => {
    Promise.join(client.hgetAsync('config', 'next_query'),
        Qos.find().sort('loc_s').select('-loc').lean().exec(),
        (value, datas) => {
            wrapper_data(datas, value)
            res.json(datas)
        })
        .catch(e => next(e))
});

router.get('/status', (req, res, next) => {
    Promise.join(client.hgetAsync('config', 'next_query'),
        Qos.find().sort('loc_s').select('-_id updatedAt status').lean().exec(),
        (value, datas) => {
            wrapper_data(datas, value)
            res.json(datas)
        })
        .catch(e => next(e))
});

module.exports = router