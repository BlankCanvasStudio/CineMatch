var express = require('express');
var router = express.Router();

let Entertainment = require('../models/entertainment');
let Image = require('../models/image');
let Genre = require('../models/genre');
const reteieve = require('../population/retrieve-titles/retrieve.js')


router.get('/', function(req, res, next) {
    let entertainment = reteieve.return_home_default("Netflix", 15, (entertainment) => {
        res.render('home', { title: 'CineMatch Home', entertainment:entertainment });
    });
});

module.exports = router;