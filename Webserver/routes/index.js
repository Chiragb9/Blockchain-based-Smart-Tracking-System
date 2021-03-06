
var express = require('express');
var router = express.Router();
const sdata = require("../models/sdata");
/* GET home page. */
/*router.get('/', function(req, res, next) {
  //console.log(web3.eth.getAccounts());
  res.render('index', { title: 'BE project' });
});*/

router.post("/adddata",(req,res) =>{
  const {temperature} = req.body;
  let errors = [];

  if(!temperature){
    errors.push({msg : "Parameters are missing"});
  }
  if(errors.length>0){
    res.json({Message : errors})
  }else{
    const data = new sdata({
      temperature
    });

    data
    .save()
    .then(sdata => {
      res.json({ Message: "Data Inserted"});
    })
    .catch(err => console.log(err));
  }
});
module.exports = router;

/*router.get("/getdata/:assetnumber",(req,res) =>{
  var assetnumber = req.params.assetnumber;
  console.log(assetnumber);

  gpsdata.find({assetnumber: assetnumber}).exec((err, notenumber)=>{
    console.log(notenumber);
    res.json(notenumber);
  });
}); */
/*
{
  "assetnumber" : "1234324",
  "latitude" : "1231313",
  "longitude" : "123145646"
}

*/