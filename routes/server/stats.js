const router = require('express').Router()
    , Promise = require("bluebird")
    , ObjectId = require('mongoose').Types.ObjectId
    , { getUpdatedAt } = require('./utils')
    , Peer = require('../../models/peer')
    , City = require('../../models/city');

const { SNR_MAX, SNR_MIN, SNR_WEIGHT } = require('../../config')


router.get('/snr/city/:city', (req, res, next) => {
    const { city } = req.params;
    const ar_group = [];
    const updatedAt = getUpdatedAt(req.query.t);

    for (var j = SNR_MIN; j < SNR_MAX; j += SNR_WEIGHT) {
        var end = j + SNR_WEIGHT
        ar_group.push([end, Peer.find({ city, updatedAt})
            .where('snr').gt(j).lte(end)
            .count().exec()])
    }

    let data = [];
    Promise.reduce(ar_group,
        (total, [key, p]) => p.then(count => data.push([key, count])))
        .then(() => {
            data.sort((a, b) => {
                return a[0] - b[0];
            })
            res.json(data);
        }).catch(e => next(e))
});


router.get('/snr/summary/:city', (req, res, next) => {
    Peer.aggregate([
        {
            $match: {
                city: ObjectId(req.params.city),
                snr: { $gt: SNR_MIN },
                updatedAt: getUpdatedAt(req.query.t)
            }
        },
        { $sort: { updatedAt: -1 } },
        { $limit: 10000 },
        { $project: { _id: 0, snr: 1 } },
    ]).sort('snr').exec()
        .then(docs => {
            if (!docs.length) {
                return res.json([[0, 0], [0.1, 0], [0.2, 0], [0.3, 0], [0.4, 0], [0.5, 0]])
            }

            var data = [];
            for (var i = 0; i <= 0.5; i += 0.1) {
                var snr = docs[parseInt(docs.length * i)].snr;
                data.push([i.toFixed(2), snr])
            }
            res.json(data)
        })
        .catch(e => next(e))

});

router.get('/snr/json/:city', (req, res, next) => {
    if (req.query.sort) {
        var sort = {
            [req.query.sort]: req.query.order == 'asc' ? 1 : -1
        };
    }

    const options = {
        select: '-_id ip snr updatedAt times',
        sort,
        lean: true,
        leanWithId: false,
        offset: parseInt(req.query.offset),
        limit: parseInt(req.query.limit)
    };

    Peer.paginate({ city: req.params.city },
        options, function (err, result) {
            if (err) return next(err)
            result.rows = result.docs;
            delete result.docs;
            res.json(result)
        });
});


module.exports = router;