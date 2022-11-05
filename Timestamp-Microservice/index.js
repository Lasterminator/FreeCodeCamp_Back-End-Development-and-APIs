var express = require('express');
var app = express();




var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  


app.use(express.static('public'));


app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});



app.get("/api/hello", function (req, res) {
  res.json({ greeting: 'hello API' });
});


app.get("/api/:date", function (req, res) {
  let dateString = req.params.date;

  

  

  if (/\d{5,}/.test(dateString)) {

    const dateInt = parseInt(dateString);

    

    res.json({ unix: dateInt, utc: new Date(dateInt).toUTCString() });

  } else {

    let dateObject = new Date(dateString);

    if (dateObject.toString() === "Invalid Date") {

      res.json({ error: "Invalid Date" });

    } else {

      res.json({ unix: dateObject.valueOf(), utc: dateObject.toUTCString() });

    }

  }
});

app.get("/api", function (req, res) {
  const date = new Date()
  console.log(date.valueOf(), date.toUTCString());
  res.json({
    unix: date.valueOf(),
    utc: date.toUTCString()
  })
})




const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Node.js listening on port " + listener.address().port);
});