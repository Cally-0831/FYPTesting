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
            console.log('getclassinfo MySQL Connected');
        });
        var type = req.query.type;
        var search_query = req.query.parent_value;
       
        console.log(type+"     "+search_query);
        var thisistheline;
        if (type == 'load_code') {
            thisistheline = "SELECT DISTINCT CCode FROM allclass "
                + "WHERE CDept = \"" + search_query + "\"";
        }

        if (type == 'load_section') {
            thisistheline = "SELECT DISTINCT CSecCode FROM allclass "
                + "WHERE CID like \"" + search_query +"_0"+ "\%\"";
        }
        if (type == 'load_lab') {
            var depcode = search_query.split("_")
            var getlecturesection = search_query.at(-1);
            
            thisistheline = "SELECT CSecCode FROM allclass "
                + "WHERE CID like \"" + depcode[0]+"_"+"10"+""+getlecturesection + "\%\"";
        }
        console.log(thisistheline);
        db.query(thisistheline, (err, results) => {
            var string = JSON.stringify(results);
                var json = JSON.parse(string);
                console.log(json);
           
            res.json(json);

        })

    },
}