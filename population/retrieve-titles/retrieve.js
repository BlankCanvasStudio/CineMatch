let Entertainment = require('../../models/entertainment');
let Image = require('../../models/image');
let Genre = require('../../models/genre');

async function return_home_default(plat, num, next){
    if(plat === "All"){
        Entertainment.find({}).populate('img').exec((err, ent_list) => {
            if(err){console.log(err);}
            next(ent_list.slice(0, num+1)||[]);
        });
    } else{
        Entertainment.find({platform:plat}).populate('img').exec((err, ent_list) => {
            if(err){console.log(err);}
            next(ent_list.slice(0, num+1)||[]);
        });
    }
}

async function return_new_film(plat, next){
    if(plat === "All"){
        Entertainment.findOne({}).populate('img').exec((err, ent) => {
            if(err){console.log(err);}
            next(ent_list||[]);
        });
    } else{
        Entertainment.findOne({platform:plat}).populate('img').exec((err, ent_list) => {
            if(err){console.log(err);}
            next(ent_list||[]);
        });
    }
}

exports.return_home_default = return_home_default;
exports.return_new_film = return_new_film;