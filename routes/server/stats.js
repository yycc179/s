const router = require('express').Router()
    , Promise = require("bluebird")
    , Peer = require('../../models/peer')
    , City = require('../../models/city');

const { SNR_MAX, SNR_MIN, SNR_WEIGHT } = require('../../config')

router.get('/snr/city/:city', (req, res, next) => {
    let data = [];
    const { city } = req.params;

    const ar_group = [];
    for (var j = SNR_MIN; j < SNR_MAX; j += SNR_WEIGHT) {
        var end = j + SNR_WEIGHT
        ar_group.push([end, Peer.find({ city })
            .where('snr')
            .gt(j).lte(end)
            .count().exec()])
    }

    Promise.reduce(ar_group,
        (total, [key, p]) => p.then(count => data.push([key, count])))
        .then(() => {
            data.sort((a, b) => {
                return a[0] - b[0];
            })
            res.json(data);
        }).catch(e => next(e))
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