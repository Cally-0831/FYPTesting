module.exports = {
    allDeptlist: {},
    allCCodelist: {},
    deptlist: {},
    ccodelist: {},

    getallclass: async function (req, res) {

        var ccodelist;
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
        let thisistheline = "select distinct CDept from allclass";

        db.query(thisistheline, (err, results) => {
            try {

                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                deptlist = json;
                allDeptlist = deptlist;
                console.log('>> classlist: ', allDeptlist);
                return res.view('user/submitttb', {
                    allDeptlist: deptlist,
                    allCCodelist: ccodelist
                });
            } catch (err) {
                console.log("sth happened here" + err);

            }


        });

    },

    getccode: async function (req, res) {
        var ccodelist;
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
            console.log('getclassinfo MySQL Connected');
        });
        console.log("@@@@@@@@@@@");
        console.log(req.body);
        console.log("@@@@@@@@@@@");
        var ccodelist;
        thisistheline = "select distinct CCode from allclass where CDept=\"" + req.body.CDept + "\"";
        console.log(thisistheline);
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                ccodelist = json;
                allCCodelist = ccodelist;
                console.log('>> ccodelist: ', ccodelist);
                res.body = req.body;
                return res.view('user/classcode', {
                    allDeptlist: allDeptlist,
                    allCCodelist: ccodelist
                });
            } catch (err) {
                console.log("sth happened here");

            }

        }

        )


    }
}