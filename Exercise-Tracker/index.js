
require('dotenv').config()

const express = require('express');

const app = express();

const cors = require('cors');

const bodyParser = require("body-parser");


const mongoose = require("mongoose");
const { response } = require('express');

const Schema = mongoose.Schema;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

var log = console.log.bind(log);

app.use((req, res, next) => {
  console.log(`req ip:${req.ip} req url: ${req.url} `);
  next();
})


app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: "false" }));
const regDate = /\d\d\d\d-\d\d-\d\d/;


const exerciseSchema = new Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: {
    type: String,
    
    
    
    
    
    default: () => { return new Date().toDateString() }
  },
}, { versionKey: false, })

const userSchema = new Schema({
  username: { type: String, required: true },
  count: { type: Number, default: 0 },
  log: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Exercise"
  }]
})


let User = mongoose.model("User", userSchema);
let Exercise = mongoose.model("Exercise", exerciseSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post("/api/users", (req, res, next) => {
  console.log(`req.body.username: '${req.body.username}'`)
  let userName = req.body.username === "" ? next("Username is empty") : req.body.username;
  User.find({ username: userName }, "_id username", (err, user) => {
    if (err) console.log(err);
    console.log("In the find:", user)
    if (user.length == 0) {
      let user = new User({ username: userName })
      console.log(user);
      user.save((serr, user) => {
        if (serr) {
          console.log("Save error:", serr);
          next(serr);
        }
        else {
          console.log("User created:", user);
          res.json({ "username": user.username, "_id": user._id });
        }
      })
    }
    else if (typeof user !== "undefined") {
      user = user[0];
      console.log("User available:", user);
      res.json(user);
    }
    else {
      console.log("Error on find:", err);
      next(err)
    }
  })
})


app.get("/api/users", (req, res, next) => {

  
  User.find({}, "_id username __v", (err, users) => {
    if (err) console.log(err)
    console.log("users found:", users);
    if (users.length !== 0) {
      res.json(users);
    }
    else {
      res.json("Empty");
    }
  })
})


app.post("/api/users/:_id/exercises", (req, res, next) => {
  console.log(req.params._id, "req.body.date is:", req.body.date, "req.body.date type: ", typeof req.body.date)

  
  let toDBdate = /\d\d\d\d-\d\d-\d\d/.test(req.body.date) ? new Date(req.body.date.split("-")).toDateString() : new Date().toDateString();
  
  console.log(toDBdate);

  
  let exercise = new Exercise({
    description: req.body.description,
    duration: req.body.duration,
    date: toDBdate
  })
  exercise.save((serr, exr) => {
    if (serr) console.log(serr);
    else console.log(exr)
  });
  
  User.findById(req.params._id, (err, user) => {
    if (err) {
      console.log(err);
      next("err");
    };
    if (!user) {
      next(user);
    }
    console.log("user availability:", user);
    if (typeof user !== "undefined") {
      
      let logid = user.log.length;
      user.log.push({
        _id: exercise._id
      })
      user.count = user.log.length;
      user.save((err) => {
        if (err) console.log("When saving DB err occured:", err)
        next(err);
      })
      res.json({ "_id": user._id, "username": user.username, "date": exercise.date, "duration": exercise.duration, "description": exercise.description });
    }
    else {
      next("user is not created yet")
    }
  })
})


app.get("/api/users/:_id", (req, res, next) => {
  const id = req.params._id;
  User.findById(id, (err, user) => {
    if (err) console.error(err);
    res.json(user);
  }).populate("log");
})


app.get("/api/users/:_id/logs", (req, res, next) => {
  const id = req.params._id;
  var fromDate = req.query.from;
  var toDate = req.query.to;
  var limit = req.query.limit;

  console.log(id, fromDate, toDate, limit);

  const validateDate = (aDate) => {
    if (aDate !== undefined) {
      aDate = new Date(aDate);
      if (aDate == "Invalid Date") {
        res.json("Invalid Date bitches")
        return;
      }
    }
  }

  const checkLimit = (limit) => {
    if (limit !== undefined) {
      limit = new Number(limit);
      if (isNaN(limit)) {
        res.json("Invalid Limit Entered");
        return;
      }
    }
  }
  
  validateDate(fromDate);
  validateDate(toDate);
  checkLimit(limit);

  User.findById({ "_id": id }, "_id username count log", (err, user) => {
    if (err) console.error(err);

    const checkLog = () => {
      let obj = { ...user._doc };
      if (fromDate) {
        obj.log = obj.log.filter(log => Date.parse(log.date) > Date.parse(fromDate))
        obj.from = new Date(fromDate).toDateString();
      }
      if (toDate) {
        obj.log = obj.log.filter(log => Date.parse(log.date) < Date.parse(toDate))
        obj.to = new Date(toDate).toDateString();
        console.log("to: ", obj.to);
      }
      if (limit) {
        obj.log = obj.log.slice(0, limit);
        obj.count = obj.log.length;
      }
      log(obj.log.length);
      return { ...obj };
    }
    let ret = checkLog();

    res.json(ret)
  }).populate("log", "-_id")
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})