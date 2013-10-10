var cronJob = require('cron').CronJob;
var scraper = require('./lib/dataScraper');


// var job = new cronJob({
//   // every minute, 
//   cronTime: '0 * 8-17 * * 1-5',
//   onTick: function() {
//     // Runs every weekday, from 8 til 
//     scraper.scrape();
//   },
//   start: true
// });

scraper.scrape();

