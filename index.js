const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
var cookieParser = require('cookie-parser');
var db;
var cookie_name = 'voteapp_voted';

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());

app.get('/', function (req, res) {


    // check vote cookie
    let voteCookie = req.cookies[cookie_name];

    let votes = {
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

        res.render('index', { votes: votes, voteCookie: voteCookie });

    });

});

app.get('/vote/android', function (req, res) {
    db.collection('votes').save({type: 'android', createdAt: new Date()}, (err, result) => {
        if(err) return console.log(err);
        res.cookie(cookie_name , 'android', { expire : new Date() + 3600 });
        res.redirect('/');
    });
})


app.get('/vote/ios', function (req, res) {
    db.collection('votes').save({type: 'ios', createdAt: new Date()}, (err, result) => {
        if(err) return console.log(err)
        res.cookie(cookie_name , 'ios', { expire : new Date() + 3600 });
        res.redirect('/');
    });
})

MongoClient.connect('mongodb://mongo', (err, client) => {
    if(err) return console.log(err);
    db = client.db('votesapp');
    app.listen(3000, () => {
        console.log('listening on 3000')
    });
});


