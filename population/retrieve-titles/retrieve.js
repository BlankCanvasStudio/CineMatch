let Entertainment = require('../../models/entertainment');
let Image = require('../../models/image');
let Genre = require('../../models/genre');
const { networkConditions } = require('puppeteer');

async function return_home_default(plat, num, next){
    let ent_list = []
    let images = []
    if(plat === "All"){
        movie_cursor = await Entertainment.aggregate([{ $sample:{size:num}}]);
    } else { 
        movie_cursor = await Entertainment.aggregate([{$match:{platform:plat} }, { $sample:{size:num}}]);
            // This has to happen in this way or the matching will only occur on the array returned, not specify what 
                // should be drawn from the database
    }
    await Entertainment.populate(movie_cursor, {path: "img"});
    next(movie_cursor);
}

async function return_new_film(plat, next){
    let ent_list = []
    let images = []
    if(plat === "All"){
        movie_cursor = await Entertainment.aggregate([{ $sample:{size:1}}]);
    } else { 
        movie_cursor = await Entertainment.aggregate([{$match:{platform:plat} }, { $sample:{size:1}}]);
            // This has to happen in this way or the matching will only occur on the array returned, not specify what 
                // should be drawn from the database
    }
    await Entertainment.populate(movie_cursor, {path: "img"});
    next(movie_cursor);
}

exports.return_home_default = return_home_default;
exports.return_new_film = return_new_film;