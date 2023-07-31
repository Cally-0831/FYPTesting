const socketlist = require("./socketlist");



module.exports = {

    fn: async function (newsocket) {
        var array = await sails.helpers.socketlist();
        socketarray.push(newsocket);
         return sails.helpers.Sockets.setarray(array);
     }
 }