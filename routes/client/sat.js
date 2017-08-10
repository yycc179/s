const router = require('express').Router()
    , Promise = require('bluebird')
    , client = require('../../models/settings')
    , Sat = require('../../models/sat');

router.post('/edit', (req, res, next) => {
    var lnb = req.body.lnb;
    lnb.freq = (lnb.freq_h << 16) + lnb.freq_l;
    const { _id } = req.body

    if (_id) {
        Sat.findByIdAndUpdate(_id, req.body, e => {
            if (e) return next(e);
            res.json({ ok: 1, _id })
        })
    }
    else {
        var s = new Sat(req.body)
        s.save(e => {
            console.log(e)
            if (e) {
                if (e.code = 11000) {
                    return res.json({ ok: 0, err: "Name duplicate" })
                }
                else {
                    return next(e)
                }
            }
            res.json({ ok: 1, _id: s._id })
        })
    }

});

router.post('/del/:id', (req, res, next) => {
    Sat.remove({ _id: req.params.id }, e => {
        if (e) return next(e);
        res.json({ ok: 1 })
    })
});


router.get('/list', (req, res, next) => {
    Sat.find().sort('name').lean().exec()
        .then(datas => {
            datas.map(d => {
                var lnb = d.lnb;
                if (d.lnb) {
                    lnb.freq_h = lnb.freq >> 16;
                    lnb.freq_l = lnb.freq & 0xffff;
                    delete lnb.freq;
                }

            })
            res.json(datas)
        })
        .catch(e => {
            next(e)
        })

});



module.exports = router