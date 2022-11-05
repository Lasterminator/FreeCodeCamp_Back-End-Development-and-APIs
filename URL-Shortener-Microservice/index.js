require('dotenv').config();
const url = require('url')
const dns = require('dns')
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const shortenUrl = require('./data').shorten_URL
const getUrl = require('./data').getUrl

const app = express();


const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post('/api/shorturl', function (req, res) {

  let originalURL = req.body.url
  let parsedUrl = url.parse(originalURL)

  if (parsedUrl.protocol == 'http:' || parsedUrl.protocol == 'https:') {
    dns.lookup(parsedUrl.hostname, (err, address, family) => {
      if (err) {
        res.json({
          error: 'invalid url'
        })
      }
      else {
        res.json(shortenUrl(originalURL))
      }
    })
  }
  else {
    res.json({
      error: 'invalid url'
    })
  }

});

app.get('/api/shorturl/:shorturl', (req, res) => {
  let originalUrl = getUrl(req.params.shorturl)

  
  if (originalUrl) {
    res.redirect(originalUrl)
  }
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});