module.exports = {
    liststudent: async function (req, res) {
        var stdlist;
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

        let thisistheline = "SELECT student.stdname, student.sid,supervisorpairstudent.Topic "+
        "\n FROM supervisorpairstudent "+"\n INNER JOIN student ON student.sid=supervisorpairstudent.sid;";

        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                console.log('>> string: ', string );
                var json = JSON.parse(string);
                console.log('>> json: ', json);  
                stdlist=json;    
                console.log('>> stdlist: ', stdlist);  
                return res.view('user/liststudent',{allstdlist : stdlist});  
            } catch (err) {
               console.log("sth happened here");

            }


        });
        
        
    }
}