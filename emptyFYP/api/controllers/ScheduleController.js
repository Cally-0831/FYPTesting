const { start } = require("repl");

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
            var today = new Date();
            console.log(">>settingdate", settingdate.toLocaleDateString(), "  ", settingdate.toLocaleTimeString("en-GB"), " ", today.toLocaleDateString(), "  ", today.toLocaleTimeString("en-GB"))
            // console.log(settingdate >= new Date())
            // console.log(settingdate >= today)
            if (settingdate <= new Date()) {

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
                        console.log("error happened in ScheduleController.viewFinalSchedule.getschedulebox\n " + getschedulebox)
                        return res.status(401).json("Sorry, encountered error");
                    }
                });
            } else {
                return res.status(401).json("The Schedule will not be disclosed until the disclosing date\n " + "Date : " + setting.deadlinedate.split("T")[0] + "\nTime : " + setting.deadlinetime);
            }
        } else {
            console.log(setting.errmsg);
            return res.status(401).json("Sorry, encountered error");
        }

    },

    genAvailable: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        console.log(req.body);

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

        for (var a = 0; a < hvrecordbutnosubmitstudent.length; a++) {
            var deleteline = "delete from allstudenttakecourse where pid = \"" + hvrecordbutnosubmitstudent[a].sid + "\" and (confirmation = \"0\" or confirmation = \"3\");"
            //console.log(deleteline)
            db.query(deleteline, (err, result) => {
                try {
                    //console.log("delete complete")
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
                    //console.log("insert complete")
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
                    //console.log("update complete")
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
        //console.log(studentlist)

        for (var a = 0; a < studentlist.length; a++) {
            //try enroll all of them to EMPTY
            var insertemptyline = "insert ignore into alltakecourse values(\"EMPTY_\",\"" + studentlist[a].sid + "\");"
            //console.log(insertemptyline)
            db.query(insertemptyline, (err, result) => {
                try {
                    //console.log("insert complete")
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
                    //console.log("update complete")
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
                //console.log("update complete")
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
                //console.log("update complete")
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

        //Generate studentavailable
        for (var a = 0; a < studentlist.length; a++) {

            var currentgeneratedate = new Date(setting3.startday);
            var currentgeneratedateend = new Date(setting3.startday);

            while (currentgeneratedate < new Date(setting3.endday)) {

                var supervisorttblist;
                var supervisorrequest;



                if (req.body.typeofpresent == "midterm") {
                    // console.log()
                    currentgeneratedateend = new Date(currentgeneratedate.getTime() + 25 * 60 * 1000);

                    var datestring = currentgeneratedate.getFullYear() + "-" + (currentgeneratedate.getMonth() + 1) + "-" + currentgeneratedate.getDate();
                    /**midterm no need to check stu midterm */
                    // var boolcheckttb = false;

                    var boolcheckreq = false;


                    /**midterm no need to check stu midterm */
                    // var getcheckstudentttb = "select * from allstudenttakecourse left join allclass on allclass.cid = allstudenttakecourse.cid  where pid = \"" + studentlist[a].sid + "\" and weekdays = \"" + currentgeneratedate.getDay() + "\" and (starttime <= Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and endtime >= time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\")) order by pid asc, weekdays asc,startTime asc"
                    // studentttblist = await new Promise((resolve) => {
                    //     pool.query(getcheckstudentttb, (err, res) => {
                    //         var string = JSON.stringify(res);
                    //         var json = JSON.parse(string);
                    //         var ans = json;
                    //         resolve(ans)
                    //     })
                    // }).catch((err) => {
                    //     errmsg = "error happened in ScheduleController.genavailble.getcheckstudentttb"
                    // })
                    // if (studentttblist == null || studentttblist == undefined || studentttblist.length == 0) {
                    //     boolcheckttb = true;
                    // }


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



                    /**midterm no need to check stu midterm */
                    // if (boolcheckreq && boolcheckttb) {
                    if (boolcheckreq) {
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

                    var checkdate1 = new Date();
                    checkdate1.setHours(setting3.endday.getHours());
                    checkdate1.setMinutes(setting3.endday.getMinutes());
                    checkdate1.setSeconds(setting3.endday.getSeconds());

                    var checkdate2 = new Date();
                    checkdate2.setHours(currentgeneratedate.getHours());
                    checkdate2.setMinutes(currentgeneratedate.getMinutes());
                    checkdate2.setSeconds(currentgeneratedate.getSeconds());



                    // console.log(checkdate1.toLocaleTimeString("en-GB") ,"  ", checkdate2.toLocaleTimeString("en-GB") , "endend")

                    // console.log(checkdate1.getTime() - 30*60*1000 - checkdate2.getTime()<=30*60*1000  , "endend")

                    if (checkdate1.getTime() - 25 * 60 * 1000 - checkdate2.getTime() < 25 * 60 * 1000) {

                        // if (currentgeneratedate.toLocaleTimeString("en-GB") == "18:00:00") {
                        if (currentgeneratedate.getDay() != 6) {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours(9);
                            currentgeneratedate.setMinutes(30);
                            currentgeneratedate.setSeconds(0);
                            // currentgeneratedate.setHours(setting3.startday.getHours());
                            // currentgeneratedate.setMinutes(setting3.startday.getMinutes());
                            // currentgeneratedate.setSeconds(setting3.startday.getSeconds())
                        } else {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 2 * 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours(9);
                            currentgeneratedate.setMinutes(30);
                            currentgeneratedate.setSeconds(0);
                            // currentgeneratedate.setHours(setting3.startday.getHours());
                            // currentgeneratedate.setMinutes(setting3.startday.getMinutes());
                            // currentgeneratedate.setSeconds(setting3.startday.getSeconds())
                        }



                    } else {
                        currentgeneratedate.setTime(currentgeneratedate.getTime() + 25 * 60 * 1000);
                    }
                    // console.log("midterm check ",currentgeneratedate.toLocaleString(),"  ",currentgeneratedateend.toLocaleString())





                } else if (req.body.typeofpresent == "final") {
                    currentgeneratedateend = new Date(currentgeneratedate.getTime() + 45 * 60 * 1000);

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

                    var checkdate1 = new Date();
                    checkdate1.setHours(setting3.endday.getHours());
                    checkdate1.setMinutes(setting3.endday.getMinutes());
                    checkdate1.setSeconds(setting3.endday.getSeconds());

                    var checkdate2 = new Date();
                    checkdate2.setHours(currentgeneratedate.getHours());
                    checkdate2.setMinutes(currentgeneratedate.getMinutes());
                    checkdate2.setSeconds(currentgeneratedate.getSeconds());



                    // console.log(checkdate1.toLocaleTimeString("en-GB"), "  ", checkdate2.toLocaleTimeString("en-GB"), "endend")
                    // console.log(checkdate1.getTime() - checkdate2.getTime(), "endend")
                    // console.log(checkdate1.getTime() - checkdate2.getTime() < 45 * 60 * 1000, "endend")
                    if (checkdate1.getTime() - checkdate2.getTime() <= 45 * 60 * 1000) {
                        if (currentgeneratedate.getDay() != 6) {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours(9);
                            currentgeneratedate.setMinutes(30);
                            currentgeneratedate.setSeconds(0);
                            // currentgeneratedate.setHours(setting3.startday.getHours());
                            // currentgeneratedate.setMinutes(setting3.startday.getMinutes());
                            // currentgeneratedate.setSeconds(setting3.startday.getSeconds())
                        } else {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 2 * 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours(9);
                            currentgeneratedate.setMinutes(30);
                            currentgeneratedate.setSeconds(0);
                            // currentgeneratedate.setHours(setting3.startday.getHours());
                            // currentgeneratedate.setMinutes(setting3.startday.getMinutes());
                            // currentgeneratedate.setSeconds(setting3.startday.getSeconds())
                        }

                    } else {
                        currentgeneratedate.setTime(currentgeneratedate.getTime() + 45 * 60 * 1000);
                    }



                    // console.log("final check ",currentgeneratedate.toLocaleString(),"  ",currentgeneratedateend.toLocaleString())
                    //  console.log(currentgeneratedate.toLocaleDateString("en-GB") + "   " + currentgeneratedate.toLocaleTimeString("en-GB"))

                }

            }
        }
        //Generate supervisioravailable
        for (var a = 0; a < supervisorlist.length; a++) {
            //console.log(supervisorlist[a]);
            var currentgeneratedate = new Date(setting3.startday);
            var currentgeneratedateend = new Date(setting3.startday);
            while (currentgeneratedate < new Date(setting3.endday)) {

                var supervisorttblist;
                var supervisorrequest;

                if (req.body.typeofpresent == "midterm") {
                    //console.log("midterm")
                    currentgeneratedateend = new Date(currentgeneratedate.getTime() + 25 * 60 * 1000);
                    var datestring = currentgeneratedate.getFullYear() + "-" + (currentgeneratedate.getMonth() + 1) + "-" + currentgeneratedate.getDate();
                    /**midterm no need to check stu midterm */
                    // var boolcheckttb = false;

                    var boolcheckreq = false;

                    var getchecksupervisorttb = "select * from allsupertakecourse left join allclass on allclass.cid = allsupertakecourse.cid  where confirmation = 1 and pid = \"" + supervisorlist[a].tid + "\" and weekdays = \"" + currentgeneratedate.getDay() + "\" and (starttime <= Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and endtime >= time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\")) order by pid asc, weekdays asc,startTime asc"
                    // console.log(getchecksupervisorttb);

                    /**midterm no need to check stu midterm */
                    // supervisorttblist = await new Promise((resolve) => {
                    //     pool.query(getchecksupervisorttb, (err, res) => {
                    //         var string = JSON.stringify(res);
                    //         var json = JSON.parse(string);
                    //         var ans = json;
                    //         resolve(ans)
                    //     })
                    // }).catch((err) => {
                    //     errmsg = "error happened in ScheduleController.genavailble.getsupervisorttblist"
                    // })
                    // if (supervisorttblist.length == 0 || supervisorttblist == null || supervisorttblist == undefined) {
                    //     boolcheckttb = true;
                    // }

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
                    /**midterm no need to check stu midterm */
                    // if (boolcheckreq && boolcheckttb) {
                    if (boolcheckreq) {
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



                    var checkdate1 = new Date();
                    checkdate1.setHours(setting3.endday.getHours());
                    checkdate1.setMinutes(setting3.endday.getMinutes());
                    checkdate1.setSeconds(setting3.endday.getSeconds());

                    var checkdate2 = new Date();
                    checkdate2.setHours(currentgeneratedate.getHours());
                    checkdate2.setMinutes(currentgeneratedate.getMinutes());
                    checkdate2.setSeconds(currentgeneratedate.getSeconds());



                    // console.log(checkdate1.toLocaleTimeString("en-GB") ,"  ", checkdate2.toLocaleTimeString("en-GB") , "endend")

                    // console.log((checkdate1.getTime() - 30*60*1000) - checkdate2.getTime()<=30*60*1000 , "endend")

                    if (checkdate1.getTime() - 25 * 60 * 1000 - checkdate2.getTime() < 25 * 60 * 1000) {

                        // if (currentgeneratedate.toLocaleTimeString("en-GB") == "18:00:00") {
                        if (currentgeneratedate.getDay() != 6) {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours(9);
                            currentgeneratedate.setMinutes(30);
                            currentgeneratedate.setSeconds(0);
                            // currentgeneratedate.setHours(setting3.startday.getHours());
                            // currentgeneratedate.setMinutes(setting3.startday.getMinutes());
                            // currentgeneratedate.setSeconds(setting3.startday.getSeconds())
                        } else {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 2 * 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours(9);
                            currentgeneratedate.setMinutes(30);
                            currentgeneratedate.setSeconds(0);
                            // currentgeneratedate.setHours(setting3.startday.getHours());
                            // currentgeneratedate.setMinutes(setting3.startday.getMinutes());
                            // currentgeneratedate.setSeconds(setting3.startday.getSeconds())
                        }



                    } else {
                        currentgeneratedate.setTime(currentgeneratedate.getTime() + 25 * 60 * 1000);
                    }
                    // console.log("midterm check ",currentgeneratedate.toLocaleString(),"  ",currentgeneratedateend.toLocaleString())


                } else if (req.body.typeofpresent == "final") {
                    //console.log("final")
                    currentgeneratedateend = new Date(currentgeneratedate.getTime() + 45 * 60 * 1000);

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


                    var checkdate1 = new Date();
                    checkdate1.setHours(setting3.endday.getHours());
                    checkdate1.setMinutes(setting3.endday.getMinutes());
                    checkdate1.setSeconds(setting3.endday.getSeconds());

                    var checkdate2 = new Date();
                    checkdate2.setHours(currentgeneratedate.getHours());
                    checkdate2.setMinutes(currentgeneratedate.getMinutes());
                    checkdate2.setSeconds(currentgeneratedate.getSeconds());



                    // console.log(checkdate1.toLocaleTimeString("en-GB"), "  ", checkdate2.toLocaleTimeString("en-GB"), "endend")
                    // console.log(checkdate1.getTime() - checkdate2.getTime(), "endend")
                    // console.log(checkdate1.getTime() - checkdate2.getTime() < 45 * 60 * 1000, "endend")
                    if (checkdate1.getTime() - checkdate2.getTime() <= 45 * 60 * 1000) {



                        if (currentgeneratedate.getDay() != 6) {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours(9);
                            currentgeneratedate.setMinutes(30);
                            currentgeneratedate.setSeconds(0);
                            // currentgeneratedate.setHours(setting3.startday.getHours());
                            // currentgeneratedate.setMinutes(setting3.startday.getMinutes());
                            // currentgeneratedate.setSeconds(setting3.startday.getSeconds())
                        } else {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 2 * 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours(9);
                            currentgeneratedate.setMinutes(30);
                            currentgeneratedate.setSeconds(0);
                            // currentgeneratedate.setHours(setting3.startday.getHours());
                            // currentgeneratedate.setMinutes(setting3.startday.getMinutes());
                            // currentgeneratedate.setSeconds(setting3.startday.getSeconds())
                        }
                    } else {
                        currentgeneratedate.setTime(currentgeneratedate.getTime() + 45 * 60 * 1000);
                    }
                }

            }
        }

        var pairinglist = await new Promise((resolve) => {
            pool.query("select tid, supervisorpairstudent.sid,oid from supervisorpairstudent left join observerpairstudent on observerpairstudent.sid = supervisorpairstudent.sid ;", (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.genavailble.paringlist"
        })
        // console.log(pairinglist)

        for (var a = 0; a < pairinglist.length; a++) {
            //console.log("select supavaTID.tid, studentavailable.sid,supavaOID.tid as oid, studentavailable.availabledate, studentavailable.availablestarttime,studentavailable.availableendtime from studentavailable left join supervisorpairstudent on supervisorpairstudent.sid = studentavailable.sid left join supervisoravailable as supavaTID on supavaTID.tid = supervisorpairstudent.tid  left join observerpairstudent on observerpairstudent.sid = studentavailable.sid left join supervisoravailable as supavaOID on supavaOID.tid = observerpairstudent.oid where supavaTID.availablestartTime = studentavailable.availablestartTime and supavaOID.availablestartTime = supavaTID.availablestartTime "
            //+ "and studentavailable.sid = \"" + pairinglist[a].sid + "\" and supavaTID.tid = \"" + pairinglist[a].tid + "\" and supavaOID.tid = \"" + pairinglist[a].oid + "\";")
            var addthreepartyAva = await new Promise((resolve) => {
                pool.query(
                    "select supavaTID.tid, studentavailable.sid,supavaOID.tid as oid, studentavailable.availabledate, studentavailable.availablestarttime,studentavailable.availableendtime from studentavailable left join supervisorpairstudent on supervisorpairstudent.sid = studentavailable.sid left join supervisoravailable as supavaTID on supavaTID.tid = supervisorpairstudent.tid  left join observerpairstudent on observerpairstudent.sid = studentavailable.sid left join supervisoravailable as supavaOID on supavaOID.tid = observerpairstudent.oid where supavaTID.availablestartTime = studentavailable.availablestartTime and supavaOID.availablestartTime = supavaTID.availablestartTime "
                    + "and studentavailable.sid = \"" + pairinglist[a].sid + "\" and supavaTID.tid = \"" + pairinglist[a].tid + "\" and supavaOID.tid = \"" + pairinglist[a].oid + "\";"
                    , (err, res) => {
                        var string = JSON.stringify(res);
                        var json = JSON.parse(string);
                        var ans = json;
                        resolve(ans)
                    })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.genavailble.paringlist"
            })
            // console.log(">>addthreepartyAVA", addthreepartyAva);

            addthreepartyAva.forEach(threepartyava => {
                var availabledate = ((new Date(threepartyava.availabledate)).toLocaleDateString("en-GB")).split("/");
                threepartyava.availabledate = availabledate[2] + "-" + availabledate[1] + "-" + availabledate[0];

                threepartyava.availablestarttime = threepartyava.availabledate + " " + (new Date(threepartyava.availablestarttime)).toLocaleTimeString("en-GB");
                threepartyava.availableendtime = threepartyava.availabledate + " " + (new Date(threepartyava.availableendtime)).toLocaleTimeString("en-GB");
                //console.log("insert into threeparty (tid,sid,oid,availabledate,availablestarttime,availableendtime) values(\"" + threepartyava.tid + "\",\"" + threepartyava.sid + "\",\"" + threepartyava.oid + "\",Date(\"" + threepartyava.availabledate + "\"),Timestamp(\"" + threepartyava.availablestarttime + "\"),timestamp(\"" + threepartyava.availableendtime + "\")) ");
                db.query("insert into threeparty (tid,sid,oid,availabledate,availablestarttime,availableendtime) values(\"" + threepartyava.tid + "\",\"" + threepartyava.sid + "\",\"" + threepartyava.oid + "\",Date(\"" + threepartyava.availabledate + "\"),Timestamp(\"" + threepartyava.availablestarttime + "\"),timestamp(\"" + threepartyava.availableendtime + "\")) ", (err, result) => {
                    try {

                    } catch (err) {
                        if (err) {
                            errstring = "";
                            errstring += "error happened for:" + threepartyava + "\n"
                            statuscode = 401;
                        }
                        console.log(errstring);
                    }

                })


            });
            // console.log("all gen ok")
        }
        console.log("all gen ok all")


        return res.redirect("/scheduledesign/startschedule?typeOfPresent=" + req.body.typeofpresent)
    },

    startScheduling: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var setting3 = await new Promise((resolve) => {
            pool.query("select * from  allsupersetting where typeofsetting = 3 and Announcetime is not null;", (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans;
                if (json.length > 0) {
                    var presentstartdate = new Date(json[0].startdate);
                    var presentenddate = new Date(json[0].enddate);
                    var presentstarttime = json[0].starttime;
                    var presentendtime = json[0].endtime;
                    ans = JSON.parse(JSON.stringify({
                        presentstartdate: presentstartdate,
                        presentenddate: presentenddate,
                        presentstarttime: presentstarttime,
                        presentendtime: presentendtime
                    }))
                }
                ans.presentstartdate = new Date(ans.presentstartdate);
                ans.presentenddate = new Date(ans.presentenddate);
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.startScheduling.setting3"
        })
        // console.log(setting3)

        // gen combination of date for possible plans
        var presentperiod = new Array();
        var possibledatecombination = new Array();
        var designdate = new Date();
        designdate.setTime(setting3.presentstartdate.getTime());
        // console.log(">>designdate", designdate.toLocaleDateString("en-GB")," ",designdate.toLocaleTimeString("en-GB"));
        while (designdate.toLocaleDateString("en-GB") != setting3.presentenddate.toLocaleDateString("en-GB")) {
            // console.log(">>designdate2", designdate.toLocaleDateString("en-GB")," ",designdate.toLocaleTimeString("en-GB"));
            if (designdate.getDay() != 0) {
                presentperiod.push(designdate);
            }

            // console.log(">>presentperiod ",presentperiod);
            // presentperiod.forEach(item=>{
            //     console.log(">>designdate3 ", item.toLocaleDateString("en-GB")," ",item.toLocaleTimeString("en-GB"));
            // })
            // console.log("\n");
            designdate = new Date(designdate.getTime() + 60 * 60 * 24 * 1000);
            // console.log(">>designdate", designdate.toLocaleDateString("en-GB")," ",designdate.toLocaleTimeString("en-GB"));
        }

        // console.log(">>presentperiod", presentperiod);

        function copyarray(array1) {
            var ans = new Array();
            ans = array1.slice();
            return ans;
        }

        for (var a = 0; a < presentperiod.length; a++) {
            var ans = copyarray(presentperiod);
            var combinationforthisday = new Array();
            for (var b = 0; b < a; b++) {
                ans.shift(ans[b]);
            }
            // console.log(">>after cutting top ",ans,"\n")
            for (var b = presentperiod.length - 1; b >= a; b--) {
                // console.log(">>cutting bottom ",ans,"\n")
                var copycopy = copyarray(ans);
                combinationforthisday.push(copycopy)
                // console.log(">>combinationforthisday ",combinationforthisday)
                ans.pop(ans[b]);

            }
            // console.log(">>final combinationforthisday ",combinationforthisday)
            combinationforthisday.forEach(item => { possibledatecombination.push(item); })
        }
        possibledatecombination.sort((a, b) => a.length - b.length);
        // console.log(">> final possibledatecombination ", possibledatecombination)

        var preSetClassroomList = ['FSC801C', 'FSC801D', 'FSC901C', 'FSC901D', 'RRS638']
        // console.log(">> preSetClassroomList ", preSetClassroomList);
        console.log(req.query);


        //gen based on the possibile date combinations

        function resetsessionstarttime(dateoftoday) {
            var sessionstart = new Date(dateoftoday);
            sessionstart.setHours(9);
            sessionstart.setMinutes(30);
            return sessionstart;
        }
        function resetsessionendtime(sessionstarttime) {
            var sessionend;
            if (req.query.typeOfPresent == "final") {
                sessionend = new Date(sessionstarttime.getTime() + 45 * 60 * 1000);
            } else {
                sessionend = new Date(sessionstarttime.getTime() + 25 * 60 * 1000);
            }
            return sessionend;
        }
        async function checkclassroomttb(classroom, weekday, starttime, endtime) {
            console.log("select * from  allclass where RID =\"" + classroom + "\" and weekdays = " + weekday + " and !(Time(\"" + starttime + "\") >= endTime || Time(\"" + endtime + "\") <= startTime);")
            var checking = await new Promise((resolve) => {
                pool.query("select * from  allclass where RID =\"" + classroom + "\" and weekdays = " + weekday + " and !(Time(\"" + starttime + "\") >= endTime || Time(\"" + endtime + "\") <= startTime);", (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        if (json.length > 0) {
                            //have class during the time => cant use
                            resolve(false);
                        } else {
                            //no class during the time => can use
                            resolve(true);
                        }
                    } catch (err) {
                        resolve("err");
                    }
                });
            }).catch((err) => {
                return res.status(401).json("Error happened when excuting ScheduleController,startschedule.checkclassroomttb()")
            })
            if (checking != "err") { return checking; } else { return false; }
        }

        async function checkclassroomtimeslot(classroom, dateoftoday, starttime, endtime) {
            var checking = await new Promise((resolve) => {
                pool.query("select * from  allclassroomtimeslot where RID = \"" + classroom + "\" and (time(\"" + dateoftoday + " " + starttime + "\") >= time(concat(startdate,\" \",starttime)) && time(\"" + dateoftoday + " " + endtime + "\") <= time(concat(enddate,\" \",endtime)) );", (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        if (json.length > 0) {
                            //have class during the time => cant use
                            resolve(false);
                        } else {
                            //no class during the time => can use
                            resolve(true);
                        }
                    } catch (err) {
                        resolve("err");
                    }
                });
            }).catch((err) => {
                return res.status(401).json("Error happened when excuting ScheduleController,startschedule.checkclassroomtimeslot()")
            })
            if (checking != "err") { return checking; } else { return false; }
        }

        async function getsuplist() {
            var suplist = await new Promise((resolve) => {
                pool.query("select tid, priority from supervisor order by priority asc, tid asc", (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        resolve(json);
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.retrievesinglesupervisorschedule.getrequestforthissupervisor"
            })
            if (suplist != "err") { return suplist; } else { return false; }
        }

        async function getpairinglistforthissup(tid) {
            var pairinglist = await new Promise((resolve) => {
                pool.query("select * from (select t1.oid, t1.sid,t2.priority as obspriority from observerpairstudent as t1 left join supervisor as t2 on t2.tid = t1.oid) as t4 right join (select * from supervisorpairstudent where tid = \"" + tid + "\") as t3 on t4.sid = t3.sid;", (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        resolve(json);
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.startschedule.getpairinglistforthissup"
            })
            if (pairinglist != "err") { return pairinglist; } else { return false; }
        }

        async function getprefofthissuper(tid) {
            var prefofthissup = await new Promise((resolve) => {
                pool.query("select * from allpreffromsup where tid = \"" + tid + "\";", (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        resolve(json);
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.startschedule.getprefofthissuper"
            })
            if (prefofthissup != "err") { return prefofthissup; } else { return false; }

        }

        async function getthreepartyavalist() {
            var threepartyava = await new Promise((resolve) => {
                pool.query("select * from threeparty;", (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        resolve(json);
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.startschedule.getthreepartyavalist()"
            })
            if (threepartyava != "err") { return threepartyava; } else { return false; }

        }
        async function checkanypaironlythistimeslot(currentschedule, dateoftoday, starttime) {
            var pairsonlythistimeslot = await new Promise((resolve) => {
                //select * from threeparty where sid in (select sid from threeparty where availabledate = "2024-02-19" group by tid,sid,oid,TIDPrior,OIDPrior  having count(availablestarttime) =1) and availabledate = "2024-02-19";
                pool.query("select * from threeparty where tid not in (select tid from (SELECT tid,sid,oid, TIDPrior,OIDPrior,count(*) FROM threeparty where availabledate = \"" + dateoftoday + "\" and availablestarttime != \"" + dateoftoday + " " + starttime + "\"  group by tid,sid,oid,TIDPrior,OIDPrior having count(*) >1) as t1) and availabledate = \"" + dateoftoday + "\";", (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        resolve(json);
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.startschedule.checkanypaironlythistimeslot()"
            })
            if (pairsonlythistimeslot != "err") { return pairsonlythistimeslot; } else { return false; }
        }

        async function checkanypaircanusethistimeslot(currentschedule, dateoftoday, starttime) {

            var pairscanusethistimeslot = await new Promise((resolve) => {
                pool.query("select t1.tid, t1.sid,t1.oid,t1.TIDPrior,t1.OIDPrior,threeparty.availabledate,threeparty.availablestarttime , threeparty.availableendtime from threeparty right join (SELECT tid,sid,oid, TIDPrior,OIDPrior, count(*) as counting FROM threeparty where availabledate = \"" + dateoftoday + "\" and timestamp(\"" + dateoftoday + " " + starttime + "\") group by tid,sid,oid,TIDPrior,OIDPrior having count(*) >0 ) as t1 on t1.tid = threeparty.tid and t1.sid = threeparty.sid and t1.oid = threeparty.oid where availablestarttime = \"" + dateoftoday + " " + starttime + "\" order by t1.counting asc , t1.TIDPrior asc, t1.OIDPrior asc  ;", (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        resolve(json);
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.startschedule.checkanypaironlythistimeslot()"
            })
            if (pairsonlythistimeslot != "err") { return pairsonlythistimeslot; } else { return false; }

        }

        async function checkuniquetimeslotcountforoneday(plan) {
            console.log("\n\n>>checkuniquetimeslotcountforoneday()    ", "select distinct(availablestarttime),count(*) as counting  from  threeparty where " + getallplandate(plan) + " group by availablestarttime order by counting asc  ;\n\n");
            var uniquetimeslotcounts = await new Promise((resolve) => {
                pool.query("select distinct(availablestarttime),count(*) as counting  from  threeparty where " + getallplandate(plan) + " group by availablestarttime order by counting asc  ;", (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        resolve(json);
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.startschedule.checkuniquetimeslotcountforoneday()"
            })
            if (uniquetimeslotcounts != "err") { return uniquetimeslotcounts; } else { return false; }
        }

        async function getascorderoftimecountpairlist(planNo,parallelschedule, dateoftoday, starttime) {
            // var query = "select t2.tid,t2.sid,t2.oid,t2.availabledate,t2.availablestarttime,t2.availableendtime,t1.counting from threeparty as t2 left join (select sid, availabledate,count(availabledate) as counting  from threeparty as t1 where availabledate = \"" + dateoftoday + "\" and availablestarttime >= \"" + dateoftoday + " " +starttime + "\"  group by tid,sid,oid, availabledate)as t1 on t1.sid = t2.sid and t1.availabledate = t2.availabledate  where availablestarttime = \"" + dateoftoday + " " + starttime + "\" and t2.sid in (select  sid from threeparty as t1 where availabledate = \"" + dateoftoday + "\" and  tid not in(select tid from allschedulebox where planNo = "+planNo+" ) and  oid not in(select oid from allschedulebox where planNo =  "+planNo+" ) and  sid not in(select sid from allschedulebox where planNo = "+planNo+" )   group by tid,sid,oid, availabledate) order by t1.counting asc;";
           var query = "select t2.*,t1.counting from threeparty as t2 left join (select tid,sid,oid,count(availabledate) as counting from threeparty where availabledate =\"" + dateoftoday + "\" group by tid,sid,oid,availabledate having count(*) > 0) as t1 on t1.tid = t2.tid and t1.sid = t2.sid and t2.oid = t2.oid where availablestarttime = \"" + dateoftoday + " " + starttime + "\" and t2.tid not in (select tid from allschedulebox where planno = 0 and boxdate = \"" + dateoftoday + " " + starttime + "\") and t2.oid not in (select oid from allschedulebox where planno = 0 and boxdate = \"" + dateoftoday + " " + starttime + "\") and t2.sid not in (select sid from allschedulebox where planno = 0 and boxdate = \"" + dateoftoday + " " + starttime + "\") order by t1.counting asc;"
            console.log(query);
            var pairsforthistimeslot = await new Promise((resolve) => {
                pool.query(query, (err, results) => {
                    console.log(query);
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        console.log("pairsforthistimeslot  ", results.length)
                        resolve(json);
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.startschedule.getascorderoftimecountpairlist()"
            })
            console.log("pairsforthistimeslot  ", pairsforthistimeslot.length)
            if (pairsforthistimeslot != "err") { return pairsforthistimeslot; } else { return false; }
        }
        async function getnumberofstudent() {
            var ans = await new Promise((resolve) => {
                pool.query("select count(*) as counting from student;", (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        resolve(json[0].counting);
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.startschedule.getnumberofstudent()"
            })
            if (ans != "err") { console.log(ans); return ans; } else { return false; }
        }


        function sidnotinschedulelist(currentschedule) {
            var ans = "";
            for (var a = 0; a < currentschedule.length; a++) {
                if (a != currentschedule.length - 1) {
                    ans += "sid != \"" + currentschedule[a].sid + "\" and ";
                } else {
                    ans += "sid != \"" + currentschedule[a].sid + "\" ";
                }

            }
            if (ans != "") {
                ans = "and " + ans;
                return ans;
            } else {
                return ans;
            }

        }

        function tidnotinschedulelist(currentschedule) {
            var ans = "";
            for (var a = 0; a < currentschedule.length; a++) {
                if (a != currentschedule.length - 1) {
                    ans += " tid != \"" + currentschedule[a].tid + "\" and oid != \"" + currentschedule[a].tid + "\" and ";
                    ans += " tid != \"" + currentschedule[a].oid + "\" and oid != \"" + currentschedule[a].oid + "\" and ";
                } else {
                    ans += " tid != \"" + currentschedule[a].tid + "\" and oid != \"" + currentschedule[a].tid + "\" and ";
                    ans += "tid != \"" + currentschedule[a].oid + "\" and oid != \"" + currentschedule[a].oid + "\" ";
                }
            }
            if (ans != "") {
                ans = " and " + ans;
                console.log(">tidnot up ", ans)
                return ans;
            } else {
                console.log(">tidnot down ", ans)
                return ans;
            }

        }


        function createschedulebox(planNo, tid, sid, oid, availabledate, availabletimeslot, campus, rid) {
            var thetime = new Date(availabledate);
            thetime.setHours(availabletimeslot.split(":")[0]);
            thetime.setMinutes(availabletimeslot.split(":")[1]);
            var schedulebox = JSON.parse(JSON.stringify({
                boxID: "",
                planNo: planNo,
                boxdate: thetime,
                type: req.query.typeOfPresent,
                tid: tid,
                sid: sid,
                oid: oid,
                campus: campus,
                rid: rid,
                LastUpdate: "",

            }));
            console.log(schedulebox);
            return schedulebox
        }

        function getallplandate(plan) {
            var ans = "";

            for (var a = 0; a < plan.length; a++) {

                var datestring = plan[a].toLocaleDateString("en-GB").split("/");
                datestring = datestring[2] + "-" + datestring[1] + "-" + datestring[0];
                if (a != plan.length - 1) {
                    ans += " availabledate = \"" + datestring + "\" or ";
                } else {
                    ans += " availabledate = \"" + datestring + "\" ";
                }
            }
            console.log(ans)
            return ans;
        }

        async function insertbox(element ,sqldatestring, sessionstarttime ) {
 
                let boxid = 'boxID';
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                const charactersLength = characters.length;
                let counter = 0;
                while (counter < 15) {
                    boxid += characters.charAt(Math.floor(Math.random() * charactersLength));
                    counter += 1;
                }
               
                var insertscheduleboxquery = "insert into allschedulebox values(\"" + boxid + "\",\""+element.planNo+"\",\"" +sqldatestring+" "+sessionstarttime.toLocaleTimeString("en-GB")+ "\",\"" + element.type + "\","
                    + "\"" + element.tid + "\",\"" + element.sid + "\",\"" + element.oid + "\","
                    + "\"" + element.campus + "\",\"" +element.rid+ "\", now()) ;"
                console.log(insertscheduleboxquery)

                db.query(insertscheduleboxquery, (err, results) => {
                    try {
                        console.log("inserted ")
                    } catch (err) {
                        return err;
                    }
                });
           
        }

        async function insertarraybox(parallelschedule ,sqldatestring, sessionstarttime ) {
            
            parallelschedule.forEach((element => {
                let boxid = 'boxID';
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                const charactersLength = characters.length;
                let counter = 0;
                while (counter < 15) {
                    boxid += characters.charAt(Math.floor(Math.random() * charactersLength));
                    counter += 1;
                }
               
                var insertscheduleboxquery = "insert into allschedulebox values(\"" + boxid + "\",\""+element.planNo+"\",\"" +sqldatestring+" "+sessionstarttime.toLocaleTimeString("en-GB")+ "\",\"" + element.type + "\","
                    + "\"" + element.tid + "\",\"" + element.sid + "\",\"" + element.oid + "\","
                    + "\"" + element.campus + "\",\"" +element.rid+ "\", now()) ;"
                console.log(insertscheduleboxquery)

                db.query(insertscheduleboxquery, (err, results) => {
                    try {
                        console.log("inserted ")
                    } catch (err) {
                        return err;
                    }
                });
            }))
        }



        function checkpairsmustusethistimeslot(planNo, parallelschedule, pairsforthistimeslot, sqldatestring, sessionstarttime) {
            console.log(pairsforthistimeslot);
            var copyarray = pairsforthistimeslot.slice();
            console.log(copyarray)
            copyarray.forEach(element => {
                parallelschedule.forEach(element2 => {
                    if (element.sid == element2.sid) {
                        pairsforthistimeslot.pop(element)
                    }
                });
            });
            var ans = new Array();
            pairsforthistimeslot.forEach(element => {
                if (element.counting == 1) {
                    var schedulebox = createschedulebox(planNo, element.tid, element.sid, element.oid, sqldatestring, sessionstarttime, null, null);
                    ans.push(schedulebox);
                }
            });
            return ans;
        }


        var threepartyAvaList = await getthreepartyavalist();
        // console.log(threepartyAvaList)

        // var a  == looping in possible plans
        // for (var a = 0; a < possibledatecombination.length; a++) {
        for (var a = 0; a < 1; a++) {
            var scheduleforthisplan = new Array();
            console.log(">>plan ", a, " ", possibledatecombination[a])
            // var b  == looping dates in the plans
            var uniquetimeslotcounts = await checkuniquetimeslotcountforoneday(possibledatecombination[a]);
            console.log(uniquetimeslotcounts);
            //looping the timeslots for this day
            for (var c = 0; c < 1; c++) {
                // for (var c = 0; c < 5; c++) {
                // console.log(uniquetimeslotcounts[c].availablestarttime);

                var sessionstarttime = new Date(uniquetimeslotcounts[c].availablestarttime);
                var sessionendtime = resetsessionendtime(sessionstarttime);
                var sqldatestring = sessionstarttime.toLocaleDateString("en-GB").split("/");
                sqldatestring = sqldatestring[2] + "-" + sqldatestring[1] + "-" + sqldatestring[0];
                sqldatestring.trim();

                //get the classroomlist that available for the time
                var availableclassroomlist = new Array();;
                for (var d = 0; d < 4; d++) {
                    if (req.query.typeOfPresent == "final") {
                        var roomttbresult = await checkclassroomttb(preSetClassroomList[d], sessionstarttime.getDay(), sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                        var roomtimeslotresult = await checkclassroomtimeslot(preSetClassroomList[d], sessionstarttime.getDay(), sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                        if (roomttbresult && roomtimeslotresult) {
                            availableclassroomlist.push(preSetClassroomList[d]);
                        }
                    } else {
                        var roomtimeslotresult = await checkclassroomtimeslot(preSetClassroomList[d], sessionstarttime.getDay(), sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                        if (roomtimeslotresult) {
                            availableclassroomlist.push(preSetClassroomList[d]);
                        }
                    }

                }

                console.log("availableclassroomlist.length   ", availableclassroomlist.length, availableclassroomlist)
                var parallelschedule = new Array();
                for (var d = 0; d < availableclassroomlist.length; d++) {
                    var pairsforthistimeslot = await getascorderoftimecountpairlist(a, parallelschedule, sqldatestring, sessionstarttime.toLocaleTimeString("en-GB"));
                    console.log(pairsforthistimeslot);
                    if (pairsforthistimeslot.length != 0) {
                        console.log("this classroom ", availableclassroomlist[d], " is ok for ", sessionstarttime.toLocaleDateString("en-GB"), " this timeslot ", sessionstarttime.toLocaleTimeString("en-GB"), "  ", sessionendtime.toLocaleTimeString("en-GB"))
                        var schedulebox = createschedulebox(a, pairsforthistimeslot[0].TID, pairsforthistimeslot[0].SID, pairsforthistimeslot[0].OID, sessionstarttime, sessionstarttime.toLocaleTimeString('en-GB'), "Sin Hang", preSetClassroomList[d]);
                        parallelschedule.push(schedulebox);
                        console.log(schedulebox)
                        console.log("now insert mustusepair")
                        insertbox(schedulebox,sqldatestring,sessionstarttime);
                        pairsforthistimeslot.shift();
                    }
                    console.log(">>parallelschedule for date time ", sessionstarttime.toLocaleDateString("en-GB"), " ", sessionstarttime.toLocaleTimeString("en-GB"), " ", parallelschedule.length, "\n", parallelschedule);
                }
                var mustusepair = checkpairsmustusethistimeslot(a,parallelschedule, pairsforthistimeslot, sqldatestring, sessionstarttime.toLocaleTimeString("en-GB"))
                // insertbox(parallelschedule,sqldatestring,sessionstarttime);
console.log("now insert mustusepair")
insertarraybox(mustusepair,sqldatestring,sessionstarttime);

            }

            console.log("\n\n\n")
            console.log(">>scheduleforthisplan  ", scheduleforthisplan.length, " ", scheduleforthisplan);
        }
        return res.redirect("/hello")
    },

    // genavailable: async function (req, res) {
    //     var db = await sails.helpers.database();
    //     var pool = await sails.helpers.database2();
    //     var errmsg = "";
    //     //var schedulebox = new Array();


    //     // get presentperiod
    //     var getsetting3 = "select * from allsupersetting where typeofsetting = 3;"
    //     var setting3 = await new Promise((resolve) => {
    //         pool.query(getsetting3, (err, res) => {
    //             var string = JSON.stringify(res);
    //             var json = JSON.parse(string);
    //             var ans = json;
    //             if (ans.length != 0) {
    //                 var startday = new Date(ans[0].startdate);
    //                 var endday = new Date(ans[0].enddate);
    //                 var startTime = ans[0].starttime.split(":");
    //                 var endTime = ans[0].endtime.split(":");
    //                 startday.setHours(startTime[0]);
    //                 startday.setMinutes(startTime[1]);
    //                 startday.setSeconds(startTime[2]);
    //                 endday.setHours(endTime[0]);
    //                 endday.setMinutes(endTime[1]);
    //                 endday.setSeconds(endTime[2]);
    //                 console.log(startday + "   " + endday)
    //                 ans = { startday: startday, endday: endday };
    //             }
    //             resolve(ans)
    //         })
    //     }).catch((err) => {
    //         errmsg = "error happened in ScheduleController.genavailble.getsetting3"
    //     })
    //     //console.log(errmsg)
    //     // console.log(setting3)



    //     function resetschedulebox() {
    //         var days = 0;
    //         var schedulebox = new Array();
    //         while (true) {
    //             var scheduleboxsetting = JSON.parse(JSON.stringify({ "date": "", "prefno": "", "schedule": new Array() }))
    //             // console.log("new schedulebox",schedulebox)
    //             var presentday = new Date((new Date(setting3.startday)).getTime() + (24 * 60 * 60 * 1000) * days);
    //             //console.log(new Date((new Date(setting3.startday)).getTime() + (24 * 60 * 60 * 1000) * days))
    //             if (setting3.startday.getDay() != 6 || setting3.startday.getDay() != 0) {
    //                 if (presentday.getDay() != 0) {
    //                     var date = presentday.toLocaleDateString("en-GB").split("/");
    //                     scheduleboxsetting.date = date[2] + "-" + date[1] + "-" + date[0];
    //                     schedulebox.push(scheduleboxsetting);
    //                 }
    //                 days++;
    //             }
    //             if (presentday.toLocaleDateString("en-GB") == (new Date(setting3.endday)).toLocaleDateString("en-GB")) {
    //                 false;
    //                 break;
    //             }
    //         }
    //         //console.log("resetted schedulebox", schedulebox)
    //         return schedulebox;
    //     }


    //     // gen all supervisors
    //     var getallsupervisor = "select tid,submission from supervisor order by priority asc"
    //     var supervisorlist = await new Promise((resolve) => {
    //         pool.query(getallsupervisor, (err, res) => {
    //             var string = JSON.stringify(res);
    //             var json = JSON.parse(string);
    //             var ans = json;
    //             resolve(ans)
    //         })
    //     }).catch((err) => {
    //         errmsg = "error happened in ScheduleController.genavailble.getallsupervvisor"
    //     })


    //     //need to del all unpending records
    //     var gethvrecordbutnosubmit = "select distinct(student.sid) from allstudenttakecourse left join student on student.sid = allstudenttakecourse.pid where ttbsubmission = \"N\" or ttbsubmission=\"Rejected\";"
    //     var hvrecordbutnosubmitstudent = await new Promise((resolve) => {
    //         pool.query(gethvrecordbutnosubmit, (err, res) => {
    //             var string = JSON.stringify(res);
    //             var json = JSON.parse(string);
    //             var ans = json;
    //             resolve(ans)
    //         })
    //     }).catch((err) => {
    //         errmsg = "error happened in ScheduleController.genavailble.gethvrecordbutnosubmit"
    //     })

    //     //console.log(">>hvrecordbutnosubmitstudent", hvrecordbutnosubmitstudent)

    //     for (var a = 0; a < hvrecordbutnosubmitstudent.length; a++) {
    //         var deleteline = "delete from allstudenttakecourse where pid = \"" + hvrecordbutnosubmitstudent[a].sid + "\" and (confirmation = \"0\" or confirmation = \"3\");"
    //         //console.log(deleteline)
    //         db.query(deleteline, (err, result) => {
    //             try {
    //                 //console.log("delete complete")
    //             } catch (err) {
    //                 if (err) {
    //                     errstring = "";
    //                     errstring += "error happened for:" + deleteline + "\n"
    //                     statuscode = 401;
    //                 }
    //             }

    //         })

    //         var insertemptyline = "insert ignore into alltakecourse values(\"EMPTY_\",\"" + hvrecordbutnosubmitstudent[a].sid + "\");"
    //         //console.log(insertemptyline)
    //         db.query(insertemptyline, (err, result) => {
    //             try {
    //                 //console.log("insert complete")
    //             } catch (err) {
    //                 if (err) {
    //                     errstring = "";
    //                     errstring += "error happened for:" + deleteline + "\n"
    //                     statuscode = 401;
    //                 }
    //             }

    //         })

    //         updatetakecourseline = "Update allstudenttakecourse set allstudenttakecourse.ttbcomments = \"enforced to enroll empty since no submission or being rejected\" , allstudenttakecourse.confirmation = \"4\",  allstudenttakecourse.review = now() where allstudenttakecourse.pid=\"" + hvrecordbutnosubmitstudent[a].sid + "\";"
    //         //console.log(updatetakecourseline)
    //         db.query(updatetakecourseline, (err, result) => {
    //             try {
    //                 //console.log("update complete")
    //             } catch (err) {
    //                 if (err) {
    //                     errstring = "";
    //                     errstring += "error happened for:" + updatetakecourseline + "\n"
    //                     statuscode = 401;
    //                 }
    //             }

    //         })



    //     }




    //     // gen all student update those who didnot even handin ttb
    //     var getallstudentttbnotok = "select distinct(sid) from student where ttbsubmission = \"N\";"
    //     var studentlist = await new Promise((resolve) => {
    //         pool.query(getallstudentttbnotok, (err, res) => {
    //             var string = JSON.stringify(res);
    //             var json = JSON.parse(string);
    //             var ans = json;
    //             resolve(ans)
    //         })
    //     }).catch((err) => {
    //         errmsg = "error happened in ScheduleController.genavailble.getallstudentttbnotok"
    //     })
    //     //console.log(studentlist)

    //     for (var a = 0; a < studentlist.length; a++) {
    //         //try enroll all of them to EMPTY
    //         var insertemptyline = "insert ignore into alltakecourse values(\"EMPTY_\",\"" + studentlist[a].sid + "\");"
    //         //console.log(insertemptyline)
    //         db.query(insertemptyline, (err, result) => {
    //             try {
    //                 //console.log("insert complete")
    //             } catch (err) {
    //                 if (err) {
    //                     errstring = "";
    //                     errstring += "error happened for:" + deleteline + "\n"
    //                     statuscode = 401;
    //                 }
    //             }

    //         })

    //         updatetakecourseline = "Update allstudenttakecourse set allstudenttakecourse.ttbcomments = \"enforced to enroll empty since no submission or being rejected\" , allstudenttakecourse.confirmation = \"4\",  allstudenttakecourse.review = now() where allstudenttakecourse.pid=\"" + studentlist[a].sid + "\";"
    //         //console.log(updatetakecourseline)
    //         db.query(updatetakecourseline, (err, result) => {
    //             try {
    //                 //console.log("update complete")
    //             } catch (err) {
    //                 if (err) {
    //                     errstring = "";
    //                     errstring += "error happened for:" + updatetakecourseline + "\n"
    //                     statuscode = 401;
    //                 }
    //             }

    //         })
    //     }

    //     //turn Required Proof into Rejected
    //     var updaterequiredproofline = "Update allrequestfromstudent set status = \"Enforce Rejected\", reply=\"Enforced to reject since didn't upload proof ontime\" where status = \"Require Proof\""
    //     //console.log(updaterequiredproofline)
    //     db.query(updaterequiredproofline, (err, result) => {
    //         try {
    //             //console.log("update complete")
    //         } catch (err) {
    //             if (err) {
    //                 errstring = "";
    //                 errstring += "error happened for:" + updaterequiredproofline + "\n"
    //                 statuscode = 401;
    //             }
    //         }

    //     })

    //     //turn Pending into Approved
    //     updatependingrequestline = "Update allrequestfromstudent set status = \"Enforce Approved\", reply=\"Enforced to approve since supervisor left for pending\" where status = \"Pending\";"
    //     //console.log(updatependingrequestline)
    //     db.query(updatependingrequestline, (err, result) => {
    //         try {
    //             //console.log("update complete")
    //         } catch (err) {
    //             if (err) {
    //                 errstring = "";
    //                 errstring += "error happened for:" + updatependingrequestline + "\n"
    //                 statuscode = 401;
    //             }
    //         }

    //     })

    //     // handle gen student availble 
    //     // gen all students
    //     var getallstudent = "select  supervisorpairstudent.tid , student.sid , observerpairstudent.oid from student join supervisorpairstudent on supervisorpairstudent.sid = student.sid  join observerpairstudent on observerpairstudent.sid = student.sid"
    //     var studentlist = await new Promise((resolve) => {
    //         pool.query(getallstudent, (err, res) => {
    //             var string = JSON.stringify(res);
    //             var json = JSON.parse(string);
    //             var ans = json;
    //             resolve(ans)
    //         })
    //     }).catch((err) => {
    //         errmsg = "error happened in ScheduleController.genavailble.getallstudent"
    //     })
    //     //console.log(">>studentlist", studentlist)

    //     for (var a = 0; a < studentlist.length; a++) {

    //         var currentgeneratedate = new Date(setting3.startday);
    //         var currentgeneratedateend = new Date(setting3.startday);

    //         while (currentgeneratedate < new Date(setting3.endday)) {

    //             var supervisorttblist;
    //             var supervisorrequest;

    //             if (req.body.typeofpresent == "midterm") {
    //                 // console.log()
    //                 if (currentgeneratedate.toLocaleTimeString("en-GB") == setting3.startday.toLocaleTimeString("en-GB")) {
    //                     if (currentgeneratedate.getMinutes() == 30) {
    //                         currentgeneratedateend.setHours(currentgeneratedate.getHours() + 1);
    //                         currentgeneratedateend.setMinutes(0)
    //                     } else {
    //                         currentgeneratedateend.setHours(currentgeneratedate.getHours());
    //                         currentgeneratedateend.setMinutes(30);
    //                     }
    //                     //console.log(currentgeneratedate.toLocaleString("en-GB"), "  hellobello  ", currentgeneratedateend.toLocaleString("en-GB"))

    //                 } else if (currentgeneratedate.getMinutes() == 30) {
    //                     currentgeneratedateend.setHours(currentgeneratedate.getHours() + 1);
    //                     currentgeneratedateend.setMinutes(0)
    //                 } else {
    //                     currentgeneratedateend.setMinutes(30);
    //                 }


    //                 var datestring = currentgeneratedate.getFullYear() + "-" + (currentgeneratedate.getMonth() + 1) + "-" + currentgeneratedate.getDate();
    //                 var boolcheckttb = false;
    //                 var boolcheckreq = false;

    //                 var getcheckstudentttb = "select * from allstudenttakecourse left join allclass on allclass.cid = allstudenttakecourse.cid  where pid = \"" + studentlist[a].sid + "\" and weekdays = \"" + currentgeneratedate.getDay() + "\" and (starttime <= Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and endtime >= time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\")) order by pid asc, weekdays asc,startTime asc"
    //                 //console.log(getcheckstudentttb);

    //                 studentttblist = await new Promise((resolve) => {
    //                     pool.query(getcheckstudentttb, (err, res) => {
    //                         var string = JSON.stringify(res);
    //                         var json = JSON.parse(string);
    //                         var ans = json;
    //                         resolve(ans)
    //                     })
    //                 }).catch((err) => {
    //                     errmsg = "error happened in ScheduleController.genavailble.getcheckstudentttb"
    //                 })
    //                 if (studentttblist == null || studentttblist == undefined || studentttblist.length == 0) {
    //                     boolcheckttb = true;
    //                 }


    //                 var getcheckstudentrequest = "select * from allrequestfromstudent where (status = \"Approved\" or status = \"Enforce Approved\") and sid = \"" + studentlist[a].sid + "\" and requestDate = DATE(\"" + datestring + "\") and (requeststarttime <= Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and requestendtime >= time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\"))";
    //                 //console.log(getcheckstudentrequest)

    //                 studentrequest = await new Promise((resolve) => {
    //                     pool.query(getcheckstudentrequest, (err, res) => {
    //                         var string = JSON.stringify(res);
    //                         var json = JSON.parse(string);
    //                         var ans = json;
    //                         resolve(ans)
    //                     })
    //                 }).catch((err) => {
    //                     errmsg = "error happened in ScheduleController.genavailble.getcheckstudentrequest"
    //                 })

    //                 if (studentrequest.length == 0 || studentrequest == null || studentrequest == undefined) {
    //                     //console.log(supervisorlist[a].tid+"     "+currentgeneratedate.toLocaleDateString()+"   "+currentgeneratedate.toLocaleTimeString()+"    "+currentgeneratedateend.toLocaleTimeString())
    //                     //var datestring = currentgeneratedate.getFullYear()+"-"+(currentgeneratedate.getMonth()+1)+"-"+currentgeneratedate.getDate();
    //                     boolcheckreq = true;
    //                 }




    //                 if (boolcheckreq && boolcheckttb) {
    //                     var insertavability = "insert into studentavailable value(\"" + studentlist[a].sid + "\",Date(\"" + datestring + "\"),timestamp(\"" + datestring + " " + currentgeneratedate.toLocaleTimeString("en-GB") + "\"),timestamp(\"" + datestring + " " + currentgeneratedateend.toLocaleTimeString("en-GB") + "\"))"
    //                     //console.log(insertavability)
    //                     var studentavailbilityinsert = await new Promise((resolve) => {
    //                         pool.query(insertavability, (err, res) => {
    //                             resolve(res);
    //                         })
    //                     }).catch((err) => {
    //                         errmsg = "error happened in ScheduleController.genavailble.insertavability"
    //                     })

    //                 }

    //                 var checkdate1 = new Date();
    //                 checkdate1.setHours(setting3.endday.getHours());
    //                 checkdate1.setMinutes(setting3.endday.getMinutes());
    //                 checkdate1.setSeconds(setting3.endday.getSeconds());

    //                 var checkdate2 = new Date();
    //                 checkdate2.setHours(currentgeneratedate.getHours());
    //                 checkdate2.setMinutes(currentgeneratedate.getMinutes());
    //                 checkdate2.setSeconds(currentgeneratedate.getSeconds());



    //                 // console.log(checkdate1.toLocaleTimeString("en-GB") ,"  ", checkdate2.toLocaleTimeString("en-GB") , "endend")

    //                 // console.log(checkdate1.getTime() - 30*60*1000 - checkdate2.getTime()<=30*60*1000  , "endend")

    //                 if (checkdate1.getTime() - 30 * 60 * 1000 - checkdate2.getTime() < 30 * 60 * 1000) {

    //                     // if (currentgeneratedate.toLocaleTimeString("en-GB") == "18:00:00") {
    //                     if (currentgeneratedate.getDay() != 6) {
    //                         currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
    //                         currentgeneratedate = new Date(currentgeneratedate);
    //                         // currentgeneratedate.setHours(9);
    //                         // currentgeneratedate.setMinutes(30);
    //                         // currentgeneratedate.setSeconds(0);
    //                         currentgeneratedate.setHours(setting3.startday.getHours());
    //                         currentgeneratedate.setMinutes(setting3.startday.getMinutes());
    //                         currentgeneratedate.setSeconds(setting3.startday.getSeconds())
    //                     } else {
    //                         currentgeneratedate.setTime(currentgeneratedate.getTime() + 2 * 24 * 60 * 60 * 1000);
    //                         currentgeneratedate = new Date(currentgeneratedate);
    //                         // currentgeneratedate.setHours(9);
    //                         // currentgeneratedate.setMinutes(30);
    //                         // currentgeneratedate.setSeconds(0);
    //                         currentgeneratedate.setHours(setting3.startday.getHours());
    //                         currentgeneratedate.setMinutes(setting3.startday.getMinutes());
    //                         currentgeneratedate.setSeconds(setting3.startday.getSeconds())
    //                     }



    //                 } else {
    //                     if (currentgeneratedate.getMinutes() == 30) {
    //                         currentgeneratedate.setHours(currentgeneratedate.getHours() + 1);
    //                         currentgeneratedate.setMinutes(0)
    //                     } else {
    //                         currentgeneratedate.setMinutes(30)
    //                     }

    //                 }
    //                 // console.log("midterm check ",currentgeneratedate.toLocaleString(),"  ",currentgeneratedateend.toLocaleString())





    //             } else if (req.body.typeofpresent == "final") {
    //                 currentgeneratedateend.setHours(currentgeneratedate.getHours() + 1);

    //                 var datestring = currentgeneratedate.getFullYear() + "-" + (currentgeneratedate.getMonth() + 1) + "-" + currentgeneratedate.getDate();

    //                 // console.log(datestring)
    //                 //console.log("final")
    //                 var boolcheckttb = false;
    //                 var boolcheckreq = false;

    //                 var getcheckstudentttb = "select * from allstudenttakecourse left join allclass on allclass.cid = allstudenttakecourse.cid  where pid = \"" + studentlist[a].sid + "\" and weekdays = \"" + currentgeneratedate.getDay() + "\" and (starttime < Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and endtime > time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\")) order by pid asc, weekdays asc,startTime asc"
    //                 //console.log(getcheckstudentttb);
    //                 studentttblist = await new Promise((resolve) => {
    //                     pool.query(getcheckstudentttb, (err, res) => {
    //                         var string = JSON.stringify(res);
    //                         var json = JSON.parse(string);
    //                         var ans = json;
    //                         resolve(ans)
    //                     })
    //                 }).catch((err) => {
    //                     errmsg = "error happened in ScheduleController.genavailble.getcheckstudentttb"
    //                 })
    //                 if (studentttblist == null || studentttblist == undefined || studentttblist.length == 0) {
    //                     boolcheckttb = true;
    //                 }

    //                 var getcheckstudentrequest = "select * from allrequestfromstudent where (status = \"Approved\" or status = \"Enforce Approved\") and sid = \"" + studentlist[a].sid + "\" and requestDate = DATE(\"" + datestring + "\") and (requeststarttime <= Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and requestendtime >= time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\"))";
    //                 //console.log(getcheckstudentrequest)
    //                 studentrequest = await new Promise((resolve) => {
    //                     pool.query(getcheckstudentrequest, (err, res) => {
    //                         var string = JSON.stringify(res);
    //                         var json = JSON.parse(string);
    //                         var ans = json;
    //                         resolve(ans)
    //                     })
    //                 }).catch((err) => {
    //                     errmsg = "error happened in ScheduleController.genavailble.getcheckstudentrequest"
    //                 })

    //                 if (studentrequest.length == 0 || studentrequest == null || studentrequest == undefined) {
    //                     //console.log(supervisorlist[a].tid+"     "+currentgeneratedate.toLocaleDateString()+"   "+currentgeneratedate.toLocaleTimeString()+"    "+currentgeneratedateend.toLocaleTimeString())
    //                     //var datestring = currentgeneratedate.getFullYear()+"-"+(currentgeneratedate.getMonth()+1)+"-"+currentgeneratedate.getDate();
    //                     boolcheckreq = true;
    //                 }


    //                 if (boolcheckreq && boolcheckttb) {
    //                     var insertavability = "insert into studentavailable value(\"" + studentlist[a].sid + "\",Date(\"" + datestring + "\"),timestamp(\"" + datestring + " " + currentgeneratedate.toLocaleTimeString("en-GB") + "\"),timestamp(\"" + datestring + " " + currentgeneratedateend.toLocaleTimeString("en-GB") + "\"))"
    //                     //console.log(insertavability)
    //                     var studentavailbilityinsert = await new Promise((resolve) => {
    //                         pool.query(insertavability, (err, res) => {
    //                             resolve(res);
    //                         })
    //                     }).catch((err) => {
    //                         errmsg = "error happened in ScheduleController.genavailble.insertavability"
    //                     })
    //                 }

    //                 var checkdate1 = new Date();
    //                 checkdate1.setHours(setting3.endday.getHours() - 1);
    //                 checkdate1.setMinutes(setting3.endday.getMinutes());
    //                 checkdate1.setSeconds(setting3.endday.getSeconds());

    //                 var checkdate2 = new Date();
    //                 checkdate2.setHours(currentgeneratedate.getHours());
    //                 checkdate2.setMinutes(currentgeneratedate.getMinutes());
    //                 checkdate2.setSeconds(currentgeneratedate.getSeconds());



    //                 // console.log(checkdate1.toLocaleTimeString("en-GB") ,"  ", checkdate2.toLocaleTimeString("en-GB") , "endend")
    //                 // console.log(checkdate1.getTime() - checkdate2.getTime() , "endend")
    //                 // console.log(checkdate1.getTime() - checkdate2.getTime()<= 60*60*1000 , "endend")
    //                 if (checkdate1.getTime() - checkdate2.getTime() < 60 * 60 * 1000) {
    //                     // if (currentgeneratedate.toLocaleTimeString("en-GB") == "17:30:00") {
    //                     //console.log(currentgeneratedate.getDay())
    //                     if (currentgeneratedate.getDay() != 6) {
    //                         currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
    //                         currentgeneratedate = new Date(currentgeneratedate);
    //                         // console.log(setting3,"check setting 3")
    //                         // currentgeneratedate.setHours(9);
    //                         // currentgeneratedate.setMinutes(30);
    //                         // currentgeneratedate.setSeconds(0);
    //                         currentgeneratedate.setHours(setting3.startday.getHours());
    //                         currentgeneratedate.setMinutes(setting3.startday.getMinutes());
    //                         currentgeneratedate.setSeconds(setting3.startday.getSeconds());

    //                     } else {
    //                         currentgeneratedate.setTime(currentgeneratedate.getTime() + 2 * 24 * 60 * 60 * 1000);
    //                         currentgeneratedate = new Date(currentgeneratedate);
    //                         // currentgeneratedate.setHours(9);
    //                         // currentgeneratedate.setMinutes(30);
    //                         // currentgeneratedate.setSeconds(0);
    //                         currentgeneratedate.setHours(setting3.startday.getHours());
    //                         currentgeneratedate.setMinutes(setting3.startday.getMinutes());
    //                         currentgeneratedate.setSeconds(setting3.startday.getSeconds())
    //                     }


    //                 } else {
    //                     currentgeneratedate.setHours(currentgeneratedate.getHours() + 1);
    //                 }


    //                 // console.log("final check ",currentgeneratedate.toLocaleString(),"  ",currentgeneratedateend.toLocaleString())
    //                 //  console.log(currentgeneratedate.toLocaleDateString("en-GB") + "   " + currentgeneratedate.toLocaleTimeString("en-GB"))

    //             }

    //         }
    //     }


    //     // console.log(supervisorlist.length)
    //     //console.log(supervisorlist)
    //     for (var a = 0; a < supervisorlist.length; a++) {
    //         //console.log(supervisorlist[a]);
    //         var currentgeneratedate = new Date(setting3.startday);
    //         var currentgeneratedateend = new Date(setting3.startday);
    //         while (currentgeneratedate < new Date(setting3.endday)) {

    //             var supervisorttblist;
    //             var supervisorrequest;
    //             if (req.body.typeofpresent == "midterm") {
    //                 //console.log("midterm")
    //                 if (currentgeneratedate.toLocaleTimeString("en-GB") == setting3.startday.toLocaleTimeString("en-GB")) {
    //                     if (currentgeneratedate.getMinutes() == 30) {
    //                         currentgeneratedateend.setHours(currentgeneratedate.getHours() + 1);
    //                         currentgeneratedateend.setMinutes(0)
    //                     } else {
    //                         currentgeneratedateend.setHours(currentgeneratedate.getHours());
    //                         currentgeneratedateend.setMinutes(30);
    //                     }
    //                     // console.log(currentgeneratedate.toLocaleString("en-GB"), "  hellobello  ", currentgeneratedateend.toLocaleString("en-GB"))

    //                 } else if (currentgeneratedate.getMinutes() == 30) {
    //                     currentgeneratedateend.setHours(currentgeneratedate.getHours() + 1);
    //                     currentgeneratedateend.setMinutes(0)
    //                 } else {
    //                     currentgeneratedateend.setMinutes(30);
    //                 }
    //                 var datestring = currentgeneratedate.getFullYear() + "-" + (currentgeneratedate.getMonth() + 1) + "-" + currentgeneratedate.getDate();

    //                 var boolcheckttb = false;
    //                 var boolcheckreq = false;

    //                 var getchecksupervisorttb = "select * from allsupertakecourse left join allclass on allclass.cid = allsupertakecourse.cid  where confirmation = 1 and pid = \"" + supervisorlist[a].tid + "\" and weekdays = \"" + currentgeneratedate.getDay() + "\" and (starttime <= Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and endtime >= time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\")) order by pid asc, weekdays asc,startTime asc"
    //                 // console.log(getchecksupervisorttb);


    //                 supervisorttblist = await new Promise((resolve) => {
    //                     pool.query(getchecksupervisorttb, (err, res) => {
    //                         var string = JSON.stringify(res);
    //                         var json = JSON.parse(string);
    //                         var ans = json;
    //                         resolve(ans)
    //                     })
    //                 }).catch((err) => {
    //                     errmsg = "error happened in ScheduleController.genavailble.getsupervisorttblist"
    //                 })
    //                 if (supervisorttblist.length == 0 || supervisorttblist == null || supervisorttblist == undefined) {
    //                     boolcheckttb = true;
    //                 }

    //                 var getchecksupervisorrequest = "select * from allrequestfromsupervisor where tid = \"" + supervisorlist[a].tid + "\" and requestDate = DATE(\"" + datestring + "\") and (requeststarttime <= Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and requestendtime >= time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\"))";
    //                 //console.log(getchecksupervisorrequest)
    //                 supervisorrequest = await new Promise((resolve) => {
    //                     pool.query(getchecksupervisorrequest, (err, res) => {
    //                         var string = JSON.stringify(res);
    //                         var json = JSON.parse(string);
    //                         var ans = json;
    //                         resolve(ans)
    //                     })
    //                 }).catch((err) => {
    //                     errmsg = "error happened in ScheduleController.genavailble.getchecksupervisorrequest"
    //                 })

    //                 if (supervisorrequest.length == 0 || supervisorrequest == null || supervisorrequest == undefined) {
    //                     //console.log(supervisorlist[a].tid+"     "+currentgeneratedate.toLocaleDateString()+"   "+currentgeneratedate.toLocaleTimeString()+"    "+currentgeneratedateend.toLocaleTimeString())
    //                     //var datestring = currentgeneratedate.getFullYear()+"-"+(currentgeneratedate.getMonth()+1)+"-"+currentgeneratedate.getDate();
    //                     boolcheckreq = true;
    //                 }
    //                 if (boolcheckreq && boolcheckttb) {
    //                     var insertavability = "insert into supervisoravailable value(\"" + supervisorlist[a].tid + "\",Date(\"" + datestring + "\"),timestamp(\"" + datestring + " " + currentgeneratedate.toLocaleTimeString("en-GB") + "\"),timestamp(\"" + datestring + " " + currentgeneratedateend.toLocaleTimeString("en-GB") + "\"))"
    //                     //console.log(insertavability)

    //                     var supervisoravailbilityinsert = await new Promise((resolve) => {
    //                         pool.query(insertavability, (err, res) => {
    //                             resolve(res);
    //                         })
    //                     }).catch((err) => {
    //                         errmsg = "error happened in ScheduleController.genavailble.insertavability"
    //                     })
    //                 }



    //                 var checkdate1 = new Date();
    //                 checkdate1.setHours(setting3.endday.getHours());
    //                 checkdate1.setMinutes(setting3.endday.getMinutes());
    //                 checkdate1.setSeconds(setting3.endday.getSeconds());

    //                 var checkdate2 = new Date();
    //                 checkdate2.setHours(currentgeneratedate.getHours());
    //                 checkdate2.setMinutes(currentgeneratedate.getMinutes());
    //                 checkdate2.setSeconds(currentgeneratedate.getSeconds());



    //                 // console.log(checkdate1.toLocaleTimeString("en-GB") ,"  ", checkdate2.toLocaleTimeString("en-GB") , "endend")

    //                 // console.log((checkdate1.getTime() - 30*60*1000) - checkdate2.getTime()<=30*60*1000 , "endend")

    //                 if (checkdate1.getTime() - 30 * 60 * 1000 - checkdate2.getTime() < 30 * 60 * 1000) {



    //                     // if (currentgeneratedate.toLocaleTimeString("en-GB") == "18:00:00") {
    //                     //console.log(currentgeneratedate.getDay())
    //                     if (currentgeneratedate.getDay() != 6) {
    //                         currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
    //                         currentgeneratedate = new Date(currentgeneratedate);
    //                         // currentgeneratedate.setHours(9);
    //                         // currentgeneratedate.setMinutes(30);
    //                         // currentgeneratedate.setSeconds(0);
    //                         currentgeneratedate.setHours(setting3.startday.getHours());
    //                         currentgeneratedate.setMinutes(setting3.startday.getMinutes());
    //                         currentgeneratedate.setSeconds(setting3.startday.getSeconds())
    //                     } else {
    //                         currentgeneratedate.setTime(currentgeneratedate.getTime() + 2 * 24 * 60 * 60 * 1000);
    //                         currentgeneratedate = new Date(currentgeneratedate);
    //                         // currentgeneratedate.setHours(9);
    //                         // currentgeneratedate.setMinutes(30);
    //                         // currentgeneratedate.setSeconds(0);
    //                         currentgeneratedate.setHours(setting3.startday.getHours());
    //                         currentgeneratedate.setMinutes(setting3.startday.getMinutes());
    //                         currentgeneratedate.setSeconds(setting3.startday.getSeconds())
    //                     }



    //                 } else {
    //                     if (currentgeneratedate.getMinutes() == 30) {
    //                         currentgeneratedate.setHours(currentgeneratedate.getHours() + 1);
    //                         currentgeneratedate.setMinutes(0)
    //                     } else {
    //                         currentgeneratedate.setMinutes(30)
    //                     }

    //                 }
    //                 // console.log("midterm check ",currentgeneratedate.toLocaleString(),"  ",currentgeneratedateend.toLocaleString())


    //             } else if (req.body.typeofpresent == "final") {
    //                 //console.log("final")
    //                 currentgeneratedateend.setHours(currentgeneratedate.getHours() + 1);

    //                 var datestring = currentgeneratedate.getFullYear() + "-" + (currentgeneratedate.getMonth() + 1) + "-" + currentgeneratedate.getDate();
    //                 var boolcheckttb = false;
    //                 var boolcheckreq = false;

    //                 var getchecksupervisorttb = "select * from allsupertakecourse left join allclass on allclass.cid = allsupertakecourse.cid  where confirmation = 1 and pid = \"" + supervisorlist[a].tid + "\" and weekdays = \"" + currentgeneratedate.getDay() + "\" and (starttime < Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and endtime > time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\")) order by pid asc, weekdays asc,startTime asc"
    //                 //console.log(getchecksupervisorttb);
    //                 supervisorttblist = await new Promise((resolve) => {
    //                     pool.query(getchecksupervisorttb, (err, res) => {
    //                         var string = JSON.stringify(res);
    //                         var json = JSON.parse(string);
    //                         var ans = json;
    //                         resolve(ans)
    //                     })
    //                 }).catch((err) => {
    //                     errmsg = "error happened in ScheduleController.genavailble.getsupervisorttblist"
    //                 })
    //                 if (supervisorttblist.length == 0 || supervisorttblist == null || supervisorttblist == undefined) {
    //                     boolcheckttb = true;
    //                 }


    //                 var getchecksupervisorrequest = "select * from allrequestfromsupervisor where tid = \"" + supervisorlist[a].tid + "\" and requestDate = DATE(\"" + datestring + "\") and (requeststarttime <= Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and requestendtime >= time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\"))";
    //                 supervisorrequest = await new Promise((resolve) => {
    //                     pool.query(getchecksupervisorrequest, (err, res) => {
    //                         var string = JSON.stringify(res);
    //                         var json = JSON.parse(string);
    //                         var ans = json;
    //                         resolve(ans)
    //                     })
    //                 }).catch((err) => {
    //                     errmsg = "error happened in ScheduleController.genavailble.getchecksupervisorrequest"
    //                 })

    //                 if (supervisorrequest.length == 0 || supervisorrequest == null || supervisorrequest == undefined) {
    //                     //console.log(supervisorlist[a].tid+"     "+currentgeneratedate.toLocaleDateString()+"   "+currentgeneratedate.toLocaleTimeString()+"    "+currentgeneratedateend.toLocaleTimeString())
    //                     //var datestring = currentgeneratedate.getFullYear()+"-"+(currentgeneratedate.getMonth()+1)+"-"+currentgeneratedate.getDate();
    //                     boolcheckreq = true;
    //                 }
    //                 if (boolcheckreq && boolcheckttb) {
    //                     var insertavability = "insert into supervisoravailable value(\"" + supervisorlist[a].tid + "\",Date(\"" + datestring + "\"),timestamp(\"" + datestring + " " + currentgeneratedate.toLocaleTimeString("en-GB") + "\"),timestamp(\"" + datestring + " " + currentgeneratedateend.toLocaleTimeString("en-GB") + "\"))"
    //                     // console.log(insertavability)
    //                     var supervisoravailbilityinsert = await new Promise((resolve) => {
    //                         pool.query(insertavability, (err, res) => {
    //                             resolve(res);
    //                         })
    //                     }).catch((err) => {
    //                         errmsg = "error happened in ScheduleController.genavailble.insertavability"
    //                     })
    //                 }


    //                 var checkdate1 = new Date();
    //                 checkdate1.setHours(setting3.endday.getHours() - 1);
    //                 checkdate1.setMinutes(setting3.endday.getMinutes());
    //                 checkdate1.setSeconds(setting3.endday.getSeconds());

    //                 var checkdate2 = new Date();
    //                 checkdate2.setHours(currentgeneratedate.getHours());
    //                 checkdate2.setMinutes(currentgeneratedate.getMinutes());
    //                 checkdate2.setSeconds(currentgeneratedate.getSeconds());



    //                 // console.log(checkdate1.toLocaleTimeString("en-GB") ,"  ", checkdate2.toLocaleTimeString("en-GB") , "endend")
    //                 // console.log(checkdate1.getTime() - checkdate2.getTime() , "endend")
    //                 // console.log(checkdate1.getTime() - checkdate2.getTime()<= 60*60*1000 , "endend")
    //                 if (checkdate1.getTime() - checkdate2.getTime() < 60 * 60 * 1000) {

    //                     // if (currentgeneratedate.toLocaleTimeString("en-GB") == "17:30:00") {
    //                     currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
    //                     currentgeneratedate = new Date(currentgeneratedate);
    //                     // currentgeneratedate.setHours(9);
    //                     // currentgeneratedate.setMinutes(30);
    //                     // currentgeneratedate.setSeconds(0);
    //                     currentgeneratedate.setHours(setting3.startday.getHours());
    //                     currentgeneratedate.setMinutes(setting3.startday.getMinutes());
    //                     currentgeneratedate.setSeconds(setting3.startday.getSeconds())
    //                 } else {
    //                     currentgeneratedate.setHours(currentgeneratedate.getHours() + 1);
    //                 }

    //                 //  console.log(currentgeneratedate.toLocaleDateString("en-GB") + "   " + currentgeneratedate.toLocaleTimeString("en-GB"))

    //             }

    //         }
    //     }

    //     //console.log(">>supervisorlist", supervisorlist);

    //     //  for (var a = 0; a < 3; a++) {




    //     for (var a = 0; a < supervisorlist.length; a++) {
    //         var getprefofthissuper = "select * from allpreffromsup where tid = \"" + supervisorlist[a].tid + "\"";
    //         var prefofthissuper = await new Promise((resolve) => {
    //             pool.query(getprefofthissuper, (err, res) => {
    //                 var string = JSON.stringify(res);
    //                 var json = JSON.parse(string);
    //                 var ans = json;
    //                 resolve(ans)
    //             })
    //         }).catch((err) => {
    //             errmsg = "error happened in ScheduleController.genavailble.getprefofthissuper"
    //         })
    //         //console.log(">>preflist", prefofthissuper)
    //         //console.log(prefofthissuper.length)
    //         var thisschedulebox = resetschedulebox();

    //         if (prefofthissuper != null && prefofthissuper.length > 0) {
    //             // console.log("hello pref    ", prefofthissuper[0])
    //             var prefary = (prefofthissuper[0].Prefno).split("/");
    //             prefary.pop()
    //             //console.log(prefary);
    //             for (var b = 0; b < thisschedulebox.length; b++) {
    //                 if (prefary.length < b) {
    //                     thisschedulebox[b].prefno = "0"
    //                 } else {
    //                     thisschedulebox[b].prefno = prefary[b];
    //                 }

    //             }
    //             // for (var b = 0; b < prefary.length; b++) {
    //             //     thisschedulebox[b].prefno = prefary[b];
    //             // }
    //         }

    //         function sortingscheduleboxSAT() {
    //             thisschedulebox.sort((a, b) => {
    //                 return b.prefno - a.prefno;
    //             });
    //             var dateofsat = [];
    //             function arrayRemove(arr, value) {
    //                 return arr.filter(function (geeks) {
    //                     return geeks.date != value.date;
    //                 });
    //             }

    //             thisschedulebox.forEach(element => {
    //                 var datecheck = new Date(element.date);
    //                 if (datecheck.getDay() == 6) {
    //                     dateofsat.push(element);
    //                 }
    //             });
    //             //console.log(dateofsat)
    //             dateofsat.forEach(element => {
    //                 let result = arrayRemove(thisschedulebox, element)
    //                 //console.log(result)
    //                 thisschedulebox = result;
    //             });
    //             //console.log(thisschedulebox)
    //             dateofsat.forEach(element => {
    //                 thisschedulebox.push(element)
    //             });
    //             return thisschedulebox;
    //         }

    //         thisschedulebox = sortingscheduleboxSAT();


    //         //console.log(supervisorlist[a].tid, "   ", thisschedulebox)

    //         var getallstudentlistforthissuper = "(select tid, supervisorpairstudent.sid, oid as colleague from supervisorpairstudent left join observerpairstudent on observerpairstudent.sid = supervisorpairstudent.sid where supervisorpairstudent.tid = \"" + supervisorlist[a].tid + "\"and supervisorpairstudent.sid not in (select sid from allschedulebox) )union (select oid,observerpairstudent.sid , tid as colleague from observerpairstudent left join supervisorpairstudent on observerpairstudent.sid = supervisorpairstudent.sid where observerpairstudent.oid = \"" + supervisorlist[a].tid + "\" and observerpairstudent.sid not in (select sid from allschedulebox))";
    //         // console.log(getallstudentlistforthissuper)
    //         var studentlistforthissupervisor = await new Promise((resolve) => {
    //             pool.query(getallstudentlistforthissuper, (err, res) => {
    //                 var string = JSON.stringify(res);
    //                 var json = JSON.parse(string);
    //                 var ans = json;
    //                 resolve(ans)
    //             })
    //         }).catch((err) => {
    //             errmsg = "error happened in ScheduleController.genavailble.getallstudentlistforthissuper"
    //         })
    //         //console.log(">>studentlistforthissupervisor", studentlistforthissupervisor)

    //         var counttimeboxlist = new Array();
    //         if (studentlistforthissupervisor != 0) {
    //             for (var b = 0; b < studentlistforthissupervisor.length; b++) {
    //                 var checkavailabledup = "select count(*) as boxcount from supervisorpairstudent "
    //                     + "left join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid "
    //                     + "join studentavailable on studentavailable.sid = supervisorpairstudent.sid and studentavailable.sid =\"" + studentlistforthissupervisor[b].sid + "\" "
    //                     + "join supervisoravailable as sa1 on sa1.tid = supervisorpairstudent.tid and (sa1.tid = \"" + studentlistforthissupervisor[b].tid + "\" or sa1.tid = \"" + studentlistforthissupervisor[b].colleague + "\") "
    //                     + "and sa1.availabledate = studentavailable.availabledate and sa1.availablestartTime = studentavailable.availablestartTime "
    //                     + "join supervisoravailable as sa2 on sa2.tid = observerpairstudent.oid and sa1.availabledate = sa2.availabledate and sa1.availablestartTime = sa2.availablestartTime  "
    //                     + "and (sa2.tid = \"" + studentlistforthissupervisor[b].colleague + "\" or sa2.tid = \"" + studentlistforthissupervisor[b].tid + "\");"
    //                 //console.log(checkavailabledup)
    //                 var availblelist = await new Promise((resolve) => {
    //                     pool.query(checkavailabledup, (err, res) => {
    //                         var string = JSON.stringify(res);
    //                         var json = JSON.parse(string);
    //                         var ans = json;
    //                         resolve(ans)
    //                     })
    //                 }).catch((err) => {
    //                     errmsg = "error happened in ScheduleController.genavailble.checkavailabledup"
    //                 })

    //                 counttimeboxlist.push(JSON.parse(JSON.stringify({ "sid": studentlistforthissupervisor[b].sid, "tid": studentlistforthissupervisor[b].tid, "oid": studentlistforthissupervisor[b].colleague, "availblelist": parseInt(availblelist[0].boxcount) })));
    //             }

    //             counttimeboxlist.sort((a, b) => {
    //                 return a.availblelist - b.availblelist;
    //             })
    //             console.log("countimeboxlist all after sort", counttimeboxlist)

    //             /*** step 1 fulfill supervisor pref */
    //             var addedlist = [];
    //             for (var b = 0; b < counttimeboxlist.length; b++) {

    //                 var added = false;
    //                 var index = 0;

    //                 for (var c = 0; c < thisschedulebox.length; c++) {
    //                     //console.log(thisschedulebox[c])
    //                     var presentday = thisschedulebox[c].date;
    //                     var checker = thisschedulebox[c].prefno;
    //                     if (checker == "") {
    //                         checker = 0;
    //                     } else {
    //                         checker = parseInt(thisschedulebox[c].prefno);
    //                     }
    //                     //console.log(thisschedulebox);

    //                     //console.log(">>presentday", presentday, "  ", counttimeboxlist[b].sid, "  ", checker, "  ", thisschedulebox[c].schedule.length)

    //                     if (thisschedulebox[c].schedule.length < checker) {

    //                         // if ((checker == "0") || thisschedulebox[c].schedule.length != checker ) {
    //                         while (!added) {
    //                             function appendquery(thisschedulebox) {
    //                                 var checkavailabledup = "select supervisorpairstudent.tid , supervisorpairstudent.sid , observerpairstudent.oid, studentavailable.availabledate, studentavailable.availablestartTime, studentavailable.availableendTime from supervisorpairstudent "
    //                                     + "left join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid "
    //                                     + "join studentavailable on studentavailable.sid = supervisorpairstudent.sid and studentavailable.sid =\"" + counttimeboxlist[b].sid + "\" "
    //                                     + "and studentavailable.availabledate =\"" + presentday + "\""
    //                                 thisschedulebox.forEach(dayday => {
    //                                     dayday.schedule.forEach(schedulebox => {
    //                                         var timestamp = new Date(schedulebox.availablestartTime);
    //                                         checkavailabledup += "and studentavailable.availablestarttime != \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\" "

    //                                     });
    //                                 });
    //                                 checkavailabledup += "join supervisoravailable as sa1 on sa1.tid = supervisorpairstudent.tid and (sa1.tid = \"" + counttimeboxlist[b].tid + "\" or sa1.tid = \"" + counttimeboxlist[b].oid + "\") "
    //                                     + "and sa1.availabledate = studentavailable.availabledate and sa1.availablestartTime = studentavailable.availablestartTime "
    //                                     + "join supervisoravailable as sa2 on sa2.tid = observerpairstudent.oid and sa1.availabledate = sa2.availabledate and sa1.availablestartTime = sa2.availablestartTime  "
    //                                     + "and (sa2.tid = \"" + counttimeboxlist[b].oid + "\" or sa2.tid = \"" + counttimeboxlist[b].tid + "\") order by availablestartTime"
    //                                 // console.log(checkavailabledup);
    //                                 return checkavailabledup;
    //                             }

    //                             var checkavailabledup = appendquery(thisschedulebox);
    //                             //console.log(checkavailabledup)
    //                             var checkscheduleboxlist = await new Promise((resolve) => {
    //                                 pool.query(checkavailabledup, (err, res) => {
    //                                     var string = JSON.stringify(res);
    //                                     var json = JSON.parse(string);
    //                                     var ans = json;
    //                                     resolve(ans)
    //                                 })
    //                             }).catch((err) => {
    //                                 errmsg = "error happened in ScheduleController.genavailble.checkavailabledup"
    //                             })

    //                             //console.log(">>checkscheduleboxlist", checkscheduleboxlist[0])
    //                             if (checkscheduleboxlist[0] == undefined) {
    //                                 //console.log(supervisorlist[a].tid, "  ", checkavailabledup)
    //                                 index++;
    //                                 //console.log("this fail", counttimeboxlist[b].sid)
    //                                 var manualhandleline = "insert ignore into manualhandlecase values(\"" + counttimeboxlist[b].sid + "\",\"" + counttimeboxlist[b].tid + "\",\"" + counttimeboxlist[b].oid + "\")"
    //                                 db.query(manualhandleline, (err, res) => {
    //                                     try { //console.log("inserted manual handlecase") 
    //                                     } catch (err) {
    //                                         //console.log("error happened in inserting ScheduleController.genavailble.manualhandleline")
    //                                     }
    //                                 })
    //                                 break;
    //                             } else {
    //                                 thisschedulebox[c].schedule.push(checkscheduleboxlist[0])

    //                                 //console.log(">>see see ", thisschedulebox[c].schedule)
    //                                 added = true;
    //                                 //console.log("this pass", counttimeboxlist[b].sid)
    //                             }

    //                         }
    //                         if (added) {
    //                             checker++;
    //                             var deletemanualhandleline = "delete from manualhandlecase where sid = \"" + counttimeboxlist[b].sid + "\";";
    //                             addedlist.push(counttimeboxlist[b].sid)
    //                             db.query(deletemanualhandleline, (err, res) => {
    //                                 try {
    //                                     //console.log("deleteed manual handlecase") 
    //                                 } catch (err) {
    //                                     // console.log("error happened in inserting ScheduleController.genavailble.deletemanualhandleline")
    //                                 }
    //                             })
    //                             break;
    //                         } else {
    //                             console.log("need to handle this ppl manually", counttimeboxlist[b].sid);
    //                         }
    //                     } else {
    //                         // if (checker == "0") {
    //                         //     console.log("need to handle this ppl 1", counttimeboxlist[b].sid)
    //                         // } else if (thisschedulebox[c].schedule.length == parseInt(checker)) {
    //                         //     console.log("need to handle this ppl 2", counttimeboxlist[b].sid)
    //                         // }

    //                         if (parseInt(checker) == 0) {
    //                             break;
    //                         }

    //                     }






    //                     // if (added) {
    //                     //     checker++;
    //                     //     var deletemanualhandleline = "delete from manualhandlecase where sid = \"" + counttimeboxlist[b].sid + "\";";

    //                     //     db.query(deletemanualhandleline, (err, res) => {
    //                     //         try { console.log("deleteed manual handlecase") } catch (err) {
    //                     //             console.log("error happened in inserting ScheduleController.genavailble.deletemanualhandleline")
    //                     //         }
    //                     //     })
    //                     //     break;
    //                     // } else {
    //                     //     console.log("need to handle this ppl manually", counttimeboxlist[b].sid);
    //                     // }
    //                 }
    //             }


    //             function arrayRemovesid(arr, value) {
    //                 return arr.filter(function (geeks) {
    //                     return geeks.sid != value;
    //                 });
    //             }

    //             //console.log("added list   ", addedlist);
    //             addedlist.forEach(element => {
    //                 counttimeboxlist = arrayRemovesid(counttimeboxlist, element);
    //                 //console.log("new countimebox in prcess  ", counttimeboxlist)
    //             })


    //             //console.log("countimeboxlist all after sort 2 ", counttimeboxlist)
    //             //console.log(">> final schedulebox", thisschedulebox)
    //             function sortingschedulebox() {
    //                 thisschedulebox.sort((a, b) => {
    //                     return (a.schedule.length - b.schedule.length);
    //                 });
    //                 var dateofsat = [];
    //                 function arrayRemove(arr, value) {
    //                     return arr.filter(function (geeks) {
    //                         return geeks.date != value.date;
    //                     });
    //                 }

    //                 thisschedulebox.forEach(element => {
    //                     var datecheck = new Date(element.date);
    //                     if (datecheck.getDay() == 6) {
    //                         dateofsat.push(element);
    //                     }
    //                 });
    //                 //console.log(dateofsat)
    //                 dateofsat.forEach(element => {
    //                     let result = arrayRemove(thisschedulebox, element)
    //                     //console.log(result)
    //                     thisschedulebox = result;
    //                 });
    //                 //console.log(thisschedulebox)
    //                 dateofsat.forEach(element => {
    //                     thisschedulebox.push(element)
    //                 });
    //                 return thisschedulebox;
    //             }

    //             thisschedulebox = sortingschedulebox();
    //             //console.log("after sorting   ", thisschedulebox);
    //             addedlist = [];

    //             //console.log("after remove   ", counttimeboxlist)


    //             /***step 2 insert by sorting the least amount of box */
    //             for (var b = 0; b < counttimeboxlist.length; b++) {
    //                 var added = false;

    //                 for (var c = 0; c < thisschedulebox.length; c++) {
    //                     var presentday = thisschedulebox[c].date;
    //                     function appendquery(thisschedulebox) {
    //                         var checkavailabledup = "select supervisorpairstudent.tid , supervisorpairstudent.sid , observerpairstudent.oid, studentavailable.availabledate, studentavailable.availablestartTime, studentavailable.availableendTime from supervisorpairstudent "
    //                             + "left join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid "
    //                             + "join studentavailable on studentavailable.sid = supervisorpairstudent.sid and studentavailable.sid =\"" + counttimeboxlist[b].sid + "\" "
    //                             + "and studentavailable.availabledate =\"" + presentday + "\""
    //                         thisschedulebox.forEach(dayday => {
    //                             dayday.schedule.forEach(schedulebox => {
    //                                 var timestamp = new Date(schedulebox.availablestartTime);
    //                                 checkavailabledup += "and studentavailable.availablestarttime != \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\" "

    //                             });
    //                         });
    //                         // for (var z = 0; z < thisschedulebox[c].schedule.length; z++) {
    //                         //     var timestamp = new Date(thisschedulebox[c].schedule[z].availablestartTime);
    //                         //     //     console.log(timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB"))
    //                         //     checkavailabledup += "and studentavailable.availablestarttime != \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\" "
    //                         // }
    //                         checkavailabledup += "join supervisoravailable as sa1 on sa1.tid = supervisorpairstudent.tid and (sa1.tid = \"" + counttimeboxlist[b].tid + "\" or sa1.tid = \"" + counttimeboxlist[b].oid + "\") "
    //                             + "and sa1.availabledate = studentavailable.availabledate and sa1.availablestartTime = studentavailable.availablestartTime "
    //                             + "join supervisoravailable as sa2 on sa2.tid = observerpairstudent.oid and sa1.availabledate = sa2.availabledate and sa1.availablestartTime = sa2.availablestartTime  "
    //                             + "and (sa2.tid = \"" + counttimeboxlist[b].oid + "\" or sa2.tid = \"" + counttimeboxlist[b].tid + "\") order by availablestartTime"
    //                         // console.log("checkavailabledup in step 2", checkavailabledup);
    //                         return checkavailabledup;
    //                     }

    //                     var checkavailabledup = appendquery(thisschedulebox);
    //                     //console.log("checkavailabledup 2    ", checkavailabledup)
    //                     var checkscheduleboxlist = await new Promise((resolve) => {
    //                         pool.query(checkavailabledup, (err, res) => {
    //                             var string = JSON.stringify(res);
    //                             var json = JSON.parse(string);
    //                             var ans = json;
    //                             resolve(ans)
    //                         })
    //                     }).catch((err) => {
    //                         errmsg = "error happened in ScheduleController.genavailble.checkavailabledup"
    //                     })

    //                     //console.log(">>checkscheduleboxlist 2 ", checkscheduleboxlist[0]);
    //                     if (checkscheduleboxlist[0] == undefined) {
    //                         //console.log(supervisorlist[a].tid, "  ", checkavailabledup)
    //                         index++;
    //                         //console.log("this fail", counttimeboxlist[b].sid)
    //                         var manualhandleline = "insert ignore into manualhandlecase values(\"" + counttimeboxlist[b].sid + "\",\"" + counttimeboxlist[b].tid + "\",\"" + counttimeboxlist[b].oid + "\")"
    //                         db.query(manualhandleline, (err, res) => {
    //                             try {
    //                                 //console.log("inserted manual handlecase") 
    //                             } catch (err) {
    //                                 //console.log("error happened in inserting ScheduleController.genavailble.manualhandleline")
    //                             }
    //                         })
    //                         break;
    //                     } else {
    //                         thisschedulebox[c].schedule.push(checkscheduleboxlist[0])

    //                         //console.log(">>see see  2", thisschedulebox[c].schedule)
    //                         added = true;
    //                         //console.log("this pass 2", counttimeboxlist[b].sid)
    //                     }

    //                     if (added) {
    //                         var deletemanualhandleline = "delete from manualhandlecase where sid = \"" + counttimeboxlist[b].sid + "\";";
    //                         addedlist.push(counttimeboxlist[b].sid);
    //                         thisschedulebox = sortingschedulebox();
    //                         // console.log(counttimeboxlist[b].tid, "  thisschdeulebox after sorting again", thisschedulebox)
    //                         db.query(deletemanualhandleline, (err, res) => {
    //                             try {
    //                                 // console.log("deleteed manual handlecase") 
    //                             } catch (err) {
    //                                 // console.log("error happened in inserting ScheduleController.genavailble.deletemanualhandleline")
    //                             }
    //                         })
    //                         break;
    //                     } else {
    //                         // console.log("need to handle this ppl manually", counttimeboxlist[b].sid);
    //                     }
    //                 }

    //             }

    //             console.log(supervisorlist[a].tid, "schedulebox after step 2     ", thisschedulebox)



    //             for (var c = 0; c < thisschedulebox.length; c++) {
    //                 for (var e = 0; e < thisschedulebox[c].schedule.length; e++) {
    //                     var campus = "";
    //                     var room = "";
    //                     //  console.log(thisschedulebox[c].schedule[e].tid, " ", thisschedulebox[c].schedule[e].oid, " ", thisschedulebox[c].date);
    //                     var timestamp = new Date(thisschedulebox[c].schedule[e].availablestartTime);

    //                     var getcampusandroomquery = "select t2.cid,pid,priority, campus,rid,startTime,endTime from (select * from (select * from allsupertakecourse where (pid = \"" + thisschedulebox[c].schedule[e].tid + "\" or pid = \"" + thisschedulebox[c].schedule[e].oid + "\")) as t1 left join supervisor on supervisor.tid = t1.pid )as t2 left join allclass on allclass.cid = t2.CID where weekdays = \"" + timestamp.getDay() + "\" order by t2.priority asc, startTime asc, Campus asc , RID asc"
    //                     //console.log(getcampusandroomquery)
    //                     var checkcampusandroom = await new Promise((resolve) => {
    //                         pool.query(getcampusandroomquery, (err, res) => {
    //                             var string = JSON.stringify(res);
    //                             var json = JSON.parse(string);
    //                             var ans = json;
    //                             //console.log("checkcampusandroom length    " , ans.length)
    //                             resolve(ans)
    //                         })
    //                     }).catch((err) => {
    //                         errmsg = "error happened in ScheduleController.genavailble.getcampusandroomquery"
    //                     })
    //                     //console.log(checkcampusandroom.length , "   check after query get   ",thisschedulebox[c].schedule[e])
    //                     if (checkcampusandroom.length == 0) {
    //                         getcampusandroomquery = "select campus,rid from classroom where Campus != \"\""
    //                         checkcampusandroom = await new Promise((resolve) => {
    //                             pool.query(getcampusandroomquery, (err, res) => {
    //                                 var string = JSON.stringify(res);
    //                                 var json = JSON.parse(string);
    //                                 var ans = json;
    //                                 resolve(ans)
    //                             })
    //                         }).catch((err) => {
    //                             errmsg = "error happened in ScheduleController.genavailble.getcampusandroomquery"
    //                         })

    //                     }

    //                     // console.log(checkcampusandroom , "   check campus")
    //                     var added = false;
    //                     for (var i = 0; i < checkcampusandroom.length; i++) {
    //                         added = false;
    //                         var campus = checkcampusandroom[i].campus;
    //                         //console.log(campus + "   check campus")
    //                         getcampusandroomquery = "select * from classroom where Campus =\"" + campus + "\" and status=\"Open\" "
    //                             + " and rid not in (select rid from allclassroomtimeslot where Campus = \"" + campus + "\" and startdate = \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + "\" and (starttime < Time(\"" + timestamp.toLocaleTimeString("en-GB") + "\")< endtime))"
    //                             + " and rid not in(select rid from allclass where Campus = \"" + campus + "\" and weekdays = \"" + timestamp.getDay() + "\" and (starttime < Time(\"" + timestamp.toLocaleTimeString("en-GB") + "\")< endtime))"
    //                             + " and concat(campus,rid) not in (select concat(campus,rid) from allschedulebox where boxdate = \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\")"
    //                         //console.log(getcampusandroomquery);

    //                         var checkcampusandroom = await new Promise((resolve) => {
    //                             pool.query(getcampusandroomquery, (err, res) => {
    //                                 var string = JSON.stringify(res);
    //                                 var json = JSON.parse(string);
    //                                 var ans = json;
    //                                 resolve(ans)
    //                             })
    //                         }).catch((err) => {
    //                             errmsg = "error happened in ScheduleController.genavailble.getcampusandroomquery"
    //                         })
    //                         // console.log(checkcampusandroom)
    //                         if (checkcampusandroom.length > 0) {
    //                             room = checkcampusandroom[0].RID;
    //                         } else {
    //                             room = null;
    //                         }

    //                         if (room != null) {
    //                             // console.log(campus + "    " + room)
    //                             let boxid = 'boxID';
    //                             const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    //                             const charactersLength = characters.length;
    //                             let counter = 0;
    //                             while (counter < 15) {
    //                                 boxid += characters.charAt(Math.floor(Math.random() * charactersLength));
    //                                 counter += 1;
    //                             }
    //                             var insertscheduleboxquery = "insert into allschedulebox values(\"" + boxid + "\",\"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\",\"" + req.body.typeofpresent + "\","
    //                                 + "\"" + thisschedulebox[c].schedule[e].tid + "\",\"" + thisschedulebox[c].schedule[e].sid + "\",\"" + thisschedulebox[c].schedule[e].oid + "\","
    //                                 + "\"" + campus + "\",\"" + room + "\", now()) ;"
    //                             // console.log(insertscheduleboxquery)

    //                             var insertbox = await new Promise((resolve) => {
    //                                 pool.query(insertscheduleboxquery, (err, res) => {
    //                                     resolve(res)
    //                                 })
    //                             }).catch((err) => {
    //                                 errmsg = "error happened in ScheduleController.genavailble.insertscheduleboxquery"
    //                             })
    //                             added = true;
    //                             break;
    //                         } else {
    //                             console.log("this set have problem", thisschedulebox[c].schedule[e])
    //                         }

    //                     }
    //                     if (!added) {
    //                         var manualhandleline = "insert ignore into manualhandlecase values(\"" + thisschedulebox[c].schedule[e].sid + "\",\"" + thisschedulebox[c].schedule[e].tid + "\",\"" + thisschedulebox[c].schedule[e].oid + "\")"
    //                         db.query(manualhandleline, (err, res) => {
    //                             try {
    //                                 // console.log("inserted manual handlecase")
    //                             } catch (err) {
    //                                 // console.log("error happened in inserting ScheduleController.genavailble.manualhandleline")
    //                             }
    //                         })
    //                     } else {

    //                         var delavailabletimequery = "delete from supervisoravailable where (tid = \"" + thisschedulebox[c].schedule[e].tid + "\" or tid = \"" + thisschedulebox[c].schedule[e].oid + "\") and availablestartTime = \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\"; "
    //                         // + "delete from studentavailable where sid = \"" + thisschedulebox[c].schedule[e].sid + "\" and availablestartTime = \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\";"
    //                         //console.log(delavailabletimequery)
    //                         db.query(delavailabletimequery, (err, result) => {
    //                             try {
    //                                 //   console.log("delavailabletimequery complete")
    //                             } catch (err) {
    //                                 if (err) {
    //                                     errmsg = "error happened in ScheduleController.delavailabletimequery"
    //                                 }
    //                             }

    //                         })
    //                         delavailabletimequery = "delete from studentavailable where sid = \"" + thisschedulebox[c].schedule[e].sid + "\" and availablestartTime = \"" + timestamp.getFullYear() + "-" + (timestamp.getMonth() + 1) + "-" + timestamp.getDate() + " " + timestamp.toLocaleTimeString("en-GB") + "\";"
    //                         //console.log(delavailabletimequery)
    //                         db.query(delavailabletimequery, (err, result) => {
    //                             try {
    //                                 // console.log("delavailabletimequery complete")
    //                             } catch (err) {
    //                                 if (err) {
    //                                     errmsg = "error happened in ScheduleController.delavailabletimequery"
    //                                 }
    //                             }

    //                         })

    //                     }


    //                 }

    //             }


    //         }
    //     }


    //     return res.ok();
    // },


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
        //console.log(setting3)

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

        var manualhandlecase = await new Promise((resolve) => {
            pool.query("select * from manualhandlecase", (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                if (json.length == 0) {
                    resolve(null);
                } else {
                    resolve(ans)
                }

            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.supervisorschedulelist.getmanualhandlecase"
        })


        var query = "select *  from supervisor"
        db.query(query, function (err, result) {
            try {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                var ans = json;

                return res.view("user/admin/supervisorschedulelist", { allsuplist: ans, manualhandlecase: manualhandlecase })
            } catch (err) {
                return res.status(401).json("error happened in SchdeuleController.supervisorschedulelist.query")
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


        var displaystartday = new Date(setting3.startday.getTime() - 60 * 60 * 24 * 1000 * setting3.startday.getDay() + 60 * 60 * 24 * 1000 * (req.params.Page - 1) * 7);
        var displayendday = new Date(setting3.startday.getTime() + 60 * 60 * 24 * 1000 * (6 - setting3.startday.getDay()) + 60 * 60 * 24 * 1000 * (req.params.Page - 1) * 7);
        displayendday.setHours(18);
        displayendday.setMinutes(30);
        var startday = displaystartday.toLocaleDateString('en-GB').split('/').reverse().join('-');
        var endday = new Date(displayendday.getTime() + 60 * 60 * 24 * 1000).toLocaleDateString('en-GB').split('/').reverse().join('-');
        console.log(displaystartday, "  ", displaystartday.toLocaleTimeString("en-GB"), "  display from  ", displayendday, "  ", displayendday.toLocaleTimeString("en-GB"))

        var query = "select * from allschedulebox where (tid = \"" + req.params.tid + "\" or oid =  \"" + req.params.tid + "\" ) and (boxdate >= date(\"" + startday + "\") and boxdate <= date(\"" + endday + "\") ) order by boxdate asc;"
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
                    if (ans.length > 0) {
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
        console.log("type from controller", type)

        query = "select * from allrequestfromsupervisor where tid = \"" + req.params.tid + "\"  and (RequestDate >= date(\"" + startday + "\") and RequestDate <= date(\"" + endday + "\") ) order by requestdate asc, requeststarttime asc";
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

        query = "select allclass.cid,weekdays,starttime,endtime,campus,rid from (select * from allsupertakecourse where pid = \"" + req.params.tid + "\") as t1 left join allclass on t1.cid = allclass.cid order by weekdays asc, allclass.starttime asc;";
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

        query = "select * from manualhandlecase where tid = \"" + req.params.tid + "\" or oid = \"" + req.params.tid + "\"";
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
            displaystartday: displaystartday, displayendday: displayendday, Page: req.params.Page, type: type,
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
                return res.status(401).json("Error happened when excuting SettingController.checksetting")
            }


        });

    },

    HandleManualCase: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();


        if (req.query.boxid == "null") {
            // don't have a schedulebox
            console.log("this is a empty student , ")

            var getpairing = "select tid,supervisorpairstudent.sid,oid from supervisorpairstudent join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid and supervisorpairstudent.sid = \"" + req.query.sid + "\"";
            //console.log(getpairing);
            pairinginfo = await new Promise((resolve) => {
                pool.query(getpairing, (err, res) => {
                    if (err) { resolve(JSON.parse(JSON.stringify({ "errmsg": "error happened in ScheduleController.HandleManualCase.getPairing" }))) }
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    if (json.length > 0) {
                        var ans = json[0];
                        resolve(ans);
                    } else {
                        resolve(null);
                    }

                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.HandleManualCase.getPairing"
            })

            if (req.query.type == "null") {
                var type = await new Promise((resolve) => {
                    pool.query("select distinct(type) as type from allschedulebox", (err, res) => {
                        if (err) { resolve(JSON.parse(JSON.stringify({ "errmsg": "error happened in ScheduleController.HandleManualCase.getPairing" }))) }
                        var string = JSON.stringify(res);
                        var json = JSON.parse(string);
                        if (json.length > 0) {
                            var ans = json[0].type;
                            resolve(ans);
                        } else {
                            resolve(null);
                        }

                    })
                }).catch((err) => {
                    errmsg = "error happened in ScheduleController.HandleManualCase.getPairing"
                })
                req.query.type = type;
                console.log(req.query.type);
            }

            var CurrentBox = JSON.parse(JSON.stringify({
                boxID: null,
                boxdate: null,
                TYPE: req.query.type,
                TID: pairinginfo.tid,
                SID: pairinginfo.sid,
                OID: pairinginfo.oid,
                Campus: null,
                RID: null,
                LastUpdate: null
            }));
            //console.log(CurrentBox);

            // var getavailabletimes = "select t1.tid,t1.sid, observerpairstudent.oid,t1.availabledate,t1.availablestartTime,t1.availableendTime from "
            //     + "(select supervisorpairstudent.tid,supervisorpairstudent.sid,sa1.availabledate,sa1.availablestartTime,sa1.availableendTime "
            //     + "from supervisorpairstudent left join supervisoravailable as sa1 on sa1.tid = supervisorpairstudent.tid "
            //     + "where supervisorpairstudent.sid = \"" + req.query.sid + "\" "
            //     + "and (sa1.availabledate in (select availabledate from studentavailable where sid = \"" + req.query.sid + "\") "
            //     + "and sa1.availablestartTime in (select availablestartTime from studentavailable where sid = \"" + req.query.sid + "\") "
            //     + "and sa1.availableendTime in (select availableendTime from studentavailable where sid = \"" + req.query.sid + "\")) "
            //     + ")as t1 left join observerpairstudent on t1.sid = observerpairstudent.sid "
            //     + " left join supervisoravailable as sa2 on sa2.tid = observerpairstudent.oid "
            //     + "where (sa2.availabledate = t1.availabledate "
            //     + "and sa2.availablestartTime = t1.availablestartTime "
            //     + "and sa2.availableendTime = t1.availableendTime);"
        } else {
            // have a schedulebox

            var getCurrentBox = "Select * from allschedulebox where boxid = \"" + req.query.boxid + "\"; ";
            CurrentBox = await new Promise((resolve) => {
                pool.query(getCurrentBox, (err, res) => {
                    if (err) { resolve(JSON.parse(JSON.stringify({ "errmsg": "error happened in ScheduleController.HandleManualCase.getCurrentBox" }))) }
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    if (json.length > 0) {
                        var ans = json[0];
                        resolve(ans);
                    } else {
                        resolve(null);
                    }

                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.HandleManualCase.getCurrentBox"
            })

            console.log("this box need modify ", CurrentBox)


        }
        var getavailabletimes = "select availabledate , availablestartTime from studentavailable where sid = \"" + CurrentBox.SID + "\" and availabledate in("
            + " select availabledate from supervisoravailable where tid = \"" + CurrentBox.TID + "\" "
            + "and availablestarttime in(select availablestarttime from supervisoravailable where tid = \"" + CurrentBox.OID + "\")) "
            + "and availablestarttime in( select availablestartTime from supervisoravailable where tid = \"" + CurrentBox.TID + "\" "
            + "and availablestarttime in(select availablestarttime from supervisoravailable where tid = \"" + CurrentBox.OID + "\"));";
        //console.log(getavailabletimes);
        availableCombination = await new Promise((resolve) => {
            pool.query(getavailabletimes, (err, res) => {
                if (err) { resolve(JSON.parse(JSON.stringify({ "errmsg": "error happened in ScheduleController.HandleManualCase.availableCombination" }))) }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);

                var ans = json;
                resolve(ans)


            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.HandleManualCase.availableCombination"
        })

        function getuniquedate(arr) {
            let unique = [];
            arr.forEach(element => {
                var stringdate = ((new Date(element.availabledate)).toLocaleDateString('en-GB')).split("/")
                stringdate = stringdate[2] + "-" + stringdate[1] + "-" + stringdate[0];
                if (!unique.includes(stringdate)) {
                    unique.push(stringdate);
                }
            });
            return unique;
        }
        var availabledate = getuniquedate(availableCombination);

        if (availableCombination.errmsg == undefined) {
            return res.view("user/admin/HandleManualCase", { currentbox: CurrentBox, availabledate: availabledate, availableCombination: availableCombination })
        } else {
            return res.status(401).json(availableCombination.errmsg);
        }

    },

    GetData: async function (req, res, next) {
        console.log(req.query);
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();

        if (req.query.Command == "getTime") {
            var getavailabletimes = "select availablestartTime from studentavailable where sid = \"" + req.query.SID + "\" and availablestartTime in ("
                + "select availablestartTime from supervisoravailable where tid = \"" + req.query.OID + "\" "
                + "and availablestartTime in(select availablestartTime from supervisoravailable where tid = \"" + req.query.TID + "\" and availabledate = \"" + req.query.Date + "\"));"
            console.log(getavailabletimes)
            availbletimes = await new Promise((resolve) => {
                pool.query(getavailabletimes, (err, res) => {
                    if (err) { return res.status(401).json("error happened in HandelManualCase.GetTimeByDate") }
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    var ans = new Array();
                    json.forEach(element => {
                        var starttime = (new Date(element.availablestartTime)).toLocaleTimeString("en-GB");
                        ans.push(starttime);
                    });
                    console.log(ans);
                    resolve(ans);
                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.HandleManualCase.availableCombination"
            })


            return res.status(200).json(availbletimes);
        } else if (req.query.Command == "getCampus") {
            var getcampus = "select distinct(Campus) as Campus from classroom where Campus != \"\";"
            campuslist = await new Promise((resolve) => {
                pool.query(getcampus, (err, res) => {
                    if (err) { return res.status(401).json("error happened in HandelManualCase.GetTimeByDate") }
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    resolve(json);
                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.HandleManualCase.availableCombination"
            })
            return res.status(200).json(campuslist);
        } else if (req.query.Command == "getRoom") {
            var newdate = new Date(req.query.Date + " " + req.query.Time);
            var newdatestring = newdate.toLocaleDateString("en-GB").split("/");
            var timestampstring = newdatestring[2] + "-" + newdatestring[1] + "-" + newdatestring[0] + " " + newdate.toLocaleTimeString("en-GB");
            var getRoomquery = "select distinct(rid) as Room from classroom where Campus = \"" + req.query.Campus + "\" and status = \"Open\" and rid != \"\" "
                + " and (rid not in (select rid from allclass where Campus = \"" + req.query.Campus + "\" and weekdays = \"" + newdate.getDay() + "\" and (endtime >= time(\"" + newdate.toLocaleTimeString("en-GB") + "\") and time(\"" + newdate.toLocaleTimeString("en-GB") + "\") >= starttime)) "
                + " and rid not in (select rid from allclassroomtimeslot where Campus =  \"" + req.query.Campus + "\" and (timestamp(concat(StartDate,\" \",startTime)) <= timestamp(\"" + timestampstring + "\") and timestamp(concat(endDate,\" \",endTime)) >= timestamp(\"" + timestampstring + "\")))"
                + " and concat(campus,rid) not in (select concat(campus,rid) from allschedulebox where boxdate = \"" + timestampstring + "\"));"
                ;
            console.log(getRoomquery)
            roomlist = await new Promise((resolve) => {
                pool.query(getRoomquery, (err, res) => {
                    if (err) { return res.status(401).json("error happened in HandelManualCase.Getdata.Roomlist") }
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);

                    resolve(json);
                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.HandleManualCase.Getdata.Roomlist"
            })
            return res.status(200).json(roomlist);
        } else {
            return res.status(401).json("error with no command matched")
        }


    },

    EditScheduleBox: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();

        if (req.body.Campus == "null" || req.body.RID == "null"
            || req.body.SID == "null" || req.body.TID == "null" || req.body.OID == "null"
            || req.body.date == "null" || req.body.time == "null"
        ) { return res.status(401).json("Invalid input involoved") }

        var boxdate = req.body.date + " " + req.body.time;
        // Schedulebox format
        // {
        //     boxID: 'boxIDnsTovD31ySUIFtF',
        //     boxdate: '2024-01-20T04:30:00.000Z',
        //     TYPE: 'final',
        //     TID: 'tid00001',
        //     SID: 'sid10111',
        //     OID: 'tid00002',
        //     Campus: 'AAB',
        //     RID: 'AAB509',
        //     LastUpdate: '2023-12-26T01:05:25.000Z'
        // }


        console.log(req.body);
        console.log("check here ", req.body.TYPE);
        console.log("check here midterm", req.body.TYPE == "midterm");
        console.log("check here final", req.body.TYPE == "final");

        var type = await new Promise((resolve) => {
            pool.query("select distinct(TYPE) as TYPE from allschedulebox", (err, res) => {
                if (err) { return res.status(401).json("error happened in ScheduleController.EditScheduleBox.getCurrentBox") }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                console.log("check here 2 ", json[0].TYPE);
                if (json.length > 0) {
                    resolve(json[0].TYPE);
                } else {
                    resolve(null);
                }
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.EditScheduleBox.gettype"
        })
        req.body.TYPE = type;



        console.log("check here 3", req.body.TYPE);
        if (req.body.boxID == "") {
            //create a new schedulebox by insert 
            let boxid = 'boxID';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < 15) {
                boxid += characters.charAt(Math.floor(Math.random() * charactersLength));
                counter += 1;
            }
            req.body.boxID = boxid;
            console.log(req.body);
            var query = ["insert allschedulebox values (\"" + req.body.boxID + "\",\"" + req.body.date + " " + req.body.time + "\",\"" + req.body.TYPE + "\",\"" + req.body.TID + "\",\"" + req.body.SID + "\",\"" + req.body.OID + "\",\"" + req.body.Campus + "\",\"" + req.body.RID + "\",now());",
            "Delete from supervisoravailable where tid = \"" + req.body.TID + "\" and availabledate = \"" + req.body.date + "\" and availablestarttime = \"" + req.body.date + " " + req.body.time + "\";",
            "Delete from supervisoravailable where tid = \"" + req.body.OID + "\" and availabledate = \"" + req.body.date + "\" and availablestarttime = \"" + req.body.date + " " + req.body.time + "\";",
            "Delete from studentavailable where sid = \"" + req.body.SID + "\" and availabledate = \"" + req.body.date + "\" and availablestarttime = \"" + req.body.date + " " + req.body.time + "\";",
            "Delete from manualhandlecase where sid = \"" + req.body.SID + "\" ;",
            ]

            query.forEach(element => {
                db.query(element, (err, res) => {
                    try { } catch (err) { return res.status(401).json("error happened in ScheduleController.EditScheduleBox.UpdateQuery") }
                })
            });

            return res.status(200).json("done");

        } else {
            // check whether the current classroom can still be used for present
            var getCurrentBox = "select * from allschedulebox where boxID = \"" + req.body.boxID + "\";";
            console.log(getCurrentBox)
            var CurrentBox = await new Promise((resolve) => {
                pool.query(getCurrentBox, (err, res) => {
                    if (err) { return res.status(401).json("error happened in ScheduleController.EditScheduleBox.getCurrentBox") }
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    if (json.length > 0) {
                        resolve(json[0]);
                    } else {
                        resolve(null);
                    }
                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.EditScheduleBox.getCurrentBox"
            })
            var oldboxdate = new Date(CurrentBox.boxdate);
            var oldboxdatestring = oldboxdate.toLocaleDateString("en-GB").split("/");
            var oldboxendtime;
            if (req.body.type == "final") {
                oldboxendtime = new Date(oldboxdate.getTime() + 60 * 60 * 1000);
            } else {
                oldboxendtime = new Date(oldboxdate.getTime() + 30 * 60 * 1000);
            }
            var query = ["Update allschedulebox set boxdate = \"" + req.body.date + " " + req.body.time + "\" , Campus = \"" + req.body.Campus + "\", RID = \"" + req.body.RID + "\",LastUpdate = now() where boxID = \"" + req.body.boxID + "\";",
            "insert into supervisoravailable values('" + req.body.TID + "','" + oldboxdatestring[2] + "-" + oldboxdatestring[1] + "-" + oldboxdatestring[0] + "','" + oldboxdatestring[2] + "-" + oldboxdatestring[1] + "-" + oldboxdatestring[0] + " " + oldboxdate.toLocaleTimeString("en-GB") + "','" + oldboxdatestring[2] + "-" + oldboxdatestring[1] + "-" + oldboxdatestring[0] + " " + oldboxendtime.toLocaleTimeString("en-GB") + "');",
            "insert into supervisoravailable values('" + req.body.OID + "','" + oldboxdatestring[2] + "-" + oldboxdatestring[1] + "-" + oldboxdatestring[0] + "','" + oldboxdatestring[2] + "-" + oldboxdatestring[1] + "-" + oldboxdatestring[0] + " " + oldboxdate.toLocaleTimeString("en-GB") + "','" + oldboxdatestring[2] + "-" + oldboxdatestring[1] + "-" + oldboxdatestring[0] + " " + oldboxendtime.toLocaleTimeString("en-GB") + "');",
            "insert into studentavailable values('" + req.body.SID + "','" + oldboxdatestring[2] + "-" + oldboxdatestring[1] + "-" + oldboxdatestring[0] + "','" + oldboxdatestring[2] + "-" + oldboxdatestring[1] + "-" + oldboxdatestring[0] + " " + oldboxdate.toLocaleTimeString("en-GB") + "','" + oldboxdatestring[2] + "-" + oldboxdatestring[1] + "-" + oldboxdatestring[0] + " " + oldboxendtime.toLocaleTimeString("en-GB") + "');",
            "Delete from supervisoravailable where tid = \"" + req.body.TID + "\" and availabledate = \"" + req.body.date + "\" and availablestarttime = \"" + req.body.date + " " + req.body.time + "\";",
            "Delete from supervisoravailable where tid = \"" + req.body.OID + "\" and availabledate = \"" + req.body.date + "\" and availablestarttime = \"" + req.body.date + " " + req.body.time + "\";",
            "Delete from studentavailable where sid = \"" + req.body.SID + "\" and availabledate = \"" + req.body.date + "\" and availablestarttime = \"" + req.body.date + " " + req.body.time + "\";",
            ]
            query.forEach(element => {
                db.query(element, (err, res) => {
                    try { } catch (err) { return res.status(401).json("error happened in ScheduleController.EditScheduleBox.UpdateQuery") }
                })
            });

            return res.status(200).json("done");


            // update the box

        }

        //update 3 ppl's availabletimeslot table
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

    EditRecords: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();

        if (req.body.command = "delete") {

            var query = ["delete from allschedulebox where boxid = '" + req.body.boxid + "';",
            "insert into supervisoravailable values('" + req.body.tid + "','" + req.body.date + "','" + req.body.date + " " + req.body.starttime + "','" + req.body.date + " " + req.body.endtime + "');",
            "insert into supervisoravailable values('" + req.body.oid + "','" + req.body.date + "','" + req.body.date + " " + req.body.starttime + "','" + req.body.date + " " + req.body.endtime + "');",
            "insert into studentavailable values('" + req.body.sid + "','" + req.body.date + "','" + req.body.date + " " + req.body.starttime + "','" + req.body.date + " " + req.body.endtime + "');",
            "insert into manualhandlecase values('" + req.body.sid + "','" + req.body.tid + "','" + req.body.oid + "');"]

            query.forEach(element => {
                db.query(element, (err, results) => {
                    try { } catch (err) {
                        return res.status(401).json("Error happened when excuting ScheduleController.EditRecords.delete")
                    }
                });
            });


        } else {

        }
        return res.status(200).json("ok");
    }
}
