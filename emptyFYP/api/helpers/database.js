var mysql = require('mysql');

var db = mysql.createConnection({
    host: "fypdeploy-mysql.svc",
    user: "fypdeploy",
    port: 3306,
    password: "Psycho.K0831",
    //database: "fyptesting"
});
db.connect(async (err) => {
    if (err) {
        console.log("Database Connection Failed !!!", err);
        return;
    }
    console.log('MySQL Connected');
});

module.exports = {

   fn: async function () {
        return db;
    }
}

