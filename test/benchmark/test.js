import test from 'ava';
import Signal from '../../models/signal';
import db from '../../models/db';
import EventEmitter from 'events';


test.cb('statistics 1', t => {
    const o = {
        verbose: true,
        map: function () {
            emit(this.quality, 1)
        },
        reduce: function (key, values) {
            return Array.sum(values)
        },
        query: { city: 'city_1' }
    }

    Signal.mapReduce(o, (err, model, stas) => {
        console.log(stas)
        t.pass();
        t.end();
    })
})

test.cb('statistics 2', t => {
    const myEmitter = new EventEmitter();

    var r = {};
    var i = 0;

    function query(a, b) {
        Signal.find({ city: 'city_1', }).where('quality').gt(a).lte(b).count().exec((err, count) => {
            myEmitter.emit(err ? 'err,' : 'done', count);
        });
    }

    const key = 1;
    for (var j = 0; j < key; j++) {
        query(j * 10, (j + 1) * 10);
        // query(j);
    }

    myEmitter.on('done', (c) => {
        r[i] = c
        if (++i >= key) {
            t.pass();
            t.end();
        }

    });
})

test.cb('statistics 3', t => {
    Signal.aggregate.group({ _id: '$quality', $sum: 1 }).match({ city: 'city_1' }).sort({ _id: 1 }).exec().then(data => {
        t.pass();
        t.end();
        console.log(data)
    })
})

test.cb('query', t => {
    var next_query = 60
    Signal.find({ city: 'city_1' }).
        sort('quality').
        select('quality').
        limit(1).
        exec().
        then(docs => {
            const {quality} = docs[0];
            if (!quality) {
                var err = 'no valid data';
                next_query = next_query / 2;
            }
            console.log({ err, quality, next_query })
            t.pass();
            t.end();
        }).
        catch(e => {
            console.log(e);
            console.log({ err: 'Server error', next_query })
        })
})

test.after('cleanup', t => {
    db.disconnect();
});

