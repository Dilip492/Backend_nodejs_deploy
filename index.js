const express = require('express')
const connect = require('./database')
const passport = require('passport');
const cors = require("cors")
const session = require('express-session')
const cookieParser  = require('cookie-parser')
require("dotenv").config()

require('./routes/passport')
const app = express();
const port = 5000 || process.env.PORT;
app.use(cors({
  origin: 'http://localhost:3000', // React app URL
  credentials: true
}))
app.use(session({ 
  secret: 'hello', 
  resave: false, 
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:true
  }
}));
app.use(passport.initialize())
app.use(passport.session())
//   database connection function call 
connect();


app.use(express.json());
app.use(cookieParser())


//   authentication middleware  

app.use('/auth', require("./routes/auth"));

//  passport middleware  
 (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
  };


console.log("hello everyone is here ")

app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
