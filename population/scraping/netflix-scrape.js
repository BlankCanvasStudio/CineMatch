// Netflix yelled at me for logging in too much so we will scrape flixable and then 
  // Generate the links as need be if people want it
  // Lmao flixable already has the links what fun!!!

  const axios = require('axios');
  const cheerio = require('cheerio');
  const puppeteer = require('puppeteer');
  const globals = require('../../globals.js');
  
  let netflix_url = 'https://www.netflix.com';
  let netflix_login_url = 'https://www.netflix.com/login';
  
  let testing_url = 'http://www.google.com/';
  
  exports.netflix_url = netflix_url;
    //This is going to assume that you aren't logged in
  
  async function netflix_login(){
    const browser = await puppeteer.launch({ devtools : true });
    let page = await browser.newPage();
    await page.goto(netflix_login_url);
    await page.type('#id_userLoginId', "cdgreer66@gmail.com");
    await page.type('#id_password', "SpChGi3");
    await page.keyboard.press('Enter');
    await page.screenshot({ path: 'step1.png' });
      // Fill out the information and submit
    await page.waitForNavigation();
    await page.screenshot({ path: 'step2.png' });
    await page.$eval("a.profile-link", el => el.click());
    await page.screenshot({ path: 'step3.png' });
      // Chose a random profile and login (hopefully it isn't a kids account lmao)
    // Definitely should add a pause here to let the netflix page load
    await save_entertainment_page(browser, page);
  }
  async function scrape_current_page(){
    // This function is to scrape all the info from a page that has a bunch of different titles off if
    return;
  }
  async function scrape_url_extension(browser, ext){
    console.log(ext);
    let page = await browser.newPage();
    page.goto(netflix_url+ext);
    await page.waitForNavigation(); 
    await page.screenshot({ path: 'loaded_example.png' });
    return;
  }
  async function save_entertainment_page(browser, page){
    // This function actually saves the information from a loaded titles webpage
    await page.waitForSelector('div.ptrack-content > a', { visible: true, });
    const content = await page.content();
    const $ = cheerio.load(content);
    links = []
    let len =0;
    $('div.ptrack-content > a').each( (index, value) => {
      scrape_url_extension(browser, $(value).attr('href'));
    });
  }
  async function scrape_by_genre(page){
    // This will navigate to the browse tab and then run a scrape of everything accessible from the browse tab
    
    const codes = await page.evaluate(() => {
      let anchors = document.querySelectorAll('div[label="Genres"] > div + div li > a');
      let codes = [];
  
      for (let a of anchors) {
        let genre = {
          name: a.innerText,
          code: a.pathname.substr(a.pathname.lastIndexOf('/') + 1)
        }
        codes.push(genre);
      }
      return codes;
    });
  }
  
  exports.netflix_login = netflix_login;
  
  exports.webscraping = async (url) => {
      const browser = await puppeteer.launch();
      let page = await browser.newPage();
      await page.goto('http://google.com/');
      await page.$eval('input.gLFyf.gsfi', el => el.value = 'testing');
      await page.$eval( 'input[value="Google Search"]', el => el.click() );
      //let page2 = await browser.newPage();
      await page.waitForNavigation(); 
      await page.screenshot({ path: 'example.png' });
      await browser.close();
  }