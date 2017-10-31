const router = require('express').Router()
    , session = require('express-session')
    , passport = require('passport')
    , redisStore = require('connect-redis')(session)
    , config = require('../../config');


router.use(session({
    store: new redisStore({
        ttl: config.sesion_ttl
    }),
    secret: config.session_secret,
    // cookie: { maxAge: config.session_age },
    resave: true,
    saveUninitialized: true
}));

router.use(passport.initialize());
router.use(passport.session());

router.use(require('connect-flash')());
router.use(require('cookie-parser')());

// router.use(require('serve-favicon')('public/favicon.ico'));

router.use('/signin', require('./signin'));

if (process.env.NODE_ENV == 'production') {
    router.use(function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/web/signin')
    });
}
router.use('/stats', require('./stats'));
router.use('/setting', require('./setting'));
router.use('/qos', require('./qos'));
router.use('/sat', require('./sat'));
router.use('/upgrade', require('./upgrade'));

module.exports = router;









