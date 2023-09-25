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

module.exports = {

    viewschedulepage: async function (req, res) {

    },
    viewfinalschedule: async function (req, res) {
        var getsettinginfo;
        var getschedulebox;
        var thisistheline3;
        var releasedate;
        var releasetime;

        if (req.session.role == "sup") {
            getsettinginfo = "select * from allsupersetting where where announcetime is not null and  typeofsetting= \"4\""
            getschedulebox = "select * from allschedulebox where tid = \"" + req.session.userid + "\" or oid =\"" + req.session.userid + "\"";
        } else if (req.session.role == "stu") {
            getsettinginfo = "select * from allsupersetting where announcetime is not null and  typeofsetting= \"4\"";
            getschedulebox = "select * from allschedulebox where sid = \"" + req.session.userid + "\""
        }

        db.query(getsettinginfo, (err, results) => {
            try {
                //get setting check can the system show now
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                if (json.length == 0) {
                    releasedate = null
                    releasetime = null
                } else {
                    releasedate = json[0].deadlinedate;
                    releasetime = json[0].deadlinetime;
                }
                //console.log('>> checkschedeulerelease: ', json);

                db.query(getschedulebox, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        var personalschedulebox = json;
                        return res.view('user/checkschedule', {
                            releasedate: releasedate, releasetime: releasetime,
                            personalschedulebox: personalschedulebox
                        });

                    } catch (err) {
                        console.log("sth happened here");
                    }
                });
            } catch (err) {
                console.log("sth happened here");
            }
        });
    },

    getallneededinfo: async function (req, res) {
        var getpairing = "select tid,supervisorpairstudent.sid,oid from supervisorpairstudent left join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid"
        //get the pairs
        db.query(getpairing, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                var threepartylist = json;
                thisistheline2 = "select startdate, starttime,enddate,endtime from allsupersetting where typeofsetting = \"3\" and Announcetime is not null;"
                /** Get present time */
                db.query(thisistheline2, (err, results) => {
                    var string = JSON.stringify(results);
                    var json = JSON.parse(string);
                    var presentdate = json
                    console.log(">>  presentdate:", presentdate)
                    var startstart = new Date(presentdate[0].startdate);
                    var endend = new Date(presentdate[0].enddate);
                    var strstarttime = presentdate[0].starttime.split(":");
                    var strendtime = presentdate[0].endtime.split(":");

                    var ansstartdate;
                    var ansenddate;
                    var adddate;
                    startstart.setHours(strstarttime[0], strstarttime[1], strstarttime[2]);
                    endend.setHours(strendtime[0], strendtime[1], strendtime[2]);
                    var strstartstart = startstart.toISOString().toString().split("T")[0];
                    var strendend = endend.toISOString().toString().split("T")[0];

                    var thisistheline3 = "select *  from classroom inner join allclass where classroom.Campus = allclass.Campus and classroom.RID = allclass.RID and allclass.Campus != \"\" and classroom.status != \"Close\" order by classroom.Campus asc ,classroom.RID asc, weekdays asc,startTime asc";
                    /** Get classroom's ttb */
                    db.query(thisistheline3, (err, results) => {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        var classroomusagelist = json;
                        console.log('>> classroomusagelist: ', classroomusagelist);
                        var thisistheline4 = "select  *  from allclassroomtimeslot left join classroom on classroom.campus = allclassroomtimeslot.campus and classroom.rid = allclassroomtimeslot.rid where classroom.status != \"Close\"and ((startdate between \"" + strstartstart + "\"  and \"" + strendend + "\") or (enddate between \"" + strstartstart + "\" and \"" + strendend + "\")) order by allclassroomtimeslot.Campus asc,allclassroomtimeslot.RID asc, allclassroomtimeslot.startTime asc"
                        /** Get classroom's unavailble timeslot */
                        db.query(thisistheline4, (err, results) => {
                            var string = JSON.stringify(results);
                            var json = JSON.parse(string);
                            var classroomtimeslotlist = json;
                            console.log('>> classroomtimeslotlist: ', classroomtimeslotlist);
                            var thisistheline5 = "select distinct(Campus) from classroom where Campus != \"\"";
                            db.query(thisistheline5, (err, results) => {
                                var string = JSON.stringify(results);
                                var json = JSON.parse(string);
                                var Campuslist = json;
                                console.log('>> Campuslist: ', Campuslist);
                                var thisistheline6 = "select * from classroom where Campus!=\"\" and status != \"Close\"";
                                db.query(thisistheline6, (err, results) => {
                                    var string = JSON.stringify(results);
                                    var json = JSON.parse(string);
                                    var allclassroomlist = json;
                                    console.log('>>allclassroomlist: ', allclassroomlist);
                                    var thisistheline7 = "select * from allsupertakecourse left join allclass on allsupertakecourse.CID = allclass.CID where confirmation = \"1\""
                                    db.query(thisistheline7, (err, results) => {
                                        var string = JSON.stringify(results);
                                        var json = JSON.parse(string);
                                        var superttb = json;
                                        console.log('>>superttb : ', superttb);
                                        var thisistheline8 = "select * from allstudenttakecourse left join allclass onallstudenttakecourse.CID = allclass.CID where confirmation = \"1\""
                                        db.query(thisistheline8, (err, results) => {
                                            var string = JSON.stringify(results);
                                            var json = JSON.parse(string);
                                            var stuttb = json;
                                            console.log('>>stuttb: ', stuttb);

                                        })
                                    })
                                })
                            })
                        })
                    })
                    return res.ok()
                })
            } catch (err) {
                console.log("error happened when excuting SchduleController.getallneededinfo")
            }
        })
    },


    createdraft: async function (req, res) {
        var campusfortoday;

        var supweeklist = [], obsweeklist = [], stdweeklist = [];

        for (var a = 0; a < 6; a++) {
            supweeklist.push([]);
            obsweeklist.push([]);
            stdweeklist.push([]);
        }

        var startday = req.body.startday;
        var endday = req.body.endday;
        var typeofpresent = req.body.typeofpresent;
        if(typeofpresent == "midterm"){

        }else{
            
        }



        var getclassinfo = "select * from allclass"
        db.query(getclassinfo, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                var classttb = json;
                var getclassroomtimeslot = "select * from allclassroomtimeslot where !(startdate >DATE(\"" + req.body.fullendday + "\") or enddate < DATE(\"" + req.body.fullstartday + "\"))"
                db.query(getclassroomtimeslot, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        var classroomtimeslot = json;
                        var getsupttb = "select * from allsupertakecourse left join allclass on allsupertakecourse.CID = allclass.CID where allsupertakecourse.pid = \"" + req.body.tid + "\" and confirmation = \"1\""
                        //console.log(getsupttb)
                        db.query(getsupttb, (err, results) => {
                            try {
                                var string = JSON.stringify(results);
                                var json = JSON.parse(string);
                                var superttb = json;
                                for (var a = 0; a < superttb.length; a++) {
                                    supweeklist[parseInt(superttb[a].weekdays) - 1].push(superttb[a]);
                                }

                                var getobsttb = "select * from allsupertakecourse left join allclass on allsupertakecourse.CID = allclass.CID where allsupertakecourse.pid = \"" + req.body.oid + "\" and confirmation = \"1\""
                                //console.log(getobsttb)
                                db.query(getobsttb, (err, results) => {
                                    try {
                                        var string = JSON.stringify(results);
                                        var json = JSON.parse(string);
                                        var obsttb = json;
                                        for (var a = 0; a < obsttb.length; a++) {
                                            obsweeklist[parseInt(obsttb[a].weekdays)-1].push(obsttb[a]);
                                        }
                                        var getstdttb = "select * from allstudenttakecourse left join allclass on allstudenttakecourse.CID = allclass.CID where allstudenttakecourse.pid = \"" + req.body.sid + "\" and confirmation = \"2\""
                                        //console.log(getstdttb)
                                        db.query(getstdttb, (err, results) => {
                                            try {
                                                var string = JSON.stringify(results);
                                                var json = JSON.parse(string);
                                                var stdttb = json;

                                                for (var a = 0; a < stdttb.length; a++) {
                                                    stdweeklist[parseInt(stdttb[a].weekdays) - 1].push(stdttb[a]);
                                                }
                                                for (var a = 0; a < stdweeklist.length; a++) {
                                                    if (stdweeklist[a].length == 0) {
                                                        stdweeklist[a].push("EMPTY")
                                                    }
                                                    if (obsweeklist[a].length == 0) {
                                                        obsweeklist[a].push("EMPTY")
                                                    }
                                                    if (supweeklist[a].length == 0) {
                                                        supweeklist[a].push("EMPTY")
                                                    }

                                                }


                                                return res.ok();
                                            } catch (err) {
                                                return res.status(401).json("Error happened when excuting ScheduleController.createschedule.stdttb    " + getstdttb)
                                            }
                                        })
                                    } catch (err) {
                                        return res.status(401).json("Error happened when excuting ScheduleController.createschedule.obsttb")
                                    }
                                })
                            } catch (err) {
                                return res.status(401).json("Error happened when excuting ScheduleController.createschedule.supttb")
                            }

                        })
                    } catch (err) {
                        return res.status(401).json("Error happened when excuting ScheduleController.fixedgetclassinfo.timeslot")
                    }
                })
            } catch (err) {
                return res.status(401).json("Error happened when excuting ScheduleController.fixedgetclassinfo.classttb")
            }
        })



        //console.log(weeklist[0].length + "    " + weeklist[1].length + "    " + weeklist[2].length + "    " + weeklist[3].length + "    " + weeklist[4].length + "    " + weeklist[5].length);
    },

    savebox: async function (req, res) {
        console.log(req.body);
        var errstring = "ok";
        var statuscode = 200;
        var arrayint = [];

        thisistheline = "Update supervisor set draft= \"Y\" where tid = \"" + req.session.userid + "\"";
        db.query(thisistheline, (err, results) => {
            if (err) { return res.status(401).json("Error happened when updating") }
        });

        for (var a = 0; a < req.body.length; a++) {
            console.log("\n\n\n\n");
            console.log(req.body[a].boxid);
            console.log(req.body[a].stu);
            console.log(req.body[a].obs);
            console.log(req.body[a].Campus);
            console.log(req.body[a].RID);
            insertline = "insert ignore into allschedulebox values(\"" + req.body[a].boxid + "\",\"" + req.body[a].boxdate + "\",\"" + req.body[a].boxtime + "\",\"" + req.session.userid + "\",\"" + req.body[a].stu + "\",\"" + req.body[a].obs + "\",\"" + req.body[a].Campus + "\",\"" + req.body[a].RID + "\",now())";

            thisistheline = "Update allschedulebox set boxdate = \"" + req.body[a].boxdate + "\", boxtime = \"" + req.body[a].boxtime + "\" ,SID =\"" + req.body[a].stu + "\", OID = \"" + req.body[a].obs + "\", Campus = \"" + req.body[a].Campus + "\", RID = \"" + req.body[a].RID + "\", LastUpdate = now() where boxid = \"" + req.body[a].boxid + "\"";

            console.log(thisistheline)
            db.query(insertline, (err, result) => {
                if (err) {
                    errstring = "";
                    errstring += "error happened for:" + insertline + "\n"
                    statuscode = 401;
                }

            })
            db.query(thisistheline, (err, result) => {
                if (err) {
                    errstring = "";
                    errstring += "error happened for:" + thisistheline + "\n"
                    statuscode = 401;
                }
            })
            /**
            console.log(ans)
            if (ans._resultSet == null){
                thisistheline2 = "insert into allschedulebox values(\"" + req.body[a].boxid + "\",\"" + req.session.userid + "\",\"" + req.body[a].stu + "\",\"" + req.body[a].obs + "\",\"" + req.body[a].Campus + "\",\"" + req.body[a].RID + "\",now())";
            } else {
                thisistheline2 = "Update allschedulebox set SID =\"" + req.body[a].stu + "\", OID = \"" + req.body[a].obs + "\", Campus = \"" + req.body[a].Campus + "\", RID = \"" + req.body[a].RID + "\", LastUpdate = now() where boxid = \"" + req.body[a].boxid + "\"";
            }
            console.log(thisistheline2)
                
                db.query(thisistheline2, (err, result) => {
                    if (err) {
                        errstring = "";
                        errstring += "error happened for:" + thisistheline2 + "\n"
                        statuscode = 401;
                    }

                })
 */
        }

        return res.status(statuscode).json(errstring);
    },

    getrequestroomlist: async function (req, res) {
        var thisistheline = "select * from classroom where Campus = \"" + req.query.Campus + "\" and RID not in ((select RID from allclass where Campus = \"" + req.query.Campus + "\" and weekdays = \"" + req.query.Weekday + "\"and !(startTime > Time(\"" + req.query.Time + "\") || endTime < Time(\"" + req.query.Time + "\")))) and RID not in (select RID from allclassroomtimeslot where Campus = \"" + req.query.Campus + "\" and !(timestamp(concat(StartDate,\" \",startTime)) > timestamp(\"" + req.query.Date + " " + req.query.Time + "\")  || timestamp(concat(EndDate,\" \",endTime)) < timestamp(\"" + req.query.Date + " " + req.query.Time + "\") ) )";

        db.query(thisistheline, (err, result) => {
            if (err) { return res.status(401).json("Error happened when updating") } else {
                var string = JSON.stringify(result);
                var roomlist = JSON.parse(string);
                return res.json(roomlist);
            }
        });



    },

    getrequestobslist: async function (req, res) {
        var thisistheline = "select * from supervisorpairobserver where tid = \"" + req.session.userid + "\" and OID not in (select OID from allrequestfromobserver where (timestamp(\"" + req.query.Date + " " + req.query.Time + "\")>= timestamp(concat(RequestDate,\" \",RequestStartTime)) and timestamp(\"" + req.query.Date + " " + req.query.Time + "\")< timestamp(concat(RequestDate,\" \",RequestEndTime)))) and OID not in (select pid from allobstakecourse inner join allclass on allclass.CID = allobstakecourse.CID where weekdays =" + req.query.Weekday + " and  (time(\"" + req.query.Time + "\")>= allclass.startTime and time(\"" + req.query.Time + "\")< allclass.endTime))"

        db.query(thisistheline, (err, result) => {
            if (err) { return res.status(401).json("Error happened when updating") } else {
                var string = JSON.stringify(result);
                var okobslist = JSON.parse(string);
                return res.json(okobslist);
            }
        });


    },

    getpairing: async function (req, res) {
        thisistheline = "select tid,supervisorpairstudent.sid,oid from supervisorpairstudent left join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid";
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                var pairinglist = json;
                console.log(pairinglist)
                return res.status(200).json({ pairinglist: pairinglist })
            } catch (err) {
                return res.status(401).json("error happened when excuting SettingController.nodraft.getallinfo.retrievepairinglist");
            }

        })

    },

}
