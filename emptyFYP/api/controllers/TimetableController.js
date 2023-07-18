
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

const fs = require('fs');
const { get } = require('https');



/**
 * const express = require('express');
const cors = require('cors');
const fileupload = require('express-fileupload');
const app = express();
app.use(fileupload(), cors())
const jsftp = require('jsftp');
const thisurl = new URL(sails.config.custom.URL);
const Ftp = new jsftp({
    host: thisurl.hostname,
    user: thisurl.user,
    password: thisurl.password,
    port: thisurl.port
});

const PORT = sails.config.PORT || 8080;
app.listen(PORT);
 * 
 */
var filefile;

module.exports = {
    allDeptlist: {},
    allCCodelist: {},
    deptlist: {},
    ccodelist: {},
    allClassentry: {},




    getallclass: async function (req, res) {

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
                + "WHERE CID like \"" + depcode[0] + "_" + "10" + "" + getlecturesection + "\%\" or CID Like \"" + depcode[0] + "_" + "10\%\" ;";
        }
        //console.log(thisistheline);
        db.query(thisistheline, (err, results) => {
            var string = JSON.stringify(results);
            var json = JSON.parse(string);
            var array = json;
            if (type == "load_lab") {
                array = new Array();
                for (var i = 0; i < json.length; i++) {
                    var stringstring = json[i].CSecCode.charAt(2);
                    if (stringstring != 0 && stringstring != getlecturesection) {
                    } else {
                        array.push(json[i]);
                    }
                }
            }
            console.log(array);
            res.json(json);

        })

    },

    submitclass: async function (req, res) {
        console.log(req.body)
        let thisistheline = "";
        if (req.body.noclassenrolled == "true") {
            thisistheline = "insert ignore into alltakecourse values(\"EMPTY_\",\"" + req.session.userid + "\");\n";
        } else {
            if (req.body.classlabsection != undefined) {

                thisistheline = "insert ignore  into alltakecourse values(\"" + req.body.classdep + "" + req.body.classcode + "_" + req.body.classlabsection + "\",\"" + req.session.userid + "\");\n";
            } else if (req.body.classsection != "") {
                thisistheline = "insert ignore into alltakecourse values(\"" + req.body.classdep + "" + req.body.classcode + "_" + req.body.classsection + "\",\"" + req.session.userid + "\");\n";
            }
        }
        console.log(thisistheline);

        db.query(thisistheline, function (err, result) {
            if (err) {

                res.status(401).json("Error happened when excuting : " + thisistheline);

            };
            console.log("1 record inserted");
        });
        return res.json("ok");
    },
    submitempty: async function (req, res) {

        let thisistheline = "insert ignore into alltakecourse values(\"EMPTY\",\"" + req.session.userid + "\")";

        db.query(thisistheline, function (err, result) {
            if (err) {
                res.status(401).json("Error happened when excuting : " + thisistheline);
            };
            console.log("1 record inserted");
        });
        return res.json("ok");
    },

    getpersonalallclass: async function (req, res) {

        console.log("\n\n\n\n\n");
        let thisistheline;
        if (req.session.role == "sup") {
            thisistheline = "select allclass.CID, allclass.rid, allclass.weekdays,allclass.startTime,allclass.endTime,allsupertakecourse.confirmation,allsupertakecourse.Submissiontime from allsupertakecourse inner join allclass on allclass.cid = allsupertakecourse.cid and PID=\"" + req.session.userid + "\" ORDER BY  startTime asc ,weekdays asc";

        } else {
            thisistheline = "select allclass.CID, allclass.rid, allclass.weekdays,allclass.startTime,allclass.endTime,allstudenttakecourse.confirmation, allstudenttakecourse.Submissiontime, allstudenttakecourse.picdata, submission from allstudenttakecourse inner join allclass on allclass.cid = allstudenttakecourse.cid join student on allstudenttakecourse.pid = student.sid where student.sid = \"" + req.session.userid + "\"order BY  startTime asc ,weekdays asc";

        }
        // console.log(thisistheline);
        db.query(thisistheline, function (err, result) {
            try {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                personallist = json;
                // console.log(personallist)
                return res.view('user/timetable', {
                    date: date,
                    allpersonallist: personallist,

                });

            } catch (err) {
                // console.log(' getpersonalallclass MySQL Problem' + "    " + err);
            }

        });
        // return res.json("ok");
    },

    delpersonalallclass: async function (req, res) {
        let thisistheline;
        if (req.session.role == "sup") {
            thisistheline = "DELETE from allsupertakecourse where pid=\"" + req.session.userid + "\" and cid like\"" + req.body.cid + "%\"";

        } else {
            thisistheline = "DELETE from allstudenttakecourse where pid=\"" + req.session.userid + "\" and cid like\"" + req.body.cid + "%\"";

        }
        console.log(thisistheline);
        // console.log(thisistheline);
        db.query(thisistheline, function (err, result) {
            try {
                console.log("Deleted")
                return res.json("ok");


            } catch (err) {
                console.log(' delpersonalallclass MySQL Problem' + "    " + err);
            }

        });
        // return res.json("ok");
    },

    submitpersonalallclass: async function (req, res) {
        let thisistheline;
        console.log(req.body + "         $$$$$$$$$$$            " + req.session.role)

        if (req.session.role == "sup") {
            thisistheline = "Update allsupertakecourse set confirmation =\"1\",SubmissionTime = now() where pid=\"" + req.session.userid + "\"";
            console.log(thisistheline);
            // console.log(thisistheline);
            db.query(thisistheline, function (err, result) {
                try {
                    console.log("Submitted")
                    return res.redirect("../timetable");
                } catch (err) {
                    console.log(' submitpersonalallclass MySQL Problem' + "    " + err);
                }

            });
        } else if (req.session.role == "stu") {


            //console.log(req.file('avatar'));
            thisistheline = "Update allstudenttakecourse set confirmation =\"1\",SubmissionTime = now() where pid=\"" + req.session.userid + "\"";
            //console.log(thisistheline);
            console.log("Update allstudenttakecourse set confirmation =\"1\",SubmissionTime = now() where pid=\"" + req.session.userid + "\"");
            db.query(thisistheline, function (error, result) {
                try {

                    console.log("Submitted")
                    return res.redirect("../timetable");
                } catch (err) {
                    console.log(' submitpersonalallclass MySQL Problem' + "    " + error);
                }

            });
        };
    },
    //pageback : function (req,res){ return res.redirect("/timetable");},

    upload: function (req, res) {
        req.file('avatar').upload(function (err, files) {
            console.log(files[0].fd);

            const fs = require('fs');

            fs.readFile(files[0].fd, { encoding: 'base64' }, (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }
                //    console.log(data);

                //console.log(req.file('avatar'));
                thisistheline = "Update allstudenttakecourse set picdata= \"" + data + "\"  where pid=\"" + req.session.userid + "\"";
                //console.log(thisistheline);
                db.query(thisistheline, function (error, result) {
                    try {

                        console.log("Submitted")
                        return res.redirect("../timetable");
                    } catch (err) {
                        console.log(' submitpersonalallclass MySQL Problem' + "    " + error);
                    }

                });
            });
            fs.unlink(files[0].fd, function (err) {
                if (err) return console.log(err); // handle error as you wish
                // file deleted... continue your logic
            });
        });

    }



}