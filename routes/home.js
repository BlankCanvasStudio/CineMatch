var express = require('express');
var router = express.Router();

let Entertainment = require('../models/entertainment');
let Image = require('../models/image');
let Genre = require('../models/genre');
let User = require('../models/user');
const reteieve = require('../population/retrieve-titles/retrieve.js');
let ObjectID = require('mongodb').ObjectID

function ent_to_JSObj(entertainment){
    let new_ent = {
        "title": entertainment.title,
        "url": entertainment.url,
        "description": entertainment.description, 
        "genres": entertainment.genre,
        "platform": entertainment.platform,
        "img_src": entertainment.img.src,
        "img_alt": entertainment.img.alt,
        "id":entertainment._id,
    };
    return new_ent;
}
function removeItem(array, item) {
    var i = array.length;
  
    while (i--) {
        if (array[i].toString() === item) {
            array.splice(array.indexOf(item), 1);
        }
    }
  }

router.post('/', function(req,res, next){
    if(req.body.type==="new-movie"){
        let platform = ((req.body.platform || req.query.platform) || Netflix).replace('Plus', '+');
        reteieve.return_new_film(platform, (entertainment) => {
            res.json(ent_to_JSObj(entertainment));
        });
    }
    if(req.body.type==="add-to-list"){
        let user_email = req.oidc.user.email;
        let entertainment = req.body.id_num;
        User.findOne({email:user_email}).exec((err, user) => {
            // Might want to do an email search or something instead but idc rn
            if(err){console.log(err); return;}
            user.to_watch.push(entertainment);
            user.save();
            //res.send('Done');
        });
    }
    if(req.body.type==="move-to-watched"){
        let user_email = req.oidc.user.email;
        let entertainment = req.body.id_num;
        User.findOne({email:user_email}).exec((err, user) => {
            // Might want to do an email search or something instead but idc rn
            if(err){console.log(err); return;}
            removeItem(user.to_watch, entertainment);
            user.watched.push(entertainment);
            user.save();
        });
    }
    if(req.body.type==="remove-from-list"){
    let user_email = req.oidc.user.email;
      let entertainment = req.body.id_num;
      User.findOne({email:user_email}).exec((err, user) => {
          // Might want to do an email search or something instead but idc rn
          if(err){console.log(err); return;}
          removeItem(user.to_watch, entertainment);
          user.save();
      });
    }
    if(req.body.type==="remove-from-watched"){
        let user_email = req.oidc.user.email;
        let entertainment = req.body.id_num;
        User.findOne({email:user_email}).exec((err, user) => {
            // Might want to do an email search or something instead but idc rn
            if(err){console.log(err); return;}
            removeItem(user.watched, entertainment);
            user.save();
        }); 
    }
    if(req.body.type==="load-movie"){
        let user_email = req.oidc.user.email;
        Entertainment.findOne({_id:req.body.id_num}).populate('img').exec((err, entertainment)=>{
            res.json(ent_to_JSObj(entertainment));
        }); 
    }
})

router.get('/', function(req, res, next) {
    let entertainment = reteieve.return_home_default("Netflix", 15, (entertainment) => {
        reteieve.return_home_default((req.query.platform || "Netflix").replace("Plus", "+"), 15, (entertainment) => {
            // + denotes another value so we had to change is to 'Plus' then we replace it with + but if the param isn't there then we 
                // have an issue so we put it outside the quotes and it works just fine
            res.render('home', { title: 'CineMatch Home', entertainment:entertainment });
        });
    });
});

module.exports = router;
