var express = require('express');
var router = express.Router();

let Entertainment = require('../models/entertainment');
let Image = require('../models/image');
let Genre = require('../models/genre');
let User = require('../models/user');
const reteieve = require('../population/retrieve-titles/retrieve.js');
let ObjectID = require('mongodb').ObjectID

router.get('/', function(req, res, next) {
    User.findOne({email:req.oidc.user.email}).exec((err, my) => {
        if (my===null || my===undefined) {
            res.render('settings', { title: 'Your Settings', me:req.oidc.user , error:"NoUser"});
            return;
        }
        res.render('settings', { title: 'Your Settings', me:my , error:"None"});
    });
});
router.post('/', function(req, res, next){
    User.findOne({email:req.oidc.user.email}).exec((err, my) => {
        if(err){console.log(err); return;}
        console.log(req.body);
        if(my !== null && my !== undefined){
            my.name = req.body.name;
            my.nickname = req.body.username;
            my.save();
            res.render('settings', { title: 'Your Settings', me:my , error:"None"});
        } else {
            res.render('settings', { title: 'Your Settings', me:req.oidc.user , error:"NoUser"});
        }
    });
});

module.exports = router;