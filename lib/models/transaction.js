// to store the errors
var mongoose = require('mongoose');
var transDb = mongoose.createConnection('mongodb://localhost/transactions');

// error schema to store errors on mongodb
var Schema = mongoose.Schema;
var Transaction = new Schema({
  id          : { type : String, required: true, index: true},
  dateTime    : { type : Date,   required: true},
  price       : { type : Number, required: true},
  size        : { type : Number, required: true},
  value       : { type : Number, required: true},
  buySell     : { type : String, required: true}
});
var TransactionModel = transDb.model('Transaction', Transaction);  

module.exports = TransactionModel;