const { createPool } = require("mysql")

const pool = createPool({
    host:"localhost",
    user: "root",
    password: "Password",
    database: "prjdatabase",
    connectionLimit:10
})


module.exports = {

   fn: async function () {
        return pool;
    },

   
}

