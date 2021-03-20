let mongoose = require('mongoose');
let Schema = mongoose.Schema;

//import platform_names from '../globals.js';
platform_names = ["Disney+", "Hulu", "HBO Max", "Netflix"];

let EntertainmentSchema = new Schema(
    {
        title:{type:String},
        url: {type:String, unqiue: true},
            // Every URL is unique so we can enforce it this way
        genre:[{type:String}],
        type:{type:String},
        img:{type: mongoose.Schema.Types.ObjectId, ref: 'Image'},
        platform:{type:String},
        description:{type:String},
    }
);

module.exports = mongoose.model('Entertainment', EntertainmentSchema);