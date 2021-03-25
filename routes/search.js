var express = require('express');
var router = express.Router();

let Entertainment = require('../models/entertainment');
let Image = require('../models/image');
let Genre = require('../models/genre');
let User = require('../models/user');
const reteieve = require('../population/retrieve-titles/retrieve.js');
const scrape = require('../population/scraping/flixable-scrape.js');
let ObjectID = require('mongodb').ObjectID

router.get('/', function(req, res, next) {
    // This adds stuff to the database for every search but we need to do some kinds of verification before searching
        // But idk how to do that effectively so I'll come back to it
    let search_terms = req.originalUrl.split('&')[0].split('=')[1];
    console.log(search_terms);
    scrape.scrape_search(search_terms, (req.query.platform || "Netflix").replace("Plus", "+"), (entertainment)=>{
        console.log('ent: ',entertainment[0]);
        res.render('home', { title: 'CineMatch Home', entertainment:entertainment });
    });
});

module.exports = router;