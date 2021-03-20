let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let GenreSchema = new Schema(
    {
        text: {type:String, required:true},
    }
);

module.exports = mongoose.model('Genre', GenreSchema);