const { createPool } = require("mysql2")

const pool = createPool({
    host: "fypdeploy-mysql",
    //host: "localhost",
    //user: "root",
    user:"fypdeploy",
    port:3306,
    password: "Psycho.K0831",
    database: "fypdeploy",
    connectionLimit:10
})


module.exports = {

   fn: async function () {
        return pool;
    },

   
}

