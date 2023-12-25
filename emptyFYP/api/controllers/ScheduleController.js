module.exports = {

    viewschedulepage: async function (req, res) {

    },
    viewFinalSchedule: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var getsettinginfo;
        var getschedulebox;
        var thisistheline3;
        var releasedate;
        var releasetime;

        // check the displaytime has come
        checkdisplaydate = "select deadlinedate , deadlinetime from allsupersetting where typeofsetting = 4 and Announcetime is not null;"

        setting = await new Promise((resolve) => {
            pool.query(checkdisplaydate, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans;
                if (err == undefined && json.length > 0) {
                    ans = json[0];
                    resolve(ans)
                } else {
                    var errmsg = JSON.parse(JSON.stringify({ "errmsg": "error happened in ScheduleController.viewFinalSchedule.checkdisplaydate" }));
                    err = errmsg;
                    resolve(err)
                }
            })
        })
        console.log(setting)

        if (setting.errmsg == undefined) {
            var settingdate = new Date(setting.deadlinedate);
            settingdate.setHours(setting.deadlinetime.split(":")[0]);
            settingdate.setMinutes(setting.deadlinetime.split(":")[1]);
            console.log(settingdate)
            if (settingdate > new Date()) {

                if (req.session.role == "sup") {
                    getschedulebox = "select * from allschedulebox where tid = \"" + req.session.userid + "\" or oid =\"" + req.session.userid + "\" order by boxdate";
                } else if (req.session.role == "stu") {
                    getschedulebox = "select * from allschedulebox where sid = \"" + req.session.userid + "\""
                }
                db.query(getschedulebox, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        var personalschedulebox = json;
                        return res.view('user/viewFinalSchedule.ejs', {
                            releasedate: settingdate,
                            personalschedulebox: personalschedulebox
                        });

                    } catch (err) {
                        console.log("error happened in ScheduleController.viewFinalSchedule.getschedulebox");
                    }
                });
            }
        } else {
            console.log(setting.errmsg)
        }

    },

    genavailable: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var errmsg = "";
        //var schedulebox = new Array();


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
        //console.log(errmsg)
        console.log(setting3)



        function resetschedulebox() {
            var days = 0;
            var schedulebox = new Array();
            while (true) {
                var scheduleboxsetting = JSON.parse(JSON.stringify({ "date": "", "prefno": "", "schedule": new Array() }))
                // console.log("new schedulebox",schedulebox)
                var presentday = (new Date((new Date(setting3.startday)).getTime() + (24 * 60 * 60 * 1000) * days)).toLocaleDateString("en-GB");
                //console.log(presentday.toLocaleDateString())
                if (setting3.startday.getDay() != 6 || setting.startday.getDay() != 0) {
                    var date = presentday.split("/");
                    scheduleboxsetting.date = date[2] + "-" + date[1] + "-" + date[0];
                    schedulebox.push(scheduleboxsetting);
                    days++;
                }

                if (presentday == (new Date(setting3.endday)).toLocaleDateString("en-GB")) {
                    false;
                    break;
                }

            }

            //console.log("resetted schedulebox", schedulebox)
            return schedulebox;
        }


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

            updatetakecourseline = "Update allstudenttakecourse set allstudenttakecourse.ttbcomments = \"enforced to enroll empty since no submission or being rejected\" , allstudenttakecourse.confirmation = \"4\",  allstudenttakecourse.review = now() where allstudenttakecourse.pid=\"" + studentlist[a].sid + "\";"
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

        //turn Required Proof into Rejected
        var updaterequiredproofline = "Update allrequestfromstudent set status = \"Enforce Rejected\", reply=\"Enforced to reject since didn't upload proof ontime\" where status = \"Require Proof\""
        //console.log(updaterequiredproofline)
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
        //console.log(updatependingrequestline)
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
        //console.log(">>studentlist", studentlist)

        for (var a = 0; a < studentlist.length; a++) {

            var currentgeneratedate = new Date(setting3.startday);
            var currentgeneratedateend = new Date(setting3.startday);
            //console.log(currentgeneratedate)
            while (currentgeneratedate < new Date(setting3.endday)) {
                var supervisorttblist;
                var supervisorrequest;
                if (req.body.typeofpresent == "midterm") {
                    //console.log("midterm")
                    if (currentgeneratedate.getMinutes() == 30) {
                        currentgeneratedateend.setHours(currentgeneratedate.getHours() + 1);
                        currentgeneratedateend.setMinutes(0)
                    } else {
                        currentgeneratedateend.setMinutes(30);
                    }
                    //console.log(currentgeneratedate.toLocaleTimeString("en-GB"), "    ", currentgeneratedateend.toLocaleTimeString("en-GB"))


                    var datestring = currentgeneratedate.getFullYear() + "-" + (currentgeneratedate.getMonth() + 1) + "-" + currentgeneratedate.getDate();
                    var boolcheckttb = false;
                    var boolcheckreq = false;

                    var getcheckstudentttb = "select * from allstudenttakecourse left join allclass on allclass.cid = allstudenttakecourse.cid  where pid = \"" + studentlist[a].sid + "\" and weekdays = \"" + currentgeneratedate.getDay() + "\" and (starttime <= Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and endtime >= time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\")) order by pid asc, weekdays asc,startTime asc"
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
                        //console.log(insertavability)
                        var studentavailbilityinsert = await new Promise((resolve) => {
                            pool.query(insertavability, (err, res) => {
                                resolve(res);
                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.insertavability"
                        })

                    }

                    if (currentgeneratedate.toLocaleTimeString("en-GB") == "18:00:00") {
                        if (currentgeneratedate.getDay() != 6) {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours(9);
                            currentgeneratedate.setMinutes(30);
                            currentgeneratedate.setSeconds(0);
                        } else {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 2 * 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours(9);
                            currentgeneratedate.setMinutes(30);
                            currentgeneratedate.setSeconds(0);
                        }



                    } else {
                        if (currentgeneratedate.getMinutes() == 30) {
                            currentgeneratedate.setHours(currentgeneratedate.getHours() + 1);
                            currentgeneratedate.setMinutes(0)
                        } else {
                            currentgeneratedate.setMinutes(30)
                        }

                    }





                } else if (req.body.typeofpresent == "final") {
                    currentgeneratedateend.setHours(currentgeneratedate.getHours() + 1);

                    var datestring = currentgeneratedate.getFullYear() + "-" + (currentgeneratedate.getMonth() + 1) + "-" + currentgeneratedate.getDate();

                    // console.log(datestring)
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
                        //console.log(insertavability)
                        var studentavailbilityinsert = await new Promise((resolve) => {
                            pool.query(insertavability, (err, res) => {
                                resolve(res);
                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.insertavability"
                        })
                    }




                    if (currentgeneratedate.toLocaleTimeString("en-GB") == "17:30:00") {
                        //console.log(currentgeneratedate.getDay())
                        if (currentgeneratedate.getDay() != 6) {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours(9);
                            currentgeneratedate.setMinutes(30);
                            currentgeneratedate.setSeconds(0);
                        } else {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 2 * 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours(9);
                            currentgeneratedate.setMinutes(30);
                            currentgeneratedate.setSeconds(0);
                        }

                        //console.log(currentgeneratedate)

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
                //console.log("enter")
                var supervisorttblist;
                var supervisorrequest;
                if (req.body.typeofpresent == "midterm") {
                    //console.log("midterm")
                    if (currentgeneratedate.getMinutes() == 30) {
                        currentgeneratedateend.setHours(currentgeneratedate.getHours() + 1);
                        currentgeneratedateend.setMinutes(0)
                    } else {
                        currentgeneratedateend.setMinutes(30);
                    }
                    var datestring = currentgeneratedate.getFullYear() + "-" + (currentgeneratedate.getMonth() + 1) + "-" + currentgeneratedate.getDate();

                    var boolcheckttb = false;
                    var boolcheckreq = false;

                    var getchecksupervisorttb = "select * from allsupertakecourse left join allclass on allclass.cid = allsupertakecourse.cid  where confirmation = 1 and pid = \"" + supervisorlist[a].tid + "\" and weekdays = \"" + currentgeneratedate.getDay() + "\" and (starttime <= Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and endtime >= time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\")) order by pid asc, weekdays asc,startTime asc"
                    // console.log(getchecksupervisorttb);


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
                    //console.log(getchecksupervisorrequest)
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
                        //console.log(insertavability)

                        var supervisoravailbilityinsert = await new Promise((resolve) => {
                            pool.query(insertavability, (err, res) => {
                                resolve(res);
                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.insertavability"
                        })
                    }






                    if (currentgeneratedate.toLocaleTimeString("en-GB") == "18:00:00") {
                        //console.log(currentgeneratedate.getDay())
                        if (currentgeneratedate.getDay() != 6) {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours(9);
                            currentgeneratedate.setMinutes(30);
                            currentgeneratedate.setSeconds(0);
                        } else {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 2 * 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours(9);
                            currentgeneratedate.setMinutes(30);
                            currentgeneratedate.setSeconds(0);
                        }



                    } else {
                        if (currentgeneratedate.getMinutes() == 30) {
                            currentgeneratedate.setHours(currentgeneratedate.getHours() + 1);
                            currentgeneratedate.setMinutes(0)
                        } else {
                            currentgeneratedate.setMinutes(30)
                        }

                    }


                } else if (req.body.typeofpresent == "final") {
                    //console.log("final")
                    currentgeneratedateend.setHours(currentgeneratedate.getHours() + 1);

                    var datestring = currentgeneratedate.getFullYear() + "-" + (currentgeneratedate.getMonth() + 1) + "-" + currentgeneratedate.getDate();
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

        //console.log(">>supervisorlist", supervisorlist);

        //  for (var a = 0; a < 3; a++) {




        for (var a = 0; a < supervisorlist.length; a++) {
            var getprefofthissuper = "select * from allpreffromsup where tid = \"" + supervisorlist[a].tid + "\"";
            var prefofthissuper = await new Promise((resolve) => {
                pool.query(getprefofthissuper, (err, res) => {
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    var ans = json;
                    resolve(ans)
                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.genavailble.getprefofthissuper"
            })
            //console.log(">>preflist", prefofthissuper)
            //console.log(prefofthissuper.length)
            var thisschedulebox = resetschedulebox();

            if (prefofthissuper != null && prefofthissuper.length > 0) {
                //console.log(prefofthissuper[0].Prefno)
                var prefary = prefofthissuper[0].Prefno.split("/");

                for (var b = 0; b < prefary.length; b++) {
                    thisschedulebox[b].prefno = prefary[b];
                }
            }
            thisschedulebox.sort((a, b) => {
                return b.prefno - a.prefno;
            });
            // console.log(supervisorlist[a].tid, "   ", thisschedulebox)

            var getallstudentlistforthissuper = "(select tid, supervisorpairstudent.sid, oid as colleague from supervisorpairstudent left join observerpairstudent on observerpairstudent.sid = supervisorpairstudent.sid where supervisorpairstudent.tid = \"" + supervisorlist[a].tid + "\"and supervisorpairstudent.sid not in (select sid from allschedulebox) )union (select oid,observerpairstudent.sid , tid as colleague from observerpairstudent left join supervisorpairstudent on observerpairstudent.sid = supervisorpairstudent.sid where observerpairstudent.oid = \"" + supervisorlist[a].tid + "\" and observerpairstudent.sid not in (select sid from allschedulebox))";
            // console.log(getallstudentlistforthissuper)
            var studentlistforthissupervisor = await new Promise((resolve) => {
                pool.query(getallstudentlistforthissuper, (err, res) => {
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    var ans = json;
                    resolve(ans)
                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.genavailble.getallstudentlistforthissuper"
            })
            //console.log(">>studentlistforthissupervisor", studentlistforthissupervisor)

            var counttimeboxlist = new Array();
            if (studentlistforthissupervisor != 0) {
                for (var b = 0; b < studentlistforthissupervisor.length; b++) {
                    var checkavailabledup = "select count(*) as boxcount from supervisorpairstudent "
                        + "left join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid "
                        + "join studentavailable on studentavailable.sid = supervisorpairstudent.sid and studentavailable.sid =\"" + studentlistforthissupervisor[b].sid + "\" "
                        + "join supervisoravailable as sa1 on sa1.tid = supervisorpairstudent.tid and (sa1.tid = \"" + studentlistforthissupervisor[b].tid + "\" or sa1.tid = \"" + studentlistforthissupervisor[b].colleague + "\") "
                        + "and sa1.availabledate = studentavailable.availabledate and sa1.availablestartTime = studentavailable.availablestartTime "
                        + "join supervisoravailable as sa2 on sa2.tid = observerpairstudent.oid and sa1.availabledate = sa2.availabledate and sa1.availablestartTime = sa2.availablestartTime  "
                        + "and (sa2.tid = \"" + studentlistforthissupervisor[b].colleague + "\" or sa2.tid = \"" + studentlistforthissupervisor[b].tid + "\");"
                    //console.log(checkavailabledup)
                    var availblelist = await new Promise((resolve) => {
                        pool.query(checkavailabledup, (err, res) => {
                            var string = JSON.stringify(res);
                            var json = JSON.parse(string);
                            var ans = json;
                            resolve(ans)
                        })
                    }).catch((err) => {
                        errmsg = "error happened in ScheduleController.genavailble.checkavailabledup"
                    })
                    
                    counttimeboxlist.push(JSON.parse(JSON.stringify({ "sid": studentlistforthissupervisor[b].sid, "tid": studentlistforthissupervisor[b].tid, "oid": studentlistforthissupervisor[b].colleague, "availblelist": parseInt(availblelist[0].boxcount) })));
                }

                counttimeboxlist.sort((a, b) => {
                    return a.availblelist - b.availblelist;
                })
                console.log("countimeboxlist all after sort",counttimeboxlist)


                for (var b = 0; b < counttimeboxlist.length; b++) {
                    
                    var added = false;
                    var index = 0;

                    for (var c = 0; c < thisschedulebox.length; c++) {
                        //console.log(thisschedulebox[c])
                        var presentday = thisschedulebox[c].date;
                        var checker = thisschedulebox[c].prefno;
                        if (checker == "") {
                            checker = 0;
                        } else {
                            checker = parseInt(thisschedulebox[c].prefno);
                        }
                        //console.log(thisschedulebox);

                        //console.log(">>presentday", presentday, "  ", counttimeboxlist[b].sid, "  ", checker, "  ", thisschedulebox[c].schedule.length)


                        if (thisschedulebox[c].schedule.length != checker || (checker == "0")) {
                            while (!added) {
                                function appendquery(thisschedulebox) {
                                    var checkavailabledup = "select supervisorpairstudent.tid , supervisorpairstudent.sid , observerpairstudent.oid, studentavailable.availabledate, studentavailable.availablestartTime, studentavailable.availableendTime from supervisorpairstudent "
                                        + "left join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid "
                                        + "join studentavailable on studentavailable.sid = supervisorpairstudent.sid and studentavailable.sid =\"" + counttimeboxlist[b].sid + "\" "
                                        + "and studentavailable.availabledate =\"" + presentday + "\""
                                    for (var z = 0; z < thisschedulebox[c].schedule.length; z++) {
                                        var timestamp = new Date(thisschedulebox[c].schedule[z].availablestartTime);
                                        //     console.log(timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB"))
                                        checkavailabledup += "and studentavailable.availablestarttime != \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\" "
                                    }
                                    checkavailabledup += "join supervisoravailable as sa1 on sa1.tid = supervisorpairstudent.tid and (sa1.tid = \"" + counttimeboxlist[b].tid + "\" or sa1.tid = \"" + counttimeboxlist[b].oid + "\") "
                                        + "and sa1.availabledate = studentavailable.availabledate and sa1.availablestartTime = studentavailable.availablestartTime "
                                        + "join supervisoravailable as sa2 on sa2.tid = observerpairstudent.oid and sa1.availabledate = sa2.availabledate and sa1.availablestartTime = sa2.availablestartTime  "
                                        + "and (sa2.tid = \"" + counttimeboxlist[b].oid + "\" or sa2.tid = \"" + counttimeboxlist[b].tid + "\")"
                                    // console.log(checkavailabledup);
                                    return checkavailabledup;
                                }

                                var checkavailabledup = appendquery(thisschedulebox);
                                //console.log(checkavailabledup)
                                var checkscheduleboxlist = await new Promise((resolve) => {
                                    pool.query(checkavailabledup, (err, res) => {
                                        var string = JSON.stringify(res);
                                        var json = JSON.parse(string);
                                        var ans = json;
                                        resolve(ans)
                                    })
                                }).catch((err) => {
                                    errmsg = "error happened in ScheduleController.genavailble.checkavailabledup"
                                })

                                //console.log(">>checkscheduleboxlist", checkscheduleboxlist[0])
                                if (checkscheduleboxlist[0] == undefined) {
                                    //console.log(supervisorlist[a].tid, "  ", checkavailabledup)
                                    index++;




                                    //console.log("this fail", counttimeboxlist[b].sid)

                                    var manualhandleline = "insert into manualhandlecase values(\"" + counttimeboxlist[b].sid + "\",\"" + counttimeboxlist[b].tid + "\",\"" + counttimeboxlist[b].oid + "\")"

                                    db.query(manualhandleline, (err, res) => {
                                        try { console.log("inserted manual handlecase") } catch (err) {
                                            console.log("error happened in inserting ScheduleController.genavailble.manualhandleline")
                                        }
                                    })


                                    break;
                                } else {
                                    thisschedulebox[c].schedule.push(checkscheduleboxlist[0])
                                    //console.log(">>see see ", thisschedulebox[c].schedule)
                                    added = true;
                                    //console.log("this pass", counttimeboxlist[b].sid)
                                }

                            }
                        } else {
                            if (checker == "0") {
                                console.log("need to handle this ppl 1", counttimeboxlist[b].sid)
                            } else if (thisschedulebox[c].schedule.length == parseInt(checker)) {
                                console.log("need to handle this ppl 2", counttimeboxlist[b].sid)
                            }

                        }
                        if (added) {
                            checker++;
                            var deletemanualhandleline = "delete from manualhandlecase where sid = \"" + counttimeboxlist[b].sid + "\";";

                            db.query(deletemanualhandleline, (err, res) => {
                                try { console.log("deleteed manual handlecase") } catch (err) {
                                    console.log("error happened in inserting ScheduleController.genavailble.deletemanualhandleline")
                                }
                            })
                            break;
                        } else {
                            console.log("need to handle this ppl manually", counttimeboxlist[b].sid);
                        }
                    }
                }
                
console.log(">> final schedulebox",thisschedulebox)




                for (var c = 0; c < thisschedulebox.length; c++) {
                    for (var e = 0; e < thisschedulebox[c].schedule.length; e++) {
                        var campus = "";
                        var room = "";
                        //  console.log(thisschedulebox[c].schedule[e].tid, " ", thisschedulebox[c].schedule[e].oid, " ", thisschedulebox[c].date);
                        var timestamp = new Date(thisschedulebox[c].schedule[e].availablestartTime);

                        var delavailabletimequery = "delete from supervisoravailable where (tid = \"" + thisschedulebox[c].schedule[e].tid + "\" or tid = \"" + thisschedulebox[c].schedule[e].oid + "\") and availablestartTime = \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\"; "
                        // + "delete from studentavailable where sid = \"" + thisschedulebox[c].schedule[e].sid + "\" and availablestartTime = \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\";"
                        //console.log(delavailabletimequery)
                        db.query(delavailabletimequery, (err, result) => {
                            try {
                                //   console.log("delavailabletimequery complete")
                            } catch (err) {
                                if (err) {
                                    errmsg = "error happened in ScheduleController.delavailabletimequery"
                                }
                            }

                        })
                        delavailabletimequery = "delete from studentavailable where sid = \"" + thisschedulebox[c].schedule[e].sid + "\" and availablestartTime = \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\";"
                        //console.log(delavailabletimequery)
                        db.query(delavailabletimequery, (err, result) => {
                            try {
                                console.log("delavailabletimequery complete")
                            } catch (err) {
                                if (err) {
                                    errmsg = "error happened in ScheduleController.delavailabletimequery"
                                }
                            }

                        })

                        var getcampusandroomquery = "select t2.cid,pid,priority, campus,rid,startTime,endTime from (select * from (select * from allsupertakecourse where (pid = \"" + thisschedulebox[c].schedule[e].tid + "\" or pid = \"" + thisschedulebox[c].schedule[e].oid + "\")) as t1 left join supervisor on supervisor.tid = t1.pid )as t2 left join allclass on allclass.cid = t2.CID where weekdays = \"" + timestamp.getDay() + "\" order by t2.priority asc, startTime asc, Campus asc , RID asc"
                        // console.log(getcampusandroomquery)
                        var checkcampusandroom = await new Promise((resolve) => {
                            pool.query(getcampusandroomquery, (err, res) => {
                                var string = JSON.stringify(res);
                                var json = JSON.parse(string);
                                var ans = json;
                                resolve(ans)
                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.getcampusandroomquery"
                        })

                        if (checkcampusandroom.length > 0) {
                            campus = checkcampusandroom[0].campus
                        } else {

                            getcampusandroomquery = "select * from classroom where Campus != \"\""
                            var checkcampusandroom = await new Promise((resolve) => {
                                pool.query(getcampusandroomquery, (err, res) => {
                                    var string = JSON.stringify(res);
                                    var json = JSON.parse(string);
                                    var ans = json;
                                    resolve(ans)
                                })
                            }).catch((err) => {
                                errmsg = "error happened in ScheduleController.genavailble.getcampusandroomquery"
                            })
                            campus = checkcampusandroom[0].Campus
                        }
                        // console.log(campus + "   hello")

                        getcampusandroomquery = "select * from classroom where Campus =\"" + campus + "\" and status=\"Open\" "
                            + " and rid not in (select rid from allclassroomtimeslot where Campus = \"" + campus + "\" and startdate = \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + "\" and (starttime < Time(\"" + timestamp.toLocaleTimeString("en-GB") + "\")< endtime))"
                            + " and rid not in(select rid from allclass where Campus = \"" + campus + "\" and weekdays = \"" + timestamp.getDay() + "\" and (starttime < Time(\"" + timestamp.toLocaleTimeString("en-GB") + "\")< endtime))"
                        // console.log(getcampusandroomquery);

                        var checkcampusandroom = await new Promise((resolve) => {
                            pool.query(getcampusandroomquery, (err, res) => {
                                var string = JSON.stringify(res);
                                var json = JSON.parse(string);
                                var ans = json;
                                resolve(ans)
                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.getcampusandroomquery"
                        })
                        // console.log(checkcampusandroom)
                        if (checkcampusandroom.length > 0) {
                            room = checkcampusandroom[0].RID;
                        } else {
                            room = "ooops"
                        }
                        // console.log(campus + "    " + room)
                        let boxid = 'boxID';
                        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                        const charactersLength = characters.length;
                        let counter = 0;
                        while (counter < 15) {
                            boxid += characters.charAt(Math.floor(Math.random() * charactersLength));
                            counter += 1;
                        }
                        var insertscheduleboxquery = "insert into allschedulebox values(\"" + boxid + "\",\"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\",\"" + req.body.typeofpresent + "\","
                            + "\"" + thisschedulebox[c].schedule[e].tid + "\",\"" + thisschedulebox[c].schedule[e].sid + "\",\"" + thisschedulebox[c].schedule[e].oid + "\","
                            + "\"" + campus + "\",\"" + room + "\", now()) ;"
                        //console.log(insertscheduleboxquery)

                        var insertbox = await new Promise((resolve) => {
                            pool.query(insertscheduleboxquery, (err, res) => {
                                resolve(res)
                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.insertscheduleboxquery"
                        })
                        /** 
                                                var updatesupervisordraft = "update supervisor set draft = \"Y\" where tid = \"" + thisschedulebox[c].schedule[e].tid + "\""
                                                //console.log(updatesupervisordraft)
                                                insertbox = await new Promise((resolve) => {
                                                    pool.query(updatesupervisordraft, (err, res) => {
                                                        resolve(res)
                                                    })
                                                }).catch((err) => {
                                                    errmsg = "error happened in ScheduleController.genavailble.updatesupervisordraft"
                                                })
                        */
                    }

                }


            }
        }


        return res.ok();
    },


    /**
        savebox: async function (req, res) {
            var db = await sails.helpers.database();
            // console.log(req.body.boxlist);
            var boxlist = req.body.boxlist;
            updatesupdraftexist = "Update supervisor set draft= \"Y\" where tid = \"" + boxlist[0].tid + "\"";
            
            db.query( updatesupdraftexist, (err, results) => {
                if (err) { return res.status(401).json("Error happened when excuting ScheduleController.savebox.updatesupdraftexist") };
            });
     
            for (var a = 0; a < boxlist.length; a++) {
                updateobsdraftexist = "Update supervisor set draft= \"Y\" where tid = \"" + boxlist[a].oid + "\"";
                
                db.query(updateobsdraftexist, (err, results) => {
                    if (err) { return res.status(401).json("Error happened when excuting ScheduleController.savebox.updateobsdraftexist") };
                });
                
                boxid = "" + (boxlist[a].presentday.split("T"))[0] + "_" + boxlist[a].presentstartTime;
    
                insertline = "insert ignore into allschedulebox values(\"" + boxid + "\",\"" + boxlist[a].presentday + "\",\"" + boxlist[a].presentstartTime + "\",\"" + boxlist[a].tid + "\",\"" + boxlist[a].sid + "\",\"" + boxlist[a].oid + "\",\"" + boxlist[a].finalcampus + "\",\"" + boxlist[a].finalrid + "\",now())";
                updateline = "Update allschedulebox set boxdate = \"" + boxlist[a].presentday + "\", boxtime = \"" + boxlist[a].presentstartTime + "\" ,SID =\"" + boxlist[a].sid + "\", OID = \"" + boxlist[a].oid + "\", Campus = \"" + boxlist[a].finalcampus + "\", RID = \"" + boxlist[a].finalrid + "\", LastUpdate = now() where boxid = \"" + boxid + "\"";
                console.log(boxid)
                console.log(insertline)
                console.log(updateline)
               
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
             
    
            }
    
         
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
    
    
            console.log(supervisorlist)
            return res.ok();
        },
     */


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

    supervisorschedulelist: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var query = "select *  from supervisor"
        db.query(query, function (err, result) {
            try {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                var ans = json;
                //console.log(ans)
                return res.view("user/admin/supervisorschedulelist", { allsuplist: ans })
            } catch (err) {
                return res.status(400).json("error happened in SchdeuleController.supervisorschedulelist.query")
            }
        })
    },

    retrievesinglesupervisorschedule: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        console.log(req.query)
        query = "select * from allsupersetting where typeofsetting = 3;"
        var setting3 = await new Promise((resolve) => {
            pool.query(query, (err, res) => {
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
                    ans = { startday: startday, endday: endday };
                }
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.retrievesinglesupervisorschedule.getsetting3"
        })
        
        
        var displaystartday = new Date(setting3.startday.getTime() - 60 * 60 * 24 * 1000 * setting3.startday.getDay() + 60 * 60 * 24 * 1000 * (req.query.Page - 1) * 7);
        var displayendday = new Date(setting3.startday.getTime() + 60 * 60 * 24 * 1000 * (6 - setting3.startday.getDay()) + 60 * 60 * 24 * 1000 * (req.query.Page - 1) * 7);
        displayendday.setHours(18);
        displayendday.setMinutes(30);
        var startday = displaystartday.toLocaleDateString('en-GB').split('/').reverse().join('-');
        var endday = new Date(displayendday.getTime()+60*60*24*1000).toLocaleDateString('en-GB').split('/').reverse().join('-');
        console.log(displaystartday,"  ",displaystartday.toLocaleTimeString("en-GB"),"  display from  ",displayendday,"  ",displayendday.toLocaleTimeString("en-GB"))

        var query = "select * from allschedulebox where (tid = \"" + req.query.id + "\" or oid =  \"" + req.query.id + "\" ) and (boxdate >= date(\"" + startday + "\") and boxdate <= date(\"" + endday + "\") ) order by boxdate asc;"
        console.log(query)
        var boxesforthissupervisor = await new Promise((resolve) => {
            pool.query(query, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.retrievesinglesupervisorschedule.getboxforthissupervisor"
        })
        if (boxesforthissupervisor.length == 0) {
            query = "select distinct(type) from allschedulebox;"
            type = await new Promise((resolve) => {
                pool.query(query, (err, res) => {
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    var ans = json;
                    if(ans.length>0){
                        ans = ans[0].type
                    }
                    resolve(ans)
                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.retrievesinglesupervisorschedule.gettype"
            })
        } else {
            type = boxesforthissupervisor[0].TYPE;
        }

        query = "select * from allrequestfromsupervisor where tid = \"" + req.query.id + "\"  and (RequestDate >= date(\"" + startday + "\") and RequestDate <= date(\"" + endday + "\") ) order by requestdate asc, requeststarttime asc";
        var requestforthissupervisor = await new Promise((resolve) => {
            pool.query(query, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.retrievesinglesupervisorschedule.getrequestforthissupervisor"
        })

        query = "select allclass.cid,weekdays,starttime,endtime,campus,rid from (select * from allsupertakecourse where pid = \"" + req.query.id + "\") as t1 left join allclass on t1.cid = allclass.cid order by weekdays asc, allclass.starttime asc;";
        var ttbforthissupervisor = await new Promise((resolve) => {
            pool.query(query, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.retrievesinglesupervisorschedule.getttbforthissupervisor"
        })

        query = "select * from manualhandlecase where tid = \"" + req.query.id + "\" or oid = \"" + req.query.id + "\"";
        var manualhandlecaseforthissupervisor = await new Promise((resolve) => {
            pool.query(query, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.retrievesinglesupervisorschedule.manualhandlecaseforthissupervisor"
        })




        console.log(boxesforthissupervisor, "\n\n", requestforthissupervisor, "\n\n", ttbforthissupervisor)
        return res.view("user/admin/modifyschedule", {
            boxes: boxesforthissupervisor, ttb: ttbforthissupervisor,
            requestes: requestforthissupervisor, setting: setting3,
            displaystartday: displaystartday, displayendday: displayendday, Page: req.query.Page, type: type,
            manualhandlecase: manualhandlecaseforthissupervisor
        })

    },

    checksetting: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        let checkdraftexist = " select * from allschedulebox";

        db.query(checkdraftexist, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                var havedraft = json;
                console.log('>> havedraft: ', havedraft.length);
                if (havedraft.length > 0) {
                    return res.status(200).json("redirect");
                } else {
                    return res.status(200).json("go")
                }
            } catch (err) {
                return res.status(400).json("Error happened when excuting SettingController.checksetting")
            }


        });

    },

    HandleManualCase: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();

        var getCurrentBox = "Select * from allschedulebox where sid = \"" + req.query.sid + "\"; ";
        CurrentBox = await new Promise((resolve) => {
            pool.query(getCurrentBox, (err, res) => {
                if (err) { resolve(JSON.parse(JSON.stringify({ "errmsg": "error happened in ScheduleController.retrievesinglesupervisorschedule.getCurrentBox" }))) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                if (json.length > 0) {
                    var ans = json;
                    resolve(ans);
                } else {
                    resolve(null);
                }

            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.retrievesinglesupervisorschedule.getCurrentbox"
        })

        var getavailabletimes = "select t1.tid,t1.sid, observerpairstudent.oid,t1.availabledate,t1.availablestartTime,t1.availableendTime from "
            + "(select supervisorpairstudent.tid,supervisorpairstudent.sid,sa1.availabledate,sa1.availablestartTime,sa1.availableendTime "
            + "from supervisorpairstudent left join supervisoravailable as sa1 on sa1.tid = supervisorpairstudent.tid "
            + "where supervisorpairstudent.sid = \"" + req.query.sid + "\" "
            + "and (sa1.availabledate in (select availabledate from studentavailable where sid = \"" + req.query.sid + "\") "
            + "and sa1.availablestartTime in (select availablestartTime from studentavailable where sid = \"" + req.query.sid + "\") "
            + "and sa1.availableendTime in (select availableendTime from studentavailable where sid = \"" + req.query.sid + "\")) "
            + ")as t1 left join observerpairstudent on t1.sid = observerpairstudent.sid "
            + " left join supervisoravailable as sa2 on sa2.tid = observerpairstudent.oid "
            + "where (sa2.availabledate = t1.availabledate "
            + "and sa2.availablestartTime = t1.availablestartTime "
            + "and sa2.availableendTime = t1.availableendTime);"

        availableCombination = await new Promise((resolve) => {
            pool.query(getavailabletimes, (err, res) => {
                if (err) { resolve(JSON.parse(JSON.stringify({ "errmsg": "error happened in ScheduleController.retrievesinglesupervisorschedule.availableCombination" }))) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);

                var ans = json;
                resolve(ans)


            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.retrievesinglesupervisorschedule.availableCombination"
        })
        if (availableCombination.errmsg == undefined) {
            return res.view("user/admin/HandleManualCase", { currentbox: CurrentBox, availableCombination: availableCombination })
        } else {
            return res.status(400).json(availableCombination.errmsg);
        }

    },

    RemoveRecords: async function (req, res) {
        const importer = await sails.helpers.importer()
        //console.log(importer)
        // Recursive function to get files
        const fs = require("fs");

        const sqlfiles = '../SQL/Standard/RemoveRecords.sql'

        await importer.import(sqlfiles);
        var files_imported = importer.getImported();
        console.log(`${files_imported.length} SQL file(s) imported.`);


        return res.status(200).json("ok");
    },

    EditRecords: async function (req,res){
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();

        if(req.body.command = "delete"){

            var query = ["delete from allschedulebox where boxid = '"+req.body.boxid+"';",
            "insert into supervisoravailable values('"+req.body.tid+"','"+req.body.date+"','"+req.body.date+" "+req.body.starttime+"','"+req.body.date+" "+req.body.endtime+"');",
            "insert into supervisoravailable values('"+req.body.oid+"','"+req.body.date+"','"+req.body.date+" "+req.body.starttime+"','"+req.body.date+" "+req.body.endtime+"');",
            "insert into studentavailable values('"+req.body.sid+"','"+req.body.date+"','"+req.body.date+" "+req.body.starttime+"','"+req.body.date+" "+req.body.endtime+"');",
            "insert into manualhandlecase values('"+req.body.sid+"','"+req.body.tid+"','"+req.body.oid+"');"]
            
            console.log("delete from allschedulebox where boxid = '"+req.body.boxid+"';");
            console.log("insert into supervisoravailable values('"+req.body.tid+"','"+req.body.date+"','"+req.body.date+" "+req.body.starttime+"','"+req.body.date+" "+req.body.endtime+"');");
            console.log("insert into supervisoravailable values('"+req.body.oid+"','"+req.body.date+"','"+req.body.date+" "+req.body.starttime+"','"+req.body.date+" "+req.body.endtime+"');");
            console.log("insert into studentavailable values('"+req.body.sid+"','"+req.body.date+"','"+req.body.date+" "+req.body.starttime+"','"+req.body.date+" "+req.body.endtime+"');");
            console.log("insert into manualhandlecase values('"+req.body.sid+"','"+req.body.tid+"','"+req.body.oid+"');");

            query.forEach(element => {
                db.query(element, (err, results) => {
                            if (err) {
                                return res.status(400).json("Error happened when excuting ScheduleController.EditRecords.delete")
                            }
                    });
            });
             
        
        }else{

        } 
        return res.status(200).json("ok");
    }
}
