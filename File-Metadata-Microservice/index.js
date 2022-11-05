var express = require('express'); 
var cors = require('cors');       
require('dotenv').config()        
const multer = require("multer"); 

var app = express();              
var log = console.log.bind(log);  

app.use(cors());                      
app.use((req, res, next) => {         
  log(`req.ip: ${req.ip} ${req.url}`)
  next();
})

app.use('/public', express.static(process.cwd() + '/public'));  

app.get('/', function (req, res) {                      
  res.sendFile(process.cwd() + '/views/index.html');    
});

const fileStorageEngine = multer.diskStorage({          
  destination: (req, file, cb) => {
    cb(null, "./images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine })    

app.post("/api/fileanalyse", upload.single('upfile'), (req, res, next) => {  
  console.log(req.file)
  res.json({
    "name": req.file.originalname, "type": req.file.mimetype, "size": req.file.size
  })
})

const port = process.env.PORT || 3000;                  
app.listen(port, function () {                          
  console.log('Your app is listening on port ' + port)
});