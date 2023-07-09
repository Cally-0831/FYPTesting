module.exports = {
    getallclass :async function(req,res){
        var classlist;
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
            console.log('getallclass MySQL Connected');
        });

        let thisistheline="select distinct* from allclass";

        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string); 
                classlist = json;
                //console.log('>> classlist: ', classlist);  
                return res.view('user/submitttb', { allclasslist: classlist });
            } catch (err) {
                console.log("sth happened here");

            }


        });

    }
}