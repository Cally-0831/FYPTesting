var mysql = require('mysql');

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Psycho.K0831",
    database: "fyptesting"
});
db.connect(async (err) => {
    if (err) {
        console.log("Database Connection Failed !!!", err);
        return;
    }
    console.log('MySQL Connected');
});

module.exports = {

  
    upload: function  (req, res) {
      req.file('avatar').upload(function (err, files) {

        
        if (err)
          return res.serverError(err);
  
        return res.json({
          message: files.length + ' file(s) uploaded successfully!',
          files: files
        });
      });
    }
  
  };