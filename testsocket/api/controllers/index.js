const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);





module.exports={

  viewthepage : async function(req,res){
    var msg ="I see you";
    var msg = "hello world"
    return  res.send(msg);
  }
}