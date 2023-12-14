const { createPool } = require("mysql")

const pool = createPool({
    host:"localhost",
    user: "root",
    password: "Psycho.K0831",
    database: "fyptesting",
    connectionLimit:10
})


module.exports = {

   fn: async function () {
        return pool;
    },

   
}

