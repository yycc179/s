const router = require('express').Router()
    , Promise = require("bluebird")
    , ObjectId = require('mongoose').Types.ObjectId
    , geoip = require('geoip-lite')
    , request = require('request')
    , client = require('../../models/settings')
    , City = require('../../models/city')
    , Qos = require('../../models/qos')
    , Peer = require('../../models/peer');

const { SNR_MAX, SNR_MIN, SNR_WEIGHT } = require('../../config')

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
 * @apiSuccessExample Success-Response-peer:
 *     HTTP/1.1 200 OK
 *     {
 *       "version": "0.1.0",
 *       "valid": true,
 *       "period": 3600
 *     }
 *
 * @apiSuccessExample Success-Response-qos:
 *     HTTP/1.1 200 OK
 *     {
 *       "version": "0.1.0",
 *       "valid": true,
 *       "period": 10
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

    client.hgetallAsync('config')
        .then(obj => {
            if (t == 'q') {
                role = Qos;
                inc = 0;
                conf.period = parseInt(obj.next_query);
            }
            else if (t == 'p') {
                conf.period = parseInt(obj.next_update);
            }
            else return Promise.reject();

            return role.findOne({ ip }).exec();
        })
        .then(d => {
            if (d && d.city) return res.json(conf);

            queryCity(ip)
                .then(({ city = 'unknow', country = 'UNKNOW' }) => {
                    return City.findOneAndUpdate({ city, country },
                        { $inc: { peer: inc } },
                        { upsert: true, new: true })
                        .exec();
                })
                .then(city => {
                    if (!d) d = new role({ ip });
                    d.city = city._id;
                    d.save(e => {
                        if (e) return next(e);
                        res.json(conf);
                    })
                }).catch(e => next(e))
        })
        .catch(e => next(e))

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
 * @apiSampleRequest off
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
    let next_update;
    client.hgetAsync('config', 'next_update')
        .then(value => {
            next_update = parseInt(value);
            return Peer.findOneAndUpdate({ ip }, { snr, $inc: { times: 1 } }).exec()
        })
        .then(data => {
            if (!data) {
                res.status(401).json({ err: 'config first' })
            }
            else {
                res.json({ next_update })
            }
        })
        .catch(e => next(e))

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
 *       "next_query": 5    //local < summsry, no need att
 *     }
 * 
 *  @apiSuccessExample Success-Response-sleep:
 *     HTTP/1.1 200 OK
 *     {
 *       "next_query": 3600    
 *     }
 *
 *  @apiSuccessExample Success-Response-no-data:
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
router.get('/query', (req, res, next) => {
    const ip = getClientIp(req);
    const { local } = req.query;

    if (!local || isNaN(local)) {
        return next();
    }

    let config;
    client.hgetallAsync('config')
        .then(obj => {
            config = obj
            return Qos.findOne({ ip }).exec()
        })
        .then(doc => {
            var city = doc && doc.city;
            if (!city) {
                var e = new Error('config first');
                e.status = 401;
                return Promise.reject(e);
            }

            const expire = new Date();
            expire.setSeconds(0);
            expire.setMinutes(expire.getMinutes() - config.valid_time);

            return Peer.aggregate([
                {
                    $match: {
                        city: ObjectId(city),
                        snr: { $gt: SNR_MIN },
                        updatedAt: { $gt: expire }   //yy test
                    }
                },
                { $sort: { updatedAt: -1 } },
                { $limit: 10000 },
                { $project: { _id: 0, snr: 1 } },

            ]).sort('snr').exec()
        })
        .then(docs => {
            const next_query = parseInt(config.next_query);

            if (!docs.length) {
                return res.json({ err: 'no data', next_query })
            }
            const { snr } = docs[parseInt(docs.length * config.factor)];
            console.log(snr)

            var obj = { next_query };
            if (local > snr && config.att_alg == 1) {
                obj.att = (local - snr) / 2;
            }
            else if (config.att_alg == 2) {
                obj.att_inc = Number(config.att_step);
            }

            res.json(obj)
        })
        .catch(e => next(e))
})

router.use('/stats', require('./stats'));

router.use(function (req, res, next) {
    var err = new Error('invalid request');
    err.status = 404;
    next(err);
})

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    router.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            err: err.message,
            stack: err.stack
        })
    });
}

// production error handler
router.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        err: err.message,
    });
});

module.exports = router;
