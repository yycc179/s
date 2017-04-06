const router = require('express').Router()
    , Qos = require('../../models/qos');

router.get('/', (req, res, next) => {
    Qos.find().sort('city').lean().exec()
        .then(docs => {
            return Qos.populate(docs, { path: 'city', select: '-_id city country' })
        })
        .then(datas => {
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
    Qos.find().select('local').lean().exec((e, docs) => {
        if (e) return next(e)
        res.json(docs)
    })
});

module.exports = router