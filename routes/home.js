var express = require('express');
var router = express.Router();

let Entertainment = require('../models/entertainment');
let Image = require('../models/image');
let Genre = require('../models/genre');

async function generat_content(plat, num, next){
    Entertainment.find({platform:plat}).populate('img').exec((err, ent_list) => {
        if(err){console.log(err);}
        next(ent_list.slice(0, num+1)||[]);
    });
}

router.get('/', function(req, res, next) {
    let entertainment = generat_content("Disney+", 15, (entertainment) => {
        res.render('home', { title: 'CineMatch Home', entertainment:entertainment });
    });
});

module.exports = router;