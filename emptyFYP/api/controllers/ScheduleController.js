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

    viewschdulepage: async function (req, res) {

    },
    viewfinalschdule: async function (req, res) {
        var thisistheline;
        var thisistheline2;
        var thisistheline3;
        var releasedate;
        var releasetime;

        if (req.session.role == "sup") {
            thisistheline = "select * from allsupersetting where where announcetime is not null and  typeofsetting= \"4\""
            thisistheline2 = "select * from allschedulebox where tid = \"" + req.session.userid + "\" or oid =\"" + req.session.userid + "\"";
        } else if (req.session.role == "stu") {
            thisistheline = "select * from allsupersetting where announcetime is not null and  typeofsetting= \"4\"";
            thisistheline2 = "select * from allschedulebox where sid = \"" + req.session.userid + "\""
        }

        db.query(thisistheline, (err, results) => {
            try {
                //get setting check can the system show now
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                console.log('>> json: ', json);
                if (json.length == 0) {
                    releasedate = null
                    releasetime = null
                } else {
                    releasedate = json[0].deadlinedate;
                    releasetime = json[0].deadlinetime;
                }
                //console.log('>> checkschdeulerelease: ', json);

                db.query(thisistheline2, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        var personalschedulebox = json;
                        console.log('>> personalschedulebox: ', personalschedulebox);
                        return res.view('user/checkschdule', {
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
        var thisistheline = "select tid,supervisorpairstudent.sid,oid from supervisorpairstudent left join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid"
        //get the pairs
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                var threepartylist = json;
                console.log(">>threepartylist:  ", threepartylist)
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

    fixedgetclassinfo: async function (req, res) {
        var getclassinfo = "select * from allclass"
        console.log(getclassinfo + "\n\n")
        db.query(getclassinfo, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                var classttb = json;
                //console.log(">>classttb :", classttb)
                var getclasstimeslot = "select * from allclassroomtimeslot where !(startdate >DATE(\""+req.query.endday+"\") or enddate < DATE(\""+req.query.startday+"\"))"
               // console.log(getclasstimeslot + "\n\n")
                db.query(getclasstimeslot, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        var classtimeslot = json;
                       // console.log(">>classtimeslot :", classtimeslot)
                        return res.status(200).json({classttb:classttb,classtimeslot:classtimeslot});
                    } catch (err) {
                        return res.status(401).json("Error happened when excuting ScheduleController.fixedgetclassinfo.timeslot")
                    }
                })
            } catch (err) {
                return res.status(401).json("Error happened when excuting ScheduleController.fixedgetclassinfo.classttb")
            }
        })
    },

    createschedule: async function (req, res) {
        console.log(req.query)
        var getsupttb = "select * from allsupertakecourse left join allclass on allsupertakecourse.CID = allclass.CID where allsupertakecourse.pid = \"" + req.query.tid + "\" and confirmation = \"1\""
        console.log(getsupttb + "\n\n")
        db.query(getsupttb, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                var superttb = json;
                //console.log(">>superttb :", superttb)
                var getobsttb = "select * from allsupertakecourse left join allclass on allsupertakecourse.CID = allclass.CID where allsupertakecourse.pid = \"" + req.query.oid + "\" and confirmation = \"1\""
                console.log(getobsttb + "\n\n")
                db.query(getobsttb, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        var obsttb = json;
                       console.log(">>obsttb :", obsttb)
                        var getstdttb = "select * from allstudenttakecourse left join allclass on allstudenttakecourse.CID = allclass.CID where allstudenttakecourse.pid = \"" + req.query.sid + "\" and confirmation = \"1\""
                        console.log(getstdttb + "\n\n")
                        db.query(getstdttb, (err, results) => {
                            try {
                                var string = JSON.stringify(results);
                                var json = JSON.parse(string);
                                var stdttb = json;
                               // console.log(">>stdttb :", stdttb)
                                return res.status(200).json({superttb:superttb,obsttb:obsttb,stdttb:stdttb});
                            } catch (err) {
                                return res.status(401).json("Error happened when excuting ScheduleController.createschedule.stdttb")
                            }
                        })
                    } catch (err) {
                        return res.status(401).json("Error happened when excuting ScheduleController.createschedule.obsttb")
                    }
                })
            } catch (err) {
                return res.status(401).json("Error happened when excuting ScheduleController.createschedule.supttb")
            }
            var string = JSON.stringify(results);
            var json = JSON.parse(string);
            var superttb = json;

        })



    },

    createdraft : async function(req,res){
        var campusfortoday;
        var mon, tue,wed,thu,fri,sat;
        var weeklist = [mon,tue,wed,thu,fri,sat];
        var startday = req.body.startday;
        var endday = req.body.endday;
        
        
        
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
        console.log("enter here" + "     " + req.query.Campus + "  " + req.query.Time);
        var thisistheline = "select * from classroom where Campus = \"" + req.query.Campus + "\" and RID not in ((select RID from allclass where Campus = \"" + req.query.Campus + "\" and weekdays = \"" + req.query.Weekday + "\"and !(startTime > Time(\"" + req.query.Time + "\") || endTime < Time(\"" + req.query.Time + "\")))) and RID not in (select RID from allclassroomtimeslot where Campus = \"" + req.query.Campus + "\" and !(timestamp(concat(StartDate,\" \",startTime)) > timestamp(\"" + req.query.Date + " " + req.query.Time + "\")  || timestamp(concat(EndDate,\" \",endTime)) < timestamp(\"" + req.query.Date + " " + req.query.Time + "\") ) )";
        console.log(thisistheline)

        db.query(thisistheline, (err, result) => {
            if (err) { return res.status(401).json("Error happened when updating") } else {
                var string = JSON.stringify(result);
                var roomlist = JSON.parse(string);
                return res.json(roomlist);
            }
        });



    },

    getrequestobslist: async function (req, res) {
        console.log("enter here" + "     " + req.query.Weekday + "  " + req.query.Time + "   " + req.query.Date);
        var thisistheline = "select * from supervisorpairobserver where tid = \"" + req.session.userid + "\" and OID not in (select OID from allrequestfromobserver where (timestamp(\"" + req.query.Date + " " + req.query.Time + "\")>= timestamp(concat(RequestDate,\" \",RequestStartTime)) and timestamp(\"" + req.query.Date + " " + req.query.Time + "\")< timestamp(concat(RequestDate,\" \",RequestEndTime)))) and OID not in (select pid from allobstakecourse inner join allclass on allclass.CID = allobstakecourse.CID where weekdays =" + req.query.Weekday + " and  (time(\"" + req.query.Time + "\")>= allclass.startTime and time(\"" + req.query.Time + "\")< allclass.endTime))"
        console.log(thisistheline);

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
                return res.status(200).json({ pairinglist: pairinglist })
            } catch (err) {
                return res.status(401).json("error happened when excuting SettingController.nodraft.getallinfo.retrievepairinglist");
            }

        })

    },

}
