
exports = module.exports = {
    version: 0.1,
    db_url: 'mongodb://localhost:27017/snr',
    session_secret: 'snr_secret',
    session_age: 2 * 3600 * 1000,  //2 hours
    sesion_ttl: 7 * 24 * 3600,   //7 days
    hash_slat: 'hash(user)',
    admin_user: 'admin',
    admin_password: 'admin',

    SNR_WEIGHT: 1,
    SNR_MAX: 30,
    SNR_MIN: 0,
}
