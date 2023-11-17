/**
 
  mysql = require('mysql');
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
**/

module.exports = {
    allDeptlist: {},
    allCCodelist: {},
    deptlist: {},
    ccodelist: {},
    allClassentry: {},




    getallclass: async function (req, res) {
        var db = await sails.helpers.database();

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
        var db = await sails.helpers.database();

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
        var db = await sails.helpers.database();


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




        if (req.body.classlabsection == undefined || req.body.classlabsection == "") {
            caninsertthisclasssection = "insert ignore  into alltakecourse values(\"" + req.body.classdep + "" + req.body.classcode + "_" + req.body.classsection + "\",\"" + req.session.userid + "\");\n";

        }
        if (req.body.classsection != undefined && req.body.classlabsection != undefined) {
            if (req.body.classlabsection == "all") {
                caninsertthisclasslabsection = "all";
            } else {
                caninsertthisclasslabsection = "insert ignore  into alltakecourse values(\"" + req.body.classdep + "" + req.body.classcode + "_" + req.body.classlabsection + "\",\"" + req.session.userid + "\");\n";
            }
            caninsertthisclasssection = "insert ignore  into alltakecourse values(\"" + req.body.classdep + "" + req.body.classcode + "_" + req.body.classsection + "\",\"" + req.session.userid + "\");\n";

            //"select * from allclass where CID like \"" + req.body.classdep + req.body.classcode + "_" + req.body.classlabsection + "%\"";
        }


        if (caninsertthisclasslabsection != "") {
            if (req.body.classlabsection == "all") {
                var getalllabsection = "SELECT distinct(CSecCode) FROM allclass WHERE CID like \"" + req.body.classdep + req.body.classcode + "_1%\" or CID like \"" + req.body.classdep + req.body.classcode + "_2%\""
                console.log("\n\n\n" + getalllabsection)
                db.query(getalllabsection, function (err, result) {
                    var string = JSON.stringify(result);
                    var json = JSON.parse(string);
                    labsectionlist = json;
                    console.log(">>labsection", labsectionlist)


                    for (var i = 0; i < labsectionlist.length; i++) {
                        var insertinglabsection = "insert ignore  into alltakecourse values(\"" + req.body.classdep + req.body.classcode + "_" + labsectionlist[i].CSecCode + "\",\"" + req.session.userid + "\")"
                        console.log(insertinglabsection);
                        db.query(insertinglabsection, function (err, result) {
                            try { } catch (err) {
                                return console.log("Error happened when excuting TimtableController.submitclass.insertingmultiplelabsection \n" + err)

                            }
                        })
                    }

                })
            } else {
                db.query(caninsertthisclasslabsection, function (err, result) {
                    try { } catch (err) {
                        return console.log("Error happened when excuting TimtableController.submitclass.insertinglabsection \n" + err)
                    }
                })
            }

        }

        db.query(caninsertthisclasssection, function (err, result) {
            try {
                return res.ok();
            } catch (err) {
                return console.log("Error happened when excuting TimtableController.submitclass.insertingsection \n" + err)
            }
        })


    },
    submitempty: async function (req, res) {
        var db = await sails.helpers.database();
        let thisistheline = "insert ignore into alltakecourse values(\"EMPTY_\",\"" + req.session.userid + "\")";

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
        var db = await sails.helpers.database();
        let getclassinput;
        if (req.session.role == "sup") {
            getclassinput = "select allclass.CID, allclass.rid, allclass.weekdays,allclass.startTime,allclass.endTime,allsupertakecourse.confirmation,allsupertakecourse.Submissiontime from allsupertakecourse inner join allclass on allclass.cid = allsupertakecourse.cid and PID=\"" + req.session.userid + "\" ORDER BY  startTime asc ,weekdays asc";

        } else {
            getclassinput = "select allclass.CID, allclass.rid, allclass.weekdays,allclass.startTime,allclass.endTime,allstudenttakecourse.confirmation, allstudenttakecourse.Submissiontime, allstudenttakecourse.picdata, allstudenttakecourse.review , allstudenttakecourse.ttbcomments, student.ttbdeadline from allstudenttakecourse inner join allclass on allclass.cid = allstudenttakecourse.cid right join student on allstudenttakecourse.pid = student.sid where student.sid = \"" + req.session.userid + "\"order BY  startTime asc ,weekdays asc";

        }
        // console.log(getclassinput);
        db.query(getclassinput, function (err, result) {
            try {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                personallist = json;
                var zerocourse = false;
                console.log(personallist)


                checksetting = "select deadlinedate,deadlinetime from allsupersetting where  typeofsetting =\"1\" and Announcetime is not null";
                db.query(checksetting, function (err, result) {
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
                                zerocourse=true;
                            }
                        }

                        return res.view('user/timetable', {
                            date: date,
                            allpersonallist: personallist,
                            checkzerocourse : zerocourse

                        });
                    } catch (err) {
                        return res.status(400).json('Error exist when excuting TimeTableController.getallpersonalclass.checksetting')
                        }

                })



            } catch (err) {
                return res.status(400).json('Error exist when excuting TimeTableController.getallpersonalclass.getclassinput');
                 }

        });
        // return res.json("ok");
    },

    checkduplication: async function (req, res) {
        var db = await sails.helpers.database();
        if (req.body.classlabsection == undefined || req.body.classlabsection == "") {
            insertsection = "select * from allclass where CID like \"" + req.body.classdep + req.body.classcode + "_" + req.body.classsection + "%\"";
        }
        if (req.body.classsection != undefined && req.body.classlabsection != undefined) {
            if (req.body.classlabsection == "all") {
                insertsection = "SELECT * FROM allclass WHERE CID like \"" + req.body.classdep + req.body.classcode + "_" + req.body.classsection + "%\" or CID like \"" + req.body.classdep + req.body.classcode + "_1%\" or CID like \"" + req.body.classdep + req.body.classcode + "_2%\"";
            } else {
                insertsection = "select * from allclass where CID like \"" + req.body.classdep + req.body.classcode + "_" + req.body.classsection + "%\" or CID like \"" + req.body.classdep + req.body.classcode + "_" + req.body.classlabsection + "%\""
            }
        }

        db.query(insertsection, function (err, result) {
            try {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                thisclassinfo = json;
                console.log(">> thisclassinfo", thisclassinfo)
                var x = 0;
                if (req.session.role == "stu") {
                    var findtimecrashstr = "select * from allstudenttakecourse  join allclass on allclass.CID = allstudenttakecourse.CID where allstudenttakecourse.PID = \"" + req.session.userid + "\" and (";
                } else {
                    var findtimecrashstr = "select * from allsupertakecourse  join allclass on allclass.CID = allsupertakecourse.CID where allsupertakecourse.PID = \"" + req.session.userid + "\" and (";
                }
                for (var x = 0; x < thisclassinfo.length; x++) {
                    if (x != 0) {
                        findtimecrashstr += "or";
                    }
                    findtimecrashstr += " (weekdays = \"" + thisclassinfo[x].weekdays + "\" and ((\"" + thisclassinfo[x].startTime + "\" between startTime and endTime)|| (\"" + thisclassinfo[x].endTime + "\" between startTime and endTime)||(\"" + thisclassinfo[x].startTime + "\" = startTime)||(\"" + thisclassinfo[x].endTime + "\"=endTime)))"

                }
                findtimecrashstr += ");"
                console.log(findtimecrashstr)
                db.query(findtimecrashstr, function (err, result) {
                    try {
                        var string = JSON.stringify(result);
                        var json = JSON.parse(string);
                        timecrashresult = json;
                        console.log(timecrashresult)
                        if (timecrashresult.length > 0) {
                            return res.status(401).json("Review Your inputs, there is a timecrash between your input and current enrolled timetable.")
                        } else {
                            return res.ok();
                        }
                    } catch (err) {
                        return console.log("Error happened when excuting TimtableController.submitclass.findtimecrash \n" + err)
                    }
                })
            } catch (err) {
                return console.log("Error happened when excuting TimtableController.checkduplication.findallclassinfo \n" + err)
            }
        })
    },

    delpersonalallclass: async function (req, res) {
        var db = await sails.helpers.database();
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
        var db = await sails.helpers.database();
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

    upload: async function (req, res) {
        let thisistheline;
        let today = new Date();
        var db = await sails.helpers.database();
        thisistheline = "select ttbdeadline from student where sid = \"" + req.session.userid + "\"";


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
    },

    readsinglestudentttb: async function (req, res) {
        var db = await sails.helpers.database();
        let thisistheline;

        thisistheline = "select allclass.CID, allclass.rid, allclass.weekdays,allclass.startTime,allclass.endTime,allstudenttakecourse.picdata,allstudenttakecourse.confirmation,allstudenttakecourse.Submissiontime, allstudenttakecourse.ttbcomments, allstudenttakecourse.review from allstudenttakecourse inner join allclass on allclass.cid = allstudenttakecourse.cid and PID=\"" + req.params.SID + "\" ORDER BY  startTime asc ,weekdays asc";

        // console.log(thisistheline);
        db.query(thisistheline, function (err, result) {
            try {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                personallist = json;
                return res.view("user/readttb", {
                    allpersonallist: personallist,
                    SID: req.params.SID
                })

            } catch (err) {
                console.log(' getpersonalallclass MySQL Problem' + "    " + err);
            }

        });

    },

    judgettb: async function (req, res) {
        var db = await sails.helpers.database();
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
        var db = await sails.helpers.database();

        thisistheline = "select deadlinedate,deadlinetime from allsupersetting where  typeofsetting =\"1\" and Announcetime is not null";
        console.log("timetable checkdeadline    " + thisistheline);
        db.query(thisistheline, function (error, result) {
            try {

                var string = JSON.stringify(result);
                var json = JSON.parse(string);




                if (json.length != 0) {
                    var deadline = new Date(json[0].deadlinedate);
                    var deadlinetime = json[0].deadlinetime.split(":");
                    deadline.setHours(deadlinetime[0]);
                    deadline.setMinutes(deadlinetime[1]);
                    deadline.setSeconds(deadlinetime[2]);
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