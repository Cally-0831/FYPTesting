const { createPool } = require("mysql")

const pool = createPool({
    host:"localhost",
    user: "root",
    password: "Password",
    database: "databasename",
    connectionLimit:10
})


module.exports = {

   fn: async function () {
        return pool;
    },

   
}

