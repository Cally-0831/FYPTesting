module.exports = {

    viewschedulepage: async function (req, res) {

    },
    viewfinalschedule: async function (req, res) {
        var db = await sails.helpers.database();
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
                console.log('>> checkschedeulerelease: ', json);

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
    /** 
        getallneededinfo: async function (req, res) {
            var db = await sails.helpers.database();
            var getpairing = "select tid,supervisorpairstudent.sid,oid from supervisorpairstudent left join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid"
            //get the pairs
            db.query(getpairing, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    var json = JSON.parse(string);
                    var threepartylist = json;
                    thisistheline2 = "select startdate, starttime,enddate,endtime from allsupersetting where typeofsetting = \"3\" and Announcetime is not null;"
                    /** Get present time 
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
                       // Get classroom's ttb 
                        db.query(thisistheline3, (err, results) => {
                            var string = JSON.stringify(results);
                            var json = JSON.parse(string);
                            var classroomusagelist = json;
                            console.log('>> classroomusagelist: ', classroomusagelist);
                            var thisistheline4 = "select  *  from allclassroomtimeslot left join classroom on classroom.campus = allclassroomtimeslot.campus and classroom.rid = allclassroomtimeslot.rid where classroom.status != \"Close\"and ((startdate between \"" + strstartstart + "\"  and \"" + strendend + "\") or (enddate between \"" + strstartstart + "\" and \"" + strendend + "\")) order by allclassroomtimeslot.Campus asc,allclassroomtimeslot.RID asc, allclassroomtimeslot.startTime asc"
                            // Get classroom's unavailble timeslot 
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
        **/


    createdraft: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var campusfortoday;
        console.log(req.body)

        var supweeklist = [], obsweeklist = [], stdweeklist = [];

        for (var a = 0; a < 6; a++) {
            supweeklist.push([]);
            obsweeklist.push([]);
            stdweeklist.push([]);
        }

        var startday = new Date(req.body.fullstartday);
        var startime = startday.toLocaleTimeString("en-GB");
        var endday = new Date(req.body.fullendday);
        var endtime = endday.toLocaleTimeString("en-GB");
        //#   console.log((endday - startday) / 1000 / 60 / 60 / 24)
        var sessionduration = 0;
        var typeofpresent = req.body.typeofpresent;

        if (typeofpresent == "midterm") {
            sessionduration = 30;
        } else {
            sessionduration = 60;
        }

        var getallclassinfo = "select * from allclass order by Campus asc, rid asc , weekdays asc, starttime asc, endtime asc"
        var classttb = await new Promise((resolve, reject) => {
            pool.query(getallclassinfo, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.classttb")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })


        var getallclassroominschool = "select * from classroom where status != \"Closed\" and rid != \"\" order by Campus asc, rid asc"
        var classroomlist = await new Promise((resolve, reject) => {
            pool.query(getallclassroominschool, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.classroomlist")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })
        //console.log(classroomlist)
        let distinctcampuslist = (classroomlist) => {
            let unique_values = classroomlist
                .map((item) => item.Campus)
                .filter(
                    (value, index, current_value) => current_value.indexOf(value) === index
                );
            return unique_values;
        };
        var campuslist = distinctcampuslist(classroomlist);

        var getclassroomtimeslot = "select * from allclassroomtimeslot"
        var classroomtimeslot = await new Promise((resolve, reject) => {
            pool.query(getclassroomtimeslot, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.classroomtimeslot")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })

        var getsupttb = "select * from allsupertakecourse left join allclass on allsupertakecourse.CID = allclass.CID where allsupertakecourse.pid = \"" + req.body.tid + "\" and confirmation = \"1\" order by weekdays asc, startTime asc"
        var superttb = await new Promise((resolve, reject) => {
            pool.query(getsupttb, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.getsupttb")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })
        for (var a = 0; a < superttb.length; a++) {
            supweeklist[parseInt(superttb[a].weekdays) - 1].push(superttb[a]);
        }

        var getsuprequest = "select * from allrequestfromsupervisor where tid = \"" + req.body.tid + "\" and (RequestDate >= Date(\"" + req.body.startdaydate + "\") and RequestDate <= Date(\"" + req.body.enddaydate + "\")) order by RequestDate asc, requeststarttime asc "
        var superrequest = await new Promise((resolve, reject) => {
            pool.query(getsuprequest, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.superrequest")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })
        console.log(">> superrequest", superrequest[0])

        var getsupschedulebox = "select * from allschedulebox where tid = \"" + req.body.tid + "\" order by boxdate asc , boxtime asc";
        var superschedulebox = await new Promise((resolve, reject) => {
            pool.query(getsupschedulebox, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.superrequest")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })

        var getobsttb = "select * from allsupertakecourse left join allclass on allsupertakecourse.CID = allclass.CID where allsupertakecourse.pid = \"" + req.body.oid + "\" and confirmation = \"1\" order by weekdays asc, startTime asc"
        var obsttb = await new Promise((resolve, reject) => {
            pool.query(getobsttb, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.superrequest")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })
        for (var a = 0; a < obsttb.length; a++) { obsweeklist[parseInt(obsttb[a].weekdays) - 1].push(obsttb[a]); }

        var getobsrequest = "select * from allrequestfromsupervisor where tid = \"" + req.body.oid + "\" and (RequestDate >= Date(\"" + req.body.startdaydate + "\") and RequestDate <= Date(\"" + req.body.enddaydate + "\")) order by RequestDate asc, requeststarttime asc "
        var obsrequest = await new Promise((resolve, reject) => {
            pool.query(getobsrequest, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.superrequest")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })

        var getobsschedulebox = "select * from allschedulebox where tid = \"" + req.body.oid + "\" order by boxdate asc , boxtime asc";
        var obsschedulebox = await new Promise((resolve, reject) => {
            pool.query(getobsschedulebox, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.superrequest")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })


        var getstdttb = "select * from allstudenttakecourse left join allclass on allstudenttakecourse.CID = allclass.CID where allstudenttakecourse.pid = \"" + req.body.sid + "\" and confirmation = \"2\" order by weekdays asc, startTime asc"
        var stdttb = await new Promise((resolve, reject) => {
            pool.query(getstdttb, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.superrequest")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })


        for (var a = 0; a < stdttb.length; a++) { stdweeklist[parseInt(stdttb[a].weekdays) - 1].push(stdttb[a]); }
        for (var a = 0; a < stdweeklist.length; a++) {
            if (stdweeklist[a].length == 0) { stdweeklist[a].push("EMPTY") }
            if (obsweeklist[a].length == 0) { obsweeklist[a].push("EMPTY") }
            if (supweeklist[a].length == 0) { supweeklist[a].push("EMPTY") }
        }


        var getstdrequest = "select * from allrequestfromstudent where sid =\"" + req.body.sid + "\" and (RequestDate >= Date(\"" + req.body.startdaydate + "\") and RequestDate <= Date(\"" + req.body.enddaydate + "\")) and status = \"Approved\" order by RequestDate asc, requeststarttime asc "
        var stdrequest = await new Promise((resolve, reject) => {
            pool.query(getstdrequest, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.superrequest")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })

        var getsuppreference = "select * from allpreffromsup where tid =\"" + req.body.tid + "\"";
        var suppref = await new Promise((resolve, reject) => {
            pool.query(getsuppreference, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)

            })
        })

        //console.log(suppref.length)
        if (suppref.length == 0) {
            suppref = null;
        } else {
            suppref = suppref[0]
            let splitstring = (suppref.Prefno).split("/");
            suppref = splitstring;
        }
        //suppref = suppref[0]


        var getobspreference = "select * from allpreffromsup where tid =\"" + req.body.oid + "\"";
        var obspref = await new Promise((resolve, reject) => {
            pool.query(getobspreference, (err, res) => {
                if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.getobspreference")) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        })
        if (obspref.length == 0) {
            obspref = null;
        } else {
            obspref = obspref[0]
            let splitstring = (obspref.Prefno).split("/");
            obspref = splitstring;
        }
        console.log(obspref)

        var startindex = startday.getDay();

        console.log(startday)
        var currentsessiontimeinpresentday = startday;
        currentsessiontimeinpresentday.setHours(8, 30, 0);
        var currentsessionendtimeinpresentday = (new Date(currentsessiontimeinpresentday.getTime() + (1000 * 60 * sessionduration)));

        console.log("finally working")

        console.log(req.body.suppriority + "      " + req.body.obspriority)
        if (req.body.suppriority <= req.body.obspriority) {
            for (var a = 0; a < suppref.length; a++) {
                console.log(currentsessiontimeinpresentday + "     asdfasdf");
                console.log(currentsessionendtimeinpresentday + "    erqwer ")
            }
        } else {
            for (var a = 0; a < obspref.length; a++) {
                console.log(currentsessiontimeinpresentday + "     hello");
                console.log(currentsessionendtimeinpresentday + "     heool")
                var getcheckobsttb = "select * from allsupertakecourse left join allclass on allclass.CID = allsupertakecourse.CID where pid = \"" + req.body.oid + "\" and weekdays= \"" + currentsessiontimeinpresentday.getDay() + "\" and startTime";
                var obsttb = await new Promise((resolve, reject) => {
                    pool.query(getcheckobsttb, (err, res) => {
                        if (err) { reject(res.status(401).json("Error happened when excuting ScheduleController.createdraft.getobspreference")) }
                        var string = JSON.stringify(res);
                        var json = JSON.parse(string);
                        var ans = json;
                        resolve(ans)
                    })
                })
                console.log(currentsessiontimeinpresentday + "     hello");
                console.log(currentsessionendtimeinpresentday + "     heool")
            }

        }
        //for(var a = 0 ; a < )


        /** 
        
                for (var timebox = 0; timebox <= 13 * 60 / sessionduration; timebox++) {
                    //loop each time
                    var checker = -1;
        
                    if (currentsessiontimeinpresentday.toLocaleTimeString("en-GB") >= startday.toLocaleTimeString("en-GB")) {
                        for (var daynum = 0; daynum <= Math.floor((endday - startday) / 1000 / 60 / 60 / 24); daynum++) {
                            //loop days
                            var presentday = new Date(startday.getTime() + (daynum * 86400000));
                            checker = 0;
                            if (presentday.getDay() != 0 && presentday.getDay() != 6) {
                                for (var a = 0; a < superschedulebox.length; a++) {
                                    if (superschedulebox[a].boxdate == presentday.toLocaleDateString("en-GB") && superschedulebox[a].boxtime == currentsessiontimeinpresentday) {
                                        checker = -1;
                                        console.log("superschedule skip      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                        break;
                                    } else {
                                        console.log("superschedule @@@@@@@@      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                        checker = 1;
                                    }
                                }
                                if (checker >= 0) {
                                    for (var b = 0; b < req.body.boxlist.length; b++) {
                                        req.body.boxlist[b].presentday = new Date(req.body.boxlist[b].presentday);
                                        if ((req.body.boxlist[b].tid == req.body.tid || req.body.boxlist[b].oid == req.body.tid) && req.body.boxlist[b].presentday.toLocaleDateString("en-GB") == presentday.toLocaleDateString("en-GB") && req.body.boxlist[b].presentstartTime == currentsessiontimeinpresentday.toLocaleTimeString("en-GB")) {
                                            checker = -1;
                                            console.log("superboxlist skip      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                            break;
                                        } else {
                                            console.log("superboxlist @@@@@@@      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                            checker = 1;
                                        }
                                    }
        
                                }
                                if (checker >= 0) {
                                    for (var b = 0; b < superrequest.length; b++) {
                                        superrequest[b].RequestDate = new Date(superrequest[b].RequestDate);
                                        if (superrequest[b].RequestDate.toLocaleDateString("en-GB") == presentday.toLocaleDateString("en-GB") &&
                                            !(currentsessiontimeinpresentday >= superrequest[b].RequestEndTime
                                                && currentsessionendtimeinpresentday <= superrequest[b].RequestStartTime)) {
                                            checker = -1;
                                            console.log("superrequest skip      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                            break;
        
                                        } else {
                                            console.log("superrequest @@@@@@@      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                            checker = 1;
                                        }
                                    }
                                }
                                if (checker >= 0) {
                                    var b = presentday.getDay() - 1;
                                    console.log(b)
                                    if (supweeklist[b] == "EMPTY") {
                                        campus = campuslist[0];
                                        console.log("supweeklist[b][c] @@@@@@@@@ 1  ", campus);
                                        checker = 1;
                                    } else {
                                        for (var c = 0; c < supweeklist[b].length; c++) {
                                            if ((supweeklist[b][c].weekdays == presentday.getDay() && (supweeklist[b][c].startime >= currentsessionendtimeinpresentday || currentsessiontimeinpresentday >= supweeklist[b][c].endtime))) {
                                                checker = -1;
                                                console.log("supweeklist[b][c] skip      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                                break;
                                            } else {
                                                campus = supweeklist[b][c].Campus.trim();
                                                console.log("@" + campus + "@")
                                                console.log("supweeklist[b][c] @@@@" + campus + "@@@@@ 2")
                                                checker = 1;
                                            }
                                        }
                                    }
                                }
                                if (checker >= 0) {
                                    for (var a = 0; a < obsschedulebox.length; a++) {
                                        if (obsschedulebox[a].boxdate == presentday.toLocaleDateString("en-GB") && obsschedulebox[a].boxtime == currentsessiontimeinpresentday) {
                                            checker = -1;
                                            console.log("obsschedule skip      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                            break;
                                        } else {
                                            console.log("obsschedule @@@@@@      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                            checker = 1;
                                        }
                                    }
                                }
                                if (checker >= 0) {
                                    for (var b = 0; b < req.body.boxlist.length; b++) {
                                        req.body.boxlist[b].presentday = new Date(req.body.boxlist[b].presentday);
                                        if ((req.body.boxlist[b].tid == req.body.oid || req.body.boxlist[b].oid == req.body.oid) && req.body.boxlist[b].presentday.toLocaleDateString("en-GB") == presentday.toLocaleDateString("en-GB") && req.body.boxlist[b].presentstartTime == currentsessiontimeinpresentday.toLocaleTimeString("en-GB")) {
                                            checker = -1;
                                            console.log("obsboxlist skip      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                            break;
                                        } else {
                                            console.log("obsboxlist @@@@@@      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                            checker = 1;
                                        }
                                    }
                                }
                                if (checker >= 0) {
                                    for (var b = 0; b < obsrequest.length; b++) {
                                        obsrequest[b].RequestDate = new Date(obsrequest[b].RequestDate);
                                        if (obsrequest[b].RequestDate.toLocaleDateString("en-GB") == presentday.toLocaleDateString("en-GB") &&
                                            !(currentsessiontimeinpresentday >= obsrequest[b].RequestEndTime
                                                && currentsessionendtimeinpresentday <= obsrequest[b].RequestStartTime)) {
                                            checker = -1;
                                            console.log("obsrequest skip      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                            break;
        
                                        } else {
                                            console.log("obsrequest @@@@@@      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                            checker = 1;
                                        }
                                    }
                                }
                                if (checker >= 0) {
                                    for (var a = 0; a < obsttb.length; a++) {
                                        if ((obsttb[a].weekdays == presentday.getDay() && (obsttb[a].startime >= currentsessionendtimeinpresentday || currentsessiontimeinpresentday >= obsttb[a].endtime))) {
                                            checker = -1;
                                            console.log("obsttb skip      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                            break;
                                        } else {
                                            console.log("obsttb @@@@@      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                            checker = 1;
                                        }
                                    }
                                    console.log("check obschedule ", checker)
                                }
                                if (checker >= 0) {
                                    for (var b = 0; b < stdrequest.length; b++) {
                                        stdrequest[b].RequestDate = new Date(stdrequest[b].RequestDate);
                                        if (stdrequest[b].RequestDate.toLocaleDateString("en-GB") == presentday.toLocaleDateString("en-GB") &&
                                            !(currentsessiontimeinpresentday >= stdrequest[b].RequestEndTime
                                                && currentsessionendtimeinpresentday <= stdrequest[b].RequestStartTime)) {
                                            console.log("stdsrequest skip      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                            checker = -1;
                                            break;
        
                                        } else {
                                            console.log("stdsrequest @@@@@@      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                            checker = 1;
                                        }
                                    }
                                }
                                if (checker >= 0) {
                                    for (var a = 0; a < stdttb.length; a++) {
                                        if ((stdttb[a].weekdays == presentday.getDay() && (stdttb[a].startime >= currentsessionendtimeinpresentday || currentsessiontimeinpresentday >= stdxttb[a].endtime))) {
                                            checker = -1;
                                            console.log("stdsttd skip      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                            break;
                                        } else {
                                            console.log("stdttb @@@@@@      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                            checker = 1;
                                        }
                                    }
                                    //  console.log("check stdttb ", checker)
                                }
                                if (checker >= 0) {
                                    var finalcampus = undefined;
                                    var finalrid = undefined;
                                    var indexforcampusinlist = 0;
                                    //#    console.log(campuslist, "    \n", classroomlist, "     \n", classroomtimeslot, "      \n", classttb)
                                    let gettargetroomlistbycampus = (classroomlist, targetcampusclassroom) => {
                                        var classroomforcampus = { start: -1, end: -2 }
                                        for (var b = 0; b < classroomlist.length; b++) {
                                            console.log(classroomlist[b].Campus + "    " + targetcampusclassroom)
                                            if (classroomlist[b].Campus == targetcampusclassroom) {
                                                if (classroomforcampus.start == -1) {
                                                    classroomforcampus.start = b;
                                                }
                                                classroomforcampus.end = b;
                                            }
                                            if ((classroomlist[b].Campus != targetcampusclassroom && classroomforcampus.end + 1 == b) || b == classroomlist.length - 1) {
                                                return classroomforcampus;
                                            }
                                        }
                                    };
                                    let gettargetrrequestlistbycampus = (classroomtimeslot, targetcampus, targetrid) => {
                                        var requestlistforclassroom = { start: -1, end: 0 }
                                        for (var b = 0; b < classroomtimeslot.length; b++) {
                                            if (classroomtimeslot[b].Campus == targetcampus && classroomtimeslot[b].RID == targetrid) {
                                                if (requestlistforclassroom.start == -1) {
                                                    requestlistforclassroom.start = b;
                                                }
        
                                                requestlistforclassroom.end = b;
                                            }
                                            if (((classroomtimeslot[b].RID != targetrid || classroomtimeslot[b].Campus != targetcampus) && requestlistforclassroom.end + 1 == b) || b == classroomtimeslot.length - 1) {
        
                                                return requestlistforclassroom;
                                            }
                                        }
                                    };
                                    let gettargetclassroomttb = (classttb, targetcampus, targetrid) => {
                                        var ttbforclassroom = { start: -1, end: -2 }
                                        for (var b = 0; b < classttb.length; b++) {
                                            if (classttb[b].Campus == targetcampus && classttb[b].RID == targetrid) {
                                                if (ttbforclassroom.start == -1) {
                                                    ttbforclassroom.start = b;
                                                }
                                                ttbforclassroom.end = b;
                                            }
                                            if (((classttb[b].RID != targetrid || classttb[b].Campus != targetcampus) && ttbforclassroom.end + 1 == b) || b == classttb.length - 1) {
                                                return ttbforclassroom;
                                            }
                                        }
                                    };
        
                                    let checkrequestlist = (requestlistforthisroom) => {
                                        var checker = 0;
                                        for (var c = requestlistforthisroom.start; c < requestlistforthisroom.end; c++) {
                                            var unavailblestarttime = new Date(classroomtimeslot[c].StartDate);
                                            var unavailblestarttimetr = classroomtimeslot[c].StartTime.split(":")
                                            unavailblestarttime.setHours(unavailblestarttimetr[0])
                                            unavailblestarttime.setMinutes(unavailblestarttimetr[1])
                                            var unavailbleendtime = new Date(classroomtimeslot[c].EndDate);
                                            var unavailbleendtimetr = classroomtimeslot[c].EndTime.split(":")
                                            unavailbleendtime.setHours(unavailbleendtimetr[0])
                                            unavailbleendtime.setMinutes(unavailbleendtimetr[1])
                                            //#    console.log(unavailblestarttime, "    ", unavailbleendtime)
                                            if ((unavailblestarttime.toLocaleDateString() == presentday.toLocaleDateString()
                                                && !(unavailblestarttime.toLocaleTimeString("en-GB") >= currentsessionendtimeinpresentday
                                                    || unavailbleendtime.toLocaleTimeString("en-GB") <= currentsessiontimeinpresentday)
                                            )
                                            ) {
                                                console.log("classroomtimeslot skip      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                                checker = -1;
                                                break;
                                            } else {
                                                console.log("classroomtimeslot @@@@@@@@      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                                checker = 1;
                                            }
                                        }
                                        return checker;
        
                                    };
                                    let checkttb = (ttbforthisroom) => {
                                        var checker = 0;
                                        for (var c = ttbforthisroom.start; c < ttbforthisroom.end; c++) {
                                            var classstarttime = classttb[c].startTime;
                                            var classendtime = classttb[c].endTime;
        
        
                                            if ((classttbp[c].weekdays == presentday.getDay() && !(classstarttime >= currentsessionendtimeinpresentday || classendtime <= currentsessiontimeinpresentday))) {
                                                console.log("classttb skip      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                                checker = -1;
                                                break;
                                            } else {
                                                console.log("classttb @@@@@@@@      ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), presentday.toLocaleDateString())
                                                checker = 1;
                                            }
                                        }
                                        return checker;
        
                                    };
                                    while (finalcampus == undefined || finalrid == undefined) {
                                        // step 1 : check sup's in which campus
                                        // step 2 : if supcampus no suitable >> loop from the beginning of all campus
        
        
                                        var classroomlistforcampus = gettargetroomlistbycampus(classroomlist, campus);
                                        //#    console.log("classroomlistforcampus   @" + campus + "@    ", classroomlistforcampus)
                                        for (var b = classroomlistforcampus.start; b < classroomlistforcampus.end; b++) {
                                            var requestlistforthisroom = gettargetrrequestlistbycampus(classroomtimeslot, campus, classroomlist[b].RID)
                                            //#    console.log("requsetlistforthisroom    ", requestlistforthisroom)
        
                                            if (requestlistforthisroom.start == -1) {
                                                checker = 1;
                                            } else {
                                                checker = checkrequestlist(requestlistforthisroom);
                                            }
                                            if (checker >= 0) {
                                                var ttbforthisroom = gettargetclassroomttb(classttb, campus, classroomlist[b].RID)
                                                if (ttbforthisroom.start == -1) {
                                                    checker = 1;
                                                    break;
                                                } else {
                                                    checker = checkttb(ttbforthisroom);
        
                                                }
                                            }
        
                                            if (checker >= 0) {
                                                finalcampus = campus;
                                                finalrid = classroomlist[b].RID;
                                                break;
                                            }
                                        }
                                        campus = campuslist[indexforcampusinlist];
                                        indexforcampusinlist++;
                                        //    finalcampus = "hello"; finalrid = "byebye"
                                    }
                                }
                                if (checker >= 0) { break; }
        
                                // console.log(req.body.tid, " ", req.body.sid, " ", req.body.oid, " ", finalcampus, " ", finalrid, " ", presentday, " ", currentsessiontimeinpresentday)
                            }
                        }
                    }
        
        
                    if (checker >= 0) {
                        console.log("break with ", presentday.toLocaleDateString(), currentsessiontimeinpresentday.toLocaleTimeString(), currentsessionendtimeinpresentday.toLocaleTimeString());
                        break;
                    } else {
                        if (req.body.typeofpresent == "final") {
                            currentsessiontimeinpresentday.setHours((8 + timebox), 30, 0);
                            currentsessionendtimeinpresentday.setHours((8 + 1 + timebox), 30, 0)
                        } else {
                            if (timebox % 2 == 0) {
                                currentsessiontimeinpresentday.setHours((8 + timebox / sessionduration), 30, 0);
                                currentsessionendtimeinpresentday.setHours((8 + timebox / sessionduration) + 1, 0, 0)
                            } else {
                                currentsessiontimeinpresentday.setHours((8 + timebox / sessionduration), 0, 0);
                                currentsessionendtimeinpresentday.setHours((8 + timebox / sessionduration), 30, 0)
                            }
                        }
                    }
                    //    console.log("end    ", currentsessiontimeinpresentday.toLocaleTimeString("en-GB"), currentsessionendtimeinpresentday.toLocaleTimeString("en-GB"))
                }
        
        
        */



        return res.status(200).json({
            tid: req.body.tid,
            sid: req.body.sid,
            oid: req.body.oid,
            finalcampus: finalcampus,
            finalrid: finalrid,
            presentday: presentday,
            presentstartTime: currentsessiontimeinpresentday.toLocaleTimeString("en-GB"),
            presentendTime: currentsessionendtimeinpresentday.toLocaleTimeString("en-GB")
        })

    },

    genavailable: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var errmsg = "";

        // get presentperiod
        var getsetting3 = "select * from allsupersetting where typeofsetting = 3;"
        var setting3 = await new Promise((resolve) => {
            pool.query(getsetting3, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                if (ans.length != 0) {
                    var startday = new Date(ans[0].startdate);
                    var endday = new Date(ans[0].enddate);
                    var startTime = ans[0].starttime.split(":");
                    var endTime = ans[0].endtime.split(":");
                    startday.setHours(startTime[0]);
                    startday.setMinutes(startTime[1]);
                    startday.setSeconds(startTime[2]);
                    endday.setHours(endTime[0]);
                    endday.setMinutes(endTime[1]);
                    endday.setSeconds(endTime[2]);
                    console.log(startday + "   " + endday)
                    ans = { startday: startday, endday: endday };
                }
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.genavailble.getsetting3"
        })
        console.log(errmsg)
        console.log(setting3)

        // gen all supervisors
        var getallsupervisor = "select tid,submission from supervisor order by tid asc"
        var supervisorlist = await new Promise((resolve) => {
            pool.query(getallsupervisor, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.genavailble.getallsupervvisor"
        })


        //need to del all unpending records
        var gethvrecordbutnosubmit = "select distinct(student.sid) from allstudenttakecourse left join student on student.sid = allstudenttakecourse.pid where ttbsubmission = \"N\" or ttbsubmission=\"Rejected\";"
        var hvrecordbutnosubmitstudent = await new Promise((resolve) => {
            pool.query(gethvrecordbutnosubmit, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.genavailble.gethvrecordbutnosubmit"
        })
        
        console.log(">>hvrecordbutnosubmitstudent", hvrecordbutnosubmitstudent)

        for (var a = 0; a < hvrecordbutnosubmitstudent.length; a++) {
            var deleteline = "delete from allstudenttakecourse where pid = \"" + hvrecordbutnosubmitstudent[a].sid + "\" and (confirmation = \"0\" or confirmation = \"3\");"
            //console.log(deleteline)
            db.query(deleteline, (err, result) => {
                try {
                    console.log("delete complete")
                } catch (err) {
                    if (err) {
                        errstring = "";
                        errstring += "error happened for:" + deleteline + "\n"
                        statuscode = 401;
                    }
                }

            })

            var insertemptyline = "insert ignore into alltakecourse values(\"EMPTY_\",\"" + hvrecordbutnosubmitstudent[a].sid + "\");"
            //console.log(insertemptyline)
            db.query(insertemptyline, (err, result) => {
                try {
                    console.log("insert complete")
                } catch (err) {
                    if (err) {
                        errstring = "";
                        errstring += "error happened for:" + deleteline + "\n"
                        statuscode = 401;
                    }
                }

            })

            updatetakecourseline = "Update allstudenttakecourse set allstudenttakecourse.ttbcomments = \"enforced to enroll empty since no submission or being rejected\" , allstudenttakecourse.confirmation = \"4\",  allstudenttakecourse.review = now() where allstudenttakecourse.pid=\"" + hvrecordbutnosubmitstudent[a].sid + "\";"
            //console.log(updatetakecourseline)
            db.query(updatetakecourseline, (err, result) => {
                try {
                    console.log("update complete")
                } catch (err) {
                    if (err) {
                        errstring = "";
                        errstring += "error happened for:" + updatetakecourseline + "\n"
                        statuscode = 401;
                    }
                }

            })



        }




        // gen all student update those who didnot even handin ttb
        var getallstudentttbnotok = "select distinct(sid) from student where ttbsubmission = \"N\";"
        var studentlist = await new Promise((resolve) => {
            pool.query(getallstudentttbnotok, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.genavailble.getallstudentttbnotok"
        })
        console.log(studentlist)

        for (var a = 0; a < studentlist.length; a++) {
            //try enroll all of them to EMPTY
            var insertemptyline = "insert ignore into alltakecourse values(\"EMPTY_\",\"" + studentlist[a].sid + "\");"
            console.log(insertemptyline)
            db.query(insertemptyline, (err, result) => {
                try {
                    console.log("insert complete")
                } catch (err) {
                    if (err) {
                        errstring = "";
                        errstring += "error happened for:" + deleteline + "\n"
                        statuscode = 401;
                    }
                }

            })

            updatetakecourseline = "Update allstudenttakecourse set allstudenttakecourse.ttbcomments = \"enforced to enroll empty since no submission or being rejected\" , allstudenttakecourse.confirmation = \"4\",  allstudenttakecourse.review = now() where allstudenttakecourse.pid=\"" + studentlist[a].sid + "\";"
            console.log(updatetakecourseline)
            db.query(updatetakecourseline, (err, result) => {
                try {
                    console.log("update complete")
                } catch (err) {
                    if (err) {
                        errstring = "";
                        errstring += "error happened for:" + updatetakecourseline + "\n"
                        statuscode = 401;
                    }
                }

            })
        }
       
            //turn Required Proof into Rejected
            var updaterequiredproofline = "Update allrequestfromstudent set status = \"Enforce Rejected\", reply=\"Enforced to reject since didn't upload proof ontime\" where status = \"Require Proof\""
            console.log(updaterequiredproofline)
              db.query(updaterequiredproofline, (err, result) => {
                try {
                    console.log("update complete")
                } catch (err) {
                    if (err) {
                        errstring = "";
                        errstring += "error happened for:" + updaterequiredproofline + "\n"
                        statuscode = 401;
                    }
                }

            })

            //turn Pending into Approved
            updatependingrequestline = "Update allrequestfromstudent set status = \"Enforce Approved\", reply=\"Enforced to approve since supervisor left for pending\" where status = \"Pending\";"
            console.log(updatependingrequestline)
            db.query(updatependingrequestline, (err, result) => {
                try {
                    console.log("update complete")
                } catch (err) {
                    if (err) {
                        errstring = "";
                        errstring += "error happened for:" + updatependingrequestline + "\n"
                        statuscode = 401;
                    }
                }

            })

        // handle gen student availble 
        // gen all students
        var getallstudent = "select  supervisorpairstudent.tid , student.sid , observerpairstudent.oid from student join supervisorpairstudent on supervisorpairstudent.sid = student.sid  join observerpairstudent on observerpairstudent.sid = student.sid"
        var studentlist = await new Promise((resolve) => {
            pool.query(getallstudent, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.genavailble.getallstudent"
        })

        console.log(studentlist)

        for (var a = 0; a < studentlist.length; a++) {
            console.log(studentlist[a]);
            var currentgeneratedate = new Date(setting3.startday);
            var currentgeneratedateend = new Date(setting3.startday);
            while (currentgeneratedate < new Date(setting3.endday)) {
                currentgeneratedateend.setHours(currentgeneratedate.getHours() + 1);
                var studentttblist;
                var studentrequest;
                var datestring = currentgeneratedate.getFullYear() + "-" + (currentgeneratedate.getMonth() + 1) + "-" + currentgeneratedate.getDate();

                //console.log("enter")
                if (req.body.typeofpresent == "midterm") {
                    //console.log("midterm")
                } else if (req.body.typeofpresent == "final") {
                    //console.log("final")
                    var boolcheckttb = false;
                    var boolcheckreq = false;

                    var getcheckstudentttb = "select * from allstudenttakecourse left join allclass on allclass.cid = allstudenttakecourse.cid  where pid = \"" + studentlist[a].sid + "\" and weekdays = \"" + currentgeneratedate.getDay() + "\" and (starttime < Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and endtime > time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\")) order by pid asc, weekdays asc,startTime asc"
                    //console.log(getcheckstudentttb);
                    studentttblist = await new Promise((resolve) => {
                        pool.query(getcheckstudentttb, (err, res) => {
                            var string = JSON.stringify(res);
                            var json = JSON.parse(string);
                            var ans = json;
                            resolve(ans)
                        })
                    }).catch((err) => {
                        errmsg = "error happened in ScheduleController.genavailble.getcheckstudentttb"
                    })
                    if (studentttblist == null || studentttblist == undefined || studentttblist.length == 0) {
                        boolcheckttb = true;
                    }

                    var getcheckstudentrequest = "select * from allrequestfromstudent where (status = \"Approved\" or status = \"Enforce Approved\") and sid = \"" + studentlist[a].sid + "\" and requestDate = DATE(\"" + datestring + "\") and (requeststarttime <= Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and requestendtime >= time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\"))";
                    //console.log(getcheckstudentrequest)
                    studentrequest = await new Promise((resolve) => {
                        pool.query(getcheckstudentrequest, (err, res) => {
                            var string = JSON.stringify(res);
                            var json = JSON.parse(string);
                            var ans = json;
                            resolve(ans)
                        })
                    }).catch((err) => {
                        errmsg = "error happened in ScheduleController.genavailble.getcheckstudentrequest"
                    })

                    if (studentrequest.length == 0 || studentrequest == null || studentrequest == undefined) {
                        //console.log(supervisorlist[a].tid+"     "+currentgeneratedate.toLocaleDateString()+"   "+currentgeneratedate.toLocaleTimeString()+"    "+currentgeneratedateend.toLocaleTimeString())
                        //var datestring = currentgeneratedate.getFullYear()+"-"+(currentgeneratedate.getMonth()+1)+"-"+currentgeneratedate.getDate();
                        boolcheckreq = true;
                    }
                  

                    if (boolcheckreq && boolcheckttb) {
                        var insertavability = "insert into studentavailable value(\"" + studentlist[a].sid + "\",Date(\"" + datestring + "\"),timestamp(\"" + datestring + " " + currentgeneratedate.toLocaleTimeString("en-GB") + "\"),timestamp(\"" + datestring + " " + currentgeneratedateend.toLocaleTimeString("en-GB") + "\"))"
                        console.log(insertavability)
                        var studentavailbilityinsert = await new Promise((resolve) => {
                            pool.query(insertavability, (err, res) => {
                                resolve(res);
                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.insertavability"
                        }) 
                    }




                    if (currentgeneratedate.toLocaleTimeString("en-GB") == "17:30:00") {
                        currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
                        currentgeneratedate = new Date(currentgeneratedate);
                        currentgeneratedate.setHours(9);
                        currentgeneratedate.setMinutes(30);
                        currentgeneratedate.setSeconds(0);
                    } else {
                        currentgeneratedate.setHours(currentgeneratedate.getHours() + 1);
                    }

                    //  console.log(currentgeneratedate.toLocaleDateString("en-GB") + "   " + currentgeneratedate.toLocaleTimeString("en-GB"))

                }

            }
        }

        // console.log(supervisorlist.length)
        //console.log(supervisorlist)
        for (var a = 0; a < supervisorlist.length; a++) {
            //console.log(supervisorlist[a]);
            var currentgeneratedate = new Date(setting3.startday);
            var currentgeneratedateend = new Date(setting3.startday);
            while (currentgeneratedate < new Date(setting3.endday)) {
                currentgeneratedateend.setHours(currentgeneratedate.getHours() + 1);
                var supervisorttblist;
                var supervisorrequest;
                var datestring = currentgeneratedate.getFullYear() + "-" + (currentgeneratedate.getMonth() + 1) + "-" + currentgeneratedate.getDate();

                //console.log("enter")
                if (req.body.typeofpresent == "midterm") {
                    //console.log("midterm")
                } else if (req.body.typeofpresent == "final") {
                    //console.log("final")
                    var boolcheckttb = false;
                    var boolcheckreq = false;

                    var getchecksupervisorttb = "select * from allsupertakecourse left join allclass on allclass.cid = allsupertakecourse.cid  where confirmation = 1 and pid = \"" + supervisorlist[a].tid + "\" and weekdays = \"" + currentgeneratedate.getDay() + "\" and (starttime < Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and endtime > time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\")) order by pid asc, weekdays asc,startTime asc"
                    //console.log(getchecksupervisorttb);
                    supervisorttblist = await new Promise((resolve) => {
                        pool.query(getchecksupervisorttb, (err, res) => {
                            var string = JSON.stringify(res);
                            var json = JSON.parse(string);
                            var ans = json;
                            resolve(ans)
                        })
                    }).catch((err) => {
                        errmsg = "error happened in ScheduleController.genavailble.getsupervisorttblist"
                    })
                    if (supervisorttblist.length == 0 || supervisorttblist == null || supervisorttblist == undefined) {
                        boolcheckttb = true;
                    }


                    var getchecksupervisorrequest = "select * from allrequestfromsupervisor where tid = \"" + supervisorlist[a].tid + "\" and requestDate = DATE(\"" + datestring + "\") and (requeststarttime <= Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and requestendtime >= time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\"))";
                    supervisorrequest = await new Promise((resolve) => {
                        pool.query(getchecksupervisorrequest, (err, res) => {
                            var string = JSON.stringify(res);
                            var json = JSON.parse(string);
                            var ans = json;
                            resolve(ans)
                        })
                    }).catch((err) => {
                        errmsg = "error happened in ScheduleController.genavailble.getchecksupervisorrequest"
                    })

                    if (supervisorrequest.length == 0 || supervisorrequest == null || supervisorrequest == undefined) {
                        //console.log(supervisorlist[a].tid+"     "+currentgeneratedate.toLocaleDateString()+"   "+currentgeneratedate.toLocaleTimeString()+"    "+currentgeneratedateend.toLocaleTimeString())
                        //var datestring = currentgeneratedate.getFullYear()+"-"+(currentgeneratedate.getMonth()+1)+"-"+currentgeneratedate.getDate();
                        boolcheckreq = true;
                    }
                    if (boolcheckreq && boolcheckttb) {
                        var insertavability = "insert into supervisoravailable value(\"" + supervisorlist[a].tid + "\",Date(\"" + datestring + "\"),timestamp(\"" + datestring + " " + currentgeneratedate.toLocaleTimeString("en-GB") + "\"),timestamp(\"" + datestring + " " + currentgeneratedateend.toLocaleTimeString("en-GB") + "\"))"
                        // console.log(insertavability)
                        var supervisoravailbilityinsert = await new Promise((resolve) => {
                            pool.query(insertavability, (err, res) => {
                                resolve(res);
                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.insertavability"
                        })
                    }




                    if (currentgeneratedate.toLocaleTimeString("en-GB") == "17:30:00") {
                        currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
                        currentgeneratedate = new Date(currentgeneratedate);
                        currentgeneratedate.setHours(9);
                        currentgeneratedate.setMinutes(30);
                        currentgeneratedate.setSeconds(0);
                    } else {
                        currentgeneratedate.setHours(currentgeneratedate.getHours() + 1);
                    }

                    //  console.log(currentgeneratedate.toLocaleDateString("en-GB") + "   " + currentgeneratedate.toLocaleTimeString("en-GB"))

                }

            }
        }

        return res.ok();
    },

    checkpref: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var boxlist = req.body.boxlist;
        console.log(">>checkpref       ", req.body)
        var startday = new Date(req.body.fullstartday);
        var endday = new Date(req.body.fullendday);

        let distinctoidlist = (boxlist) => {
            let unique_values = boxlist
                .map((item) => item.oid)
                .filter(
                    (value, index, current_value) => current_value.indexOf(value) === index
                );
            return unique_values;
        };

        var oidlist = distinctoidlist(boxlist);
        console.log(oidlist)

        for (var a = 0; a < boxlist.length; a++) {

            var getsuppreference = "select allpreffromsup.tid , priority, prefno  from allpreffromsup  left join supervisor on supervisor.tid = allpreffromsup.tid where allpreffromsup.tid = \"" + boxlist[0].tid + "\" or allpreffromsup.tid = \"" + boxlist[a].oid + "\" order by priority asc , tid asc"
            var suppreflistforthisbox = await new Promise((resolve) => {
                pool.query(getsuppreference, (err, res) => {
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    var ans = json;
                    resolve(ans)
                })
            })
            console.log(">>suppreflistforthisbox", suppreflistforthisbox)
            if (suppreflistforthisbox.length > 0) {
                for (var b = 0; b < suppreflistforthisbox.length; b++) {
                    var prefsplitstr = suppreflistforthisbox[b].prefno.split("/");
                    var totalconsiderednum = 0;
                    prefsplitstr.forEach(num => {
                        if (num != "") {
                            totalconsiderednum += parseInt(num);
                        }
                    })
                    var presentday = new Date(boxlist[a].presentday)
                    var daycount = Math.floor((presentday - startday) / 1000 / 60 / 60 / 24)

                    var chktotalpresentforthissup = "select (select count(*) from supervisorpairstudent where tid = \"" + suppreflistforthisbox[b].tid + "\") super, (select count(*) from observerpairstudent where oid = \"" + suppreflistforthisbox[b].tid + "\") observer from dual;"
                    var totalpresentforthissup = await new Promise((resolve) => {
                        pool.query(chktotalpresentforthissup, (err, res) => {
                            var string = JSON.stringify(res);
                            var json = JSON.parse(string);
                            var ans = json;
                            resolve(ans)
                        })
                    })

                    console.log(">> totalpresentforthissup    ", (parseInt(totalpresentforthissup[0].super) + parseInt(totalpresentforthissup[0].observer)))

                    var checkthissupchedule = "select count(*) as checkcount from allschedulebox where tid = \"" + suppreflistforthisbox[b].tid + "\" and boxdate = \"" + presentday.toLocaleDateString() + "\""
                    var currentschedulenum = await new Promise((resolve) => {
                        pool.query(checkthissupchedule, (err, res) => {
                            var string = JSON.stringify(res);
                            var json = JSON.parse(string);
                            var ans = json;
                            resolve(ans)
                        })
                    })
                    console.log(currentschedulenum[0].checkcount >= prefsplitstr[daycount])
                    console.log(totalconsiderednum + "      " + (parseInt(totalpresentforthissup[0].super) + parseInt(totalpresentforthissup[0].observer)))


                    // 如果佢已經係計好咗total = fulfill >> 可以直接check 佢滿未

                    // 如果佢未滿 >> currentnum vs prefnum
                    // checker for proving the sup is done
                }
            } else {
                // 無人填pref
            }



        }



    },











    savebox: async function (req, res) {
        var db = await sails.helpers.database();
        // console.log(req.body.boxlist);
        var boxlist = req.body.boxlist;
        updatesupdraftexist = "Update supervisor set draft= \"Y\" where tid = \"" + boxlist[0].tid + "\"";
        /**
        db.query( updatesupdraftexist, (err, results) => {
            if (err) { return res.status(401).json("Error happened when excuting ScheduleController.savebox.updatesupdraftexist") };
        });
 */
        for (var a = 0; a < boxlist.length; a++) {
            updateobsdraftexist = "Update supervisor set draft= \"Y\" where tid = \"" + boxlist[a].oid + "\"";
            /**
            db.query(updateobsdraftexist, (err, results) => {
                if (err) { return res.status(401).json("Error happened when excuting ScheduleController.savebox.updateobsdraftexist") };
            });
            */
            boxid = "" + (boxlist[a].presentday.split("T"))[0] + "_" + boxlist[a].presentstartTime;

            insertline = "insert ignore into allschedulebox values(\"" + boxid + "\",\"" + boxlist[a].presentday + "\",\"" + boxlist[a].presentstartTime + "\",\"" + boxlist[a].tid + "\",\"" + boxlist[a].sid + "\",\"" + boxlist[a].oid + "\",\"" + boxlist[a].finalcampus + "\",\"" + boxlist[a].finalrid + "\",now())";
            updateline = "Update allschedulebox set boxdate = \"" + boxlist[a].presentday + "\", boxtime = \"" + boxlist[a].presentstartTime + "\" ,SID =\"" + boxlist[a].sid + "\", OID = \"" + boxlist[a].oid + "\", Campus = \"" + boxlist[a].finalcampus + "\", RID = \"" + boxlist[a].finalrid + "\", LastUpdate = now() where boxid = \"" + boxid + "\"";
            console.log(boxid)
            console.log(insertline)
            console.log(updateline)
            /**
            db.query(insertline, (err, result) => {
                if (err) {
                    errstring = "";
                    errstring += "error happened for:" + insertline + "\n"
                    statuscode = 401;
                }
 
            })
            db.query(updateline, (err, result) => {
                if (err) {
                    errstring = "";
                    errstring += "error happened for:" + thisistheline + "\n"
                    statuscode = 401;
                }
            })
           */

        }

        /** 
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
          
        }
*/

        console.log(supervisorlist)
        return res.ok();
    },

    getrequestroomlist: async function (req, res) {
        var db = await sails.helpers.database();
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
        var db = await sails.helpers.database();
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
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var errmsg = "";

        var getsetting3 = "select * from allsupersetting where typeofsetting = 3"
        var setting3 = await new Promise((resolve) => {
            pool.query(getsetting3, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                if (ans.length != 0) {
                    var startday = new Date(ans[0].startdate);
                    var endday = new Date(ans[0].enddate);
                    var startTime = ans[0].starttime.split(":");
                    var endTime = ans[0].endtime.split(":");
                    startday.setHours(startTime[0]);
                    startday.setMinutes(startTime[1]);
                    startday.setSeconds(startTime[2]);
                    endday.setHours(endTime[0]);
                    endday.setMinutes(endTime[1]);
                    endday.setSeconds(endTime[2]);
                    console.log(startday + "   " + endday)
                    ans = { startday: startday, endday: endday };
                }
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.getpairing.getsetting3"
        })
        console.log(errmsg)
        console.log(setting3)

        getpairinglist = "select * from (select supervisorpairstudent.tid , supervisor.priority as suppriority, supervisorpairstudent.sid from supervisorpairstudent left join supervisor on supervisor.tid = supervisorpairstudent.tid) as shortsuperpair left join (select observerpairstudent.oid , supervisor.priority as obspriority, observerpairstudent.sid from observerpairstudent left join supervisor on supervisor.tid = observerpairstudent.oid) as shortobspair on shortobspair.sid = shortsuperpair.sid order by shortsuperpair.suppriority asc, shortobspair.obspriority asc";
        // gen all supervisors
        var getallsupervisor = "select tid,submission from supervisor order by priority asc"
        var supervisorlist = await new Promise((resolve) => {
            pool.query(getallsupervisor, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.getpairing.getallsupervvisor"
        })

        for (var a = 0; a < supervisorlist.length; a++) {
            var getallpresentlist = "select * from supervisorpairstudent left join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid where( supervisorpairstudent.tid = \"" + supervisorlist[a].tid + "\" or observerpairstudent.oid = \"" + supervisorlist[a].tid + "\" )"
            var presentlistforthissuper = await new Promise((resolve) => {
                pool.query(getallpresentlist, (err, res) => {
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    var ans = json;
                    resolve(ans)
                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.getpairing.getallpresentlist"
            })
            console.log(presentlistforthissuper)

            for (var b = 0; b < presentlistforthissuper.length; b++) {
                var colleage;
                console.log(presentlistforthissuper[b])
                console.log(presentlistforthissuper[b].TID + "    " + supervisorlist[a].tid)

                if (presentlistforthissuper[b].TID == supervisorlist[a].TID) {
                    colleage = presentlistforthissuper[b].OID;
                } else {
                    colleage = presentlistforthissuper[b].TID;
                }




            }
        }




        /** 
                db.query(getpairinglist, (err, results) => {
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
                */
    },

}
