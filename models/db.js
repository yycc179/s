const mongoose = require('mongoose')
    , sha1 = require('utility').sha1
    , config = require('../config');

mongoose.Promise = require("bluebird");
mongoose.connect(config.db_url);

mongoose.connection.once('open', () => {
    // console.log('db open')
}
);

module.exports = mongoose;