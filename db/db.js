var mongoose = require('mongoose');
var message = require('./models/ros_msg');
var process = require('./models/process');


const fs = require("fs-extra");
const { parse } = require("csv-parse");

var url = "mongodb://localhost:27017/fame";

mongoose.connect(url)


var conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'Connection error: '));
conn.once('open', function () {
  console.log('Connection OK!');
});


fs.createReadStream("./data/ros_msg.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {
    var msg = new message({
      type: row[0],
      class: row[1],
      payload: row[2]
    })
    msg.save();
  })

fs.createReadStream("./data/process.csv")
  .pipe(parse({ delimiter: ",", from_line: 2, relax_quotes: true }))
  .on("data", function (row) {
    var pro = new process({
      id: row[0],
      name: row[1],
      process: row[2]
    })
    pro.save();
  })




//mongoose.connection.close()