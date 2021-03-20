var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    webscraping(url);
    res.render('admin', { title: 'Admin Page' });
});

module.exports = router;