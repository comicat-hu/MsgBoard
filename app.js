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


var cookieParser = require('cookie-parser');
app.use(cookieParser());

//request
var request = require("request");

var options = { 
    method: 'GET',
    url: 'https://tools.clifflu.net/ip',
    headers:
    { 
        'cache-control': 'no-cache',
        'content-type': 'application/json'
    }
};




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
                res.render('allpost', {result, username : req.cookies.username || 'vistor'});
            }else {
                res.status(200);
                res.send('No post here :(');
            }

        });
    }
    else if(req.method === 'POST' && req.cookies.username !== 'visitor') {
        console.log(req.body.remove)

        if(req.body.hasOwnProperty('remove')) {

            post.findOne({postId: req.body.remove}, function(err, result) {

                if(result.author === req.cookies.username || req.cookies.username === 'comi'){
                    post.findOneAndUpdate({postId: req.body.remove}, {unlink: true}, {upsert:true}, function(err, result){
                        if (err) return res.send(500, { error: err });

                        console.log("success remove");
                    });
                }
                res.redirect('/post');

            });
            

        }
        else if(req.body.hasOwnProperty('edit')) {
            console.log('edit post')
            post.findOne({postId: req.body.edit}, function(err, result) {

                console.log('findOne')

                if(result.author === req.cookies.username || req.cookies.username === 'comi')
                    res.redirect('/edit/' + req.body.edit);
                else
                    res.redirect('/post');
            });
        }
        

    }
    else {
        res.redirect('/post');
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
    else if(req.method === 'POST' && req.body.hasOwnProperty('post')) {

        let editData = {

            title:  req.body.title || 'No title',
            message:   req.body.message,

        };

        post.findOneAndUpdate({postId: req.params.postId}, editData, {upsert:true}, function(err, result){
            if (err) return res.send(500, { error: err });

            console.log("success update");
        });

        res.redirect('/post/' + req.params.postId); 
    }else {

        res.redirect('/post')
        
    }

});



app.use('/new', function (req, res) {

    if(req.method === 'GET') {
        console.log(req.method + ' 127.0.0.1:3000/new')
        res.status(200);
        res.render('newpost', {content: 'Write Something', username: req.cookies.username})
    }
    else if(req.method === 'POST' && req.body.hasOwnProperty('post')) {

        console.log(req.method + ' 127.0.0.1:3000/new');


        //count post in collections(posts)
        post.count({}, function(err, count) {


            var postId = count + 1;

            let postData = {

                postId: postId,
                title:  req.body.title || 'No title',
                author: req.body.author || req.cookies.username || 'visitor',
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

    if(req.method === 'GET') {
        console.log(req.method + ' 127.0.0.1:3000/')


        if (req.cookies.username) {
            console.log(req.cookies.username + ' repeat visit!');

        } else {
            res.cookie('username', 'visitor', {maxAge: 600 * 1000});
            console.log('first visit')
        }

        post.count({unlink: false}, function(err, nowPosts){

            post.count({}, function(err, totalPosts){

                request(options, function (error, response, body) {
                    if (error) throw new Error(error);

                    let resbody = JSON.parse(response.body)
                    let Ip = resbody.sourceIp;
                    console.log(Ip);

                    res.status(200);
                    res.render('index', {username: req.cookies.username || 'visitor', nowPosts, totalPosts, Ip});
                });



            });

        });
   
    }
    else if(req.method === 'POST'  && req.body.hasOwnProperty('login')) {
        console.log('login')
        if(req.body.username.match(/\w/g)){
            console.log(req.body.username + ' good username')
            res.cookie('username', req.body.username , {maxAge: 600 * 1000});
            res.redirect('/post');
        }
        else{
            console.log(req.body.username + ' invalid username')
            res.redirect('/');
        }

    }
    else if(req.method === 'POST'  && req.body.hasOwnProperty('visit')) {

        console.log('login by visitor')
        res.cookie('username', 'visitor' , {maxAge: 600 * 1000});
        res.redirect('/post');

    }
    else {
        console.log('redirect /')
        res.redirect('/');
    }

});




app.listen(3000, function () {
    console.log('Listening on port 3000!');
});
