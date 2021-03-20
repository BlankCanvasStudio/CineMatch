let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema(
    {
        username: {type:String, maxlength:20},
        friends: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        to_watch: [{type: mongoose.Schema.Types.ObjectId, ref: 'Entertainment'}],
        watched: [{type: mongoose.Schema.Types.ObjectId, ref: 'Entertainment'}],
        genres: [{type:String, maxlength:10}],
        authID: {type:String},
    }
);

module.exports = mongoose.model('User', UserSchema);