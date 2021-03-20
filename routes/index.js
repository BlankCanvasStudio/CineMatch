var express = require('express');
var router = express.Router();

const flix_scrape = require('../population/flixable-scrape.js')

/* GET home page. */
router.get('/', function(req, res, next) {
  //flix_scrape.scrape_all();
  res.render('index', { title: 'Express' });
});

module.exports = router;
