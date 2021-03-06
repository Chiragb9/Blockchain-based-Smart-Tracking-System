var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const db = require("./keys/key").mongoURI;

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
//Smart Contract 
var Web3 = require('web3');
var HDWalletProvider = require('@truffle/hdwallet-provider');
var Mycontract = require('./build/contracts/Tracktest.json');
const { fchmod } = require('fs');

const address1='';
const privateKey1='';

const web3 = new Web3('http://localhost:7545');

/*const provider = new HDWalletProvider(
    privateKey1,
    'http://localhost:7545'
  ) */
 
  //const web3 = new Web3('https://ropsten.infura.io/v3/06746d1d9cea4f5e87fbaaf33d230f3c');
let contract = null;
let addresses = null;
const init = async()=>{

  addresses = await web3.eth.getAccounts();
  //console.log(addresses[0]);

  const id = await web3.eth.net.getId();
  //console.log(id);

  contract = new web3.eth.Contract(
    Mycontract.abi,
    Mycontract.networks[id].address
  );

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

const sdata = require("./models/sdata");

app.get('/', function(req, res, next) {
  res.render('index', { title: 'BE project' });
});


//Posts sensor data - called by hw modu
app.post('/putdata', function(req, res, next){
  let {temperature} = req.body;
  let dbid = 0;
  let errors = [];

  if(!temperature){
    errors.push({msg : "Parameters are missing"});
  }
  if(errors.length>0){
    res.json({Message : errors})
  }else{

    async function f(){
    let receipt = null;
    await init();
    //console.log(contract);
    async function putData(){
    dbid = await dbid+1;
    receipt= await contract.methods.putHashedData(String(dbid),String(temperature)).send({
        from: addresses[0],
      });
    }
    await putData();
    let transactionHash = receipt.transactionHash;
    //console.log(transactionHash);
    const data = new sdata({
      temperature,
      transactionHash
    });

    data
    .save()
    .then(sdata => {
      res.json({ Message: "Data Inserted"});
    })
    .catch(err => console.log(err));
    }
    f();
    
  }
}); 


//app.use('/', indexRouter);
//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
