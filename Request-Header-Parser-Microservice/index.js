



require('dotenv').config();
var express = require('express');
var app = express();



var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); 


app.use(express.static('public'));


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/whoami', function (req, res) {
  var ip = req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress;


  res.json({
    ipaddress: ip,
    language: req.headers["accept-language"].split(',')[0],
    software: req.headers['user-agent'].split(') ')[0].split(' (')[1]
  });
});


var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
