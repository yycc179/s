const request = require('supertest')(require('../app'));
const client = require('../config').client;


describe('Front-end', () => {
    describe('signin', () => {
        it('get signin page, res 200', function (done) {
            request.get('/web/signin')
                .expect(200, done)
        })

        it('user incorrect, redirect to current page', function (done) {
            var body = {
                username: 'admin',
                password: 'error'
            }
            request.post('/web/signin')
                .send(body)
                .expect('Location', '/web/signin')
                .expect(302, done)
        })

        it('user correct,  redirect to snr page', function (done) {
            var body = {
                username: 'admin',
                password: 'admin'
            }
            request.post('/web/signin')
                .send(body)
                .expect('Location', '/web/stats/snr')
                .expect(302, done)
        })

    })


    describe('GET /web/stats/snr', () =>
        it('res 200', function (done) {
            request.get('/web/stats/snr')
                .expect(200, done)
        })
    )

    describe('GET /web/stats/peer', () =>
        it('res 200', function (done) {
            request.get('/web/stats/peer')
                .expect(200, done)
        })
    )

    describe('GET /web/stats/peer/city_1', () =>
        it('res 200', function (done) {
            request.get('/web/stats/peer/city_1')
                .expect(200, done)
        })
    )

    describe('GET /web/stats/peer/error', () =>
        it('res 200', function (done) {
            request.get('/web/stats/peer/error')
                .expect(200, done)
        })
    )

    describe('/web/setting', () => {

        it('get setting page, res 200', function (done) {
            request.get('/web/stats/peer/setting')
                .expect(200, done)
        })

        it('post peer setting data should exactly equal', function (done) {
            var body = { next_update: 3300 };

            request.post('/web/setting')
                .send(body)
                .set('Content-Type', 'application/json')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    client.next_update.should.be.exactly(body.next_update)
                    done();
                })
        })

        it('post qos setting, should exactly equal', function (done) {
            var body = {
                next_query: 50,
                valid_time: 30,
                factor: 0.4,
                att_alg: 2,
                att_step: 0.75
            };

            request.post('/web/setting')
                .send(body)
                .set('Content-Type', 'application/json')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    client.next_query.should.be.exactly(body.next_query)
                    client.valid_time.should.be.exactly(body.valid_time)
                    client.factor.should.be.exactly(body.factor)
                    client.att_alg.should.be.exactly(body.att_alg)
                    client.att_step.should.be.exactly(body.att_step)
                    done();
                })
        })
    })

})

describe('run finalize', () => {

    it('drop test database', function (done) {
        var db = require('../models/db');
        db.connection.dropDatabase(err => {
            if (err) return done(err);
            db.disconnect();
            done()
        })

    })

})