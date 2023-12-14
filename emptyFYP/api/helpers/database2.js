const { createPool } = require("mysql")

const pool = createPool({
    host: "fypdeploy-mysql",
    user: "root",
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

