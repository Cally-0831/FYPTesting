const { start } = require("repl");
const { setTimeout } = require("timers/promises");
const { Blob } = require('buffer');
const { Parser } = require('@json2csv/plainjs');
const { timeStamp } = require("console");

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
        // console.log(req.body);

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



                if (req.body.typeOfPresent == "midterm") {
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





                } else if (req.body.typeOfPresent == "final") {
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

                if (req.body.typeOfPresent == "midterm") {
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


                } else if (req.body.typeOfPresent == "final") {
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

            addthreepartyAva.forEach(async threepartyava => {
                var availabledate = ((new Date(threepartyava.availabledate)).toLocaleDateString("en-GB")).split("/");
                threepartyava.availabledate = availabledate[2] + "-" + availabledate[1] + "-" + availabledate[0];

                threepartyava.availablestarttime = threepartyava.availabledate + " " + (new Date(threepartyava.availablestarttime)).toLocaleTimeString("en-GB");
                threepartyava.availableendtime = threepartyava.availabledate + " " + (new Date(threepartyava.availableendtime)).toLocaleTimeString("en-GB");
                //console.log("insert into threeparty (tid,sid,oid,availabledate,availablestarttime,availableendtime) values(\"" + threepartyava.tid + "\",\"" + threepartyava.sid + "\",\"" + threepartyava.oid + "\",Date(\"" + threepartyava.availabledate + "\"),Timestamp(\"" + threepartyava.availablestarttime + "\"),timestamp(\"" + threepartyava.availableendtime + "\")) ");
                await db.query("insert into threeparty (tid,sid,oid,availabledate,availablestarttime,availableendtime) values(\"" + threepartyava.tid + "\",\"" + threepartyava.sid + "\",\"" + threepartyava.oid + "\",Date(\"" + threepartyava.availabledate + "\"),Timestamp(\"" + threepartyava.availablestarttime + "\"),timestamp(\"" + threepartyava.availableendtime + "\")) ", (err, result) => {
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


        console.log("\n\nGeneration of available timeslots for 3-parties was completed\n\n")

        //return res.redirect("/scheduledesign/startschedule?typeOfPresent=" + req.body.typeOfPresent)
        return res.redirect("/scheduledesign/nqueenversion?typeOfPresent=" + req.body.typeOfPresent)
    },

    nqueenversion: async function (req, res) {
        console.log("\n\nStart Processing with N-queen version");

        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        console.log(req.query);

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
        function copyarray(array1) {
            var ans = new Array();
            ans = array1.slice();
            return ans;
        }

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
        var preSetClassroomList = ['FSC801C', 'FSC801D', 'FSC901C', 'FSC901D','FSC901E', 'RRS638','RRS735']

        async function getStudentnum() {
            var studentnum = await new Promise((resolve) => {
                pool.query("select count(*) as counting from student", (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        if (json.length > 0) {
                            resolve(json[0].counting);
                        }

                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.startschedule.getStudentnum()"
            })
            if (studentnum != "err") { return studentnum; } else { return false; }
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
            // console.log(ans)
            return ans;
        }

        async function checkuniquetimeslotcountforoneday(plan) {
            // var queryline = "select count(*) from threeparty where availabledate = \"2024-02-19\""
            var queryline = "SELECT distinct(availablestarttime),COUNT(*)  from  threeparty where " + getallplandate(plan) + " GROUP BY availablestarttime order by availablestarttime asc;"
            // var queryline = "select tid, count(sid) from supervisorpairstudent group by tid order by count(sid) desc;"
            // console.log("\n\n>>checkuniquetimeslotcountforoneday()    ", queryline);
            var uniquetimeslotcounts = await new Promise((resolve) => {
                db.query(queryline, (err, results) => {
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

        async function checkclassroomttb(classroom, weekday, starttime, endtime) {
            // console.log("select * from  allclass where RID =\"" + classroom + "\" and weekdays = " + weekday + " and !(Time(\"" + starttime + "\") >= endTime || Time(\"" + endtime + "\") <= startTime);")
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

        function resetsessionendtime(sessionstarttime) {
            var sessionend;
            if (req.query.typeOfPresent == "final") {
                sessionend = new Date(sessionstarttime.getTime() + 45 * 60 * 1000);
            } else {
                sessionend = new Date(sessionstarttime.getTime() + 25 * 60 * 1000);
            }
            return sessionend;
        }

        async function availblepairsforthistimeslot(plandate, starttime) {
            // var queryline = "select count(*) from threeparty where availabledate = \"2024-02-19\""
            var queryline = "Select * from threeparty where availabledate = \"" + plandate + "\" and availablestarttime = \"" + plandate + " " + starttime + "\" ;"
            // var queryline = "select tid, count(sid) from supervisorpairstudent group by tid order by count(sid) desc;"
            // console.log("\n\n>>checkuniquetimeslotcountforoneday()    ", queryline);
            var availablepairs = await new Promise((resolve) => {
                db.query(queryline, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        resolve(json);
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.nqueenversion.availblepairsforthistimeslot()"
            })
            if (availablepairs != "err") { return availablepairs; } else { return false; }
        }

        function reducePairBySID(selectedArray, PresentationList) {
            // console.log("org presentlistlenght", selectedArray)
            var ans;
            if(selectedArray.length == 0 || selectedArray == null ){return PresentationList;}

            selectedArray.forEach(element => {

                if (PresentationList.find((element2) => element.SID == element2.SID)) {

                    var stuid = PresentationList.find((element2) => element.SID == element2.SID);
                    var index = PresentationList.indexOf(stuid);
                    // console.log("have this person reduce sin", index)

                    var removed = PresentationList.splice(index, 1);
                    // console.log(removed)

                    ans = copyarray(PresentationList);
                    // console.log(ans);
                    PresentationList = ans;
                }
            });
            // console.log(">> reduce Pair from selected ", PresentationList.length)
            return PresentationList;
        }

        function reducePairBySupObs(selectedArray, PresentationList) {
            // console.log("org presentlistlenght", PresentationList.length)
            var ans;

            selectedArray.forEach(element => {
                while (PresentationList.find((element2) => element.TID == element2.TID)) {
                    var id = PresentationList.find((element2) => element.TID == element2.TID);
                    var index = PresentationList.indexOf(id);
                    // console.log("have this person reduce sin case1")
                    var removed = PresentationList.splice(index, 1);
                    ans = copyarray(PresentationList);
                    PresentationList = ans;
                }
                while (PresentationList.find((element2) => element.TID == element2.OID)) {
                    var id = PresentationList.find((element2) => element.TID == element2.OID);
                    var index = PresentationList.indexOf(id);
                    // console.log("have this person reduce sin case 2")

                    var removed = PresentationList.splice(index, 1);
                    // console.log(removed)

                    ans = copyarray(PresentationList);
                    // console.log(ans);
                    PresentationList = ans;
                }
                while (PresentationList.find((element2) => element.OID == element2.TID)) {
                    var id = PresentationList.find((element2) => element.OID == element2.TID);
                    var index = PresentationList.indexOf(id);
                    // console.log("have this person reduce sin case 3")
                    var removed = PresentationList.splice(index, 1);
                    // console.log(removed)

                    ans = copyarray(PresentationList);
                    // console.log(ans);
                    PresentationList = ans;
                }
                while (PresentationList.find((element2) => element.OID == element2.OID)) {
                    var id = PresentationList.find((element2) => element.OID == element2.OID);
                    var index = PresentationList.indexOf(id);
                    // console.log("have this person reduce sin case 4")

                    var removed = PresentationList.splice(index, 1);
                    // console.log(removed)

                    ans = copyarray(PresentationList);
                    // console.log(ans);
                    PresentationList = ans;
                }

            });
            // console.log(">> reduce Pair from selected ", PresentationList.length)
            return PresentationList;
        }

        function reducePairByTeachingStaff(StaffList, PresentationList) {
            // console.log("(StaffList requires removal", StaffList)
            var ans;

            StaffList.forEach(staff => {
                while (PresentationList.find((element2) => staff.ID == element2.TID)) {
                    var id = PresentationList.find((element2) => staff.ID == element2.TID);
                    var index = PresentationList.indexOf(id);
                    // console.log("have this person reduce sin case1")
                    var removed = PresentationList.splice(index, 1);
                    ans = copyarray(PresentationList);
                    PresentationList = ans;
                }
                while (PresentationList.find((element2) => staff.ID == element2.OID)) {
                    var id = PresentationList.find((element2) => staff.ID == element2.OID);
                    var index = PresentationList.indexOf(id);
                    // console.log("have this person reduce sin case 2")

                    var removed = PresentationList.splice(index, 1);
                    // console.log(removed)

                    ans = copyarray(PresentationList);
                    // console.log(ans);
                    PresentationList = ans;
                }


            });
            // console.log(">> reduce Pair from TeachingStaff ", PresentationList)
            return PresentationList;
        }

        function retrieveConsecList(PreviousList, PresentationList) {
            /** PreviousList == previous 3 timeslot
            *  return a list that teaching staff exist in previous timeslot before
            */
            var priorityList = new Array();
            if (PreviousList.length == 0) { return priorityList; }

            PreviousList.forEach(ScheduledTimeslots => {
                ScheduledTimeslots.forEach(ScheduledPresent => {
                    var foundTID = PresentationList.filter((element) => element.TID == ScheduledPresent.TID || element.OID == ScheduledPresent.TID)
                    var foundOID = PresentationList.filter((element) => element.TID == ScheduledPresent.OID || element.OID == ScheduledPresent.OID)
                    priorityList.push(foundTID)
                    priorityList.push(foundOID)
                });


            });
            priorityList = (uniquePresentationList(priorityList));
            // console.log(">>priorityList in retrieveConsecList",priorityList);
            return priorityList;
        }

        function uniquePresentationList(PresentationList) {
            if (PresentationList.length == 0) { return PresentationList; }
            var uniqueList = new Array();
            PresentationList.forEach(element => {
                if (!uniqueList.find((present) => present.SID == element.SID)) {
                    uniqueList.push(element);
                }
            });
            PresentationList = uniqueList;
            return PresentationList;
        }

        function reduceConsec3Session(schedulePlan, PresentationList) {
            /** only getting previous 3 timeslot
             *  By default should not have a teaching staff sit for 4 session
             */

            var teacherList = new Array();
            if (schedulePlan.length == 0) { return PresentationList; }
            schedulePlan.forEach(timeslot => {
                timeslot.forEach(room => {
                    if (!teacherList.find((element) => element.ID == room.TID)) {
                        var obj = JSON.parse(JSON.stringify({ ID: room.TID, count: 0 }))
                        teacherList.push(obj)
                    }
                    if (!teacherList.find((element) => element.ID == room.OID)) {
                        var obj = JSON.parse(JSON.stringify({ ID: room.OID, count: 0 }))
                        teacherList.push(obj)
                    }
                });
            });

            var countingForSitting = 0;
            teacherList.forEach(teachingstaff => {
                schedulePlan.forEach(timeslot => {
                    var found = false;
                    timeslot.forEach(room => {
                        if (room.TID == teachingstaff.ID || room.OID == teachingstaff.ID) {
                            countingForSitting++;
                            found = true;
                        }
                    });
                    if (!found) {
                        countingForSitting = 0;
                    } else {
                        teachingstaff.count = countingForSitting;
                    }
                });
            });
            // console.log("teacherList   " ,teacherList.filter((staff) => staff.count >= 3))

            //first reduce those staff already sit for 3 session
            PresentationList = reducePairByTeachingStaff(teacherList.filter((staff) => staff.count >= 3), PresentationList);
            // console.log("PriorityList  1   ", PresentationList);
            // PresentationList = retrieveConsecList(schedulePlan, PresentationList);
            // console.log("PriorityList  2   ", PresentationList);
            return PresentationList;
        }

        function reduceByCombination(SchedulePlans, PresentationList, thistimeslot, timeslotCombin){
            var needremoval = false;
            var count =0;
            // console.log("reduceByCombinationProblem")
            var removeElement = new Array();
            SchedulePlans.forEach(plans => {
                var count =0;
                plans.Schd[thistimeslot].forEach(ScheduledPresent => {
                    if(timeslotCombin.find((element)=> element.SID == ScheduledPresent.SID)){
                        count++;
                    }else{
                        
                        removeElement.push(ScheduledPresent);
                    }
                });
                if(count == timeslotCombin.length){
                    needremoval=true;
                }
            });
            removeElement = uniquePresentationList(removeElement);
           
            PresentationList = reducePairBySID(removeElement,PresentationList);
            return PresentationList;
        }

        function randomNum(PresentationList) {

            return Math.floor(Math.random() * PresentationList.length);

        }

        function product_Range(a, b) {
            var prd = a, i = a;

            while (i++ < b) {
                prd *= i;
            }
            return prd;
        }

        function combinations(n, r) {
            if (n == r || r == 0) {
                return 1;
            }
            else {
                r = (r < n - r) ? n - r : r;
                return product_Range(r + 1, n) / product_Range(1, n - r);
            }
        }

        function calcPercentage(x, y, fixed = 2) {
            const percent = (x / y) * 100;

            if (!isNaN(percent)) {
                return (Number(percent.toFixed(fixed)) + "%");
            } else {
                return null;
            }
        }

        var totalStudNum = await getStudentnum();
        var finalResultOfPlans = new Array();
        console.log("Total plans requires process", possibledatecombination.length,"\n\n")
        var ProcessStart = new Date();
        for (var datecombin = 0; datecombin < possibledatecombination.length; datecombin++) {
            // for (var datecombin = 5; datecombin < 6; datecombin++) {
            var SchedulesforThisDateCombin = new Array();
            console.log("Current process status ", calcPercentage((datecombin + 1), possibledatecombination.length))
            var uniquetimeslotcounts = await checkuniquetimeslotcountforoneday(possibledatecombination[datecombin]);
            var Successfulplannum = 0;
            var SelectedPlan;
            var PlanProcessStart = new Date();
            // console.log(uniquetimeslotcounts);
            for (var possibleplan = 0; possibleplan < combinations(totalStudNum, 4); possibleplan++) {
                // for (var possibleplan = 0; possibleplan < 1; possibleplan++) {
                // console.log("working on possibleplan for one date  ", possibleplan, "/", combinations(totalStudNum, 4), "  ----------  ", calcPercentage(possibleplan, combinations(totalStudNum, 4)), " ------- ", Successfulplannum);
                var thisscheduleplan = new Array(uniquetimeslotcounts.length);
                var selectedAy = new Array();
                var pref = false;
                if (!(possibleplan % 2 == 0) || possibleplan == 0) { pref = true; }
                for (var timeslots = 0; timeslots < uniquetimeslotcounts.length; timeslots++) {

                    // for (var timeslots = 0; timeslots < 5; timeslots++) {
                    var sessionstarttime = new Date(uniquetimeslotcounts[timeslots].availablestarttime);
                    var sessionendtime = resetsessionendtime(sessionstarttime);
                    var sqldatestring = sessionstarttime.toLocaleDateString("en-GB").split("/");
                    sqldatestring = sqldatestring[2] + "-" + sqldatestring[1] + "-" + sqldatestring[0];
                    sqldatestring.trim();
                    // var selectedBaseonTime = new Array();
                    var PresentationList = await availblepairsforthistimeslot(sqldatestring, sessionstarttime.toLocaleTimeString("en-GB"));
                    PresentationList = reducePairBySID(selectedAy, PresentationList);
                    // console.log(presentationlist);
                    //get the classroomlist that available for the time
                    var availableclassroomlist = new Array();;
                    for (var room = 0; room < 4; room++) {
                        if (req.query.typeOfPresent == "final") {
                            var roomttbresult = await checkclassroomttb(preSetClassroomList[room], sessionstarttime.getDay(), sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                            var roomtimeslotresult = await checkclassroomtimeslot(preSetClassroomList[room], sessionstarttime.getDay(), sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                            if (roomttbresult && roomtimeslotresult) {
                                availableclassroomlist.push(preSetClassroomList[room]);
                            }
                        } else {
                            var roomtimeslotresult = await checkclassroomtimeslot(preSetClassroomList[room], sessionstarttime.getDay(), sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                            if (roomtimeslotresult) {
                                availableclassroomlist.push(preSetClassroomList[room]);
                            }
                        }
                    }
                    // console.log(availableclassroomlist.length)
                    thisscheduleplan[timeslots] = new Array();

                    // console.log(randomAY);
                    for (var availableroom = 0; availableroom < availableclassroomlist.length; availableroom++) {
                        PresentationList = (reducePairBySupObs(thisscheduleplan[timeslots], PresentationList))
                        //PresentationList = reduceByCombination(SchedulesforThisDateCombin,PresentationList,timeslots,thisscheduleplan[timeslots])
                        var previousList;
                        var PriorityList;
                        if (timeslots == 0) {
                            previousList = [];
                        } else if (0 < timeslots <= 2) {
                            /**
                             *  when timeslots = 1  , getting schdule[time 0]
                             *  when timeslots = 2  , getting schdule[time 0] ,schdule[time 1] 
                             *   
                             */
                            previousList = copyarray(thisscheduleplan.slice(0, timeslots));
                            // console.log(">>enter here thisscheduleplan ", thisscheduleplan)
                            // console.log(">>enter here previousList ", previousList)
                        } else {
                            /**
                             *  when timeslots = 3  , getting schdule[time 0] ,schdule[time 1] ,schdule[time 2]
                             */
                            previousList = copyarray(thisscheduleplan.slice(timeslots - 3, timeslots - 1));
                        }
                        // console.log(">>previousList   ", previousList)
                        PresentationList = reduceConsec3Session(previousList, PresentationList);
                        // console.log(">>PresentationList   ", PresentationList)
                        if (!(possibleplan % 2 == 0) || possibleplan == 0) {
                           PriorityList = ((retrieveConsecList(previousList, PresentationList)).flat());
                            // console.log(">>PriorityList   ", PriorityList) 
                            if (PriorityList.length > 0) {
                                var randomNumber = randomNum(PriorityList);
                                PriorityList[randomNumber].RID = availableclassroomlist[availableroom];
                                thisscheduleplan[timeslots].push(PriorityList[randomNumber]);
                                // console.log(">>seleced this box case1    ", PriorityList[randomNumber].SID)
                                selectedAy.push(PriorityList[randomNumber])
                            } else if (PresentationList.length > 0) {
                                var randomNumber = randomNum(PresentationList);
                                PresentationList[randomNumber].RID = availableclassroomlist[availableroom];
                                thisscheduleplan[timeslots].push(PresentationList[randomNumber]);
                                // console.log(">>seleced this box case2    ", PresentationList[randomNumber].SID)
                                selectedAy.push(PresentationList[randomNumber])
                            }
                        } else {
                            if (PresentationList.length > 0) {
                                var randomNumber = randomNum(PresentationList);
                                PresentationList[randomNumber].RID = availableclassroomlist[availableroom];
                                thisscheduleplan[timeslots].push(PresentationList[randomNumber]);
                                // console.log(">>seleced this box case3    ", PresentationList[randomNumber].SID)
                                selectedAy.push(PresentationList[randomNumber])
                            }
                        }
                    }
                    // console.log(thisscheduleplan[timeslots]);
                }
                // console.log(selectedAy.length);
                var untacklednum = (totalStudNum - selectedAy.length)
                if (untacklednum == 0) { Successfulplannum++; }
                var ScheduleJSON = JSON.parse(JSON.stringify({ Schd: thisscheduleplan, Length: selectedAy.length, Untackle: untacklednum, Preference: pref }))
                // console.log(ScheduleJSON);
                SchedulesforThisDateCombin.sort(function (a, b) { return a.Untackle - b.Untackle; })
                // console.log(SchedulesforThisDateCombin,"   ",ScheduleJSON)
                if(SchedulesforThisDateCombin.length == 0){
                    SchedulesforThisDateCombin.push(ScheduleJSON);
                }else if(SchedulesforThisDateCombin[0].Untackle >= ScheduleJSON.Untackle){
                    SchedulesforThisDateCombin.push(ScheduleJSON);
                    SchedulesforThisDateCombin = copyarray(SchedulesforThisDateCombin.filter((element)=> element.Untackle == ScheduleJSON.Untackle));
                }
                
                // if (Successfulplannum > 0.005 * (combinations(totalStudNum, 4))) { //case for many No untackled plans
                    if (ScheduleJSON.Untackle ==0) { //case for getting the first Successful Plan
                    // console.log("Having this number of successful plan", Successfulplannum)



                    /**
                     * case for many No untackled plans
                     
                    if ( SchedulesforThisDateCombin.filter((plans) => plans.Preference == true).length > 0) {
                        SchedulesforThisDateCombin =  SchedulesforThisDateCombin.filter((plans) => plans.Preference == true);
                    }
                    SelectedPlan = randomNum(SchedulesforThisDateCombin);
                    */


                    SelectedPlan = ScheduleJSON;
                    break;
                } else if ((0.05 * (combinations(totalStudNum, 4)))+1  >= SchedulesforThisDateCombin.length && SchedulesforThisDateCombin.length >= 0.05 * (combinations(totalStudNum, 4))){
                    SchedulesforThisDateCombin.sort(function (a, b) { return a.Untackle - b.Untackle; })
                    var untackledMinIndex = SchedulesforThisDateCombin[0].Untackle;
                    var CurrentEnd =  new Date();
                    console.log("Current Excecution Time  ", ((CurrentEnd.getTime() - PlanProcessStart.getTime()) / 1000), " Seconds");
                    console.log(">> chech point 5% Min untacklecd == ", untackledMinIndex)
                    // var uniqueUntackle = new Array();
                    // SchedulesforThisDateCombin.forEach(element => {
                    //     if (!uniqueUntackle.find((number) => number == element.Untackle)) {
                    //         uniqueUntackle.push(element.Untackle);
                    //     }
                    // });
                    // console.log(">> CheckPoint 5% this plan has the following untackle values", uniqueUntackle);

                }else if (SchedulesforThisDateCombin.length >= 0.1 * (combinations(totalStudNum, 4))) {
                    SchedulesforThisDateCombin.sort(function (a, b) { return a.Untackle - b.Untackle; })
                    var untackledMinIndex = SchedulesforThisDateCombin[0].Untackle;


                    // var uniqueUntackle = new Array();
                    // SchedulesforThisDateCombin.forEach(element => {
                    //     if (!uniqueUntackle.find((number) => number == element.Untackle)) {
                    //         uniqueUntackle.push(element.Untackle);
                    //     }
                    // });
                    // console.log(">>CheckPoint 10% this plan has the following untackle values", uniqueUntackle);


                    console.log(">> check point 10% Min untacklecd == ", untackledMinIndex)
                    const result = SchedulesforThisDateCombin.filter((element) => element.Untackle == untackledMinIndex);
                    SchedulesforThisDateCombin = result;
                    if (SchedulesforThisDateCombin.filter((plans) => plans.Preference == true).length > 0) {
                        SchedulesforThisDateCombin = SchedulesforThisDateCombin.filter((plans) => plans.Preference == true);
                    }
                    SelectedPlan = randomNum(SchedulesforThisDateCombin);
                    break;
                }
            }
            var PlanProcessEnd = new Date();
            console.log("Plan Excecution Time  ", ((PlanProcessEnd.getTime() - PlanProcessStart.getTime()) / 1000), " Seconds");
            /** change the SelectedPlan insert to SQL */
            SelectedPlan = SchedulesforThisDateCombin[SelectedPlan];
            console.log(SelectedPlan)
            console.log("For datecombination: ", (datecombin + 1), "  Untackle Case Count:  ", SchedulesforThisDateCombin[SelectedPlan].Untackle, "   Successful rate:  ", calcPercentage((totalStudNum - SelectedPlan.Untackle), totalStudNum))

            async function insertbox(planNo, element, sqldatestring, sessionstarttime, planStatus, typeOfPresent) {

                let boxid = 'boxID';
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                const charactersLength = characters.length;
                let counter = 0;
                while (counter < 15) {
                    boxid += characters.charAt(Math.floor(Math.random() * charactersLength));
                    counter += 1;
                }

                var insertscheduleboxquery = "insert into allschedulebox values(\"" + boxid + "\",\"" + planNo + "\",\"" + planStatus + "\",\"" + sqldatestring + " " + sessionstarttime.toLocaleTimeString("en-GB") + "\",\"" + typeOfPresent + "\","
                    + "\"" + element.TID + "\",\"" + element.SID + "\",\"" + element.OID + "\","
                    + "\"Sin Hang\",\"" + element.RID + "\", now()) ;"
                // console.log(insertscheduleboxquery)

                db.query(insertscheduleboxquery, (err, results) => {
                    try {
                        // console.log("inserted ")
                    } catch (err) {
                        return err;
                    }
                });

            }

            async function retrieveUntackledCase(planNo, SchedulePlan) {

                var allpairs = await new Promise((resolve) => {
                    db.query("select t1.TID , t1.SID,t2.OID from observerpairstudent as t2 left join (select * from supervisorpairstudent)as t1 on t1.sid = t2.sid ", (err, results) => {
                        try {
                            var string = JSON.stringify(results);
                            var json = JSON.parse(string);
                            resolve(json);
                        } catch (err) {
                            resolve("err")
                        }
                    });
                }).catch((err) => {
                    errmsg = "error happened in ScheduleController.nqueenversion.retrieveUntackledCase()"
                })

                for (var timeslot = 0; timeslot < SchedulePlan.length; timeslot++) {
                    allpairs = reducePairBySID(SchedulePlan[timeslot], allpairs)
                }
                return allpairs;
            }

            async function insertManualCasebox(planNo, element) {
                var insertquery = "insert into manualhandlecase values(\"" + element.SID + "\",\"" + element.TID + "\",\"" + element.OID + "\"," + planNo + ")";

                db.query(insertquery, (err, results) => {
                    try {
                        // console.log("inserted Manual case ")
                    } catch (err) {
                        return err;
                    }
                });
            }
            if (SelectedPlan.Untackle == 0) {
                finalResultOfPlans.push(JSON.parse(JSON.stringify({ planNo: (datecombin + 1), planStatus: 0 })))
                for (var timeslot = 0; timeslot < SelectedPlan.Schd.length; timeslot++) {
                    for (var room = 0; room < SelectedPlan.Schd[timeslot].length; room++) {
                        var sessionstarttime = new Date(SelectedPlan.Schd[timeslot][room].availablestarttime);
                        // var sessionendtime = resetsessionendtime(sessionstarttime);
                        var sqldatestring = sessionstarttime.toLocaleDateString("en-GB").split("/");
                        sqldatestring = sqldatestring[2] + "-" + sqldatestring[1] + "-" + sqldatestring[0];
                        sqldatestring.trim();
                        insertbox((datecombin + 1), SelectedPlan.Schd[timeslot][room], sqldatestring, sessionstarttime, "Successful", req.query.typeOfPresent);
                    }
                }
            } else {
                finalResultOfPlans.push(JSON.parse(JSON.stringify({ planNo: (datecombin + 1), planStatus: 1 })))
                for (var timeslot = 0; timeslot < SelectedPlan.Schd.length; timeslot++) {
                    for (var room = 0; room < SelectedPlan.Schd[timeslot].length; room++) {
                        var sessionstarttime = new Date(SelectedPlan.Schd[timeslot][room].availablestarttime);
                        // var sessionendtime = resetsessionendtime(sessionstarttime);
                        var sqldatestring = sessionstarttime.toLocaleDateString("en-GB").split("/");
                        sqldatestring = sqldatestring[2] + "-" + sqldatestring[1] + "-" + sqldatestring[0];
                        sqldatestring.trim();

                        insertbox((datecombin + 1), SelectedPlan.Schd[timeslot][room], sqldatestring, sessionstarttime, "Manual Handling", req.query.typeOfPresent);
                        var ManualCaseList = await retrieveUntackledCase((datecombin + 1), SelectedPlan.Schd);
                        for (var maualhandlecases = 0; maualhandlecases < ManualCaseList.length; maualhandlecases++) {
                            await insertManualCasebox((datecombin + 1), ManualCaseList[maualhandlecases]);
                        }
                    }
                }

            }
            console.log("\n\n")

            // for (var timeslot = 0; timeslot < SelectedPlan.Schd.length; timeslot++) {
            //     for (var room = 0; room < SelectedPlan.Schd[timeslot].length; room++) {
            //         var sessionstarttime = new Date(SelectedPlan.Schd[timeslot][room].availablestarttime);
            //         // var sessionendtime = resetsessionendtime(sessionstarttime);
            //         var sqldatestring = sessionstarttime.toLocaleDateString("en-GB").split("/");
            //         sqldatestring = sqldatestring[2] + "-" + sqldatestring[1] + "-" + sqldatestring[0];
            //         sqldatestring.trim();
            //         if (SelectedPlan.Untackle == 0) {
            //             finalResultOfPlans.push(JSON.parse(JSON.stringify({ planNo: (datecombin + 1), planStatus: 0 })))
            //             insertbox((datecombin + 1), SelectedPlan.Schd[timeslot][room], sqldatestring, sessionstarttime, "Successful", req.query.typeOfPresent);
            //         } else {
            //             finalResultOfPlans.push(JSON.parse(JSON.stringify({ planNo: (datecombin + 1), planStatus: 1 })))
            //             insertbox((datecombin + 1), SelectedPlan.Schd[timeslot][room], sqldatestring, sessionstarttime, "Manual Handling", req.query.typeOfPresent);
            //             var ManualCaseList = await retrieveUntackledCase((datecombin + 1), SelectedPlan.Schd);
            //             for (var maualhandlecases = 0; maualhandlecases < ManualCaseList.length; maualhandlecases++) {
            //                 await insertManualCasebox((datecombin + 1), ManualCaseList[maualhandlecases]);
            //             }
            //             // console.log("inserted Manual case for Plan ",(datecombin+1))
            //         }
            //     }
            // }
        }
        var ProcessEnd = new Date();

        console.log("Whole Excecution Time  ", ((ProcessEnd.getTime() - ProcessStart.getTime()) / 1000), " Seconds");

        finalResultOfPlans.sort((a, b) => a.planStatus - b.planStatus)
        return res.redirect("/scheduledesign/scheduleList?planNo=" + finalResultOfPlans.sort()[0].planNo);
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
        // console.log(req.query);


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
            // console.log("select * from  allclass where RID =\"" + classroom + "\" and weekdays = " + weekday + " and !(Time(\"" + starttime + "\") >= endTime || Time(\"" + endtime + "\") <= startTime);")
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

        async function getStudentnum() {
            var studentnum = await new Promise((resolve) => {
                pool.query("select count(*) as counting from student", (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        if (json.length > 0) {
                            resolve(json[0].counting);
                        }

                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.startschedule.getStudentnum()"
            })
            if (studentnum != "err") { return studentnum; } else { return false; }
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
            // var queryline = "select count(*) from threeparty where availabledate = \"2024-02-19\""
            var queryline = "SELECT distinct(availablestarttime),COUNT(*)  from  threeparty where " + getallplandate(plan) + " GROUP BY availablestarttime order by count(*) asc;"
            // var queryline = "select tid, count(sid) from supervisorpairstudent group by tid order by count(sid) desc;"
            // console.log("\n\n>>checkuniquetimeslotcountforoneday()    ", queryline);
            var uniquetimeslotcounts = await new Promise((resolve) => {
                db.query(queryline, (err, results) => {
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

        async function getascorderoftimecountpairlist(planNo, parallelschedule, dateoftoday, starttime) {
            var query = "select t2.tid,t2.sid,t2.oid,t2.availabledate,t2.availablestarttime,t2.availableendtime,t2.tidprior,t2.oidprior,t1.counting from threeparty as t2 left join (select sid, availabledate,count(availabledate) as counting  from threeparty as t1 where availabledate = \"" + dateoftoday + "\" and availablestarttime >= \"" + dateoftoday + " " + starttime + "\"  group by tid,sid,oid, availabledate)as t1 on t1.sid = t2.sid and t1.availabledate = t2.availabledate  where availablestarttime = \"" + dateoftoday + " " + starttime + "\" and t2.sid in (select  sid from threeparty as t1 where availabledate = \"" + dateoftoday + "\" and  tid not in(select tid from allschedulebox where planNo = " + planNo + " and boxdate = \"" + dateoftoday + " " + starttime + "\" ) and tid not in (select oid from allschedulebox where planNo =  " + planNo + " and boxdate = \"" + dateoftoday + " " + starttime + "\") and oid not in (select tid from allschedulebox where planNo =  " + planNo + " and boxdate = \"" + dateoftoday + " " + starttime + "\") and oid not in(select oid from allschedulebox where planNo =  " + planNo + " and boxdate = \"" + dateoftoday + " " + starttime + "\") and  sid not in(select sid from allschedulebox where planNo = " + planNo + " )   group by tid,sid,oid, availabledate) order by t1.counting asc, (t2.TIDPrior + t2.OIDPrior) asc, t2.TIDPrior asc , t2.OIDPrior asc;";
            //    var query = "select t2.*,t1.counting from threeparty as t2 left join (select tid,sid,oid,count(availabledate) as counting from threeparty where availabledate =\"" + dateoftoday + "\" group by tid,sid,oid,availabledate having count(*) > 0) as t1 on t1.tid = t2.tid and t1.sid = t2.sid and t2.oid = t2.oid where availablestarttime = \"" + dateoftoday + " " + starttime + "\" and t2.tid not in (select tid from allschedulebox where planno = 0 and boxdate = \"" + dateoftoday + " " + starttime + "\") and t2.oid not in (select oid from allschedulebox where planno = 0 and boxdate = \"" + dateoftoday + " " + starttime + "\") and t2.sid not in (select sid from allschedulebox where planno = 0 and boxdate = \"" + dateoftoday + " " + starttime + "\") order by t1.counting asc;"
            // var query = "select tid,sid,oid,availabledate,count(availablestarttime)as counting from threeparty where availabledate = \"" + dateoftoday + "\" group by tid,sid,oid,availabledate having count(availablestarttime >\"" + dateoftoday + " " + starttime + "\") >0;"
            // var query = "select tid,sid,oid,TIDPrior,OIDPrior,availabledate,count(*) from threeparty where availabledate = \"" + dateoftoday + "\" and sid in (select sid from threeparty where availablestarttime = \"" + dateoftoday + " " + starttime + "\") group by tid,sid,oid,TIDPrior,OIDPrior,availabledate order by count(*) asc, TIDPrior asc, OIDPrior asc ;"
            // console.log(query);
            var pairsforthistimeslot = await new Promise((resolve) => {
                db.query(query, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        resolve(json);
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.startschedule.getascorderoftimecountpairlist()"
            })
            // console.log(pairsforthistimeslot)
            if (pairsforthistimeslot != "err") { return pairsforthistimeslot; } else { return false; }
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
            // console.log(schedulebox);
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
            // console.log(ans)
            return ans;
        }

        async function insertbox(element, sqldatestring, sessionstarttime) {

            let boxid = 'boxID';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < 15) {
                boxid += characters.charAt(Math.floor(Math.random() * charactersLength));
                counter += 1;
            }

            var insertscheduleboxquery = "insert into allschedulebox values(\"" + boxid + "\",\"" + element.planNo + "\",\"Unsuccessful\",\"" + sqldatestring + " " + sessionstarttime.toLocaleTimeString("en-GB") + "\",\"" + element.type + "\","
                + "\"" + element.tid + "\",\"" + element.sid + "\",\"" + element.oid + "\","
                + "\"" + element.campus + "\",\"" + element.rid + "\", now()) ;"
            // console.log(insertscheduleboxquery)

            db.query(insertscheduleboxquery, (err, results) => {
                try {
                    // console.log("inserted ")
                } catch (err) {
                    return err;
                }
            });

        }

        async function sortAvaforManualCase(planno, sqldatestring, sessionstarttime) {
            var queryline = " select t2.tid,t2.sid,t2.oid, t1.counting from threeparty as t2 right join (select tid,sid,oid,TIDPrior,OIDPrior,availabledate,count(availablestarttime) as counting from threeparty where sid not in (select distinct(sid) from allschedulebox where planno =  0) and availabledate = \"" + sqldatestring + "\" group by tid,sid,oid,TIDPrior,OIDPrior,availabledate) as t1 on t1.sid = t2.sid and t1.availabledate = t2.availabledate where t2.availablestarttime = \"" + sqldatestring + " " + sessionstarttime + "\" and t2.tid not in (select tid from allschedulebox where planno = 0 and boxdate = \"" + sqldatestring + " " + sessionstarttime + "\") and t2.tid not in (select oid from allschedulebox where planno = 0 and boxdate = \"" + sqldatestring + " " + sessionstarttime + "\") and t2.oid not in (select tid from allschedulebox where planno = 0 and boxdate = \"" + sqldatestring + " " + sessionstarttime + "\") and t2.oid not in (select oid from allschedulebox where planno = 0 and boxdate = \"" + sqldatestring + " " + sessionstarttime + "\") order by t1.counting asc, t2.TIDprior asc, t2.OIDprior asc "
            // console.log("\n\n", queryline, "\n\n")
            var sortedManualCase = await new Promise((resolve) => {
                db.query(queryline, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        resolve(json);
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.startschedule.sortAvaforManualCase()"
            })
            if (sortedManualCase != "err") { return sortedManualCase; } else { return false; }
        }
        async function getNotYetDecidedCase(planno) {
            var queryline = "select t1.*, t2.oid from observerpairstudent as t2 right join (select tid,sid,topic from supervisorpairstudent where sid not in (select sid from allschedulebox where planno = " + planno + ")) as t1 on t1.sid = t2.sid;"
            // console.log("\n\n", queryline, "\n\n")
            var NotYetCase = await new Promise((resolve) => {
                db.query(queryline, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        resolve(json);
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.startschedule.sortAvaforManualCase()"
            })
            if (NotYetCase != "err") { return NotYetCase; } else { return false; }
        }
        async function maualhandlecaserequired(planno) {
            var queryline = "select t1.tid,t1.sid,t1.topic,t2.oid from observerpairstudent as t2 right join (select * from supervisorpairstudent where sid in (select distinct(sid) from threeparty where sid not in(select sid from allschedulebox where planno = " + planno + ")))as t1 on t1.sid = t2.sid"
            // console.log("\n\n", queryline, "\n\n")
            var ManualCase = await new Promise((resolve) => {
                db.query(queryline, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        resolve(json);
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.startschedule.ManualCase()"
            })

            if (ManualCase != "err") {
                ManualCase.forEach(async element => {
                    // console.log(element)
                    insertline = "insert into manualhandlecase values(\"" + element.SID + "\",\"" + element.TID + "\",\"" + element.oid + "\"," + planno + ")"
                    // console.log("\n\n", insertline, "\n\n")
                    var insertManualCase = await new Promise((resolve) => {
                        db.query(insertline, (err, results) => {
                            try {
                                resolve()
                            } catch (err) {
                                resolve("err")
                            }
                        });
                    }).catch((err) => {
                        errmsg = "error happened in ScheduleController.startschedule.ManualCase()"
                    })
                });


                return true;
            } else { return false; }
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

        function comparedatetime(a, b) {
            return new Date(a.boxdate) - new Date(b.boxdate);
        }

        function check3consec(pair) {
            var preval;
            var nextval;
            var pre2val;
            var next2val;
            if (req.query.typeOfPresent == "final") {
                preval = new Date(sessionstarttime.getTime() - 45 * 60 * 1000);
                nextval = new Date(sessionstarttime.getTime() + 45 * 60 * 1000);
                pre2val = new Date(sessionstarttime.getTime() - 2 * 45 * 60 * 1000);
                next2val = new Date(sessionstarttime.getTime() + 2 * 45 * 60 * 1000);
            } else {
                preval = new Date(sessionstarttime.getTime() - 25 * 60 * 1000);
                nextval = new Date(sessionstarttime.getTime() + 25 * 60 * 1000);
                pre2val = new Date(sessionstarttime.getTime() - 2 * 25 * 60 * 1000);
                next2val = new Date(sessionstarttime.getTime() + 2 * 25 * 60 * 1000);
            }

            var prearr = copyarray(scheduleforthisplan).filter((element) => (new Date(element.boxdate)).toString() === preval.toString());
            var nextarr = copyarray(scheduleforthisplan).filter((element) => (new Date(element.boxdate)).toString() === nextval.toString());
            var pre2arr = copyarray(scheduleforthisplan).filter((element) => (new Date(element.boxdate)).toString() === pre2val.toString());
            var next2arr = copyarray(scheduleforthisplan).filter((element) => (new Date(element.boxdate)).toString() === next2val.toString());

            var pre2arrexistTID = pre2arr.find((element) => element.tid === pair.tid || element.oid === pair.tid);
            var prearrexistTID = prearr.find((element) => element.tid === pair.tid || element.oid === pair.tid);
            var nextarrexistTID = nextarr.find((element) => element.tid === pair.tid || element.oid === pair.tid);
            if (pre2arrexistTID != undefined && prearrexistTID != undefined && nextarrexistTID != undefined) {
                return pair.Remove = true;
            }
            var next2arrexistTID = next2arr.find((element) => element.tid === pair.tid || element.oid === pair.tid);
            if (prearrexistTID != undefined && nextarrexistTID != undefined && next2arrexistTID != undefined) {
                return pair.Remove = true;
            }

            var pre2arrexistOID = pre2arr.find((element) => element.tid === pair.oid || element.oid === pair.oid);
            var prearrexistOID = prearr.find((element) => element.tid === pair.oid || element.oid === pair.oid);
            var nextarrexistOID = nextarr.find((element) => element.tid === pair.oid || element.oid === pair.oid);
            if (pre2arrexistOID != undefined && prearrexistOID != undefined && nextarrexistOID != undefined) {
                return pair.Remove = true;
            }
            var next2arrexistOID = next2arr.find((element) => element.tid === pair.oid || element.oid === pair.oid);
            if (prearrexistOID != undefined && nextarrexistOID != undefined && next2arrexistOID != undefined) {
                return pair.Remove = true;
            }

            return;
        }

        function markingForRoom(pair, sessionstarttime, scheduleforthisplan) {
            var preval;
            var nextval;
            var pre2val;
            var next2val;
            if (req.query.typeOfPresent == "final") {
                preval = new Date(sessionstarttime.getTime() - 45 * 60 * 1000);
                nextval = new Date(sessionstarttime.getTime() + 45 * 60 * 1000);
                pre2val = new Date(sessionstarttime.getTime() - 2 * 45 * 60 * 1000);
                next2val = new Date(sessionstarttime.getTime() + 2 * 45 * 60 * 1000);
            } else {
                preval = new Date(sessionstarttime.getTime() - 25 * 60 * 1000);
                nextval = new Date(sessionstarttime.getTime() + 25 * 60 * 1000);
                pre2val = new Date(sessionstarttime.getTime() - 2 * 25 * 60 * 1000);
                next2val = new Date(sessionstarttime.getTime() + 2 * 25 * 60 * 1000);
            }

            var presviousSessions = copyarray(scheduleforthisplan).filter((element) => (new Date(element.boxdate)).toString() === preval.toString());
            var nextSessions = copyarray(scheduleforthisplan).filter((element) => (new Date(element.boxdate)).toString() === nextval.toString());
            var presvious2Sessions = copyarray(scheduleforthisplan).filter((element) => (new Date(element.boxdate)).toString() === pre2val.toString());
            var next2Sessions = copyarray(scheduleforthisplan).filter((element) => (new Date(element.boxdate)).toString() === next2val.toString());



            var marks = parseFloat(pair.tidprior) + parseFloat(pair.oidprior);
            var tidconsecmark = 0;
            var oidconsecmark = 0
            /** count marks for supervisor */
            switch (parseInt(pair.tidprior)) {
                case 1:
                    if (presviousSessions.find((element) => element.tid === pair.tid) != undefined) { tidconsecmark += 1; }
                    if (presviousSessions.find((element) => element.oid === pair.tid) != undefined) { tidconsecmark -= 0.5; }
                    if (nextSessions.find((element) => element.tid === pair.tid) != undefined) { tidconsecmark += 1; }
                    if (nextSessions.find((element) => element.oid === pair.tid) != undefined) { tidconsecmark -= 0.5; }
                    break;
                case 2:
                    if (presviousSessions.find((element) => element.tid === pair.tid) != undefined) { tidconsecmark += 2; }
                    if (presviousSessions.find((element) => element.oid === pair.tid) != undefined) { tidconsecmark += 2.5; }
                    if (nextSessions.find((element) => element.tid === pair.tid) != undefined) { tidconsecmark -= 2; }
                    if (nextSessions.find((element) => element.oid === pair.tid) != undefined) { tidconsecmark -= 1.5; }
                    break;
                case 3:
                    if (presviousSessions.find((element) => element.tid === pair.tid) != undefined) { tidconsecmark += 3; }
                    if (presviousSessions.find((element) => element.oid === pair.tid) != undefined) { tidconsecmark += 3.5; }
                    if (nextSessions.find((element) => element.tid === pair.tid) != undefined) { tidconsecmark -= 1; }
                    if (nextSessions.find((element) => element.oid === pair.tid) != undefined) { tidconsecmark -= 0.5; }
                    break;
                default:
                    break;
            }

            /** count marks for observser */
            switch (parseInt(pair.oidprior)) {
                case 1:
                    if (presviousSessions.find((element) => element.tid === pair.oid) != undefined) { oidconsecmark += 1; }
                    if (presviousSessions.find((element) => element.oid === pair.oid) != undefined) { oidconsecmark += 1.5; }
                    if (nextSessions.find((element) => element.tid === pair.oid) != undefined) { oidconsecmark -= 3; }
                    if (nextSessions.find((element) => element.oid === pair.oid) != undefined) { oidconsecmark -= 2.5; }
                    break;
                case 2:
                    if (presviousSessions.find((element) => element.tid === pair.oid) != undefined) { oidconsecmark += 2; }
                    if (presviousSessions.find((element) => element.oid === pair.oid) != undefined) { oidconsecmark += 2.5; }
                    if (nextSessions.find((element) => element.tid === pair.oid) != undefined) { oidconsecmark -= 2; }
                    if (nextSessions.find((element) => element.oid === pair.oid) != undefined) { oidconsecmark -= 1.5; }
                    break;
                case 3:
                    if (presviousSessions.find((element) => element.tid === pair.oid) != undefined) { oidconsecmark += 3; }
                    if (presviousSessions.find((element) => element.oid === pair.oid) != undefined) { oidconsecmark += 3.5; }
                    if (nextSessions.find((element) => element.tid === pair.oid) != undefined) { oidconsecmark -= 1; }
                    if (nextSessions.find((element) => element.oid === pair.oid) != undefined) { oidconsecmark -= 0.5; }
                    break;
                default:
                    break;
            }
            marks += tidconsecmark + oidconsecmark;
            pair.marks = marks;
            console.log(pair);
        }


        // var threepartyAvaList = await getthreepartyavalist();
        // console.log(threepartyAvaList)
        var successschedule = new Array();

        // var a  == looping in possible plans
        // for (var a = 0; a < possibledatecombination.length; a++) {
        for (var a = 0; a < 8; a++) {
            var scheduleforthisplan = new Array();
            var manualhandlecase = new Array();
            console.log(">>plan ", a, " ", possibledatecombination[a])
            // var b  == looping dates in the plans
            var uniquetimeslotcounts = await checkuniquetimeslotcountforoneday(possibledatecombination[a]);
            // console.log(uniquetimeslotcounts);
            //looping the timeslots for this day
            // for (var c = 0; c < 1; c++) {
            for (var c = 0; c < uniquetimeslotcounts.length; c++) {
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

                // console.log("availableclassroomlist.length   ", availableclassroomlist.length, availableclassroomlist)
                var parallelschedule = new Array();
                for (var d = 0; d < availableclassroomlist.length; d++) {
                    // for (var d = 0; d < 1; d++) {
                    // console.log(sqldatestring,"     ", sessionstarttime.toLocaleTimeString("en-GB"))
                    var pairsforthistimeslot = await getascorderoftimecountpairlist(a, parallelschedule, sqldatestring, sessionstarttime.toLocaleTimeString("en-GB"));
                    var mincasepair = copyarray(pairsforthistimeslot.filter((element) => element.counting === pairsforthistimeslot[0].counting));
                    var shortlistpair = pairsforthistimeslot.slice(mincasepair.length, pairsforthistimeslot.length);





                    console.log(mincasepair, "    ", shortlistpair)
                    if (mincasepair.length != 0) {
                        /** check whether have previous timeslot => to assign those had session before first*/
                        scheduleforthisplan.sort(comparedatetime);
                        mincasepair.forEach(element => {
                            check3consec(element)
                        });

                        mincasepair.forEach(element => {
                            if (element.hasOwnProperty("marks")) { delete element.marks };
                            markingForRoom(element, new Date(element.availablestarttime), scheduleforthisplan)
                        });
                        console.log(mincasepair)


                        // console.log("this classroom ", availableclassroomlist[d], " is ok for ", sessionstarttime.toLocaleDateString("en-GB"), " this timeslot ", sessionstarttime.toLocaleTimeString("en-GB"), "  ", sessionendtime.toLocaleTimeString("en-GB"))
                        var schedulebox = createschedulebox(a, mincasepair[0].tid, mincasepair[0].sid, mincasepair[0].oid, sessionstarttime, sessionstarttime.toLocaleTimeString('en-GB'), "Sin Hang", preSetClassroomList[d]);
                        parallelschedule.push(schedulebox);
                        scheduleforthisplan.push(schedulebox);
                        // console.log(schedulebox)
                        insertbox(schedulebox, sqldatestring, sessionstarttime);
                        mincasepair.shift();
                    }
                    // console.log(">>parallelschedule for date time ", sessionstarttime.toLocaleDateString("en-GB"), " ", sessionstarttime.toLocaleTimeString("en-GB"), " ", parallelschedule.length, "\n", parallelschedule,"\n\n");
                }
                // scheduleforthisplan.push(schedulebox);
                // console.log("now insert mustusepair ",mustusepair)
                // insertarraybox(mustusepair, sqldatestring, sessionstarttime);
            }

            var NotYetDecidedCase = await getNotYetDecidedCase(a);

            NotYetDecidedCase.forEach(element => {
                manualhandlecase.push(element);
            });

            // console.log("maualhandlecase ", manualhandlecase)

            /**handle manualcase by checking RRS first */
            for (var e = 0; e < manualhandlecase.length; e++) {

                for (var c = 0; c < uniquetimeslotcounts.length; c++) {
                    var sessionstarttime = new Date(uniquetimeslotcounts[c].availablestarttime);
                    var sessionendtime = resetsessionendtime(sessionstarttime);
                    var sqldatestring = sessionstarttime.toLocaleDateString("en-GB").split("/");
                    sqldatestring = sqldatestring[2] + "-" + sqldatestring[1] + "-" + sqldatestring[0];
                    sqldatestring.trim();
                    var roomttbresult;
                    var roomtimeslotresult;
                    var availablemanualhandlecase = await sortAvaforManualCase(a, sqldatestring, sessionstarttime.toLocaleTimeString("en-GB"));
                    if (req.query.typeOfPresent == "final") {
                        roomttbresult = await checkclassroomttb(preSetClassroomList[4], sessionstarttime.getDay(), sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                        roomtimeslotresult = await checkclassroomtimeslot(preSetClassroomList[4], sessionstarttime.getDay(), sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));

                    } else {
                        roomtimeslotresult = await checkclassroomtimeslot(preSetClassroomList[4], sessionstarttime.getDay(), sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                        roomttbresult = true;
                    }

                    if (roomttbresult && roomtimeslotresult) {
                        // console.log(availablemanualhandlecase)
                        if (availablemanualhandlecase.length != 0) {
                            // console.log("this classroom ", preSetClassroomList[4], " is ok for ", sessionstarttime.toLocaleDateString("en-GB"), " this timeslot ", sessionstarttime.toLocaleTimeString("en-GB"), "  ", sessionendtime.toLocaleTimeString("en-GB"))
                            var schedulebox = createschedulebox(a, availablemanualhandlecase[0].tid, availablemanualhandlecase[0].sid, availablemanualhandlecase[0].oid, sessionstarttime, sessionstarttime.toLocaleTimeString('en-GB'), "Sin Hang", preSetClassroomList[4]);
                            scheduleforthisplan.push(schedulebox);
                            // console.log(schedulebox)
                            insertbox(schedulebox, sqldatestring, sessionstarttime);
                            // availablemanualhandlecase.shift();
                        }
                    }
                }
            }


            /** ManualCases left */
            maualhandlecaserequired(a);




            /**handle classroom switching */
            // console.log("\n\nsorted", scheduleforthisplan.sort(comparedatetime), "\n\n")
            for (var e = 0; e < scheduleforthisplan.length; e++) {
                // console.log("checking", new Date(scheduleforthisplan[e].boxdate).toLocaleString())
                var val = scheduleforthisplan[e].boxdate;
                var thissessionar = copyarray(scheduleforthisplan).filter((element) => element.boxdate === val);
                // console.log(thissessionar[thissessionar.length-1])
                var index = scheduleforthisplan.findIndex((element) => element.boxdate === thissessionar[thissessionar.length - 1].boxdate)
                if ((index + 2 >= scheduleforthisplan.length)) {
                    break;
                } else {


                    val = scheduleforthisplan[index + 2].boxdate;
                    var nextsessionarr = copyarray(scheduleforthisplan).filter((element) => element.boxdate === val);
                    // console.log("nextsessionarr  ",nextsessionarr); 
                    // console.log("\nnext ",nextsessionarr instanceof Array)



                }


                // // var nextsessionarr = JsonarrayIndex(scheduleforthisplan,val);
                // console.log("@@ this ", thissessionar)
                //  console.log("\nnext "+nextsessionarr)

            }


            // console.log("\n\n\n")
            // console.log(">>scheduleforthisplan  ", scheduleforthisplan.length, " ", scheduleforthisplan);
            if (scheduleforthisplan.length == (await getStudentnum())) {
                successschedule.push(a);
                db.query("update allschedulebox set planStatus = \"Successful\" where planNo = " + a + " ", (err, results) => {
                    try {
                        // console.log("inserted ")
                    } catch (err) {
                        return err;
                    }
                });
            }
        }

        async function processArray(array) {
            return await Promise.all(array.map(async item => {
                console.log(item);
                var obj = await getobjduration(item);
                console.log(obj);
                item.duration = obj;
            }));
        }
        async function getobjduration(element) {
            var getPlanduration = await new Promise((resolve) => {
                db.query("select distinct(Date(boxdate)) as Dates from allschedulebox where planNo= " + element + " ;", (err, res) => {
                    try {
                        var string = JSON.stringify(res);
                        var json = JSON.parse(string);
                        var ans = json;
                        resolve(ans);
                    } catch (err) { console.log(err); }

                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.outputCSV.getPlanBox";
            });
            return getPlanduration;
        }


        var checkPlanDuration = new Array();

        successschedule.forEach(element => {
            var obj = JSON.parse(JSON.stringify({ planNo: element }));
            checkPlanDuration.push(obj);
        });

        var checkplanduration = processArray(successschedule)




        console.log(">>checkplanduration", checkplanduration)
        var removelist = new Array();
        checkPlanDuration.forEach(element => {
            checkPlanDuration.forEach(element2 => {
                if (element.duration == element2.duration && element.planNo < element2.planNo) {
                    removelist.push(element2);
                }
            });
        });
        console.log("removelist", removelist)




        // return res.redirect("/scheduledesign/startschedule?typeOfPresent=" + req.body.typeOfPresent)

        return res.redirect("/scheduledesign/scheduleList?planNo=" + successschedule.sort()[0]);
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

    scheduleList: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        // console.log("hello")
        var plannumber = await new Promise((resolve) => {
            db.query("select distinct(planno) as planNo , planStatus from allschedulebox where planStatus != \"Unsuccessful\" order by planNo asc;", (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                if (json.length == 0) {
                    resolve(null);
                } else {
                    resolve(ans);
                }

            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.scheduleList"
        })
        console.log(plannumber)
        var plandetails = await new Promise((resolve) => {
            var queryline = "select allschedulebox.boxID, Date(boxdate)as Date , Time(boxdate) as Time,allschedulebox.type as Type, allschedulebox.tid as SupID, supervisor.supname as SupName, allschedulebox.sid as StuID, student.stdname as StuName, allschedulebox.oid as ObsID, observerpairstudent.obsname as ObsName , rid as Classroom, Topic from allschedulebox left join supervisor on supervisor.tid = allschedulebox.TID left join observerpairstudent on allschedulebox.sid = observerpairstudent.sid left join student on allschedulebox.sid = student.SID left join supervisorpairstudent on allschedulebox.sid = supervisorpairstudent.sid where planNo = " + req.query.planNo + " order by boxdate asc, RID asc";
            // console.log(queryline);
            db.query(queryline, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                if (json.length == 0) {
                    resolve(null);
                } else {
                    resolve(ans);
                }

            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.scheduleList"
        })

        var planhandlecase = await new Promise((resolve) => {
            var queryline = "select t1.sid, student.stdname , t1.tid, supervisor.supname,t1.oid,observerpairstudent.obsname from manualhandlecase as t1 left join student on student.sid = t1.sid left join supervisor on supervisor.tid = t1.tid left join observerpairstudent on observerpairstudent.sid = t1.sid where planno = " + req.query.planNo;
            // console.log(queryline);
            db.query(queryline, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                if (json.length == 0) {
                    resolve(null);
                } else {
                    resolve(ans);
                }

            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.scheduleList"
        })
        // console.log(planhandlecase)
        /** get plan dates from plandetails */



        // Array.prototype.contains = function (v) {
        //     for (var i = 0; i < this.length; i++) {
        //         if (this[i] === v) return true;
        //     }
        //     return false;
        // };

        // Array.prototype.unique = function () {
        //     var datearr = [];
        //     var timearr = [];
        //     for (var i = 0; i < this.length; i++) {
        //         var boxdate = (new Date(this[i].boxdate));
        //         if (!datearr.contains(boxdate.toLocaleDateString('en-GB'))) {
        //             datearr.push(boxdate.toLocaleDateString('en-GB'));
        //         }
        //         if (!timearr.contains(boxdate.toLocaleTimeString('en-GB'))) {
        //             timearr.push(boxdate.toLocaleTimeString('en-GB'));
        //         }
        //     }
        //     var arr = JSON.parse(JSON.stringify({ "datearr": datearr.sort(), "timearr": timearr.sort() }))
        //     return arr;
        // }

        // var planarr = plandetails.unique();
        // // console.log(planarr.datearr, "\n\n", planarr.timearr)

        // var plandatecountbox = new Array();
        // function plandatecountboxfc() {
        //     var arr = [];
        //     planarr.datearr.forEach(element => {

        //         var timecount = 0;
        //         plandetails.forEach(element2 => {
        //             if ((new Date(element2.boxdate)).toLocaleDateString("en-GB") == element) {
        //                 timecount++;
        //             }
        //         });
        //         arr.push(JSON.parse(JSON.stringify({ "date": element, "count": timecount })));
        //     });
        //     return arr;
        // }
        // plandatecountbox = plandatecountboxfc();
        // // console.log(plandatecountbox);

        return res.view("user/admin/scheduleList", { plandetails: plandetails, plannumber: plannumber, planhandlecase: planhandlecase })
        // return res.view("user/admin/supervisorschedulelist", { allsuplist: ans, manualhandlecase: manualhandlecase })

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
        // console.log(req.query)
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
        let checkdraftexist = "select * from allschedulebox where planStatus != \"Unsuccessful\" ";

        db.query(checkdraftexist, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                var havedraft = json;
                console.log('>> havedraft: ', havedraft.length);
                if (havedraft.length > 0) {
                    db.query("select min(planNo) as pathNo from allschedulebox where planStatus != \"Unsuccessful\" ", (err, results) => {
                        var string = JSON.stringify(results);
                        //console.log('>> string: ', string );
                        var json = JSON.parse(string);
                        res.redirect("/scheduledesign/scheduleList?planNo=" + json[0].pathNo);
                    });

                } else {
                    return res.redirect("/scheduledesign");
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
                // console.log(req.query.type);
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

        var getavailabletimes = "select * from threeparty where sid = \"" + CurrentBox.SID + "\" "
            + "and availabledate in (select distinct(Date(boxdate)) from allschedulebox where planNo = " + req.query.planNo + " ) "
            + "and availablestarttime not in "
            + "(select boxdate from allschedulebox where planNo = " + req.query.planNo + " "
            + "and (tid = \"" + CurrentBox.TID + "\" or oid = \"" + CurrentBox.TID + "\" or tid = \"" + CurrentBox.OID + "\" or oid = \"" + CurrentBox.OID + "\"))"


        // "select availabledate , availablestartTime from studentavailable where sid = \"" + CurrentBox.SID + "\" and availabledate in("
        //     + " select availabledate from supervisoravailable where tid = \"" + CurrentBox.TID + "\" "
        //     + "and availablestarttime in(select availablestarttime from supervisoravailable where tid = \"" + CurrentBox.OID + "\")) "
        //     + "and availablestarttime in( select availablestartTime from supervisoravailable where tid = \"" + CurrentBox.TID + "\" "
        //     + "and availablestarttime in(select availablestarttime from supervisoravailable where tid = \"" + CurrentBox.OID + "\"));";
        console.log(getavailabletimes);
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
        // console.log(req.query);
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();

        if (req.query.Command == "getTime") {
            // var getavailabletimes = "select availablestartTime from studentavailable where sid = \"" + req.query.SID + "\" and availablestartTime in ("
            //     + "select availablestartTime from supervisoravailable where tid = \"" + req.query.OID + "\" "
            //     + "and availablestartTime in(select availablestartTime from supervisoravailable where tid = \"" + req.query.TID + "\" and availabledate = \"" + req.query.Date + "\"));"
            var getavailabletimes = "select Time(availablestarttime) as availableTime from threeparty where sid = \"" + req.query.SID + "\" "
                + "and availabledate =\"" + req.query.Date + "\" "
                + "and availablestarttime not in "
                + "(select boxdate from allschedulebox where planNo = " + req.query.planNo + " "
                + "and (tid = \"" + req.query.TID + "\" or oid = \"" + req.query.TID + "\" or tid = \"" + req.query.OID + "\" or oid = \"" + req.query.OID + "\"))"
            // console.log(getavailabletimes)
            availbletimes = await new Promise((resolve) => {
                pool.query(getavailabletimes, (err, res) => {
                    if (err) { return res.status(401).json("error happened in HandelManualCase.GetTimeByDate") }
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    var ans = new Array();
                    json.forEach(element => {
                        ans.push(element.availableTime);
                    });
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
        console.log("enter EditScheduleBox")
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

        var planinfo = await new Promise((resolve) => {
            pool.query("select distinct(TYPE) as TYPE ,planStatus from allschedulebox", (err, res) => {
                if (err) { return res.status(401).json("error happened in ScheduleController.EditScheduleBox.getCurrentBox") }
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                console.log("check here 2 ", json[0]);
                if (json.length > 0) {
                    resolve(json[0]);
                } else {
                    resolve(null);
                }
            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.EditScheduleBox.gettype"
        })
        req.body.TYPE = planinfo.TYPE;



        console.log("check here 3", req.body.TYPE);
        if (req.body.boxID == "" || req.body.boxID == null) {
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
            var querys = ["insert allschedulebox values (\"" + req.body.boxID + "\"," + req.body.planNo + ",\"" + planinfo.planStatus + "\",\"" + req.body.date + " " + req.body.time + "\",\"" + req.body.TYPE + "\",\"" + req.body.TID + "\",\"" + req.body.SID + "\",\"" + req.body.OID + "\",\"" + req.body.Campus + "\",\"" + req.body.RID + "\",now());",
            "delete from manualhandlecase where sid = \"" + req.body.SID + "\";"]


            querys.forEach(element => {
                db.query(element, (err, res) => {
                    try { console.log("inserted as new box") } catch (err) { return res.status(401).json("error happened in ScheduleController.EditScheduleBox.UpdateQuery") }
                })
            });
            var getPlanBoxnumber = await new Promise((resolve) => {
                db.query("select count(*) as counting from allschedulebox where planNo = " + req.body.planNo + ";", (err, res) => {
                    try {
                        var string = JSON.stringify(res);
                        var json = JSON.parse(string);
                        console.log(json)
                        var ans = json[0].counting;
                        resolve(ans)
                    } catch (err) { console.log(err) }

                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.outputCSV.getPlanBox"
            })
            var getStunumber = await new Promise((resolve) => {
                db.query("select count(*) as counting from student;", (err, res) => {
                    try {
                        var string = JSON.stringify(res);
                        var json = JSON.parse(string);
                        console.log(json)
                        var ans = json[0].counting;
                        resolve(ans)
                    } catch (err) { console.log(err) }

                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.outputCSV.getPlanBox"
            })

            if (getPlanBoxnumber == getStunumber) {
                db.query("update allschedulebox set planStatus =\"Successful\" where planNo= " + req.body.planNo, (err, res) => {
                    try {
                        console.log("updated status")
                    } catch (err) { console.log(err) }

                })
            }


            // return res.status(200).json("done");
            return res.redirect("/scheduledesign/scheduleList?planNo=" + req.body.planNo)

        } else {
            // check whether the current classroom can still be used for present
            // var getCurrentBox = "select * from allschedulebox where boxID = \"" + req.body.boxID + "\";";
            // console.log(getCurrentBox)
            // var CurrentBox = await new Promise((resolve) => {
            //     pool.query(getCurrentBox, (err, res) => {
            //         if (err) { return res.status(401).json("error happened in ScheduleController.EditScheduleBox.getCurrentBox") }
            //         var string = JSON.stringify(res);
            //         var json = JSON.parse(string);
            //         if (json.length > 0) {
            //             resolve(json[0]);
            //         } else {
            //             resolve(null);
            //         }
            //     })
            // }).catch((err) => {
            //     errmsg = "error happened in ScheduleController.EditScheduleBox.getCurrentBox"
            // })
            // var oldboxdate = new Date(CurrentBox.boxdate);
            // var oldboxdatestring = oldboxdate.toLocaleDateString("en-GB").split("/");
            // var oldboxendtime;
            // if (req.body.type == "final") {
            //     oldboxendtime = new Date(oldboxdate.getTime() + 60 * 60 * 1000);
            // } else {
            //     oldboxendtime = new Date(oldboxdate.getTime() + 30 * 60 * 1000);
            // }
            var updatequery = "Update allschedulebox set boxdate = \"" + req.body.date + " " + req.body.time + "\" , Campus = \"" + req.body.Campus + "\", RID = \"" + req.body.RID + "\",LastUpdate = now() where boxID = \"" + req.body.boxID + "\";";

            db.query(updatequery, (err, res) => {
                try { console.log("updated") } catch (err) { return res.status(401).json("error happened in ScheduleController.EditScheduleBox.UpdateQuery") }
            })


            return res.redirect("/scheduledesign/scheduleList?planNo=" + req.body.planNo)
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

    removeRecord: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        console.log(req.body);

        if (req.body.command == "delete") {
            var getline = "select tid,oid,sid from allschedulebox where boxid = \"" + req.body.boxid + "\";";
            var getPairInfo = await new Promise((resolve) => {

                db.query(getline, (err, res) => {
                    try {
                        var string = JSON.stringify(res);
                        var json = JSON.parse(string);
                        console.log(json);
                        var ans = json[0];
                        resolve(ans)
                    } catch (err) { console.log(err) }

                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.removeRecord.getPairInfo"
            })
            console.log(getPairInfo)


            var query = ["delete from allschedulebox where boxid = '" + req.body.boxid + "';",
            "update allschedulebox set planStatus = \"Manual Handling\" where planNo = " + req.body.planNo + ";",
            "insert into manualhandlecase values(\"" + getPairInfo.sid + "\",\"" + getPairInfo.tid + "\",\"" + getPairInfo.oid + "\"," + req.body.planNo + ") "];
            query.forEach(element => {
                db.query(element, (err, results) => {
                    try { } catch (err) {
                        return res.status(401).json("Error happened when excuting ScheduleController.removeRecord")
                    }
                });
            });


        }
        return res.status(200).json("ok");
    },

    outputCSV: async function (req, res) {
        var db = await sails.helpers.database();
        var getPlanBox = await new Promise((resolve) => {
            db.query("select Date(boxdate)as Date , Time(boxdate) as Time,allschedulebox.sid as StuID,supervisor.supname as SupName,  student.stdname as StuName, observerpairstudent.obsname as ObsName , rid as Classroom, Topic from allschedulebox left join supervisor on supervisor.tid = allschedulebox.TID left join observerpairstudent on allschedulebox.sid = observerpairstudent.sid left join student on allschedulebox.sid = student.SID left join supervisorpairstudent on allschedulebox.sid = supervisorpairstudent.sid where planNo = " + req.body.planNo + " order by boxdate asc, RID asc", (err, res) => {
                try {
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    var ans = json;
                    resolve(ans)
                } catch (err) { console.log(err) }

            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.outputCSV.getPlanBox"
        })
        getPlanBox.forEach(element => {
            var date = new Date(element.Date);
            element.Date = date.toLocaleDateString("en-GB");
        });


        const opts = {};
        const parser = new Parser(opts);
        const csv = parser.parse(getPlanBox);
        console.log(csv);
        return res.json(csv);
    },
}
