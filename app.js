var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));    // to support URL-encoded bodies


var mongoose = require('mongoose');
mongoose.connect('mongodb://mongo-msgdb:27017/msgdb');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () { console.log("Database Connected."); });

//PostSchema
var schema = require('./schema.js');

var post = mongoose.model('post', schema);


app.set('view engine', 'ejs');


//set where static file
app.use(express.static(__dirname + 'public'));



app.get('/post/:postId', function (req, res, next) {

    post.findOne({postId: req.params.postId} ,function(err, result){
        if (err)
            console.log('find post error ' + err);

        if(result && !result.unlink) {
            res.status(200);
            res.render('post', result);
        }else {
            res.status(404);
            res.send('Post not find or been remove Q_Q')
        }

    });

});

app.use('/post', function (req, res) {

    if(req.method === 'GET') {
        post.find({} ,function(err, result){
            if (err)
                console.log('find post error ' + err);

            if(result) {
                res.status(200);
                res.render('allpost', {result});
            }else {
                res.status(200);
                res.send('No post here :(');
            }

        });
    }
    else if(req.method === 'POST') {
        console.log(req.body.remove)

        if(req.body.hasOwnProperty('remove')) {

            post.findOneAndUpdate({postId: req.body.remove}, {unlink: true}, {upsert:true}, function(err, result){
                if (err) return res.send(500, { error: err });

                console.log("success update");
            });


            res.redirect('/post');

        }
        else if(req.body.hasOwnProperty('edit')) {
            res.redirect('/edit/' + req.body.edit);
        }
    }

});




app.use('/edit/:postId', function (req, res) {

    if(req.method === 'GET') {
        

        post.findOne({postId: req.params.postId} ,function(err, result){
            if (err)
                console.log('find post error ' + err);

            if(result && !result.unlink) {
                res.status(200);
                res.render('editpost', result);
            }else {
                res.status(404);
                res.send('Post not find or been remove Q_Q')
            }

        });
    }
    else if(req.method === 'POST') {

        let editData = {

            title:  req.body.title || 'No title',
            message:   req.body.message,

        };

        post.findOneAndUpdate({postId: req.params.postId}, editData, {upsert:true}, function(err, result){
            if (err) return res.send(500, { error: err });

            console.log("success update");
        });

        res.redirect('/post/' + req.params.postId); 
    }

});



app.use('/new', function (req, res) {

    if(req.method === 'GET') {
        console.log(req.method + ' 127.0.0.1:3000/new')
        res.status(200);
        res.render('newpost', {content: 'Write Something'})
    }
    else if(req.method === 'POST' && req.body.hasOwnProperty('post')) {

        console.log(req.method + ' 127.0.0.1:3000/new');


        //count post in collections(posts)
        post.count({}, function(err, count) {


            var postId = count + 1;

            let postData = {

                postId: postId,
                title:  req.body.title || 'No title',
                author: req.body.author || 'Anonymous',
                message:   req.body.message,
                date: new Date(),
                unlink: false,

            };

            let newPost = new post(postData);
            newPost.save(function (err) {
                if (err) return handleError(err);
                console.log('a post save ok!')
            });

            res.redirect('/post/' + postId);

        });

    }else {
        res.redirect('/post');
    }


});

app.use('/', function (req, res) {

    console.log(req.method + ' 127.0.0.1:3000/')
    res.status(200);
    res.render('index');
});




app.listen(3000, function () {
    console.log('Listening on port 3000!');
});
