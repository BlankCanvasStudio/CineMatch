let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema(
    {
        tennant:{type:String},
        client_id:{type:String},
        connection:{type:String},
        email: {type:String},
        password:{type:String},
        request_language:{type:String},
        email_verified:{type:Boolean},
        friends: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        friend_requests: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        to_watch: [{type: mongoose.Schema.Types.ObjectId, ref: 'Entertainment'}],
        watched: [{type: mongoose.Schema.Types.ObjectId, ref: 'Entertainment'}],
        genres: [{type: mongoose.Schema.Types.ObjectId, ref: 'Genre'}],
        nickname:{type:String},
        
    }
);

module.exports = mongoose.model('User', UserSchema);