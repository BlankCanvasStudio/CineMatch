var express = require('express');
var router = express.Router();

let Entertainment = require('../models/entertainment');
let Image = require('../models/image');
let Genre = require('../models/genre');
let User = require('../models/user');
const reteieve = require('../population/retrieve-titles/retrieve.js')

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


router.post('/', function(req,res, next){
    if(req.body.type==="new-movie"){
        let platform = ((req.body.platform || req.query.platform) || Netflix).replace('Plus', '+');
        reteieve.return_new_film(platform, (entertainment) => {
            res.json(ent_to_JSObj(entertainment));
        });
    }
    if(req.body.type==="add-to-list"){
        console.log(req.oidc.user)
        let user_id = req.oidc.user.sub.split('|')[1];
        let entertainment = req.body.id_num;
        console.log(user_id);
        console.log(entertainment);
        /*User.findOne({authID:user_id}).exec((err, user) => {
            // Might want to do an email search or something instead but idc rn
            if(err){console.log(err); return;}
            user.to_watch.append(entertainment);
            user.save();
            res.send('Done');
        })*/
    }
})


router.get('/', function(req, res, next) {
    reteieve.return_home_default((req.query.platform || "Netflix").replace("Plus", "+"), 15, (entertainment) => {
        // + denotes another value so we had to change is to 'Plus' then we replace it with + but if the param isn't there then we 
            // have an issue so we put it outside the quotes and it works just fine
        res.render('home', { title: 'CineMatch Home', entertainment:entertainment });
    });
});

module.exports = router;