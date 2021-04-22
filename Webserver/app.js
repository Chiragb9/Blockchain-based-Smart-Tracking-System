var createError        = require('http-errors');
var express            = require('express');
var app                = express();
const db               = require("./keys/key").mongoURI;
var path               = require('path');
var cookieParser       = require('cookie-parser');
var logger             = require('morgan');
const mongoose         = require('mongoose');
const bodyParser       = require('body-parser');
const cors             = require('cors')
var sha256             = require('sha256')

//AUTH
const passport      = require('passport');
const LocalStrategy = require('passport-local');

//MODELS
const STSD001 = require("./models/STSD001");
const User    = require("./models/User");

//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

//SMART CONTRACT 
var Web3             = require('web3');
var HDWalletProvider = require('@truffle/hdwallet-provider');
var Mycontract       = require('./build/contracts/Tracktest.json');
const { fchmod }     = require('fs');
const { register }   = require('./models/STSD001');

const address1   ='0x4FE2000Fb08B8059e1898ceC0426B6D89228622B';
const privateKey1='7e6012ab074d4537b844e72405669e967627a8d05a1988b860ea314841a8897c';

//const web3 = new Web3('http://localhost:7545');

const provider = new HDWalletProvider(
    privateKey1,
    'https://ropsten.infura.io/v3/06746d1d9cea4f5e87fbaaf33d230f3c'
  ) 
 
const web3 = new Web3(provider);
let contract = null;
let addresses = null;
const init = async()=>{

  //addresses = await web3.eth.getAccounts();
  //console.log(addresses[0]);

  //const id = await web3.eth.net.getId();
  //console.log(id);

  contract = new web3.eth.Contract(
    Mycontract.abi
    //Mycontract.networks[id].address
  );

  contract = await contract.deploy({data: Mycontract.bytecode}).send({from: address1});

  console.log(contract._address);

  /*const receipt= await contract.methods.putHashedData('2','jfskvfjssddsv').send({
    from: addresses[0],
  });

  const data = await contract.methods.getHashedData('1').call();
  const data1 = await contract.methods.getHashedData('2').call();

  console.log(receipt.transactionHash);
  console.log(data);
  console.log(data1);
*/
}

//init();

//-------------------------------------------------------------------------------------------------------------------------------------------------

// view engine setup
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log(err));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



//AUTHENTICATION
app.use(require("express-session")({
  secret: "BE Project",
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//currentUserData Middleware
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
})


//ROUTES

let dbid=1;

//INDEX 
app.get('/', function(req, res, next) {
  res.render('index', { title: 'BE project' });
});

//AUTH
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login')
}

//register
app.get('/register',function(req,res,next){
  res.render("register")
})

app.post("/register",function(req,res,next){
  var newUser = new User({username: req.body.username})
  User.register(newUser, req.body.password, function(err, user){
    if(err){
      console.log(err)
      return res.redirect("/register")
    }
    passport.authenticate("local")(req, res, function(){
      res.redirect('/');
    })

  })
})

//login
app.get('/login', function(req,res,next){
  res.render("login")
})

app.post('/login', passport.authenticate("local", {
  successRedirect:"/",
  failureRedirect:"/login"
}),function(req,res,next){
})

//Log out
app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/login');
})



//POST SENSOR DATA - called by hw module
app.post('/putdata', function(req, res, next){
  let {temperature, humidity, lat, long} = req.body;
  let errors = [];


  let device_id = "STSD001"

  if(!temperature){
    errors.push({msg : "Parameters are missing"});
  }
  if(errors.length>0){
    res.json({Message : errors})
  }else{

    async function f(){
    let receipt = null;
    if(contract === null){
      await init();
    }
    let contractAddress = contract._address;
    async function putData(){
    await ++dbid
    //console.log(dbid)
    //console.log(sha256(temperature+humidity+lat+long))
    receipt= await contract.methods.putHashedData(String(dbid),String(sha256(temperature+humidity+lat+long))).send({
        from: address1,
      });
    }
    putData();
    //let transactionHash = receipt.transactionHash;
    //console.log(transactionHash);
    const data = new STSD001({
      device_id,
      dbid,
      temperature,
      humidity,
      lat,
      long,
      contractAddress
    });

    data
    .save()
    .then(STSD001 => {
      res.json({ Message: "Data Inserted"});
    })
    .catch(err => console.log(err));
    }
    f();
    
  }
}); 


//SEARCH API
app.get('/search/:id', function(req,res,next){
  STSD001.find({"device_id":String(req.params.id)},function(err, data){
    if(err){
      console.log(err);
    }else{
      res.json(data);
    }
  }).limit(100)
  }
)

//GET TEMPERATURE
app.get('/get_temp',function(req,res,next){
  
  STSD001.find({},function(err,data){
    if(err){
      res.send(err)
    }else{
      //console.log(data)
      res.json(parseFloat(data[0].temperature));
    }
  }).limit(1).sort({"dbid":-1})
})


//VERIFY
app.get('/verify',function(req,res,next){
    STSD001.find({"dbid":3},function(err, data){
      if(err){
        res.send(err)
      }
      else{
        async function v(){
          var b_data = await contract.methods.getHashedData(String(3)).call({from:address1})
          return b_data
        }
        var b_data = v();
        console.log(b_data)
        if(b_data==sha256(data)){
          res.json("Data Matched!!")
        }
        else{
          res.json("Not Matched :(")
        }
      }
    })
})





//app.use('/', indexRouter);
//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//ERROR HANDLER
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
