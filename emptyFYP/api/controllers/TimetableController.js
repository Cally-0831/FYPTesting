
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
            thisistheline = "SELECT Distinct(CSecCode) FROM allclass "
                + "WHERE CID like \"" + depcode[0] + "_" + "10" + "" + getlecturesection + "\%\" or CID Like \"" + depcode[0] + "_" + "10\%\" "
                + " or CID like \"" + depcode[0] + "_" + "20" + "" + getlecturesection + "\%\" or CID Like \"" + depcode[0] + "_" + "20\%\" ";
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



        let insertsection = "";
        let insertlabsection = "";
        let findtimecrashbygetpersonttb = "";
        var checkinputted = "";
        var caninsertthisclasssection = "";
        var caninsertthisclasslabsection = "";

        let thisclassinfo;
        let havethis;
        let timecrash = false;
        let codecode = 200;
        let msg = "";
        console.log(">>req.body  ", req.body);
        if (req.body.noclassenrolled == true) {
            thisistheline = "insert ignore into alltakecourse values(\"EMPTY_\",\"" + req.session.userid + "\");\n";
            db.query(thisistheline, function (err, result) {
                if (err) {
                    codecode = 401;
                    msg = "Probelm existed when inserting."
                    return res.status(codecode).json(msg);
                } else {
                    return res.ok();
                }
            })
        }




        if (req.body.classlabsection == undefined) {
            insertsection = "select * from allclass where CID like \"" + req.body.classdep + req.body.classcode + "_" + req.body.classsection + "%\"";
            caninsertthisclasssection = "insert ignore  into alltakecourse values(\"" + req.body.classdep + "" + req.body.classcode + "_" + req.body.classsection + "\",\"" + req.session.userid + "\");\n";

        }
        if (req.body.classsection != undefined && req.body.classlabsection != undefined) {
            insertsection = "select * from allclass where CID like \"" + req.body.classdep + req.body.classcode + "_" + req.body.classsection + "%\" or CID like \"" + req.body.classdep + req.body.classcode + "_" + req.body.classlabsection + "%\""
            caninsertthisclasslabsection = "insert ignore  into alltakecourse values(\"" + req.body.classdep + "" + req.body.classcode + "_" + req.body.classlabsection + "\",\"" + req.session.userid + "\");\n";
            caninsertthisclasssection = "insert ignore  into alltakecourse values(\"" + req.body.classdep + "" + req.body.classcode + "_" + req.body.classsection + "\",\"" + req.session.userid + "\");\n";
            //"select * from allclass where CID like \"" + req.body.classdep + req.body.classcode + "_" + req.body.classlabsection + "%\"";
        }
        console.log(">>insertsection  ", insertsection)
        db.query(insertsection, function (err, result) {
            try {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                thisclassinfo = json;
                console.log(">> thisclassinfo", thisclassinfo)
                for (var a = 0; a < thisclassinfo.length; a++) {
                    console.log(">> thisclassinfo ", a, "    ", thisclassinfo[a])
                    if (req.session.role == "sup") {
                        checkinputted = "select * from allsupertakecourse where pid = \"" + req.session.userid + "\" and CID like \"" + thisclassinfo[a].CID + "\"";
                        findtimecrashbygetpersonttb = "select * from allsupertakecourse join allclass on allclass.CID = allsupertakecourse.CID  where pid = \"" + req.session.userid + "\" and weekdays = \"" + thisclassinfo[a].weekdays + "\" and (\"" + thisclassinfo[a].startTime + "\" between startTime and endtime );"

                    } else {
                        checkinputted = "select * from allstudenttakecourse where pid = \"" + req.session.userid + "\" and CID like \"" + thisclassinfo[a].CID + "\"";
                        findtimecrashbygetpersonttb = "select * from allstudenttakecourse  join allclass on allclass.CID = allstudenttakecourse.CID where allstudenttakecourse.PID = \"" + req.session.userid + "\" and weekdays = \"" + thisclassinfo[a].weekdays + "\" and (\"" + thisclassinfo[a].startTime + "\" between startTime and endtime );"

                    }
                    console.log(checkinputted)
                    db.query(checkinputted, function (err, result) {
                        var string = JSON.stringify(result);
                        var json = JSON.parse(string);
                        havethis = json;
                        if (havethis.length > 0) {
                            codecode = 401;
                            msg = "This class has already been inputed before"
                            return res.status(codecode).json(msg);
                        } else {
                            console.log("not inputted you")

                            db.query(findtimecrashbygetpersonttb, function (err, result) {
                                console.log(findtimecrashbygetpersonttb)
                                if (err) throw err;
                                var string = JSON.stringify(result);
                                var json = JSON.parse(string);
                                havetimecrash = json;
                                if (havetimecrash.length > 0) {
                                    codecode = 401;
                                    msg = "Please Review your input since there was a time crash between your inputs"
                                    return res.status(codecode).json(msg);
                                } else {
                                    if(caninsertthisclasslabsection != ""){
                                        db.query(caninsertthisclasslabsection, function (err, result) {
                                            if (err) {
                                                codecode = 401;
                                                msg = "Error happened when inserting ClassLabSection"
                                                return res.status(codecode).json(msg);
                                            }
                                        })
                                    }

                                    db.query(caninsertthisclasssection, function (err, result) {
                                        if (err) {
                                            codecode = 401;
                                            msg = "Error happened when inserting ClassSection"
                                        return res.status(codecode).json(msg);
                                        }else{
                                            codecode = 200;
                                            msg = "ok"
                                         return res.status(codecode).json(msg);
                                        }
                                    })
                                }
                            })

                        }
                    })
                }

                /** 
                
                                db.query(checkinputted, function (err, result) {
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
                                                for (var a = 0; a < thisclassinfo.length; a++) {
                                                    console.log(thisclassinfo[a])
                                                    findtimecrashbygetpersonttb = "select * from allsupertakecourse join allclass on allclass.CID = allsupertakecourse.CID  where pid = \"" + req.session.userid + "\" and weekdays = \"" + thisclassinfo[a].weekdays + "\" and (\"" + thisclassinfo[a].startTime + "\" between startTime and endtime );"
                                                    db.query(findtimecrashbygetpersonttb, function (err, result) {
                                                        console.log(findtimecrashbygetpersonttb)
                                                        if (err) throw err;
                                                        var string = JSON.stringify(result);
                                                        var json = JSON.parse(string);
                                                        havetimecrash = json;
                                                        if (havetimecrash.length > 0) {
                                                            codecode = 401;
                                                            msg = "Please Review your input since there was a time crash between your inputs"
                                                            return res.status(codecode).json(msg);
                                                        }
                                                    })
                                                }
                                            } else {
                                                for (var a = 0; a < thisclassinfo.length; a++) {
                                                    console.log(thisclassinfo[a])
                                                    findtimecrashbygetpersonttb = "select * from allstudenttakecourse  join allclass on allclass.CID = allstudenttakecourse.CID where allstudenttakecourse.PID = \"" + req.session.userid + "\" and weekdays = \"" + thisclassinfo[a].weekdays + "\" and (\"" + thisclassinfo[a].startTime + "\" between startTime and endtime );"
                                                    db.query(findtimecrashbygetpersonttb, function (err, result) {
                                                        console.log(findtimecrashbygetpersonttb)
                                                        if (err) throw err;
                                                        var string = JSON.stringify(result);
                                                        var json = JSON.parse(string);
                                                        havetimecrash = json;
                                                        if (havetimecrash.length > 0) {
                                                            codecode = 401;
                                                            msg = "Please Review your input since there was a time crash between your inputs"
                                                            return res.status(codecode).json(msg);
                
                                                        } else {
                
                                                        }
                                                    })
                                                }
                                            }
                
                
                
                
                
                
                
                                            console.log(findtimecrashbygetpersonttb)
                                            
                                                                        db.query(findtimecrashbygetpersonttb, function (err, result) {
                                                                            try {
                                                                                var string = JSON.stringify(result);
                                                                                var json = JSON.parse(string);
                                                                                timecrash = json;
                                                                                if (timecrash.length > 0) {
                                                                                    codecode = 401;
                                                                                    msg = "Please Review your input since there was a time crash between your inputs"
                                                                                    return res.status(codecode).json(msg);
                                                                                } else {
                                                                                    console.log(thisistheline2)
                                            
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
                                                                                            console.log(thisistheline)
                                            
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
                
                                })**/
            } catch (err) {
                console.log("get this classinfo have err     " + err)
            }
            if(res.status != 401){
                return res.status(codecode).json(msg);
            }else{
                return ressta
            }
            
        })
        
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

        } else {
            thisistheline = "select allclass.CID, allclass.rid, allclass.weekdays,allclass.startTime,allclass.endTime,allstudenttakecourse.confirmation, allstudenttakecourse.Submissiontime, allstudenttakecourse.picdata, allstudenttakecourse.review , allstudenttakecourse.ttbcomments, student.ttbdeadline from allstudenttakecourse inner join allclass on allclass.cid = allstudenttakecourse.cid right join student on allstudenttakecourse.pid = student.sid where student.sid = \"" + req.session.userid + "\"order BY  startTime asc ,weekdays asc";

        }
        // console.log(thisistheline);
        db.query(thisistheline, function (err, result) {
            try {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                personallist = json;


                thisistheline = "select deadlinedate,deadlinetime from allsupersetting where  typeofsetting =\"1\" and Announcetime is not null";
                db.query(thisistheline, function (err, result) {
                    try {
                        var string = JSON.stringify(result);
                        var json = JSON.parse(string)
                        var deadline;
                        var deadlinetime;
                        if (json.length > 0) {
                            deadline = new Date(json[0].deadlinedate);
                            deadlinetime = json[0].deadlinetime.split(":");
                            deadline.setHours(deadlinetime[0]);
                            deadline.setMinutes(deadlinetime[1]);
                            deadline.setSeconds(deadlinetime[2]);
                            date = deadline


                        } else {
                            date = undefined;
                        }


                        if (personallist.length == 0 && req.session.role != "stu") {
                            date = deadline;
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


                return res.redirect("../listuser");
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