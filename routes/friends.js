var express = require('express');
var router = express.Router();

let Entertainment = require('../models/entertainment');
let Image = require('../models/image');
let Genre = require('../models/genre');
let User = require('../models/user');
let ObjectID = require('mongodb').ObjectID


router.get('/', (req, res, next) => {
    res.render('friends', { title:"CineMatch: Your Friends", });
});

module.exports = router;