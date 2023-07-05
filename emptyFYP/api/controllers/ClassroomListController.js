module.exports = {

    listclassroom: async function (req, res) {
        var classroomlist;
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

        let thisistheline = "SELECT * FROM classroom";

        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                classroomlist = json;
                //console.log('>> stdlist: ', stdlist);  
                return res.view('user/classroomlist', { allClassroomlist: classroomlist });
            } catch (err) {
                console.log("sth happened here");

            }


        });


    },
}