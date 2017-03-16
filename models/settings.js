const redis = require("redis")
    , client = redis.createClient({db: require('../config').red_num || 0});

require('bluebird').promisifyAll(redis.RedisClient.prototype);


var dconfig = {
    next_update: 60 * 60,   //60 mins   
    next_query: 10, //10 secs
    valid_time: 60,  //60 mins
    factor: 0.2,  //20%
    att_alg: 1, // 1 2
    att_step: 0.5 // 1 2
};

client.hlen('config', (e, l) => {
    if (e) throw e;
    if (!l) {
        client.hmset('config', dconfig);
    }
})


module.exports = client;