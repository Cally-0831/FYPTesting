const { createPool } = require("mysql2")

const pool = createPool({
//    host: "fypdeploy3-mysql",
//    host: "fypdeploy2-mysql",
   host: "fypdeploy-mysql",

    //host: "localhost",
    //user: "root",
    user: "fypdeploy",
    port: 3306,
    password: "Psycho.K0831",
    database: "fypdeploy",
 
    connectionLimit: 10,
    idleTimeout: 100000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,

})



module.exports = {

    fn: async function () {
        return pool;
    },


}

