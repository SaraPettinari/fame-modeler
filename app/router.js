var mongoose = require('mongoose');
const { exec } = require('child_process');


//var ROSLIB = require('roslib')

var url = "mongodb://localhost:27017/fame";

mongoose.connect(url)

const express = require('express')
const app = express()

const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());

// Import MongoDB data

app.get('/messages', async (req, res) => {
    var listMessages = []
    var Msg = require('../db/models/ros_msg');
    await Msg.find().exec().then(result => {
        listMessages = result

    });
    res.send({ message: "Message data", data: listMessages })
})

app.get('/processes', async (req, res) => {
    var listProcesses = []
    var Processes = require('../db/models/process');

    await Processes.find().exec().then(result => {
        listProcesses = result
    });
    res.send({ process: "Process data", data: listProcesses })
})

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    }
    else {
        next();
    }
});


app.post('/processes', async (req, res) => {
    const newData = req.body;

    var Processes = require('../db/models/process');
    
    await Processes.create(newData);

    res.send({ process: "ok"})
});


// Execute a bash command
app.post('/run-command', (req, res) => {
    const { command } = req.body;
  
    // Run the command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
  
      if (stderr) {
        return res.status(500).json({ error: stderr });
      }
  
      // Send the stdout (command output) as a JSON response
      res.json({ output: stdout });
    });
  });

app.listen(9000, () => {
    console.log("listening on port 9000")
})
