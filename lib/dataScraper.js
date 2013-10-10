var cheerio = require('cheerio');
var request = require('request');
var crypto = require('crypto');
var Transaction = require('./models/transaction');
var mongoose = require('mongoose');
var colour = require('colour');
var format = require('stringformat');



var url = "http://www.iomart.com/investors/securities-information/trades";

var headers = ['Date', 'Time', 'Price', 'Size', 'Value', 'Buy'];



function generateKey(transaction) {
  return crypto.createHash('md5').update(JSON.stringify(transaction)).digest("hex");
}

function printTransaction(trans) {

  var str = "";

  str += trans.dateTime.toISOString().yellow;

  str += " | price: ".grey  + format("{0:6}", trans.price.toFixed(2));
  str += " | size: ".grey   + format("{0:10}",trans.size);
  str += " | value: ".grey  + format("{0:15}",trans.value.toFixed(2));
  str += " - ";
  
  if (trans.buySell === 'buy') {
    str += trans.buySell.green;
  } else if (trans.buySell === 'sell') {
    str += trans.buySell.red;
  } else {
    str += trans.buySell.yellow;
  }
  
  console.log(str);

}

module.exports.scrape = function () {
  
  // connect to the db
  var transDb = mongoose.createConnection('mongodb://localhost/transactions');
  // compile the model
  var TransactionModel = transDb.model('Transaction', Transaction);  

  request(url, function(err, resp, body) {
    if (err) throw err;
    $ = cheerio.load(body);
    var rows = $('.large-left-col table tbody tr')
    rows.each(function(i, row) {
      
      if (i === 0) {
        return;
      }
      var things = $(this).find('td');



      var date = $(things[0]).text().split("-").reverse().join("-");
      var time = $(things[1]).text().split("\n")[0] + 'Z';
      var dateTime = new Date(date + "T" + time);

      var buySell = $(things[5]).text();

      if (buySell.indexOf("Buy") === 0) {
        buySell = 'buy';
      } else if (buySell.indexOf("Sell") === 0) {
        buySell = 'sell';
      } else {
        buySell = '?';
      }

      var trans = {
        dateTime  : dateTime,
        price     : parseFloat($(things[2]).text()),
        size      : parseInt($(things[3]).text()),
        value     : parseFloat($(things[4]).text()),
        buySell   : buySell
      }
      trans.id = generateKey(trans);
      printTransaction(trans);
      // // check if the id is there
      TransactionModel.find({'id': trans.id}, function(err, docs) {
        debugger;
        // there was an error, we don't want to save it
        if (err) {
          console.error("error with mongoose")
          // if we're done, disconnect
          if (i == (rows.length - 1)) {
            mongoose.disconnect();
          }
          return;
        }
        // there wasn't an error, we are ok.
        if (docs.length > 0) {
          // if we're done, disconnect
          if (i == (rows.length - 1)) {
            mongoose.disconnect();
          }
          return;
        } 

        // it's not there, save it
        var transactionModel = new TransactionModel(trans);
        transactionModel.save(function(err, savedTransaction) {
          debugger;
          if (err) {
            console.error(error);
          } else {

          }


          // we're done, disconnect;
          if (i == (rows.length - 1)) {
            mongoose.disconnect();
          }

        });

      });
      // finished saving

    });
  });
};



