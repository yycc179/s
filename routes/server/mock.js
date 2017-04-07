const router = require('express').Router()
    , Promise = require("bluebird")
    , ObjectId = require('mongoose').Types.ObjectId
    , Peer = require('../../models/peer')
    , City = require('../../models/city');


router.post('/remove/:city', (req, res, next) => {
    const { city } = req.params;
    Promise.join(City.findOneAndUpdate({ city }, { $set: { peer: 0 } }).exec(),
        Peer.remove({ city }).exec(), () => {
            res.json({ ok: 1 })
        }
    )
});

router.post('/remove/:city/:mac', (req, res, next) => {
    const { city, mac } = req.params;
    Promise.join(City.findOneAndUpdate({ city }, { $inc: { peer: -1 } }).exec(),
        Peer.remove({ mac }).exec(), () => {
            res.json({ ok: 1 })
        }
    )
});

router.post('/save/:city', (req, res, next) => {
    const { city } = req.params;
    var promise = [];
    var new_data = [];
    req.body.forEach(d => {
        if (d.updatedAt) {
            promise.push(Peer.findOneAndUpdate({mac: d.mac}, {ip: d.ip, snr: d.snr, $inc: {times: 1}}).exec())
        }
        else {
            d.city = ObjectId(city);
            d.times = 1;
            new_data.push(d);
        }
    })

    if (new_data.length) {
        promise.push(Peer.insertMany(new_data))
        promise.push(City.findByIdAndUpdate(city, {$inc: {peer: new_data.length}}))

    }

    Promise.all(promise)
        .then(() => res.json({ ok: 1 }))
        .catch(e => next(e))

});

module.exports = router;