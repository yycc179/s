const express = require('express')
    , bodyParser = require('body-parser');

const app = express();

app.set('x-powered-by', false)
// view engine setup
app.set('views', 'views');
app.set('view engine', 'ejs');

var mr = require('morgan')
app.use(mr(':method :url :status :res[content-length] - :response-time ms :date[iso]'));
app.use(express.static('public'))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use('/api', require('./routes/server'));
app.use('/web', require('./routes/client'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
})

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
