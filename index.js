const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;

var db;

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    var votes = {
        'android': {
            total: 0,
            percentage: 0
        },
        'ios': {
            total: 0,
            percentage: 0
        }
    };

    db.collection('votes').aggregate([
            {$group: {_id: {type: '$type'}, "count": {"$sum": 1}}}
        ]
    ).toArray(function (err, result) {
        let sum = 0;
        for (index in result) {
            votes[result[index]._id.type].total = result[index].count;
            sum += result[index].count;
        }

        votes.android.percentage = Math.round((votes.android.total / sum) * 100);
        votes.ios.percentage = Math.round((votes.ios.total / sum) * 100);

        console.log(votes, sum);
        res.render('index', {votes: votes});

    });

});

app.get('/vote/android', function (req, res) {
    db.collection('votes').save({type: 'android', createdAt: new Date()}, (err, result) => {
        if(err) return console.log(err);
        res.redirect('/');
    });
})


app.get('/vote/ios', function (req, res) {
    db.collection('votes').save({type: 'ios', createdAt: new Date()}, (err, result) => {
        if(err) return console.log(err)
        res.redirect('/');
    });
})

MongoClient.connect('mongodb://127.0.0.1', (err, client) => {
    if(err) return console.log(err);
    db = client.db('votesapp');
    app.listen(3000, () => {
        console.log('listening on 3000')
    });
});


