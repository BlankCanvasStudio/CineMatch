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
    let params = req.originalUrl.split('&');
    let len = params.length;
    let search_terms='';
    for(let i=0; i<len; i++){
        if(params[i].split('=')[0]==='search-terms'){
            search_terms = params[i].split('=')[1];
            i = len+1;
        }
    }
    console.log(search_terms);
    if(search_terms != ''){
        scrape.scrape_search(search_terms, (req.query.platform || "Netflix").replace("Plus", "+"), (entertainment)=>{
            res.render('home', { title: 'CineMatch Home', entertainment:entertainment });
        });
    }
    
});

module.exports = router;