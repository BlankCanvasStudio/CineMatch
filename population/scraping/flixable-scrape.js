const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const globals = require('../../globals.js');

let Entertainment = require('../../models/entertainment');
let Image = require('../../models/image');
let Genre = require('../../models/genre');

const flixable_url = 'http://www.flixable.com';
const netflix_movies_url = "https://flixable.com/genre/movies/#filterForm";
const netflix_tv_url = "https://flixable.com/genre/tv-shows/#filterForm";

async function scrape_page_to_JSON(url, type, platform){
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    let title = $('h1.title.subpage').text();
    let to_scrape = $('div.card.information p');
    let description = $(to_scrape[0]).text();
    if($(to_scrape[2]).find('span').text() === "Read More..."){
        description += " " + $(to_scrape[1]).text();
        to_scrape.splice(3, 1);
        to_scrape.splice(2, 1);
        to_scrape.splice(1, 1);
            // Needs to be in this order or it'll be wrong
    }
    if(platform==="" || platform===null || platform===undefined){
        platform = $('a.watch-on-service').text().split(' ')[1]
            // This should return the platform
    }
    let genres = []
    $(to_scrape[1]).find('a').each((index, value) => {
        let text = $(value).text();
        genres.push(text);
        // Gonna keep a list of all the unique genres. Might be helpful
        Genre.findOne({text:text}).exec((err, genre) => {
            if(!genre){
                let new_genre = new Genre({text:$(value).text()});
                new_genre.save();
            }
        });
    });
    let link = flixable_url + $('a.watch-on-service').attr('href');
    //let platform = $(to_scrape[5]).find('span').text().replace(/\s/g, '').split(":")[0].substr(7);
        // Well this is dense as shit but it gets the Added to x-plat: date, removes the padding, splits it 
            // on the :, takes the first part, and substrings it after the Added to .. which is 8 characters long 
            // Thus the string will be whatever the platform is

    // This section will be for saving the image
        // Its lazyloaded to the flix so we can do the same thing and get the lazy load data
        // from the flix website. EZPZ
    let img = $('div.card.information img.poster');
    let newImage = {
            src: $(img).attr('data-src'),
                // I tried to load the src but it didn't work. But these are the same so no problem?
            alt: $(img).attr('alt'),
    };
    console.log("title: ", title);
    console.log("description: ", description);
    console.log("genres: ", genres);
    console.log('link: ', link);
    console.log('platform:', platform);
    console.log('----');

    
        // The subpage is only for specificity so plz pray that works
    let new_ent = {
            title:title,
            url:link,
            genre:genres,
            type: type||"None",
            img: newImage,
            platform: platform,
            description:description
    };
    return new_ent;
}

async function scrape_single_page(url, type, platform){
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    let title = $('h1.title.subpage').text();
    let to_scrape = $('div.card.information p');
    let description = $(to_scrape[0]).text();
    if($(to_scrape[2]).find('span').text() === "Read More..."){
        description += " " + $(to_scrape[1]).text();
        to_scrape.splice(3, 1);
        to_scrape.splice(2, 1);
        to_scrape.splice(1, 1);
            // Needs to be in this order or it'll be wrong
    }
    if(platform==="" || platform===null || platform===undefined){
        platform = $('a.watch-on-service').text().split(' ')[1]
            // This should return the platform
    }
    let genres = []
    $(to_scrape[1]).find('a').each((index, value) => {
        let text = $(value).text();
        genres.push(text);
        // Gonna keep a list of all the unique genres. Might be helpful
        Genre.findOne({text:text}).exec((err, genre) => {
            if(!genre){
                let new_genre = new Genre({text:$(value).text()});
                new_genre.save();
            }
        });
    });
    let link = flixable_url + $('a.watch-on-service').attr('href');
    //let platform = $(to_scrape[5]).find('span').text().replace(/\s/g, '').split(":")[0].substr(7);
        // Well this is dense as shit but it gets the Added to x-plat: date, removes the padding, splits it 
            // on the :, takes the first part, and substrings it after the Added to .. which is 8 characters long 
            // Thus the string will be whatever the platform is

    // This section will be for saving the image
        // Its lazyloaded to the flix so we can do the same thing and get the lazy load data
        // from the flix website. EZPZ
    let img = $('div.card.information img.poster');
    let newImage = new Image(
        {
            src: $(img).attr('data-src'),
                // I tried to load the src but it didn't work. But these are the same so no problem?
            alt: $(img).attr('alt'),
        }
    );
    newImage.save();
    console.log("title: ", title);
    console.log("description: ", description);
    console.log("genres: ", genres);
    console.log('link: ', link);
    console.log('platform:', platform);
    console.log('----');

    
        // The subpage is only for specificity so plz pray that works
    let new_ent = new Entertainment(
        {
            title:title,
            url:link,
            genre:genres,
            type: type||"None",
            img: newImage,
            platform: platform,
            description:description
        }
    );
    new_ent.save();
    
}
async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
async function scrape_movies(platform, browser){
    // This function is going to assume that we are at the home page
    page_url = netflix_movies_url;
    if(platform!=="Netflix"){ page_url = 'http://www.flixable.com/'+platform.toLowerCase().replace(' ', '-').replace('+', '-plus')+'/genre/movies/#filterForm'; }
    let movies_page = await browser.newPage();
    await movies_page.goto(page_url);
    //await page.select("select#first", "Apple")
    let $ = cheerio.load(await movies_page.content());
    await autoScroll(movies_page);
        // Scrolling through the whole thing
    /*await movies_page.screenshot({
        path: 'yoursite.png', movies_page.content()
        fullPage: true
    });*/
    let extensions = [];
    $('div.card-header-image a').each((index, value) => {
        extensions.push($(value).attr('href'));
    });
    let len = extensions.length;
    for(let i=0; i<len; i++){
        scrape_single_page(flixable_url+extensions[i], "Movies", platform)
    }
}
async function scrape_series(platform, browser){
    // This function is going to assume that we are at the home page
    page_url = netflix_tv_url;
    if(platform==="Hulu"){ page_url = 'http://www.flixable.com/'+platform.toLowerCase()+'/genre/shows/#filterForm'; }
    else if(platform!=="Netflix"){ page_url = 'http://www.flixable.com/'+platform.toLowerCase().replace(' ', '-').replace('+', '-plus')+'/genre/series/#filterForm'; }
    let movies_page = await browser.newPage();
    await movies_page.goto(page_url);
    //await page.select("select#first", "Apple")
    let $ = cheerio.load(await movies_page.content());
    //await autoScroll(movies_page);
        // Scrolling through the whole thing
    await movies_page.screenshot({
        path: 'yoursite.png',
        fullPage: true
    });
    let extensions = [];
    $('div.card-header-image a').each((index, value) => {
        extensions.push($(value).attr('href'));
    });
    let len = extensions.length;
    for(let i=0; i<len; i++){
        scrape_single_page(flixable_url+extensions[i], "Series", platform)
    }
}

async function scrape_all(){
    //const browser = await puppeteer.launch({ devtools : true });
    //scrape_single_page("https://flixable.com/disney-plus/title/marvel-studios-assembled/", "Series", "Disney+");
    const browser = await puppeteer.launch();
    let len = globals.platform_names.length;
    for(let i=0; i<len; i++){
        await scrape_movies(platform_names[i], browser);
        await scrape_series(platform_names[i], browser);
            // You have to wait or else it'll break
    }
}
async function scrape_search(search_terms, platform, next){
    let search_url = '';
    if(platform==="All"){
        // Do a loop of everything here
        let carry_over = await scrape_search(search_terms, "Netflix");
        (await carry_over).concat(scrape_search(search_terms, "Disney+"));
        (await carry_over).concat(scrape_search(search_terms, "Hulu"));
        (await carry_over).concat(scrape_search(search_terms, "HBO Max"));
        return next(carry_over);
    }
    if(platform==="Netflix"){
        search_url = flixable_url+'/?s='+search_terms.replace(' ', '+');
    } else {
        platform = platform.toLowerCase().replace('+', '-plus').replace(' ', '-');
        search_url = flixable_url+'/'+platform+'/?s='+search_terms.replace(' ', '+');
    }
    
    scrape_single_page(search_url, "Unknown", "");
    const { data } = await axios.get(search_url);
    const $ = cheerio.load(data);
    let titles = [];
    let extensions = [];
    $('div.card-header-image a').each((index, value) => {
        extensions.push($(value).attr('href'));
    });
    let len = extensions.length;
    for(let i=0; i<len; i++){
        titles.push(await scrape_page_to_JSON(flixable_url+extensions[i], "Unknown", platform))
    }
    if(next){
        next(titles);
        return;
    }
    return titles;
}

exports.scrape_single_page = scrape_single_page;
exports.scrape_all = scrape_all;
exports.scrape_search = scrape_search