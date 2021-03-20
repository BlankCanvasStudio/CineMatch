let Entertainment = require('../../models/entertainment');
let Image = require('../../models/image');
let Genre = require('../../models/genre');

async function return_home_default(plat, num, next){
    Entertainment.find({platform:plat}).populate('img').exec((err, ent_list) => {
        if(err){console.log(err);}
        next(ent_list.slice(0, num+1)||[]);
    });
}

exports.return_home_default = return_home_default;