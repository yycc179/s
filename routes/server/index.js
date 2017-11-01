const router = require('express').Router()
    , Promise = require("bluebird")
    , ObjectId = require('mongoose').Types.ObjectId
    , geoip = require('geoip-lite')
    , request = require('request')
    , { getUpdatedAt } = require('./utils')
    , client = require('../../models/settings')
    , Country = require('../../models/country')
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
    if (data && data.country) {
        return Promise.resolve(data)
    }

    return new Promise((resolve, reject) => {
        request({ url: `http://ipinfo.io/${ip}/geo`, json: true }, (err, res, body) => {
            if (err) return reject('locate city failed, ip : ' + ip);
            if (body.loc) {
                var pos = body.loc.split(',')
                body.ll = [Number(pos[0]), Number(pos[1])]
            }
            resolve(body)
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
 * @apiParam {String} m mac address
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
    const mac = req.query.m;

    const conf = {
        version: process.env.npm_package_version,
        valid: true
    }

    let Mod = Peer;
    let key = 'next_update';
    let inc = 1;

    if (!mac) {
        return next();
    }
    else if (t == 'q') {
        Mod = Qos;
        key = 'next_query';
        inc = 0;
    }
    else if (t != 'p') {
        return next();
    }
    let role;
    Promise.join(client.hgetAsync('config', key),
        Mod.findOne({ mac }).exec(), (value, doc) => {
            conf.period = parseInt(value);
            if (!(role = doc)) role = new Mod({ mac, ip });
            if (role.loc) {
                res.json(conf);
                return Promise.reject();
            }
            return queryCity(ip)
        })
        .then(data => {
            const { country = 'UNKNOW' } = data;
            return Promise.join(Country.findOneAndUpdate({ name: country }, {},
                { upsert: true, new: true })
                .exec(),
                City.findOneAndUpdate(
                    { name: data.city || data.region || 'unknow', country, pos: data.ll },
                    { $inc: { peer: inc } },
                    { upsert: true, new: true })
                    .exec(),
                (con, city) => {
                    role.loc = con._id;
                    // role.city = city._id;
                    // if (Mod == Qos) {
                    //     role.loc_s = con.name + '-' + city.name
                    // }
                    return role.save();
                }
            )
        })
        .then(() => {
            res.json(conf);
        })
        .catch(e => {
            if (e) next(e)
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
 * @apiParam {String} m mac address
 * @apiSampleRequest off
 * 
 * @apiSuccess {Number} next next update interval/seconds
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "next": 3600
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
    var snr = body.snr || (body.length && body.pop().snr);

    if (snr == undefined || snr < SNR_MIN || snr > SNR_MAX) {
        return res.status(403).json({ err: 'invalid data' })
    }

    var mac = req.query.m;
    if (!mac) {
        return next()
    }

    Promise.join(client.hgetAsync('config', 'next_update'),
        Peer.findOneAndUpdate({ mac }, { snr, $inc: { times: 1 } }).exec(),
        (value, doc) => {
            if (!doc) {
                res.status(401).json({ err: 'config first' })
            }
            else {
                res.json({ next: parseInt(value) })
            }
        })
        .catch(e => next(e))
})


/**
 * @api {post} /query query attenuation and antenna status
 * @apiName postAtt
 * @apiGroup QOS
 *
 * @apiSuccess {String} [err]  err info.
 * @apiSuccess {Number} next  next query internal/seconds.
 * @apiSuccess {Object} att  att detail.
 * @apiSuccess {Object} [antenna] antenna setting params.
 *  
 *  @apiSuccessExample Success-Response-ok:
 *     HTTP/1.1 200 OK
 *     {
 *       "next": 10, 
 *       "att": {
 *          "aim": 3,
 *          "step": 0.5,
 *          "inv": 5,
 *       },
 *       "antenna": {
 *          "lnb": {
 *              "freq": 196608005,
 *              "type": 0
 *          },
 *          "tp": {
 *              "polar": 0,
 *              "rate": 5,
 *              "freq": 9
 *          }
 *       }
 *     }
 *
 *   @apiSuccessExample Success-Response-ok2:
 *     HTTP/1.1 200 OK
 *     {
 *       "next": 10, 
 *       "att": {
 *          "aim": 3,
 *          "step": 0.5,
 *          "inv": 5,
 *       }
 * 
 *  @apiSuccessExample Success-Response-no-data:
 *     HTTP/1.1 200 OK
 *     {
 *       "err": "no data",           
 *       "next": 5
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

router.post('/query', (req, res, next) => {
    const { mac } = req.body.device
    const { status } = req.body

    if (!status.snr || isNaN(status.snr)) {
        return next();
    }

    let config
    const out = {}
    Promise.join(client.hgetallAsync('config'),
        Qos.findOneAndUpdate({ mac }, { status, updatedAt: Date.now() })
            .populate('antenna.satellite', '-_id -name -__v')
            .lean()
            .exec(),
        (obj, doc) => {
            config = obj;
            var loc = doc && doc.loc;
            if (!loc) {
                var e = new Error('config first');
                e.status = 401;
                return Promise.reject(e);
            }
            out.next = parseInt(config.next_query)
            out.att = doc.att
            if (doc.antenna.manual && doc.antenna.satellite) {
                out.antenna = doc.antenna.satellite
            }
            if (doc.att.mode != 0) {
                res.json(out)
                return Promise.reject();
            }

            return Peer.aggregate([
                {
                    $match: {
                        loc: ObjectId(loc),
                        updatedAt: getUpdatedAt(config.valid_time),
                        snr: { $gt: SNR_MIN }
                    }
                },
                { $sort: { updatedAt: -1 } },
                { $limit: 10000 },
                { $project: { _id: 0, snr: 1 } },

            ]).sort('snr').exec()
        })
        .then(docs => {
            if (!docs.length) {
                delete out.att
                out.err = 'no snr'
                return res.json(out)
            }
            out.att.snr_aim = docs[parseInt(docs.length * config.factor)].snr;
            res.json(out)
        })
        .catch(e => {
            if (e) return next(e)
        })
})

router.use('/stats', require('./stats'));
router.use('/mock', require('./mock'));

router.use(function (req, res, next) {
    var err = new Error('invalid request');
    err.status = 404;
    next(err);
})

if (process.env.NODE_ENV !== 'production') {
    router.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            err: err.message,
            stack: err.stack
        });
    });
}

// production error handler
router.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        err: err.message,
    })
});


module.exports = router;
