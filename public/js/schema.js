var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    postId: Number,
    title:  String,
    author: String,
    message:   String,
    comments: [{ message: String, date: Date }],
    date: { type: Date, default: Date.now },
    unlink: Boolean,
});

module.exports = PostSchema;