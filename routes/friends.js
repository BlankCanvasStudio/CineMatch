var express = require('express');
var router = express.Router();

let Entertainment = require('../models/entertainment');
let Image = require('../models/image');
let Genre = require('../models/genre');
let User = require('../models/user');
let ObjectID = require('mongodb').ObjectID

function swap (arr, i, j){
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
    return arr;
}
function heapify(arr, n, i)
{
    let largest = i; // Initialize largest as root
    let l = 2 * i + 1; // left = 2*i + 1
    let r = 2 * i + 2; // right = 2*i + 2

    if (l < n && arr[l].email > arr[largest].email){
        largest = l;
    }
    if (r < n && arr[r].email > arr[largest].email){
        largest = r;
    }
    if (largest != i) {
        swap(arr, i, largest);
        heapify(arr, n, largest);
    }
}
// main function to do heap sort
function heapSort(arr, n)
{
    for (let i = n / 2 - 1; i >= 0; i--){
        heapify(arr, n, i);
    }
    for (let i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}
function prevent_user_redundancies(users){
    heapSort(users);
    let len = users.length-1;
    for(let i=0; i<len; i++){
        let index = i+1;
        while(index < users.length && users[i].email==users[index].email){
            // If the list is properly sorted then all the copied values will be next to one another
            users.splice(index, 1);
        }
    }
    return users;
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
        res.render('friends', { title:"CineMatch: Your Friends", user:user});
    });
    
});
router.post('/', (req, res, next)=>{
    if(req.body.type === "new-movie"){
        return;
    }
    console.log(req.body);
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
            res.json({ "to_watch":user.to_watch, "watched":user.watched });
        });
    }
    if(req.body.type==="get-matched-list"){
        User.findOne({email:req.body.other_u_email}).exec((err_1, other_user) => {
            // The $options: $i is to make the lookup case insensitive. Very helpful
            if(err_1){console.log(err); return}
            User.findOne({email:req.oidc.user.email}).exec((err_1, calling_user)=>{
                let common_to_watch = return_common_elements(calling_user.to_watch, other_user.to_watch);
                let common_watched = return_common_elements(calling_user.watched, other_user.watched);
                res.json({ "to_watch":common_to_watch, "watched":common_watched });
            });
        });
    }
    if(req.body.type==="add-to-list"){
        let user_email = req.oidc.user.email;
        let entertainment = req.body.id_num;
        User.findOne({email:user_email}).exec((err, user) => {
            // Might want to do an email search or something instead but idc rn
            if(err){console.log(err); return;}
            user.to_watch.push(entertainment);
            console.log(user.to_watch);
            user.save();
            //res.send('Done');
        });
    }
    if(req.body.type==="move-to-watched"){
        console.log('in moved to watch');
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
});

module.exports = router;