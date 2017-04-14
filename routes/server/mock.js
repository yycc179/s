const router = require('express').Router()
    , Promise = require("bluebird")
    , ObjectId = require('mongoose').Types.ObjectId
    , Peer = require('../../models/peer')
    , Country = require('../../models/country')
    , City = require('../../models/city');


router.post('/remove/:loc', (req, res, next) => {
    const { loc } = req.params;

    Country.findById(loc)
        .then(doc =>
            Promise.join(City.update({ country: doc.name }, { $set: { peer: 0 } }, { multi: true }).exec(),
                Peer.remove({ loc }).exec(), () => {
                    res.json({ ok: 1 })
                })
        )
        .catch(e => next(e))
});

router.post('/remove/:loc/:mac', (req, res, next) => {
    const { mac } = req.params;
    Peer.findOneAndRemove({ mac })
        .then(doc =>
            City.findByIdAndUpdate(doc.city, { $inc: { peer: -1 } })
        )
        .then((r) => {
            console.log(r)
            res.json({ ok: 1 })
        })
        .catch(e => next(e))
});

router.post('/save/:loc', (req, res, next) => {
    const { loc } = req.params;
    var promise = [];
    var new_data = [];

    req.body.forEach(d => {
        if (d.updatedAt) {
            promise.push(Peer.findOneAndUpdate({ mac: d.mac },
                {
                    ip: d.ip, snr: d.snr,
                    $inc: { times: 1 }
                }).exec())
        }
        else {
            d.loc = ObjectId(loc);
            d.times = 1;
            new_data.push(d);
        }
    })

    if (!new_data.length) {
        return Promise.all(promise)
            .then(() => res.json({ ok: 1 }))
            .catch(e => next(e))

    }

    Country.findById(loc).exec()
        .then(doc =>
            City.findOneAndUpdate({ name: 'mock', country: doc.name },
                { $inc: { peer: new_data.length } },
                { upsert: true, new: true })
        )
        .then(doc => {
            console.log(doc)
            new_data.map(x => { x.city = ObjectId(doc._id) })
            promise.push(Peer.insertMany(new_data))
            return Promise.all(promise)
        })
        .then(() => res.json({ ok: 1 }))
        .catch(e => next(e))

});

module.exports = router;