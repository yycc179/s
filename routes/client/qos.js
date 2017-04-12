const router = require('express').Router()
    , Promise = require('bluebird')
    , client = require('../../models/settings')
    , Qos = require('../../models/qos');

function setStatus(docs, next_query) {
    var now = new Date();
    now.setSeconds(now.getSeconds() - next_query - 5);
    docs.map(d => {
        d.status = d.updatedAt > now ? 'active' : 'inactive';
        delete d.updatedAt
    })
}

router.get('/', (req, res, next) => {
    Promise.join(client.hgetAsync('config', 'next_query'),
        Qos.find().sort('loc').lean().exec(),
        (value, datas) => {
            setStatus(datas, value)
            res.render('qos', {
                title: 'qos',
                user: req.user,
                datas,
            });
        })
        .catch(e => next(e))
});

router.post('/:id', (req, res, next) => {
    Qos.findByIdAndUpdate(req.params.id, req.body, e => {
        if (e) return next(e);
        res.json({ ok: 1 })
    })
});

router.get('/local', (req, res, next) => {
    Promise.join(client.hgetAsync('config', 'next_query'),
        Qos.find().sort('loc').select('snr_local updatedAt').lean().exec(),
        (value, datas) => {
            setStatus(datas, value)
            res.json(datas)
        })
        .catch(e => next(e))

});

module.exports = router