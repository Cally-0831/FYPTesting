const { createPool } = require("mysql")

const pool = createPool({
    host: "fypdeploy-mysql.svc",
    user: "fypdeploy",
    port:3306,
    password: "Psycho.K0831",
    //database: "fyptesting",
    connectionLimit:10
})


module.exports = {

   fn: async function () {
        return pool;
    },

   
}

