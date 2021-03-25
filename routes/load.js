var express = require('express');
var router = express.Router();

let Entertainment = require('../models/entertainment');
let Image = require('../models/image');
let Genre = require('../models/genre');
let User = require('../models/user');
const reteieve = require('../population/retrieve-titles/retrieve.js');
let ObjectID = require('mongodb').ObjectID

// Helper functions
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
    let removed = false;
    while (i--) {
        if (array[i].toString() === item) {
            array.splice(i, 1);
            removed = true;
        }
    }
    return removed;
}

function removeItem(array, item) {
    var i = array.length;
    let removed = false;
    while (i--) {
        if (array[i].toString() === item) {
            array.splice(array.indexOf(item), 1);
            removed = true;
        }
    }
    return removed;
}
function prevent_user_redundancies(users){
    added_user_email = [];
    non_redundant = []
    users.forEach((c) => {
        if (!added_user_email.includes(c.email)) {
            non_redundant.push(c);
            added_user_email.push(c.email);
        }
    });
    return non_redundant;
}
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
function user_to_JSObj(user){
    let genres = "";
    if(user.genres.length){
        let len = user.genres.length-1;
        for(let i=0; i<len;i++){
            genres+=user.genres[i].text+", ";
        }
        genres+=user.genres[len].text;
    } else {
        genres="None"
    }
    let new_user = {
        "genres":genres,
        "nickname":user.nickname,
        "email":user.email,
        "to_watch":user.to_watch,
    };
    return new_user;
}
function users_array_to_JSObj (users){
    if(!Array.isArray(users)){users=[users];}
    users = prevent_user_redundancies(users);
    let toReturn = [];
    let len = users.length;
    for(let i=0; i<len; i++){
        toReturn.push(user_to_JSObj(users[i]));
    }
    return {"users":toReturn};
}
function return_common_elements(arr1, arr2){
    let common=[];
    let len;
    if(arr1.length > arr2.length){
        len = arr1.length;
        for(let i=0;i<len; i++){
            if(arr2.indexOf(arr1[i])>-1){
                console.log('true');
                common.push(arr1[i])
            }
        }
    } else {
        len = arr2.length;
        for(let i=0;i<len; i++){
            if(arr1.indexOf(arr2[i])>-1){
                console.log('true');
                common.push(arr2[i])
            }
        }
    } 
    console.log('in common elements');
    return common;
}




// The post request loading all this shit 
    // Tbh it might be better to load this use different urls but we are here now
router.post('/', function(req,res, next){
    console.log(req.body.type);
    if(req.body.type === "new-movie"){
        console.log('load movie triggered');
        if(req.body.path ==="/my-list" || req.body.path === "/friends"){
            return;
        }
        console.log(req.body.path)
        //if()
        let platform = ((req.body.platform || req.query.platform) || Netflix).replace('Plus', '+');
        reteieve.return_new_film(platform, (entertainment) => {
            res.json(ent_to_JSObj(entertainment));
        });
    }
    if(req.body.type==="load-movie"){
        
        Entertainment.findOne({_id:req.body.id_num}).populate('img').exec((err, entertainment)=>{
            res.json(ent_to_JSObj(entertainment));
        }); 
    }
    if(req.body.type==="find-friends"){
        if(req.body.filter===''){
            res.json({'users':[]});
            return;
        }
        User.find({email:{'$regex': ".*"+req.body.filter+".*", $options: "$i"}}).populate('genres').exec((err_1, users_1) => {
            // The $options: $i is to make the lookup case insensitive. Very helpful
            if(err_1){console.log(err); return}
            User.find({nickname:{'$regex':".*"+req.body.filter+".*", $options: "$i"}}).populate('genres').exec((err_2, users_2) => {
                if(err_2){console.log(err); return}
                res.json(users_array_to_JSObj(users_1.concat(users_2)));
            });
        });
    }
    if(req.body.type==="get-lists"){
        console.log('in get lists')
        User.findOne({email:req.body.email}).exec((err_1, user) => {
            // The $options: $i is to make the lookup case insensitive. Very helpful
            if(err_1){console.log(err); return}
            if(user===null){
                res.send({ "status":"failure:user" });
            }
            res.json({ "to_watch":user.to_watch, "watched":user.watched, "status":"success" });
            return; 
        });
    }
    if(req.body.type==="get-matched-list"){
        User.findOne({email:req.body.other_u_email}).exec((err_1, other_user) => {
            // The $options: $i is to make the lookup case insensitive. Very helpful
            if(err_1){console.log(err); return}
            User.findOne({email:req.oidc.user.email}).exec((err_1, calling_user)=>{
                if(calling_user!==null && other_user !== null){
                    let common_to_watch = return_common_elements(calling_user.to_watch, other_user.to_watch);
                    let common_watched = return_common_elements(calling_user.watched, other_user.watched);
                    res.json({ "to_watch":common_to_watch, "watched":common_watched, "status":"success" });
                    return
                } else if (other_user === null) {
                    res.send({ "status":"failure:o_user" });
                    return
                } else if (calling_user === null) {
                    res.send({ "status":"failure:user" });
                    return
                }
                res.send({ "status":"failure:both" });
                return
                
                
            });
        });
    }
    if(req.body.type==="add-to-list"){
        let user_email = req.oidc.user.email;
        let entertainment = req.body.id_num;
        User.findOne({email:user_email}).exec((err, user) => {
            // Might want to do an email search or something instead but idc rn
            Entertainment.findOne({_id:entertainment}).exec((err, film)=>{
                if (user === null && film === null) {
                    res.send({ "status":"failure:both" });
                    return;
                } else if (user === null) {
                    res.send({ "status":"failure:user" });
                    return;
                }else if (film === null) {
                    res.send({ "status":"failure:entertainment" });
                    return;
                }
                if(err){console.log(err); return;}
                user.to_watch.push(entertainment);
                console.log(user.to_watch);
                user.save();
                res.send({ "status":"success" });
                return
            });
        });
    }
    if(req.body.type==="move-to-watched"){
        console.log('in moved to watch');
        let user_email = req.oidc.user.email;
        let entertainment = req.body.id_num;
        User.findOne({email:user_email}).exec((err, user) => {
            // Might want to do an email search or something instead but idc rn
            Entertainment.findOne({_id:entertainment}).exec((err, film)=>{
                if (user === null && film === null) {
                    res.send({ "status":"failure:both" });
                    return;
                } else if (user === null) {
                    res.send({ "status":"failure:user" });
                    return;
                }else if (film === null) {
                    res.send({ "status":"failure:entertainment" });
                    return;
                }
                if(err){console.log(err); return;}
                removeItem(user.to_watch, entertainment);
                user.watched.push(entertainment);
                user.save();
                res.send({ "status":"success" });
                return
            });
        });
    }
    if(req.body.type==="request-friend"){
        User.findOne({email:req.oidc.user.email}).exec((err, friended_user) => {
            User.findOne({ email:req.body.req_email }).exec((err, requesting_user) => {
                if(user!==null && remove_user !== null){
                    console.log(friended_user._id);
                    requesting_user.friend_requests.push(friended_user._id);
                    requesting_user.save();
                    res.send({ "status":"success" });
                    return
                } else if (friended_user === null) {
                    res.send({ "status":"failure:user" });
                    return
                } else if (requesting_user === null) {
                    res.send({ "status":"failure:requesting_user" });
                    return
                }
                res.send({ "status":"failure:both" });
                return
                
            });
        });
    }
    if(req.body.type==="add-friend"){
        User.findOne({email:req.oidc.user.email}).exec((err, friended_user) => {
            User.findOne({ email:req.body.add_email }).exec((err, requesting_user) => {
                if(friended_user!==null && requesting_user !== null){
                    console.log(friended_user._id);
                    friended_user.friends.push(requesting_user._id);
                    let index = friended_user.friend_requests.indexOf(requesting_user._id);
                    friended_user.friend_requests.splice(index, 1);
                    friended_user.save();
                    requesting_user.friends.push(friended_user._id);
                    requesting_user.save();
                    res.send({ "status":"success" });
                    return
                } else if (requesting_user === null) {
                    res.send({ "status":"failure:requesting_user" });
                    return
                } else if (friended_user === null) {
                    res.send({ "status":"failure:user" });
                    return
                }
                res.send({ "status":"failure:both" });
                return
            });
        });
    }
    if(req.body.type==="remove-request"){
        User.findOne({email:req.oidc.user.email}).exec((err, user) => {
            User.findOne({ email:req.body.remove_email }).exec((err, remove_user) => {
                if(user!==null && remove_user !== null){
                    console.log(user, remove_user);
                    let index = user.friend_requests.indexOf(remove_user._id);
                    user.friend_requests.splice(index, 1);
                    user.save();
                    res.send({ "status":"success" });
                    return
                } else if (remove_user === null) {
                    // This triggers when only the 
                    res.send({ "status":"failure:remove_user" });
                    return
                } else if (user === null) {
                    res.send({ "status":"failure:user" });
                    return;
                }
                res.send({ "status":"failure:both" });
                return
            });
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
    if(req.body.type === 'search-for-title'){
        let plat = req.body.platform;
    }
});

module.exports = router;