var cheerio = require('cheerio');
var request = require('request');
var crypto = require('crypto');
var Transaction = require('./models/transaction');
var mongoose = require('mongoose');


var url = "http://www.iomart.com/investors/securities-information/trades";

var headers = ['Date', 'Time', 'Price', 'Size', 'Value', 'Buy'];


function generateKey(transaction) {
  return crypto.createHash('md5').update(JSON.stringify(transaction)).digest("hex");
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
      } else {
        buySell = 'sell';
      }

      var transaction = {
        dateTime  : dateTime,
        price     : parseFloat($(things[2]).text()),
        size      : parseInt($(things[3]).text()),
        value     : parseFloat($(things[4]).text()),
        buySell   : buySell
      }
      transaction.id = generateKey(transaction);
      console.log(transaction);
      // // check if the id is there
      TransactionModel.find({'id': transaction.id}, function(err, docs) {
        debugger;
        // there was an error, we don't want to save it
        if (err) {
          console.error("error finding", err)
        }
        // there wasn't an error, we are ok.
        if (docs.length > 0) {
          console.log("transaction already there", docs)
        } 

        // it's not there, save it
        var transactionModel = new TransactionModel(transaction);
        transactionModel.save(function(err, savedTransaction) {
          debugger;
          if (err) {
            console.error(error);
          } else {
            console.log(transaction, "saved correctly");
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



