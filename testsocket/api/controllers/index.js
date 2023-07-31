const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);



var srv = require('http').Server();
var io = require('socket.io')(srv);
io.on('connection', function(socket){
  socket.emit('hi');
});
io.emit('hi everyone');
module.exports={

  viewthepage : async function(req,res){
    var msg ="I see you";
    var msg = "hello world"
    return  res.json(msg);
  }
}