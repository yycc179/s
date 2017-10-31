/**
 * Created by yangyang on 2016/8/23.
 */

var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');

/* GET home page. */

router.get('/info', function (req, res, next) {
    // res.redirect('/upgrade/meta.json');
    res.writeHead(200, { 'Content-type': 'application/json' });
    fs.createReadStream('public/upgrade/meta.json').pipe(res);
});

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var path = './public/upgrade';
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }

        callback(null, path);
    },
    filename: function (req, file, callback) {
        console.log(file.originalname)
        callback(null, file.originalname);
    }
});

//var upload = multer({ storage: storage }).fields(
//    [
//        { name: 'meta'},
//        { name: 'bin' }
//    ]
//);

var upload = multer({ storage: storage }).array('meta', 2);

router.get('/', function (req, res) {
    res.render('upload', {
        title: 'upgrade',
        user: req.user
    });

});

router.post('/meta', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.json({ error: err.code });
        }
        res.json({ error: null })
    });
});

module.exports = router;
