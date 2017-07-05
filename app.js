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
var schema = require('./public/js/schema.js');
var post = mongoose.model('post', schema);


app.set('view engine', 'ejs');


//set where static file
app.use(express.static(__dirname + '/public'));


var cookieParser = require('cookie-parser');
app.use(cookieParser());

var router = express.Router();


//request
var request = require("request");

var options = { 
    method: 'GET',
    url: 'https://tools.clifflu.net/ip',
    headers:
    { 
        'content-type': 'application/json'
    },
    json: true
};


const page_posts = 5;



router.get('/post/:postId', function (req, res) {

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

router.all('/list/:page', function (req, res) {

    if(req.method === 'GET') {

        if(!req.params.page.match(/^[\d]+$/g)){
            res.status(400);
            res.send('invalid url !');
        }

        let skipNum = page_posts * (+req.params.page - 1);

        // Not complete!
        // make page number > posts number ,redirect. but it can return to top function
        //
        // post.count({unlink: false}, function(err, count) {
        //     if(skipNum > count)
        //         return res.redirect('/list/1');
        // });

        return post.find({unlink: false}).sort('-postId').skip(skipNum).limit(page_posts).exec(function(err, result) {
            if (err)
                console.log('find post error ' + err);

            if(result) {
                res.status(200);
                return res.render('list', {result, username : req.cookies.username || 'vistor'});
            }

            res.status(404);
            res.send('No post here :(');

        });
    }
    if(req.method === 'POST') {

        let username = req.cookies.username;

        if(req.body.hasOwnProperty('remove')  && username !== 'visitor') {

            return post.findOne({postId: req.body.remove}, function(err, result) {

                if(result.author === username || username === 'comi'){
                    post.findOneAndUpdate({postId: req.body.remove}, {unlink: true}, {upsert:true}, function(err, result){
                        if (err) return res.send(500, { error: err });

                        console.log("success remove");
                    });
                }
                res.redirect('/list/1');

            });
            

        }
        if(req.body.hasOwnProperty('edit')  && username !== 'visitor') {
            console.log('edit post')
            return post.findOne({postId: req.body.edit}, function(err, result) {

                if(result.author === username || username === 'comi')
                    res.redirect('/edit/' + req.body.edit);
                else
                    res.redirect('/post');
            });

        }
        if(req.body.hasOwnProperty('read')) {
            console.log('read post')
            return res.redirect('/post/' + req.body.read);


        }
        

    }
    return res.redirect('/list/1');

});




router.all('/edit/:postId', function (req, res) {

    if(req.method === 'GET') {
        

        post.findOne({postId: req.params.postId} ,function(err, result){
            if (err)
                console.log('find post error ' + err);

            let username = req.cookies.username;

            if(result && result.author !== username || username === 'visitor') {
                res.status(401);
                return res.send('You are visitor or not an author of the post');
            }

            if(result && !result.unlink) {
                return res.render('editpost', result);
            }

            res.status(404);
            res.send('Post not find or been remove Q_Q');


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

        res.redirect('/list/1')
        
    }

});



router.all('/new', function (req, res) {

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
        res.redirect('/list/1');
    }


});



router.all(['/','/index'], function (req, res) {
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

                    let Ip = body.sourceIp;
                    console.log(Ip);

                    res.status(200);
                    res.render('index', {username: req.cookies.username || 'visitor', nowPosts, totalPosts, Ip});
                });



            });

        });
   
    }
    else if(req.method === 'POST'  && req.body.hasOwnProperty('login')) {
        console.log('login')
        if(req.body.username.match(/^[a-zA-Z0-9\s]+$/g)){
            console.log(req.body.username + ' good username')
            res.cookie('username', req.body.username , {maxAge: 600 * 1000});
            res.redirect('/list/1');
        }
        else{
            console.log(req.body.username + ' invalid username')
            res.redirect('/');
        }

    }
    else if(req.method === 'POST'  && req.body.hasOwnProperty('visit')) {

        console.log('login by visitor')
        res.cookie('username', 'visitor' , {maxAge: 600 * 1000});
        res.redirect('/list/1');

    }
    else {
        console.log('redirect /')
        res.redirect('/');
    }

});

app.use('/', router);

app.listen(3000, function () {
    console.log('Listening on port 3000!');
});
