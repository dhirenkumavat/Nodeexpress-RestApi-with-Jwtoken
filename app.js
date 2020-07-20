const express =require('express');
const app =express();
const bodyparser =require('body-parser');
app.set('port',process.env.PORT || 8000);
var port =app.get('port');
var jsonParser=bodyparser.json();
const crypto =require('crypto');
var key ='password';
var algo ='aes192';

const jwt =require('jsonwebtoken');
var jwtkey = 'jwt';
var mongoose = require('mongoose');
const User= require('./models/users');
const users = require('./models/users');
const uri = "mongodb+srv://angulardb:ev6IwwecJBHoWmYu@cluster0-e9n6m.mongodb.net/angularproject?retryWrites=true&w=majority";
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected…')
})
.catch(err => console.log(err))


app.get('/', function(req,res){
res.send("Hello");
});

app.post('/register',jsonParser,function(req,res){
     var cipher=crypto.createCipher(algo,key);
     var encrypted =cipher.update(req.body.password,'utf8','hex');
     encrypted+=cipher.final('hex');
     //console.log(encrypted);
     var data =new User({
        name:req.body.name,
    email:req.body.email,
    address:req.body.address,
    password:encrypted
     });
     data.save().then((result)=>{
         jwt.sign({result},jwtkey,{expiresIn:'300s'},(err,token)=>{
    res.status(201).json({token});
})
     }).catch((err)=>console.warn(err))
    });

    //login api
app.post('/login',jsonParser,function(req,res){
    User.findOne({email:req.body.email}).then((data)=>{
        var decipher=crypto.createDecipher(algo,key);
        var decrypted =decipher.update(data.password,'hex','utf8');
        decrypted=decipher.final('utf8');
        if(decrypted==req.body.password){
            jwt.sign({data},jwtkey,{expiresIn:'300s'},(err,token)=>{
                res.status(200).json({token});
            })
        }
    })
 
})
app.get('/users',verifyToken, function(req,res){
    users.find().then((result)=>{
        res.status(200).json(result);
    })
    });

    function verifyToken(req, res, next) {
        const bearerHeader = req.headers['authorization'];
         if (typeof bearerHeader!='undefined') {
          const bearer = bearerHeader.split(' ');
          const bearerToken = bearer[1];
          req.token = bearerToken;
          jwt.verify(req.token,jwtkey,(err,authdata)=>{
              if(err){
                  res.json({result:err});
              }else{
                next();
              }
          })  
          
        } else {
          // Forbidden
          res.sendStatus(403).json('Authentication error');
        }
      }
app.listen('port',function(){
  console.log('server Runing  on port ' + port);
})
