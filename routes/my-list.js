var express = require('express');
var router = express.Router();

let Entertainment = require('../models/entertainment');
let Image = require('../models/image');
let Genre = require('../models/genre');
let User = require('../models/user');
let ObjectID = require('mongodb').ObjectID

function removeItem(array, item) {
  var i = array.length;

  while (i--) {
      if (array[i].toString() === item) {
          array.splice(array.indexOf(item), 1);
      }
  }
}

router.get('/', function(req, res, next){
    let user_id = req.oidc.user.sub.split('|')[1];
    User.findOne({_id:user_id}).populate(
        {
          path: 'to_watch',
          model: 'Entertainment',
          populate:{
            path:'img',
            model:'Image'
          }}).populate(
        {
          path: 'watched',
          model:'Entertainment',
          populate:{
            path:'img',
            model:'Image'
          }}).exec((err, user) => {
        if(err){console.log(err); return;}
        res.render('my-list', { title:"CineMatch: Your List", entertainment:user.to_watch, entertainment_watched:user.watched });
    });
});
router.post('/', function(req,res, next){
  if(req.body.type==="move-to-watched"){
      let user_id = req.oidc.user.sub.split('|')[1];
      let entertainment = req.body.id_num;
      User.findOne({_id:user_id}).exec((err, user) => {
          // Might want to do an email search or something instead but idc rn
          if(err){console.log(err); return;}
          removeItem(user.to_watch, entertainment);
          user.watched.push(new ObjectID(entertainment));
          user.save();
      });
  }
  if(req.body.type==="remove-from-list"){
    let user_id = req.oidc.user.sub.split('|')[1];
    let entertainment = req.body.id_num;
    User.findOne({_id:user_id}).exec((err, user) => {
        // Might want to do an email search or something instead but idc rn
        if(err){console.log(err); return;}
        removeItem(user.to_watch, entertainment);
        user.save();
    });
  }
  if(req.body.type==="remove-from-watched"){
    let user_id = req.oidc.user.sub.split('|')[1];
    let entertainment = req.body.id_num;
    User.findOne({_id:user_id}).exec((err, user) => {
        // Might want to do an email search or something instead but idc rn
        if(err){console.log(err); return;}
        removeItem(user.watched, entertainment);
        user.save();
    }); 
  }
})

module.exports = router;