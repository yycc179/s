/**
 * Created by yangyang on 2016/2/18.
 * Update by yangyang 2017/1/3
 */
const db = require('./db')
    , sha1 = require('utility').sha1
    , config = require("../config");

const UserShcema = db.Schema({
    username: { type: String, index: true, unique: true },
    password: String,
    email: String,
})

const Admin = db.model('admin', UserShcema);

Admin.count((err, count) => {
    if (err) throw err;

    if (!count) {
        new Admin({
            username: config.admin_user,
            password: sha1(config.hash_slat + config.admin_password)
        }).save();
    }
});

module.exports = Admin