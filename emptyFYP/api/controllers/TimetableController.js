
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
const { Console } = require('console');



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




module.exports = {
    allDeptlist: {},
    allCCodelist: {},
    deptlist: {},
    ccodelist: {},
    allClassentry: {},




    getallclass: async function (req, res) {


        thisistheline = "select distinct CDept from allclass";

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
        console.log(thisistheline);
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
            json = array;
            return res.json(json);

        })

    },

    submitclass: async function (req, res) {

        let thisistheline = "";
        let thisistheline2 = "";
        let thisistheline3 = "";

        let thisclassinfo;
        let havethis;
        let timecrash;
        let codecode = 200;
        let msg = "";



        if (req.body.classlabsection == undefined) {
            thisistheline = "select * from allclass where CID like \"" + req.body.classdep + req.body.classcode + "_" + req.body.classsection + "%\"";

        }
        if (req.body.classsection == undefined) {
            thisistheline = "select * from allclass where CID like \"" + req.body.classdep + req.body.classcode + "_" + req.body.classlabsection + "%\"";
        }


        db.query(thisistheline, function (err, result) {
            try {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                thisclassinfo = json;

                if (req.session.role == "sup") {
                    thisistheline2 = "select * from allsupertakecourse where pid = \"" + req.session.userid + "\" and CID like \"" + thisclassinfo[0].CID + "\"";

                } else if (req.session.role == "obs") {
                    thisistheline2 = "select * from allobstakecourse where pid = \"" + req.session.userid + "\" and CID like \"" + thisclassinfo[0].CID + "\"";

                } else {
                    thisistheline2 = "select * from allstudenttakecourse where pid = \"" + req.session.userid + "\" and CID like \"" + thisclassinfo[0].CID + "\"";
                }

                db.query(thisistheline2, function (err, result) {
                    try {
                        var string = JSON.stringify(result);
                        var json = JSON.parse(string);
                        havethis = json;

                        if (havethis.length > 0) {
                            codecode = 401;
                            msg = "This class has already been inputed before"
                            return res.status(codecode).json(msg);
                        } else {
                            if (req.session.role == "sup") {
                                thisistheline3 = "select * from allsupertakecourse join allclass on allclass.CID = allsupertakecourse.CID  where pid = \"" + req.session.userid + "\" and weekdays = \"" + thisclassinfo[0].weekdays + "\" and (\"" + thisclassinfo[0].startTime + "\" between startTime and endtime );"

                            } else if (req.session.role == "obs") {
                                thisistheline3 = "select * from allobstakecourse join allclass on allclass.CID = allobstakecourse.CID  where pid = \"" + req.session.userid + "\" and weekdays = \"" + thisclassinfo[0].weekdays + "\" and (\"" + thisclassinfo[0].startTime + "\" between startTime and endtime );"

                            } else {
                                thisistheline3 = "select * from allstudenttakecourse  join allclass on allclass.CID = allstudenttakecourse.CID where allstudenttakecourse.PID = \"" + req.session.userid + "\" and weekdays = \"" + thisclassinfo[0].weekdays + "\" and (\"" + thisclassinfo[0].startTime + "\" between startTime and endtime );"
                            }
                            db.query(thisistheline3, function (err, result) {
                                try {
                                    var string = JSON.stringify(result);
                                    var json = JSON.parse(string);
                                    timecrash = json;
                                    if (timecrash.length > 0) {
                                        codecode = 401;
                                        msg = "Please Review your input since there was a time crash between your inputs"
                                        return res.status(codecode).json(msg);
                                    } else {

                                        db.query(thisistheline3, function (err, result) {
                                            try {

                                                if (req.body.noclassenrolled == "true") {
                                                    thisistheline = "insert ignore into alltakecourse values(\"EMPTY_\",\"" + req.session.userid + "\");\n";
                                                } else {
                                                    if (req.body.classlabsection != undefined) {

                                                        thisistheline = "insert ignore  into alltakecourse values(\"" + req.body.classdep + "" + req.body.classcode + "_" + req.body.classlabsection + "\",\"" + req.session.userid + "\");\n";
                                                    } else if (req.body.classsection != "") {
                                                        thisistheline = "insert ignore into alltakecourse values(\"" + req.body.classdep + "" + req.body.classcode + "_" + req.body.classsection + "\",\"" + req.session.userid + "\");\n";
                                                    }

                                                }

                                                db.query(thisistheline, function (err, result) {
                                                    if (err) {
                                                        codecode = 401;
                                                        msg = "Probelm existed when inserting."
                                                        return res.status(codecode).json(msg);
                                                    } else {
                                                        return res.ok();
                                                    }

                                                })



                                            } catch (err) {
                                                console.log("insert have err     " + err)
                                            }
                                        })
                                    }
                                } catch (err) {
                                    console.log("find time crash have err     " + err)
                                }

                            })

                        }
                    } catch (err) {
                        console.log("find class in personal list have err     " + err)
                    }

                })
            } catch (err) {
                console.log("get this classinfo have err     " + err)
            }

        })






        /** 
        db.query(thisistheline, function (err1, result1) {
            try {
                var string = JSON.stringify(result1);
                var json = JSON.parse(string);
                thisclassinfo = json;
                console.log(">>thisclassinfo\n");
                console.log(thisclassinfo)
                if (req.session.role == "sup") {
                    thisistheline2 = "select * from allsupertakecourse where pid = \"" + req.session.userid + "\" and CID like \"" + thisclassinfo[0].CID + "\"";

                } else {
                    thisistheline2 = "select * from allstudenttakecourse where pid = \"" + req.session.userid + "\" and CID like \"" + thisclassinfo[0].CID + "\"";
                }
                console.log("\n\n\n\n\n\n\nfind already inputted      " + thisistheline2);
                db.query(thisistheline2, function (err2, result2) {
                    try {
                        string = JSON.stringify(result2);
                        json = JSON.parse(string);
                        havethis = json;
                        console.log(">>havethis\n")
                        console.log(havethis.length);
                        if (havethis.length > 0) {

                            codecode = 401;
                            msg = "Duplicate with exitising input";
                             return res.status(codecode).json(msg);

                        } else {
                            if (req.session.role == "sup") {
                                thisistheline3 = "select * from allsupertakecourse where pid = \"" + req.session.userid + "\" and CID like \"" + thisclassinfo[0].CID + "\"";

                            } else {
                                thisistheline3 = "select * from allstudenttakecourse  join allclass on allclass.CID = allstudenttakecourse.CID where allstudenttakecourse.PID = \"" + req.session.userid + "\" and weekdays = \"" + thisclassinfo[0].weekdays + "\" and (\"" + thisclassinfo[0].startTime + "\" between startTime and endtime );"
                            }
                            console.log("\n\n\n\n\n>>thisistheline3         " + thisistheline3)
                            db.query(thisistheline3, function (err3, result3) {
                                string = JSON.stringify(result3);
                                json = JSON.parse(string);
                                var colipsethis = json;
                                console.log(colipsethis)
                                if (colipsethis.length == 0) {
                                    if (req.body.classlabsection != undefined) {

                                        thisistheline4 = "insert ignore  into alltakecourse values(\"" + req.body.classdep + "" + req.body.classcode + "_" + req.body.classlabsection + "\",\"" + req.session.userid + "\");\n";
                                    } else if (req.body.classsection != "") {
                                        thisistheline4 = "insert ignore into alltakecourse values(\"" + req.body.classdep + "" + req.body.classcode + "_" + req.body.classsection + "\",\"" + req.session.userid + "\");\n";
                                    }
                                    console.log("\n\n\n\n\n>>thisistheline4    " + thisistheline4)
                                    db.query(thisistheline4, function (err4, result4) {
                                        try {
                                            console.log("1 record inserted");

                                            res.ok();
                                        } catch (err4) {
                                            codecode = 401;
                                            msg = "Cannot insert";
                                            return res.status(codecode).json(msg);
                                        }

                                    });

                                } else {
                                    codecode = 401;
                                    msg = "Please review your input, there is a coplision between your input and your saved class";
                                    return res.status(codecode).json(msg);
                                }

                            })
                        }
                    } catch (err2) {
                        codecode = 401;
                        msg = havethis[0].CID + " has been inputted into your personal class already"
                        return res.status(codecode).json(msg);
                    }


                })
            } catch (err1) {
                codecode = 401;
                msg = havethis[0].CID + " found in your personal class already"
                return res.status(codecode).json(msg);
            }

        });

console.log("just check      "+ thisclassinfo[0])
**/
        /** 
                if (personallist.length > 0) {
                    console.log("have comlipse case")
                } else {
        
                    console.log("look gd look gd")
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
        
                }
        **/
        //    return res.status(codecode).json(msg);





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
        var date;
        console.log("\n\n\n\n\n");
        let thisistheline;
        if (req.session.role == "sup") {
            thisistheline = "select allclass.CID, allclass.rid, allclass.weekdays,allclass.startTime,allclass.endTime,allsupertakecourse.confirmation,allsupertakecourse.Submissiontime from allsupertakecourse inner join allclass on allclass.cid = allsupertakecourse.cid and PID=\"" + req.session.userid + "\" ORDER BY  startTime asc ,weekdays asc";

        } else if (req.session.role == "obs") {
            thisistheline = "select allclass.CID, allclass.rid, allclass.weekdays,allclass.startTime,allclass.endTime,allobstakecourse.confirmation,allobstakecourse.Submissiontime from allobstakecourse inner join allclass on allclass.cid = allobstakecourse.cid and PID=\"" + req.session.userid + "\" ORDER BY  startTime asc ,weekdays asc";

        } else {
            thisistheline = "select allclass.CID, allclass.rid, allclass.weekdays,allclass.startTime,allclass.endTime,allstudenttakecourse.confirmation, allstudenttakecourse.Submissiontime, allstudenttakecourse.picdata, allstudenttakecourse.review , allstudenttakecourse.ttbcomments, student.ttbdeadline from allstudenttakecourse inner join allclass on allclass.cid = allstudenttakecourse.cid right join student on allstudenttakecourse.pid = student.sid where student.sid = \"" + req.session.userid + "\"order BY  startTime asc ,weekdays asc";

        }
        // console.log(thisistheline);
        db.query(thisistheline, function (err, result) {
            try {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                personallist = json;
                console.log(personallist.length)

                thisistheline = "select deadlinedate,deadlinetime from allsupersetting where  typeofsetting =\"1\" and Announcetime is not null";
                db.query(thisistheline, function (err, result) {
                    try {
                        var string = JSON.stringify(result);
                        var json = JSON.parse(string)
                        var deadline = new Date(json[0].deadlinedate);
                        var deadlinetime = json[0].deadlinetime.split(":");
                        deadline.setHours(deadlinetime[0]);
                        deadline.setMinutes(deadlinetime[1]);
                        deadline.setSeconds(deadlinetime[2]);

                        if (personallist.length == 0 && req.session.role != "stu") {
                            date = undefined;
                            personallist = [];

                        } else {


                            date = deadline;
                            if (personallist[0].CID == null) {
                                date = deadline;
                                personallist = [];
                            }
                        }


                        return res.view('user/timetable', {
                            date: date,
                            allpersonallist: personallist,

                        });
                    } catch (err) {

                    }

                })



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

        } else if (req.session.role == "obs") {
            thisistheline = "DELETE from allobstakecourse where pid=\"" + req.session.userid + "\" and cid like\"" + req.body.cid + "%\"";

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
        } else if (req.session.role == "obs") {
            thisistheline = "Update allobstakecourse set confirmation =\"1\",SubmissionTime = now() where pid=\"" + req.session.userid + "\"";
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

            var today = new Date();
            var deadline = new Date(req.body.deadline)


            if (req.body.deadline != null) {
                if (today > deadline) {
                    return res.status(402).json("Submission Box was closed\n"
                        + "Current Time       :  " + today.toLocaleDateString() + " " + today.toLocaleTimeString('en-us') + "\n"
                        + "Submission Deadline:  " + deadline.toLocaleDateString() + " " + deadline.toLocaleTimeString('en-us'));
                }
            }


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
        let thisistheline;
        let today = new Date();


        thisistheline = "select ttbdeadline from student where sid = \"" + req.session.userid + "\"";
        console.log(thisistheline);

        db.query(thisistheline, function (error, result) {
            try {

                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                deadline = new Date(json[0].ttbdeadline);

                if (json[0].ttbdeadline != null) {
                    if (today > deadline) {
                        console.log("overtime !!!!!")

                        var msg = "Submission Box was closed\n"
                            + "Current Time       :  " + today.toLocaleDateString() + " " + today.toLocaleTimeString('en-us') + "\n"
                            + "Submission Deadline:  " + deadline.toLocaleDateString() + " " + deadline.toLocaleTimeString('en-us');
                        res.append('alert', msg);
                        return res.redirect("../timetable");
                    }
                }
                console.log(req);
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


            } catch (err) {
                console.log('checkdeadlinettb MySQL Problem' + "    " + error);
            }

        });


        /**
                console.log(req);
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
                **/

    },

    readsinglestudentttb: async function (req, res) {

        let thisistheline;

        thisistheline = "select allclass.CID, allclass.rid, allclass.weekdays,allclass.startTime,allclass.endTime,allstudenttakecourse.picdata,allstudenttakecourse.confirmation,allstudenttakecourse.Submissiontime, allstudenttakecourse.ttbcomments, allstudenttakecourse.review from allstudenttakecourse inner join allclass on allclass.cid = allstudenttakecourse.cid and PID=\"" + req.params.SID + "\" ORDER BY  startTime asc ,weekdays asc";

        // console.log(thisistheline);
        db.query(thisistheline, function (err, result) {
            try {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                personallist = json;
                // console.log(personallist)

                return res.view("user/readttb", {
                    date: date,
                    allpersonallist: personallist,
                    SID: req.params.SID
                })

            } catch (err) {
                // console.log(' getpersonalallclass MySQL Problem' + "    " + err);
            }

        });

    },

    judgettb: async function (req, res) {

        let thisistheline;
        if (req.body.type == "Approved") {
            thisistheline = "Update allstudenttakecourse set allstudenttakecourse.confirmation = \"2\",  allstudenttakecourse.review = now(), allstudenttakecourse.ttbcomments = \"" + req.body.comments + "\"  where allstudenttakecourse.pid=\"" + req.params.SID + "\"";
        } else {
            thisistheline = "Update allstudenttakecourse set allstudenttakecourse.confirmation = \"3\", allstudenttakecourse.review = now(), allstudenttakecourse.ttbcomments=\"" + req.body.comments + "\" where allstudenttakecourse.pid=\"" + req.params.SID + "\"";
        }
        console.log(thisistheline);
        db.query(thisistheline, function (error, result) {
            try {


                return res.redirect("../liststudent");
            } catch (err) {
                console.log(' judgettb MySQL Problem' + "    " + error);
            }

        });
    },

    checkdeadline: async function (req, res) {
        let thisistheline;
        let today = new Date();


        thisistheline = "select deadlinedate,deadlinetime from allsupersetting where  typeofsetting =\"1\" and Announcetime is not null";
        console.log("timetable checkdeadline    " + thisistheline);
        db.query(thisistheline, function (error, result) {
            try {

                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                var deadline = new Date(json[0].deadlinedate);
                        var deadlinetime = json[0].deadlinetime.split(":");
                        deadline.setHours(deadlinetime[0]);
                        deadline.setMinutes(deadlinetime[1]);
                        deadline.setSeconds(deadlinetime[2]);

                if (json[0].ttbdeadline != null) {
                    if (today > deadline) {
                        console.log("overtime !!!!!")
                        return res.status(401).json("Submission Box was closed\n"
                            + "Current Time       :  " + today.toLocaleDateString() + " " + today.toLocaleTimeString('en-us') + "\n"
                            + "Submission Deadline:  " + deadline.toLocaleDateString() + " " + deadline.toLocaleTimeString('en-us'));
                    } else {

                        return res.ok()
                    }

                }

                return res.ok();
            } catch (err) {
                console.log('checkdeadlinettb MySQL Problem' + "    " + error);
            }

        });
    }

}