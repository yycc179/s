const router = require('express').Router()
    , passport = require('passport')
    , LocalStrategy = require('passport-local')
    , sha1 = require('utility').sha1
    , config = require('../../config')
    , Admin = require('../../models/admin');

passport.use(new LocalStrategy((username, password, done) => {
    Admin.findOne({ username, }, (err, user) => {
        if (err) throw done(err);

        if (!user) {
            var message = 'username invalid!'; 
        }
        else if(sha1(config.hash_slat + password) != user.password) {
            user = null;
            message = 'password error!'
        }

        done(null, user, {message});
    })
}));


router.get('/', (req, res) => {
    const { error } = req.flash();
    res.render('signin', {
        err: error && error[0],
    });
});

router.post('/', passport.authenticate('local', {
    successRedirect: '/web/stats/snr',
    failureRedirect: '/web/signin',
    failureFlash: true
}));

router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/web/signin');
});

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    Admin.findById(id, (err, user) => {
        done(null, user);
    })
});

module.exports = router