module.exports = {

    listallnotice: async function (req, res) {
        var noticelist;
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
            console.log('list notice MySQL Connected');
        });
        if (req.session.role == "adm") {
            let thisistheline = "SELECT  NID, allusersname,contents,CreateDate from allnotice inner join allusers on allnotice.Creator = allusers.pid;";
            console.log(thisistheline)
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    //console.log('>> string: ', string );
                    var json = JSON.parse(string);
                    //console.log('>> json: ', json);  
                    noticelist = json;
                    console.log('>> noticelist: ', noticelist);
                    return res.view('user/notice', { thisusernoticetlist: noticelist });
                } catch (err) {
                    console.log("sth happened here");

                }


            });
        } else if (req.session.role == "sup") {
            let thisistheline = " SELECT  allnotice.NID, allusers.allusersname,allnotice.contents,allnotice.CreateDate,allnotice.Creator from allnotice"+
            "\ninner join allusers on allnotice.Creator = allusers.pid "
                + " where allnotice.creator = \"admin\" or allnotice.creator= \"" + req.session.userid + "\";";

            console.log(thisistheline)
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    //console.log('>> string: ', string );
                    var json = JSON.parse(string);
                    //console.log('>> json: ', json);  
                    noticelist = json;
                    console.log('>> noticelist: ', noticelist);
                    return res.view('user/notice', { thisusernoticetlist: noticelist });
                } catch (err) {
                    console.log("sth happened here");

                }


            });
        } else {

        }

    }
}