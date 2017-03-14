
exports = module.exports = {
    version: 0.1,
    db_url: 'mongodb://localhost:27017/snr',
    session_secret: 'snr_secret',
    session_age: 2 * 60 * 60 * 1000,  //2 hours
    hash_slat: 'hash(user)',
    admin_user: 'admin',
    admin_password: 'admin',

    SNR_WEIGHT: 1,
    SNR_MAX: 30,
    SNR_MIN: 0,
}

exports.client = {
    next_update: 60 * 60,   //60 mins   
    next_query: 10, //10 secs
    valid_time: 60,  //60 mins
    factor: 0.2,  //20%
    att_alg: 1, // 1 2
    att_step: 0.5 // 1 2
}
