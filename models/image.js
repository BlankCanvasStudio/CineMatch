let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ImageSchema = new Schema(
    {
        src: {type:String},
        alt: {type:String},
    }
);

module.exports = mongoose.model('Image', ImageSchema);