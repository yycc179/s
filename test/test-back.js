const config = require('../config');

config.db_url = 'mongodb://localhost:27017/temp_test';
config.red_num = 1;

const request = require('supertest')(require('../app'));
const should = require('should');

const client = require('../models/settings');
const Qos = require('../models/qos');

describe('Back-end', () => {

    it('update res 403 if not do config request', function (done) {
        var body = [
            { snr: 10 },
            { snr: 20 }];

        request.post('/api/update')
            .query({ m: '123' })
            .send(body)
            .expect('Content-Type', /json/)
            .expect(401)
            .end((err, res) => {
                if (err) return done(err);
                res.body.should.have.key('err');
                done();
            })
    })

    it('query res 403 if not do config request', function (done) {
        request.get('/api/query')
            .query({ l: 25 })
            .query({ m: '123' })
            .expect('Content-Type', /json/)
            .expect(401)
            .end((err, res) => {
                if (err) return done(err);
                res.body.should.have.key('err');
                done();
            })
    })


    describe('GET /api/config', () => {
        it('no type parameter, res 404', function (done) {
            request.get('/api/config')
                .expect(404, done)
        })

        it('error type parameter, res json with err key', function (done) {
            request.get('/api/config')
                .query({ t: 'error' })
                .expect(404, done)
        })

        it('no m parameter, res 404', function (done) {
            request.get('/api/config')
                .query({ t: 'q' })
                .expect(404, done)
        })

        it('type=p, m = 123, res json with version, valid, period keys', function (done) {
            request.get('/api/config')
                .query({ t: 'p' })
                .query({ m: '123' })
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    const { version, valid, period } = res.body;
                    version.should.be.a.Number;
                    valid.should.be.a.Boolean;
                    period.should.be.a.Number;
                    done();
                })
        })

        it('type=p, m = 123 twice, res json with version, valid, period keys', function (done) {
            request.get('/api/config')
                .query({ t: 'p' })
                .query({ m: '123' })
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    const { version, valid, period } = res.body;
                    version.should.be.a.Number;
                    valid.should.be.a.Boolean;
                    period.should.be.a.Number;
                    done();
                })
        })

        it('type=q, res json with version, valid, period keys', function (done) {
            request.get('/api/config')
                .query({ t: 'q' })
                .query({ m: '123' })
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    const { version, valid, period } = res.body;
                    version.should.be.a.Number;
                    valid.should.be.a.Boolean;
                    period.should.be.a.Number;
                    done();
                })
        })

    })

    describe('POST /api/update', () => {
        it('no mac parameter, res 404', function (done) {
            var body = [
                { snr: 10 },
                { snr: 20 }];
            request.post('/api/update')
                .send(body)
                .expect(404, done)
        })

        it('post normal data, res json 200 with next_update key', function (done) {
            var body = [
                { snr: 10 },
                { snr: 20 }];

            request.post('/api/update')
                .query({ m: '123' })
                .send(body)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    res.body.should.not.have.property('err');
                    res.body.next_update.should.be.a.Number;
                    done();
                })
        })

        it('post error data, res json 403 with err', function (done) {
            var body = 'error data';

            request.post('/api/update')
                .send(body)
                .expect('Content-Type', /json/)
                .expect(403)
                .end((err, res) => {
                    if (err) return done(err);
                    res.body.err.should.be.a.String;
                    done();
                })
        })

    })

    describe('GET /api/query', () => {

        it('no l parameter, res json 404 with err', function (done) {
            request.get('/api/query')
                .expect('Content-Type', /json/)
                .expect(404, done)
        })

        it('error l parameter, res json 404 with err', function (done) {
            request.get('/api/query')
                .query({ l: 'error' })
                .expect('Content-Type', /json/)
                .expect(404, done)
        })

        it('no m parameter, res json 404 with err', function (done) {
            request.get('/api/query')
                .query({ l: 25 })
                .expect('Content-Type', /json/)
                .expect(404, done)
        })

        it('att algorithm 1, high l parameter, res json 200 with att and next_query', function (done) {
            request.get('/api/query')
                .query({ l: 25 })
                .query({ m: '123' })
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    res.body.should.not.have.key('err');
                    res.body.att.should.be.a.Number;
                    res.body.next_query.should.be.a.Number;
                    done();
                })
        })

        it('low l parameter, res json 200 with no snr but next_query', function (done) {
            request.get('/api/query')
                .query({ l: 10 })
                .query({ m: '123' })
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    res.body.should.not.have.key('err');
                    res.body.should.not.have.key('att');
                    res.body.next_query.should.be.a.Number;
                    done();
                })
        })

        it('att algorithm 2, should res json with att_inc key', function (done) {
            client.hset('config', 'att_alg', 2, e => {
                if (e) return done(e);

                request.get('/api/query')
                    .query({ l: 25 })
                    .query({ m: '123' })
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res) => {
                        if (err) return done(err);
                        res.body.should.not.have.key('err');
                        res.body.next_query.should.be.a.Number;
                        client.hget('config', 'att_step', (e, v) => {
                            if (e) return done(e);
                            res.body.att_inc.should.be.exactly(Number(v))
                            done();
                        })

                    })
            })

        })

        it('set manual mode, should res ok', function (done) {
            Qos.findOne().then(doc => {
                var body = {
                    auto: false,
                    manual: {
                        target: 3,
                        step: 0.25,
                        step_time: 5,
                    }
                }
                request.post('/web/qos/' + doc._id)
                    .query({ l: 25 })
                    .query({ m: '123' })
                    .send(body)
                    .expect(200, done)
            })
        })


        it('mamnual mode query, res json 200 with manual object', function (done) {
            request.get('/api/query')
                .query({ l: 10 })
                .query({ m: '123' })
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    res.body.should.not.have.key('err');
                    res.body.should.not.have.key('att');
                    res.body.next_query.should.be.a.Number;
                    res.body.manual.should.be.an.Object;
                    var manual = res.body.manual;
                    manual.target.should.be.a.Number;
                    manual.step.should.be.a.Number;
                    manual.step_time.should.be.a.Number;

                    done();
                })
        })
    })


    describe('GET stats', () => {
        var city;
        before(function (done) {
            const City = require('../models/city')

            City.findOne({}, (e, doc) => {
                if (e) return done(e);
                city = doc.id;
                done();
            })
        })

        it('get /api/stats/snr/json/:city, res json 200', function (done) {
            request.get('/api/stats/snr/json/' + city)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    res.body.should.have.key('total');
                    res.body.should.have.key('rows').and.be.an.Array;
                    done();
                })
        })

        it('get /api/stats/snr/city/:city, res json 200', function (done) {
            request.get('/api/stats/snr/city/' + city)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    res.body.should.not.be.empty
                    done();
                })
        })


        it('get /api/stats/snr/summary/:city, res json 200', function (done) {
            request.get('/api/stats/snr/summary/' + city)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    res.body.should.have.length(6).and.be.an.Array;
                    done();
                })
        })

    })

});