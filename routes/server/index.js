const router = require('express').Router()
    , Promise = require("bluebird")
    , geoip = require('geoip-lite')
    , request = require('request')
    , config = require('../../config')
    , City = require('../../models/city')
    , Qos = require('../../models/qos')
    , Peer = require('../../models/peer');

const { SNR_MAX, SNR_MIN, SNR_WEIGHT, client } = config

function getClientIp(req) {
    return req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress ||
        req.headers['x-forwarded-for'];
};

function queryCity(ip) {
    const data = geoip.lookup(ip);
    if (data && data.city) {
        return Promise.resolve(data)
    }

    return new Promise((resolve, reject) => {
        request({ url: `http://ipinfo.io/${ip}/geo`, json: true }, (err, res, body) => {
            if (err) return reject('locate city failed, ip : ' + ip);

            resolve({ city: body.region || body.city, country: body.country })
        })
    })

}

/**
 * @apiDefine NotFoundError
 *
 * @apiError {String} err err info
 * @apiError {String} [stack] stack info, only in development env
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404
 *     {
 *       "err": "invalid request"
 *     }
 */

/**
 * @api {get} /config get config
 * @apiGroup GENERAL
 * @apiName getConfig
 * @apiParam {String} t type, p | q
 *
 * @apiSuccess {String} version version info
 * @apiSuccess {Boolean} valid  acitve state.
 * @apiSuccess {Number} period  request peroid/seconds.
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "version": "0.1.0",
 *       "valid": true,
 *       "period": 3600
 *     }
 *
 * @apiUse NotFoundError
 * 
 */
router.get('/config', (req, res, next) => {
    const ip = getClientIp(req);
    const { t } = req.query;

    const conf = {
        version: process.env.npm_package_version,
        valid: true
    }

    let role = Peer;
    let inc = 1;
    switch (t) {
        case 'q':
            role = Qos;
            inc = 0;
            conf.period = client.next_query;
            break;

        case 'p':
            conf.period = client.next_update;
            break;
        default:
            return next();
            break;
    }

    role.findOne({ip}).exec((e, d) => {
        if(e) return next(e);
        if(d && d.city) return res.json(conf);

        queryCity(ip)
            .then(({ city = 'unknow', country = 'UNKNOW' }) => {
                return City.findOneAndUpdate({ city, country},
                    { $inc: { peer: inc }},
                    { upsert: true, new: true })
                    .exec();
            })
            .then(city => {
                if(!d) d = new role({ip});
                d.city = city._id;
                console.log(d);
                d.save(e => {
                    if(e) return next(e);
                    res.json(conf);
                })
            }).catch(e => next(e))
    })
});


router.get('/location', (req, res, next) => {
    console.time('loc')
    var ip = req.query.ip || getClientIp(req);
    var d = geoip.lookup(ip)
    console.timeEnd('loc')
    res.json(d)
});

/**
 * @api {post} /update post snr
 * @apiName postSnr
 * @apiGroup PEER
 * @apiHeader {String} Content-type application/json.
 * @apiParam {String} snr SNR value
 * 
 * @apiSuccess {Number} next_update next update interval/seconds
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "next_update": 3600
 *     }
 *
 * @apiUse NotFoundError
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 403 
 *     {
 *       "err": "invalid data"
 *     }
 * 
 */
router.post('/update', (req, res, next) => {
    var body = req.body;
    var snr = body.length && body[body.length - 1].snr;
    if (!snr || snr < SNR_MIN || snr > SNR_MAX) {
        return res.status(403).json({ err: 'invalid data' })
    }

    const ip = getClientIp(req);

    Peer.findOneAndUpdate({ ip }, { snr, $inc: { times: 1 } }, (e, data) => {
        if (e) {
            next(e)
        }
        else if (!data) {
            res.status(401).json({ err: 'config first' })
        }
        else {
            res.json({ next_update: client.next_update })
        }
    })

})

router.post('/up', (req, res, next) => {
    const { snr } = req.body
    const { next_update } = client;

    if (!snr || snr < SNR_MIN || snr > SNR_MAX) {
        return res.json({ err: 'Invalid data', next_update })
    }

    const ip = getClientIp(req);
    Peer.updateOne({ ip }, { snr }, (e, raw) => {
        if (e) {
            next(e)
        }
        else if (!raw.n) {
            res.status(401).json({ err: 'config first' })
        }
        else {
            res.json({ next_update })
        }
    })

})


/**
 * @api {get} /query get attenuation
 * @apiName getAtt
 * @apiGroup QOS
 * @apiParam {Number} local local snr value
 *
 * @apiSuccess {Number} [att]  attenuation snr.
 * @apiSuccess {Number} [att_inc]  attenuation inc snr.
 * @apiSuccess {String} [err]  err info.
 * @apiSuccess {Number} next_query  next query internal/seconds.
 * 
 * @apiSuccessExample Success-Response-1:
 *     HTTP/1.1 200 OK
 *     {
 *       "att": 5,
 *       "next_query": 5
 *     }
 *  
 *  @apiSuccessExample Success-Response-2:
 *     HTTP/1.1 200 OK
 *     {
 *       "att_inc": 0.2,
 *       "next_query": 5
 *     }
 *
 *  @apiSuccessExample Success-Response-3:
 *     HTTP/1.1 200 OK
 *     {
 *       "next_query": 3600     //sleep
 *     }
 *
 *  @apiSuccessExample Success-Response-4:
 *     HTTP/1.1 200 OK
 *     {
 *       "err": "no data",           
 *       "next_query": 5
 *     }
 * 
 * @apiUse NotFoundError
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 
 *     {
 *       "err": "config first"
 *     }
 * 
 */
const ObjectId = require('mongoose').Types.ObjectId

// router.get('/query', (req, res, next) => {
//     const ip = getClientIp(req);
//     const { local } = req.query;
//     const { next_query } = client;

//     if (!local || isNaN(local)) {
//         return next();
//     }


//     let city;
//     const expire = new Date();
//     expire.setMinutes(expire.getMinutes() - client.valid_time);
//     expire.setSeconds(0);

//     Qos.findOne({ ip }).populate('city').exec()
//         .then(data => {
//             city = data && data.city;
//             if (!city) {
//                 var e = new Error('config first');
//                 e.status = 401;
//                 return Promise.reject(e);
//             }
//             return Peer.count({ city: city._id })
//                 .where('updatedAt').lt(expire).exec();
//         })
//         .then(count => {
//             count = city.peer - count;
//             var k = parseInt(count * client.factor);
//             return Peer.find({ city: city._id })
//                 .where('updatedAt').gt(expire)
//                 .sort('snr')
//                 .skip(k)
//                 .limit(1)
//                 .exec()
//         })
//         .then(docs => {
//             if (!docs.length) {
//                 return res.json({ err: 'no data', next_query })
//             }

//             let { snr } = docs[0];

//             if (local > snr && client.att_alg == 1) {
//                 res.json({ next_query, att: (local - snr) / 2 })
//             }
//             else if (client.att_alg == 2) {
//                 res.json({ next_query, att_inc: 1 })
//             }
//             else {
//                 res.json({ next_query })
//             }
//         })
//         .catch(e => next(e))
// })


router.get('/query', (req, res, next) => {
    const ip = getClientIp(req);
    const { local } = req.query;
    const { next_query } = client;

    if (!local || isNaN(local)) {
        return next();
    }

    const expire = new Date();
    expire.setMinutes(expire.getMinutes() - client.valid_time);
    expire.setSeconds(0);

    Qos.findOne({ ip }).exec()
        .then(data => {
            var city = data && data.city;
            if (!city) {
                var e = new Error('config first');
                e.status = 401;
                return Promise.reject(e);
            }

            return Peer.aggregate([
                {
                    $match: {
                        city: ObjectId(city),
                        snr: {$gt: SNR_MIN}
                        // updatedAt: { $gt: expire }   //yy test
                    }
                },
                { $sort: { updatedAt: -1 } },
                { $limit: 10000 },
                { $project: { _id: 0, snr: 1 } },

            ]).sort('snr').exec()
        })
        .then(docs => {
            if (!docs.length) {
                return res.json({ err: 'no data', next_query })
            }
            const { snr } = docs[parseInt(docs.length * client.factor)];
            console.log(snr)

            if (local > snr && client.att_alg == 1) {
                res.json({ next_query, att: (local - snr) / 2 })
            }
            else if (client.att_alg == 2) {
                res.json({ next_query, att_inc: 1 })
            }
            else {
                res.json({ next_query })
            }
        })
        .catch(e => next(e))
})

router.use('/stats', require('./stats'));

router.use(function (req, res, next) {
    var err = new Error('invalid request');
    err.status = 404;
    next(err);
})

if (process.env.NODE_ENV == 'production') {
    router.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            err: err.message,
        });
    });
}

// production error handler
router.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        err: err.message,
        stack: err.stack
    })
});

module.exports = router;
