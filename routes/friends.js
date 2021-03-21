var express = require('express');
var router = express.Router();

let Entertainment = require('../models/entertainment');
let Image = require('../models/image');
let Genre = require('../models/genre');
let User = require('../models/user');
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

router.get('/', (req, res, next) => {
    let user_email = req.oidc.user.email;
    // Email should hopefully be a unique identifier
    // We aren't going to be populating entertainment because the object ID
        // Comparision will be way easier then we populate only the matching ones
    User.findOne({email:user_email}).populate(
        {
            path: 'friends',
            model:'User',
            populate:{
                path:'genres',
                model:'Genre'
        }}).exec((err, user) => {
            console.log(user.friends);
        res.render('friends', { title:"CineMatch: Your Friends", user:user});
    });
    
});
router.post('/', (req, res, next)=>{
    if(req.body.type==="load-movie"){
        console.log(req.body);
        console.log('id_num: ', req.body.id_num);
        Entertainment.findOne({_id:req.body.id_num}).populate('img').exec((err, entertainment)=>{
            console.log(entertainment);
            res.json(ent_to_JSObj(entertainment));
        }); 
    }
});

module.exports = router;