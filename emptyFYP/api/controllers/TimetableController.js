module.exports = {
    allDeptlist: {},
    allCCodelist: {},
    deptlist: {},
    ccodelist: {},
    allClassentry: {},




    getallclass: async function (req, res) {

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
                return res.view('user/submitttb', {

                    allDeptlist: deptlist,

                });

            } catch (err) {
                console.log("sth happened here" + err);

            }


        });

    },

    getotherfield: async function (req, res, next) {

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
            // console.log('getclassinfo MySQL Connected');
        });
        var type = req.query.type;
        var search_query = req.query.parent_value;

        //console.log(type+"     "+search_query);
        var thisistheline;
        if (type == 'load_code') {
            thisistheline = "SELECT DISTINCT CCode FROM allclass "
                + "WHERE CDept = \"" + search_query + "\"";
        }

        if (type == 'load_section') {
            thisistheline = "SELECT DISTINCT CSecCode FROM allclass "
                + "WHERE CID like \"" + search_query + "_0" + "\%\"";
        }
        if (type == 'load_lab') {
            var depcode = search_query.split("_")
            var getlecturesection = search_query.at(-1);

            thisistheline = "SELECT CSecCode FROM allclass "
                + "WHERE CID like \"" + depcode[0] + "_" + "10" + "" + getlecturesection + "\%\"";
        }
        //console.log(thisistheline);
        db.query(thisistheline, (err, results) => {
            var string = JSON.stringify(results);
            var json = JSON.parse(string);
            // console.log(json);

            res.json(json);

        })

    },

    submitclass: async function (req, res) {

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
            console.log('submitclass MySQL Connected');
        });
        console.log(req.body);

        let thisistheline = "";
        if (req.body.classlabsection != undefined) {

            thisistheline = "insert into alltakecourse values(\"" + req.body.classdep + "" + req.body.classcode + "_" + req.body.classlabsection + "\",\"" + req.session.userid + "\");\n";
        } else if (req.body.classsection != "") {
            thisistheline = "insert into alltakecourse values(\"" + req.body.classdep + "" + req.body.classcode + "_" + req.body.classsection + "\",\"" + req.session.userid + "\");\n";

        }


        db.query(thisistheline, function (err, result) {
            if (err) {

                res.status(401).json("Error happened when excuting : " + thisistheline);

            };
            console.log("1 record inserted");
        });
        return res.json("ok");
    },

    getpersonalallclass: async function (req, res) {
        var mysql = require('mysql');
        const date = require('date-and-time')
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
            console.log(' getpersonalallclass MySQL Connected');
        });
        //console.log(req.body);
        let thisistheline;
if(req.session.role =="sup"){
      thisistheline = "select allclass.CID, allclass.rid, allclass.weekdays,allclass.startTime,allclass.endTime from allsupertakecourse inner join allclass on allclass.cid = allsupertakecourse.cid and PID=\""+req.session.userid+"\" ORDER BY  startTime asc ,weekdays asc";
      
}else {
    thisistheline = "select allclass.CID, allclass.rid, allclass.weekdays,allclass.startTime,allclass.endTime from allstudenttakecourse inner join allclass on allclass.cid = allstudenttakecourse.cid and PID=\"" + req.session.userid + "\" ORDER BY  startTime asc ,weekdays asc";
      
}
       // console.log(thisistheline);
        db.query(thisistheline, function (err, result) {
            try {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                personallist = json;
                console.log(personallist)
                return res.view('user/timetable', {
                    date: date,
                    allpersonallist: personallist,

                });

            } catch (err) {
               // console.log(' getpersonalallclass MySQL Problem' + "    " + err);
            }

        });
        // return res.json("ok");
    }
}