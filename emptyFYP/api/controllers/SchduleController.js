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
        var releasedate;
        var releasetime;

        if (req.session.role == "obs") {
            thisistheline = "select * from allsupersetting inner join supervisorpairobserver on allsupersetting.Creator = supervisorpairobserver.tid  where supervisorpairobserver.oid = \"" + req.session.userid + "\" and typeofsetting = \"4\""
        } else if (req.session.role == "stu") {
            thisistheline = "select * from allsupersetting inner join supervisorpairstudent on allsupersetting.Creator = supervisorpairstudent.tid  where supervisorpairstudent.sid = \"" + req.session.userid + "\" and typeofsetting = \"4\""
        }

        db.query(thisistheline, (err, results) => {
            try {
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

                //console.log('>> stdlist: ', stdlist);  
                return res.view('user/checkschdule', { releasedate: releasedate, releasetime: releasetime });
            } catch (err) {
                console.log("sth happened here");

            }


        });
    },

    getallneededinfo: async function (req, res) {
        checkline = "select * from allschedulebox where tid = \"" + req.session.userid + "\"";
        db.query(checkline, (err, result) => {
            if (err) { return res.status(401).json("Error happened when updating") } else {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                var savedbox = json;

                thisistheline = "select startdate, starttime,enddate,endtime from allsupersetting where creator = \"" + req.session.userid + "\" and typeofsetting = \"3\" ";
                /** Get present time */
                db.query(thisistheline, (err, results) => {
                    var string = JSON.stringify(results);
                    var json = JSON.parse(string);
                    var presentdate = json
                    //console.log('>> presentdate: ', presentdate);
                    var startstart = new Date(presentdate[0].startdate);
                    var endend = new Date(presentdate[0].enddate);
                    var strstarttime = presentdate[0].starttime.split(":");
                    var strendtime = presentdate[0].endtime.split(":");
                    var orgstart = new Date(presentdate[0].startdate);
                    var ansstartdate;
                    var ansenddate;
                    var adddate;
                    //startstart.setHours(strstarttime[0], strstarttime[1], strstarttime[2]);
                    endend.setHours(strendtime[0], strendtime[1], strendtime[2]);

                    if (req.params.Page > 1) {

                        adddate = (8 - parseInt(startstart.getDay())) + ((parseInt(req.params.Page) - 2) * 7);
                        //    console.log(8 - parseInt(startstart.getDay()))
                        //    console.log((parseInt(req.params.Page) - 2) * 7)
                        startstart = new Date(startstart.getTime() + (adddate) * 24 * 60 * 60 * 1000)
                    } else {
                        startstart = new Date(startstart.getTime() + (req.params.Page - 1) * 24 * 60 * 60 * 1000)
                    }


                    if (req.params.Page == 1) {
                        startstart.setHours(strstarttime[0], strstarttime[1], strstarttime[2]);
                    } else {
                        startstart.setHours(0, 0, 0);
                    }

                    ansstartdate = startstart;
                    ansenddate = endend;

                    //console.log(ansstartdate + "  " + ansenddate)

                    startstart = startstart.getFullYear() + "-" + (startstart.getMonth() + 1) + "-" + startstart.getDate();
                    endend = endend.getFullYear() + "-" + (endend.getMonth() + 1) + "-" + endend.getDate();


                    //console.log(startstart + "    " + endend)
                    var thisistheline2 = "select allclass.CID, allclass.Campus ,allclass.rid, allclass.weekdays,allclass.startTime,allclass.endTime,allsupertakecourse.confirmation,allsupertakecourse.Submissiontime from allsupertakecourse inner join allclass on allclass.cid = allsupertakecourse.cid and PID=\"" + req.session.userid + "\" and confirmation = 1 ORDER BY  startTime asc, weekdays asc";
                    /** Get supervisior's ttb */
                    db.query(thisistheline2, (err, results) => {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        var personalttb = json
                        //console.log('>> personalttb: ', personalttb);
                        var thisistheline3 = "select * from allrequestfromsupervisor where TID = \"" + req.session.userid + "\" and requestdate between \"" + startstart + "\" and \"" + endend + "\" order by requestdate asc, requeststarttime asc";
                        // console.log(thisistheline3)
                        /** Get supervisior's requests */
                        /** whole schdule is designed base on supervisor's schdule first */
                        db.query(thisistheline3, (err, results) => {
                            var string = JSON.stringify(results);
                            var json = JSON.parse(string);
                            var personalrequestlist = json;
                            // console.log('>> personalrequestlist: ', personalrequestlist);
                            var thisistheline4 = "select *  from classroom inner join allclass where classroom.Campus = allclass.Campus and classroom.RID = allclass.RID and allclass.Campus != \"\" order by classroom.Campus asc ,classroom.RID asc, weekdays asc,startTime asc";
                            /** Get classroom's ttb */
                            db.query(thisistheline4, (err, results) => {
                                var string = JSON.stringify(results);
                                var json = JSON.parse(string);
                                var classroomusagelist = json;
                                console.log('>> classroomusagelist: ', classroomusagelist);
                                var thisistheline5 = "select *  from allclassroomtimeslot where ((startdate between \"" + startstart + "\" and \"" + endend + "\") or (enddate between \"" + startstart + "\" and \"" + endend + "\")) order by Campus asc,RID asc, startTime asc";
                                /** Get classroom's unavailble timeslot */
                                db.query(thisistheline5, (err, results) => {
                                    var string = JSON.stringify(results);
                                    var json = JSON.parse(string);
                                    var classroomtimeslotlist = json;
                                    console.log('>> classroomtimeslotlist: ', classroomtimeslotlist);
                                    var thisistheline6 = "select distinct(Campus) from classroom where Campus != \"\"";
                                    db.query(thisistheline6, (err, results) => {
                                        var string = JSON.stringify(results);
                                        var json = JSON.parse(string);
                                        var Campuslist = json;
                                        console.log('>> Campuslist: ', Campuslist);
                                        var thisistheline7 = "select * from supervisorpairstudent";
                                        db.query(thisistheline7, (err, results) => {
                                            var string = JSON.stringify(results);
                                            var json = JSON.parse(string);
                                            var studentlist = json;
                                            //    console.log('>> studentlist: ', studentlist);
                                            //console.log('\n\n\n\n\n\n');
                                            var thisistheline8 = "select * from allrequestfromstudent where sid in (select sid from supervisorpairstudent where tid = \"" + req.session.userid + "\") and status = \"Approved\" ";
                                            db.query(thisistheline8, (err, results) => {
                                                var string = JSON.stringify(results);
                                                var json = JSON.parse(string);
                                                var studenttimeslotlist = json;
                                                //    console.log('>> studenttimeslotlist: ', studenttimeslotlist);
                                                var thisistheline9 = "select allstudenttakecourse.CID, allstudenttakecourse.PID, allclass.weekdays, allclass.startTime,allclass.endTime from allstudenttakecourse inner join allclass on allclass.cid = allstudenttakecourse.cid where allstudenttakecourse.pid in (select supervisorpairstudent.sid from supervisorpairstudent where supervisorpairstudent.tid = \"" + req.session.userid + "\") and allstudenttakecourse.confirmation =2 order by weekdays asc, startTime asc;";
                                                db.query(thisistheline9, (err, results) => {
                                                    var string = JSON.stringify(results);
                                                    var json = JSON.parse(string);
                                                    var studentttb = json;
                                                    //console.log('>> studentttb: ', studentttb);
                                                    var thisistheline10 = "select allobstakecourse.CID, allobstakecourse.PID, allclass.weekdays, allclass.startTime,allclass.endTime from allobstakecourse inner join allclass on allclass.cid = allobstakecourse.cid where allobstakecourse.pid in (select supervisorpairobserver.oid from supervisorpairobserver where supervisorpairobserver.tid = \"" + req.session.userid + "\") order by weekdays asc, startTime asc;";
                                                    db.query(thisistheline10, (err, results) => {
                                                        var string = JSON.stringify(results);
                                                        var json = JSON.parse(string);
                                                        var obsttb = json;
                                                        // console.log('>> obsttb: ', obsttb);
                                                        var thisistheline11 = "select * from allrequestfromobserver where oid in (select oid from supervisorpairobserver where tid =  \"" + req.session.userid + "\") order by RequestDate asc, RequestStartTime asc;";
                                                        db.query(thisistheline11, (err, results) => {
                                                            var string = JSON.stringify(results);
                                                            var json = JSON.parse(string);
                                                            var obstimeslotlist = json;
                                                            //console.log('>> obstimeslotlist: ', obstimeslotlist);
                                                            var thisistheline12 = "select observer.obsname , observer.oid , observerpairstudent.SID from observer inner join observerpairstudent ,supervisorpairobserver where observer.oid = observerpairstudent.OID and observer.oid = supervisorpairobserver.OID and supervisorpairobserver.tid = \"" + req.session.userid + "\"";
                                                            db.query(thisistheline12, (err, results) => {
                                                                var string = JSON.stringify(results);
                                                                var json = JSON.parse(string);
                                                                var obslist = json;
                                                                //console.log('>>obslist: ', obslist);
                                                                var thisistheline13 = "select * from classroom where Campus!=\"\"";
                                                                db.query(thisistheline13, (err, results) => {
                                                                    var string = JSON.stringify(results);
                                                                    var json = JSON.parse(string);
                                                                    var allclassroomlist = json;
                                                                    console.log('>>allclassroomlist: ', allclassroomlist);
                                                                    return res.view("user/createdraft", {
                                                                        savedbox: savedbox,
                                                                        pagenum: req.params.Page,
                                                                        orgstart: orgstart,
                                                                        startdate: ansstartdate, enddate: ansenddate,
                                                                        Campuslist: Campuslist, studentlist: studentlist, studentttb: studentttb,
                                                                        studenttimeslotlist: studenttimeslotlist,
                                                                        obsttb: obsttb, obstimeslotlist: obstimeslotlist, obslist: obslist,
                                                                        personalrequestlist: personalrequestlist, personalttb: personalttb,
                                                                        classroomusagelist: classroomusagelist, classroomtimeslotlist: classroomtimeslotlist,
                                                                        allclassroomlist:allclassroomlist,

                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });

                                        })

                                    })

                                });
                            });

                        });
                    })

                });

            }
        });
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
        console.log("enter here"+"     "+req.query.Campus+"  "+req.query.Time);
        var thisistheline = "select * from classroom where Campus = \""+req.query.Campus+"\" and RID not in ((select RID from allclass where Campus = \""+req.query.Campus+"\" and weekdays = \""+req.query.Weekday+"\"and !(startTime > Time(\""+req.query.Time+"\") || endTime < Time(\""+req.query.Time+"\")))) and RID not in (select RID from allclassroomtimeslot where Campus = \""+req.query.Campus+"\" and !(timestamp(concat(StartDate,\" \",startTime)) > timestamp(\""+req.query.Date+" "+req.query.Time+"\")  || timestamp(concat(EndDate,\" \",endTime)) < timestamp(\""+req.query.Date+" "+req.query.Time+"\") ) )";
        console.log(thisistheline)

        db.query(thisistheline, (err, result) => {
            if (err) { return res.status(401).json("Error happened when updating") }else{
                var string = JSON.stringify(result);
                var roomlist = JSON.parse(string);
                return res.json(roomlist);
            }
        });


        
    },
}