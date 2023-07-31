var socketIOClient = require('socket.io-client');
var sailsIOClient = require('sails.io.js');

// Instantiate the socket client (`io`)
// (for now, you must explicitly pass in the socket.io client when using this library from Node.js)
var io =  require('socket.io-client')('http://localhost:1337/');
//io.sails.autoConnect = false
// Set some options:
// (you have to specify the host and port of the Sails backend when using this library from Node.js)
//io.sails.connect('http://localhost:1337');

// Send a GET request to `http://localhost:1337/hello`:
//io.sails.url = 'http://localhost:1337';
// ...

// Send a GET request to `http://localhost:1337/hello`:

/**
io.socket.get('/login', function serverResponded (body, JWR) {
  // body === JWR.body
  console.log('Sails responded with: ', body);
  console.log(io.socket.getid())

  //console.log('with headers: ', JWR.headers);
  //console.log('and with status code: ', JWR.statusCode);

  // ...
  // more stuff
  // ...


  // When you are finished with `io.socket`, or any other sockets you connect manually,
  // you should make sure and disconnect them, e.g.:
  io.socket.disconnect();

  // (note that there is no callback argument to the `.disconnect` method)
});

**/


module.exports={
    getlogin : async function(req,res){
 //       var io = new sailsIOClient(socketIOClient);
//        console.log(io.getid())
    },
}