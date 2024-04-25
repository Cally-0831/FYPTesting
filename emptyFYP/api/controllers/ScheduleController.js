const { start } = require("repl");
const { setTimeout } = require("timers/promises");
const { Blob } = require('buffer');
const { Parser } = require('@json2csv/plainjs');
const { timeStamp } = require("console");

const ProgressBar = require('progress');
var Multiprogress = require('multi-progress');
const { emitWarning } = require("process");
const { request } = require("http");

module.exports = {

    nodraft: async function (req, res) {
        let getallsetting = " select * from allsupersetting where announcetime is not null order by typeofsetting asc";
        var supersetting;
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var checking = false;

        var checkarrangedobs = "select * from student where sid not in (select sid from observerpairstudent)";
        var arranged = await new Promise((resolve) => {
            pool.query(checkarrangedobs, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                //console.log("pairing result :", ans)
                if (ans.length > 0) {
                    ans = false
                } else {
                    ans = true
                }
                //console.log(ans + "    jdshfjashdf")
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "Error happened in ScheduleController.nodraft.checkarrangedobs"
        })
        console.log(">> here ", arranged)

        var checkdeadline = "select deadlinedate , deadlinetime,typeofsetting from allsupersetting where typeofsetting != 3 and Announcetime is not null order by typeofsetting asc";
        var setting1 = await new Promise((resolve) => {
            pool.query(checkdeadline, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                if (ans.length > 0) {
                    for (var a = 0; a < ans.length; a++) {
                        var deadlinedate = new Date(ans[a].deadlinedate);
                        var deadlinetime = ans[a].deadlinetime.split(":");
                        deadlinedate.setHours(deadlinetime[0]);
                        deadlinedate.setMinutes(deadlinetime[1]);
                        deadlinedate.setSeconds(deadlinetime[2]);
                        ans[a].deadlinedate = deadlinedate;
                    }


                } else {
                    ans = undefined
                }
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "Error happened in ScheduleController. nodraft.setting1"
        })



        checkdeadline = "select startdate , starttime,enddate,endtime from allsupersetting where typeofsetting = 3 and Announcetime is not null";
        var setting3 = await new Promise((resolve) => {
            pool.query(checkdeadline, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;

                if (ans.length > 0) {

                    var settingstartday = new Date(ans[0].startdate).toDateString();
                    var settingstarttime = ans[0].starttime;
                    var settingendday = new Date(ans[0].enddate).toDateString();
                    var settingendtime = ans[0].endtime;

                    var stringstring1 = settingstartday + " " + settingstarttime;
                    var stringstring2 = settingendday + " " + settingendtime;
                    var startdday = new Date(stringstring1);
                    presentstartday = startdday
                    presentendday = new Date(stringstring2);
                    ans = JSON.parse(JSON.stringify({ "presentstartday": presentstartday, "presentendday": presentendday }))
                } else {
                    ans = undefined
                }
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "Error happened in ScheduleController. nodraft.setting3"
        })

        // console.log(">>setting1", setting1)
        // console.log(">>setting3", setting3)

        var today = new Date();
        var errormsg = ""
        for (var a = 0; a < setting1.length; a++) {

            if (setting1[a].typeofsetting == 4 && a != setting1.length - 1) {
                setting1.push(setting1.splice(a, 1)[0])
            } else if (setting1[a].typeofsetting == 4 && a == setting1.length - 1) {
                if (new Date(setting3.presentstartday) > today) {
                    checking = true;
                } else {
                    checking = false;
                    errormsg += "3&"
                }


                if (setting1[a].deadlinedate < today) {
                    checking = true;
                } else {
                    checking = false;
                    errormsg += setting1[a].typeofsetting + "&";

                }
                // console.log("handling   " + setting1[a].typeofsetting,"   checking1  ",checking,"  errormsg1  ",errormsg)

            }
            //console.log("handling now  " + setting1[a].typeofsetting)
            if (setting1[a].typeofsetting != 4 && setting1[a].deadlinedate < today) {
                checking = true
            } else if (setting1[a].typeofsetting != 4 && setting1[a].deadlinedate > today) {
                checking = false;
                errormsg += setting1[a].typeofsetting + "&"

            }
            // console.log("handling   " + setting1[a].typeofsetting,"   checking2  ",checking,"  errormsg2  ",errormsg)
        }
        var warning;
        var erray = errormsg.split("&");
        erray = erray.filter((word) => word.length > 0);


        // console.log(arranged + "    " + erray)
        if (arranged) {
            if (erray.length == 1 && erray.includes("4")) {
                warning = "200";
                //console.log("here1")
            } else {
                warning = "401";
                //console.log("here2");
            }

        } else {
            warning = "401";
            erray.push("A");
            //console.log("here3")
        }
        // console.log("erray", erray);
        var getCampus = await new Promise((resolve) => {
            pool.query("select distinct(Campus) as Campus from classroom where Campus != \"\"", (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            console.log("Error happened in ScheduleController. nodraft.getCampus")
        })

        var isGenerating = await new Promise((resolve) => {
            db.query("select * from threeparty", (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                if (json.length > 0) {
                    resolve(true)
                } else {
                    resolve(false)
                }
                resolve(ans)
            })
        }).catch((err) => {
            console.log("Error happened in ScheduleController. nodraft.getCampus")
        })
        var isGenerating2 = await new Promise((resolve) => {
            db.query("select * from allschedulebox", (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                if (json.length > 0) {
                    resolve(true)
                } else {
                    resolve(false)
                }
                resolve(ans)
            })
        }).catch((err) => {
            console.log("Error happened in ScheduleController. nodraft.getCampus")
        })

        console.log(isGenerating, " ", warning, " ", isGenerating2)


        return res.view("user/admin/scheduledesign", {
            havedraft: "N",
            warning: warning, msg: errormsg,
            erray: erray,
            realreleaseday: setting1.find((element) => element.typeofsetting == 4).deadlinedate,
            presentstartday: new Date(setting3.presentstartday),
            presentendday: new Date(setting3.presentendday),
            Campus: getCampus

        });
    },

    viewschedulepage: async function (req, res) {

    },


    viewFinalSchedule: async function (req, res) {

        console.log("did enter here")
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var getsettinginfo;
        var getschedulebox;
        var thisistheline3;
        var releasedate;
        var releasetime;

        // check the displaytime has come
        checkdisplaydate = "select deadlinedate , deadlinetime from allsupersetting where typeofsetting = 4 and Announcetime is not null;"

        var setting = await new Promise((resolve) => {
            pool.query(checkdisplaydate, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans;
                if (json.length > 0) {
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
                    getschedulebox = "select * from allschedulebox where (tid = \"" + req.session.userid + "\" or oid =\"" + req.session.userid + "\" )and planStatus = \"Selected\" order by boxdate";
                } else if (req.session.role == "stu") {
                    getschedulebox = "select * from allschedulebox where sid = \"" + req.session.userid + "\" planStatus = \"Selected\" "
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

                    var stringmonth = "";
                    if ((currentgeneratedate.getMonth() + 1) < 10) {
                        stringmonth = "0" + (currentgeneratedate.getMonth() + 1);

                    } else {
                        stringmonth = currentgeneratedate.getMonth() + 1;
                    }

                    var datestring = currentgeneratedate.getFullYear() + "-" + stringmonth + "-" + currentgeneratedate.getDate();
                    /**midterm no need to check stu midterm */
                    var boolcheckttb = false;

                    var boolcheckreq = false;
                    var studentrequest;
                    /**midterm no need to check stu midterm */
                    if (req.body.pplTTB == "Yes") {
                        var getcheckstudentttb = "select * from allstudenttakecourse left join allclass on allclass.cid = allstudenttakecourse.cid  where pid = \"" + studentlist[a].sid + "\" and weekdays = \"" + currentgeneratedate.getDay() + "\" and (starttime <= Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and endtime >= time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\")) order by pid asc, weekdays asc,startTime asc"
                        studentttblist = await new Promise((resolve) => {
                            pool.query(getcheckstudentttb, (err, res) => {
                                var string = JSON.stringify(res);
                                var json = JSON.parse(string);
                                var ans = json;
                                if (json.length > 0) {
                                    resolve(ans)
                                } else {
                                    resolve(undefined)
                                }

                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.getcheckstudentttb"
                        })
                        if (studentttblist == undefined) {
                            boolcheckttb = true;
                        }

                    } else {
                        boolcheckttb = true;
                    }

                    if (studentttblist == null || studentttblist == undefined || studentttblist.length == 0) {
                        boolcheckttb = true;
                    }
                    if (req.body.pplTimeslot == "Yes") {
                        // select * from allrequestfromsupervisor where tid = \"" + supervisorlist[a].tid + "\" 
                        var getcheckstudentrequest = "select * from allrequestfromstudent where (status = \"Approved\" or status = \"Enforce Approved\") and sid = \"" + studentlist[a].sid + "\" and requestdate = \"" + datestring + "\" and timestamp (\"" + datestring + " " + currentgeneratedate.toLocaleTimeString("en-GB") + "\")between timestamp(concat(requestDate,\" \",requeststarttime)) and timestamp(concat(requestDate,\" \",requestendtime)) and timestamp (\"" + datestring + " " + currentgeneratedateend.toLocaleTimeString("en-GB") + "\")between timestamp(concat(requestDate,\" \",requeststarttime)) and timestamp(concat(requestDate,\" \",requestendtime))";
                        //console.log(getcheckstudentrequest)

                        studentrequest = await new Promise((resolve) => {
                            pool.query(getcheckstudentrequest, (err, res) => {
                                var string = JSON.stringify(res);
                                var json = JSON.parse(string);
                                var ans = json;
                                if (ans.length > 0) {

                                    resolve(ans)
                                } else {
                                    resolve(undefined)
                                }
                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.getcheckstudentrequest"
                        })
                        if (studentrequest == undefined) {
                            //console.log(supervisorlist[a].tid+"     "+currentgeneratedate.toLocaleDateString()+"   "+currentgeneratedate.toLocaleTimeString()+"    "+currentgeneratedateend.toLocaleTimeString())
                            //var datestring = currentgeneratedate.getFullYear()+"-"+(currentgeneratedate.getMonth()+1)+"-"+currentgeneratedate.getDate();
                            boolcheckreq = true;
                        }
                    } else {
                        boolcheckreq = true;
                    }






                    /**midterm no need to check stu midterm */
                    // if (boolcheckreq && boolcheckttb) {
                    if (boolcheckttb && boolcheckreq) {
                        var insertavability = "insert into studentavailable value(\"" + studentlist[a].sid + "\",Date(\"" + datestring + "\"),timestamp(\"" + datestring + " " + currentgeneratedate.toLocaleTimeString("en-GB") + "\"),timestamp(\"" + datestring + " " + currentgeneratedateend.toLocaleTimeString("en-GB") + "\"))"
                        // console.log(insertavability)
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

                    // console.log((checkdate1.getTime() - 30*60*1000) - checkdate2.getTime()<=30*60*1000 , "endend")

                    if (checkdate1.getTime() - 25 * 60 * 1000 - checkdate2.getTime() < 25 * 60 * 1000) {

                        // if (currentgeneratedate.toLocaleTimeString("en-GB") == "18:00:00") {
                        if (currentgeneratedate.getDay() != 6) {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours((new Date(setting3.startday).getHours()));
                            currentgeneratedate.setMinutes((new Date(setting3.startday).getMinutes()));
                            currentgeneratedate.setSeconds((new Date(setting3.startday).getSeconds()));
                            // currentgeneratedate.setHours(setting3.startday.getHours());
                            // currentgeneratedate.setMinutes(setting3.startday.getMinutes());
                            // currentgeneratedate.setSeconds(setting3.startday.getSeconds())
                        } else {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 2 * 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours((new Date(setting3.startday).getHours()));
                            currentgeneratedate.setMinutes((new Date(setting3.startday).getMinutes()));
                            currentgeneratedate.setSeconds((new Date(setting3.startday).getSeconds()));
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

                    var stringmonth = "";
                    if ((currentgeneratedate.getMonth() + 1) < 10) {
                        stringmonth = "0" + (currentgeneratedate.getMonth() + 1);

                    } else {
                        stringmonth = currentgeneratedate.getMonth() + 1;
                    }

                    var datestring = currentgeneratedate.getFullYear() + "-" + stringmonth + "-" + currentgeneratedate.getDate();
                    // console.log(datestring)
                    //console.log("final")
                    var boolcheckttb = false;
                    var boolcheckreq = false;
                    var studentttblist;

                    if (req.body.pplTTB == "Yes") {
                        var getcheckstudentttb = "select * from allstudenttakecourse left join allclass on allclass.cid = allstudenttakecourse.cid  where pid = \"" + studentlist[a].sid + "\" and weekdays = \"" + currentgeneratedate.getDay() + "\" and (starttime < Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and endtime > time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\")) order by pid asc, weekdays asc,startTime asc"
                        // console.log(getcheckstudentttb);
                        studentttblist = await new Promise((resolve) => {
                            pool.query(getcheckstudentttb, (err, res) => {
                                var string = JSON.stringify(res);
                                var json = JSON.parse(string);
                                var ans = json;
                                if (ans.length > 0) {
                                    resolve(ans)
                                } else {
                                    resolve(undefined)
                                }

                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.getcheckstudentttb"
                        })
                        if (studentttblist == undefined) {

                            boolcheckttb = true;
                        }
                    } else {
                        boolcheckttb = true;
                    }
                    // console.log(boolcheckttb)
                    if (req.body.pplTimeslot == "Yes") {
                        var getcheckstudentrequest = "select * from allrequestfromstudent where (status = \"Approved\" or status = \"Enforce Approved\") and sid = \"" + studentlist[a].sid + "\"and requestdate = \"" + datestring + "\" and timestamp (\"" + datestring + " " + currentgeneratedate.toLocaleTimeString("en-GB") + "\")between timestamp(concat(requestDate,\" \",requeststarttime)) and timestamp(concat(requestDate,\" \",requestendtime)) and timestamp (\"" + datestring + " " + currentgeneratedateend.toLocaleTimeString("en-GB") + "\")between timestamp(concat(requestDate,\" \",requeststarttime)) and timestamp(concat(requestDate,\" \",requestendtime))";
                        //console.log(getcheckstudentrequest)
                        studentrequest = await new Promise((resolve) => {
                            pool.query(getcheckstudentrequest, (err, res) => {
                                var string = JSON.stringify(res);
                                var json = JSON.parse(string);
                                var ans = json;
                                if (ans.length > 0) {
                                    resolve(ans)
                                } else {
                                    resolve(undefined)
                                }
                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.getcheckstudentrequest"
                        })
                        if (studentrequest == undefined) {

                            boolcheckreq = true;
                        }
                    } else {
                        boolcheckreq = true;
                    }






                    if (boolcheckreq && boolcheckttb) {
                        // console.log(boolcheckreq)
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
                    if (checkdate1.getTime() - 45 * 60 * 1000 - checkdate2.getTime() < 45 * 60 * 1000) {

                        // if (currentgeneratedate.toLocaleTimeString("en-GB") == "18:00:00") {
                        if (currentgeneratedate.getDay() != 6) {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours((new Date(setting3.startday).getHours()));
                            currentgeneratedate.setMinutes((new Date(setting3.startday).getMinutes()));
                            currentgeneratedate.setSeconds((new Date(setting3.startday).getSeconds()));
                            // currentgeneratedate.setHours(setting3.startday.getHours());
                            // currentgeneratedate.setMinutes(setting3.startday.getMinutes());
                            // currentgeneratedate.setSeconds(setting3.startday.getSeconds())
                        } else {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 2 * 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours((new Date(setting3.startday).getHours()));
                            currentgeneratedate.setMinutes((new Date(setting3.startday).getMinutes()));
                            currentgeneratedate.setSeconds((new Date(setting3.startday).getSeconds()));
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

            var supervisorttblist;
            var supervisorrequest;
            while (currentgeneratedate < new Date(setting3.endday)) {

                // var supervisorttblist;
                // var supervisorrequest;

                if (req.body.typeOfPresent == "midterm") {
                    //console.log("midterm")
                    currentgeneratedateend = new Date(currentgeneratedate.getTime() + 25 * 60 * 1000);
                    var stringmonth = "";
                    if ((currentgeneratedate.getMonth() + 1) < 10) {
                        stringmonth = "0" + (currentgeneratedate.getMonth() + 1);

                    } else {
                        stringmonth = currentgeneratedate.getMonth() + 1;
                    }

                    var datestring = currentgeneratedate.getFullYear() + "-" + stringmonth + "-" + currentgeneratedate.getDate();
                    /**midterm no need to check stu midterm */
                    var boolcheckttb = false;

                    var boolcheckreq = false;

                    if (req.body.pplTTB == "Yes") {
                        var getchecksupervisorttb = "select * from allsupertakecourse left join allclass on allclass.cid = allsupertakecourse.cid  where confirmation = 1 and pid = \"" + supervisorlist[a].tid + "\" and weekdays = \"" + currentgeneratedate.getDay() + "\" and (starttime <= Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and endtime >= time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\")) order by pid asc, weekdays asc,startTime asc"


                        /**midterm no need to check stu midterm */
                        supervisorttblist = await new Promise((resolve) => {
                            pool.query(getchecksupervisorttb, (err, res) => {
                                var string = JSON.stringify(res);
                                var json = JSON.parse(string);
                                var ans = json;
                                if (ans.length > 0) {
                                    // console.log(getchecksupervisorttb);
                                    // console.log("have lesson")
                                    resolve(ans)
                                } else {
                                    // console.log(getchecksupervisorttb);
                                    // console.log("no lesson")
                                    resolve(undefined)
                                }

                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.getsupervisorttblist"
                        })
                        if (supervisorttblist == undefined) {
                            boolcheckttb = true;
                        }
                    } else {
                        boolcheckttb = true;
                    }

                    if (req.body.pplTimeslot == "Yes") {
                        // select * from allrequestfromsupervisor where tid = \"" + supervisorlist[a].tid + "\" and timestamp (\"" + datestring +" "+ currentgeneratedateend.toLocaleTimeString("en-GB") + "\")between timestamp(concat(requestDate,\" \",requeststarttime)) and timestamp(concat(requestDate,\" \",requestendtime)) and timestamp (\"" + datestring +" "+ (new Date(currentgeneratedate.getTime()+25*60*60*1000)).toLocaleTimeString("en-GB") + "\")between timestamp(concat(requestDate,\" \",requeststarttime)) and timestamp(concat(requestDate,\" \",requestendtime))
                        var getchecksupervisorrequest = "select * from allrequestfromsupervisor where tid = \"" + supervisorlist[a].tid + "\" and RequestDate = \"" + datestring + "\"and (timestamp (\"" + datestring + " " + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") between timestamp(concat(requestDate,\" \",requeststarttime)) and timestamp(concat(requestDate,\" \",requestendtime)) or timestamp (\"" + datestring + " " + currentgeneratedate.toLocaleTimeString("en-GB") + "\") between timestamp(concat(requestDate,\" \",requeststarttime)) and timestamp(concat(requestDate,\" \",requestendtime)))";
                        supervisorrequest = await new Promise((resolve) => {
                            pool.query(getchecksupervisorrequest, (err, res) => {
                                var string = JSON.stringify(res);
                                var json = JSON.parse(string);
                                var ans = json;
                                // console.log(ans)
                                if (ans.length > 0) {

                                    resolve(ans)
                                } else {
                                    // console.log("no timeslot")
                                    // console.log(getchecksupervisorrequest)
                                    resolve(undefined)
                                }

                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.getchecksupervisorrequest"
                        })
                        if (supervisorrequest == undefined) {
                            boolcheckreq = true;
                        }
                    } else {
                        boolcheckreq = true;
                    }




                    /**midterm no need to check stu midterm */
                    // if (boolcheckreq && boolcheckttb) {
                    if (boolcheckttb && boolcheckreq) {
                        // console.log("finally here")
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



                    // console.log(checkdate1.toLocaleTimeString("en-GB") ,"  ", checkdate2.toLocaleTimeString("en-GB") , "endend")

                    // console.log((checkdate1.getTime() - 30*60*1000) - checkdate2.getTime()<=30*60*1000 , "endend")

                    if (checkdate1.getTime() - 25 * 60 * 1000 - checkdate2.getTime() < 25 * 60 * 1000) {

                        // if (currentgeneratedate.toLocaleTimeString("en-GB") == "18:00:00") {
                        if (currentgeneratedate.getDay() != 6) {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours((new Date(setting3.startday).getHours()));
                            currentgeneratedate.setMinutes((new Date(setting3.startday).getMinutes()));
                            currentgeneratedate.setSeconds((new Date(setting3.startday).getSeconds()));
                            // currentgeneratedate.setHours(setting3.startday.getHours());
                            // currentgeneratedate.setMinutes(setting3.startday.getMinutes());
                            // currentgeneratedate.setSeconds(setting3.startday.getSeconds())
                        } else {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 2 * 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours((new Date(setting3.startday).getHours()));
                            currentgeneratedate.setMinutes((new Date(setting3.startday).getMinutes()));
                            currentgeneratedate.setSeconds((new Date(setting3.startday).getSeconds()));
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

                    var stringmonth = "";
                    if ((currentgeneratedate.getMonth() + 1) < 10) {
                        stringmonth = "0" + (currentgeneratedate.getMonth() + 1);

                    } else {
                        stringmonth = currentgeneratedate.getMonth() + 1;
                    }

                    var datestring = currentgeneratedate.getFullYear() + "-" + stringmonth + "-" + currentgeneratedate.getDate();
                    var boolcheckttb = false;
                    var boolcheckreq = false;

                    if (req.body.pplTTB == "Yes") {
                        var getchecksupervisorttb = "select * from allsupertakecourse left join allclass on allclass.cid = allsupertakecourse.cid  where confirmation = 1 and pid = \"" + supervisorlist[a].tid + "\" and weekdays = \"" + currentgeneratedate.getDay() + "\" and (starttime < Time(\"" + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") and endtime > time(\"" + currentgeneratedate.toLocaleTimeString("en-GB") + "\")) order by pid asc, weekdays asc,startTime asc"
                        //console.log(getchecksupervisorttb);
                        supervisorttblist = await new Promise((resolve) => {
                            pool.query(getchecksupervisorttb, (err, res) => {
                                var string = JSON.stringify(res);
                                var json = JSON.parse(string);
                                var ans = json;
                                if (ans.length > 0) {
                                    resolve(ans)
                                } else {
                                    resolve(undefined)
                                }

                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.getsupervisorttblist"
                        })
                        if (supervisorttblist == undefined) {
                            boolcheckttb = true;
                        }
                    } else {
                        boolcheckttb = true;
                    }

                    if (req.body.pplTimeslot == "Yes") {
                        // select * from allrequestfromsupervisor where tid = \"" + supervisorlist[a].tid + "\" and RequestDate = \"" + datestring + "\"and (timestamp (\"" + datestring + " " + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") between timestamp(concat(requestDate,\" \",requeststarttime)) and timestamp(concat(requestDate,\" \",requestendtime)) or timestamp (\"" + datestring + " " + currentgeneratedate.toLocaleTimeString("en-GB") + "\") between timestamp(concat(requestDate,\" \",requeststarttime)) and timestamp(concat(requestDate,\" \",requestendtime)))
                        var getchecksupervisorrequest = "select * from allrequestfromsupervisor where tid = \"" + supervisorlist[a].tid + "\" and RequestDate = \"" + datestring + "\"and (timestamp (\"" + datestring + " " + currentgeneratedateend.toLocaleTimeString("en-GB") + "\") between timestamp(concat(requestDate,\" \",requeststarttime)) and timestamp(concat(requestDate,\" \",requestendtime)) or timestamp (\"" + datestring + " " + currentgeneratedate.toLocaleTimeString("en-GB") + "\") between timestamp(concat(requestDate,\" \",requeststarttime)) and timestamp(concat(requestDate,\" \",requestendtime)))";

                        supervisorrequest = await new Promise((resolve) => {
                            pool.query(getchecksupervisorrequest, (err, res) => {
                                var string = JSON.stringify(res);
                                var json = JSON.parse(string);
                                var ans = json;



                                if (ans.length > 0) {

                                    resolve(ans)
                                } else {

                                    resolve(undefined)
                                }

                            })
                        }).catch((err) => {
                            errmsg = "error happened in ScheduleController.genavailble.getchecksupervisorrequest"
                        })

                        if (supervisorrequest == undefined) {
                            boolcheckreq = true;
                        }
                    } else {
                        boolcheckreq = true;
                    }




                    if (boolcheckreq && boolcheckttb) {
                        // if(supervisorlist[a].tid = "tid00001"){
                        //     console.log("boolcheckreq", boolcheckreq)
                        //     console.log("boolcheckttb", boolcheckttb)
                        // }

                        var insertavability = "insert into supervisoravailable value(\"" + supervisorlist[a].tid + "\",Date(\"" + datestring + "\"),timestamp(\"" + datestring + " " + currentgeneratedate.toLocaleTimeString("en-GB") + "\"),timestamp(\"" + datestring + " " + currentgeneratedateend.toLocaleTimeString("en-GB") + "\"))"


                        // console.log("boolcheckreq", boolcheckreq)
                        // console.log("boolcheckttb", boolcheckttb)
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
                            // console.log(setting3.startday)
                            currentgeneratedate.setHours((new Date(setting3.startday).getHours()));
                            currentgeneratedate.setMinutes((new Date(setting3.startday).getMinutes()));
                            currentgeneratedate.setSeconds((new Date(setting3.startday).getSeconds()));
                            // currentgeneratedate.setHours(setting3.startday.getHours());
                            // currentgeneratedate.setMinutes(setting3.startday.getMinutes());
                            // currentgeneratedate.setSeconds(setting3.startday.getSeconds())
                        } else {
                            currentgeneratedate.setTime(currentgeneratedate.getTime() + 2 * 24 * 60 * 60 * 1000);
                            currentgeneratedate = new Date(currentgeneratedate);
                            currentgeneratedate.setHours((new Date(setting3.startday).getHours()));
                            currentgeneratedate.setMinutes((new Date(setting3.startday).getMinutes()));
                            currentgeneratedate.setSeconds((new Date(setting3.startday).getSeconds()));
                            // currentgeneratedate.setHours(setting3.startday.getHours());
                            // currentgeneratedate.setMinutes(setting3.startday.getMinutes());
                            // currentgeneratedate.setSeconds(setting3.startday.getSeconds())
                        }
                    } else {
                        currentgeneratedate.setTime(currentgeneratedate.getTime() + 45 * 60 * 1000);
                    }

                    if (currentgeneratedate.getTime() > (new Date(setting3.endday)).getTime()) {
                        break;
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
            var check3ava = "select supavaTID.tid, studentavailable.sid,supavaOID.tid as oid, studentavailable.availabledate, studentavailable.availablestarttime,studentavailable.availableendtime from studentavailable left join supervisorpairstudent on supervisorpairstudent.sid = studentavailable.sid left join supervisoravailable as supavaTID on supavaTID.tid = supervisorpairstudent.tid  left join observerpairstudent on observerpairstudent.sid = studentavailable.sid left join supervisoravailable as supavaOID on supavaOID.tid = observerpairstudent.oid where supavaTID.availablestartTime = studentavailable.availablestartTime and supavaOID.availablestartTime = supavaTID.availablestartTime "
                + "and studentavailable.sid = \"" + pairinglist[a].sid + "\" and supavaTID.tid = \"" + pairinglist[a].tid + "\" and supavaOID.tid = \"" + pairinglist[a].oid + "\";"
            var addthreepartyAva = await new Promise((resolve) => {
                pool.query(check3ava, (err, res) => {
                    var string = JSON.stringify(res);
                    var json = JSON.parse(string);
                    var ans = json;
                    resolve(ans)
                })
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.genavailble.paringlist"
            })



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
        // return res.redirect("/scheduledesign/nqueenversion?typeOfPresent=" + req.body.typeOfPresent)

        /**using combin version */
        return res.status(200).json("ok");
    },

    Combinversion: async function (req, res) {
        console.log("\n\nStart Processing with Genetic version");

        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        console.log(req.body);

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
        console.log(setting3)
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
        console.log(">>designdate", designdate.toLocaleDateString("en-GB"), " ", designdate.toLocaleTimeString("en-GB"));
        console.log(designdate.toLocaleDateString("en-GB") <= setting3.presentenddate.toLocaleDateString("en-GB"))
        while (designdate.getTime() <= setting3.presentenddate.getTime()) {
            console.log(">>designdate2", designdate.toLocaleDateString("en-GB"), " ", designdate.toLocaleTimeString("en-GB"));
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
        // console.log(presentperiod)
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
        var preSetClassroomList = req.body.roomList
        var firstList = new Array();
        var SecondList = new Array();




        var preSetFSCList = ['FSC801C', 'FSC801D', 'FSC901C', 'FSC901D', 'FSC901E'];
        var preSetFSC8thList = ['FSC801C', 'FSC801D', 'FSC801E'];
        var preSetFSC9thList = ['FSC901C', 'FSC901D', 'FSC901E'];
        var preSetRRSList = ['RRS638', 'RRS735', 'RRS732'];



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
            // console.log(studentnum)
            if (studentnum != "err") { return studentnum; } else { return false; }
        }
        async function getPairingList() {
            var studentList = await new Promise((resolve) => {
                pool.query("select t1.* ,t2.oid from observerpairstudent as t2 left join (select sid , tid from supervisorpairstudent) as t1 on t1.sid = t2.sid", (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        if (json.length > 0) {
                            // console.log(json);
                            resolve(json);
                        }
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.startschedule.getPairingList()"
            })
            if (studentList != "err") { return studentList; } else { return false; }
        }
        async function getTeachingList() {
            var TeachingList = await new Promise((resolve) => {
                pool.query("select tid from supervisor", (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        if (json.length > 0) {
                            // console.log(json);
                            resolve(json);
                        }
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.startschedule.getTeachingList()"
            })
            if (TeachingList != "err") { return TeachingList; } else { return false; }
        }

        async function getPrefList(TeachingList) {
            var PrefList = await new Promise((resolve) => {
                pool.query("select * from allpreffromsup", (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        if (json.length > 0) {
                            // console.log(json);
                            resolve(json);
                        } else {
                            resolve("err")
                        }
                    } catch (err) {
                        resolve("err")
                    }
                });
            }).catch((err) => {
                errmsg = "error happened in ScheduleController.Combinversion.getPrefList()"
            })
            // console.log("Iam preflist",PrefList , "  ",PrefList == "err","  ",PrefList === "err")
            if (PrefList == "err") {
                TeachingList.forEach(staff => {
                    staff.daypref = 1;
                    staff.movementpref = 1;
                });
            } else {
                TeachingList.forEach(staff => {
                    var index = PrefList.findIndex((teacher) => teacher.TID == staff.tid)
                    if (index > 0) {
                        staff.daypref = PrefList[index].daypref;
                        staff.movementpref = PrefList[index].movementpref;
                    } else if (index == undefined) {
                        staff.daypref = 1;
                        staff.movementpref = 1;
                    }
                });

            }

            return TeachingList;
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
            // console.log(uniquetimeslotcounts.length + "  " + uniquetimeslotcounts)
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
            // console.log("checking in room ttb ", checking)
            if (checking != "err") { return checking; } else { return false; }
        }

        async function checkclassroomtimeslot(classroom, dateoftoday, starttime, endtime) {
            // ((date(\"" + dateoftoday + " " + endtime + "\") between Date(concat(startdate,\" \",starttime)) and date(concat(enddate,\" \",endtime))) and (date(\"" + dateoftoday + " " + starttime + "\") between Date(concat(startdate,\" \",starttime)) and date(concat(enddate,\" \",endtime)))
            // console.log("select * from  allclassroomtimeslot where RID = \"" + classroom + "\" and  ((timestamp(\"" + dateoftoday + " " + endtime + "\") between timestamp(concat(startdate,\" \",starttime)) and timestamp(concat(enddate,\" \",endtime))) and (timestamp(\"" + dateoftoday + " " + starttime + "\") between timestamp(concat(startdate,\" \",starttime)) and timestamp(concat(enddate,\" \",endtime))))")
            var checking = await new Promise((resolve) => {
                pool.query("select * from  allclassroomtimeslot where RID = \"" + classroom + "\" and  ((timestamp(\"" + dateoftoday + " " + endtime + "\") between timestamp(concat(startdate,\" \",starttime)) and timestamp(concat(enddate,\" \",endtime))) or (timestamp(\"" + dateoftoday + " " + starttime + "\") between timestamp(concat(startdate,\" \",starttime)) and timestamp(concat(enddate,\" \",endtime))))", (err, results) => {
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
            // console.log("checking in room timeslot ", checking)
            if (checking) { return true; } else { return false; }
        }

        function resetsessionendtime(sessionstarttime) {
            var sessionend;
            if (req.body.typeOfPresent == "final") {
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
            if (availablepairs != "err") { return availablepairs.sort(() => 0.5 - Math.random()); } else { return false; }
        }

        function reducePairBySID(selectedArray, PresentationList) {
            // console.log("org presentlistlenght", selectedArray)
            var ans;
            if (selectedArray == null) { return PresentationList; }
            if (selectedArray.length == 0) { return PresentationList; }

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
            if (selectedArray.length == 0 || selectedArray == null) { return PresentationList; }
            selectedArray.forEach(element => {
                // console.log("org length",PresentationList.length)
                var foundSup = PresentationList.filter((Sup) => Sup.TID == element.TID || Sup.OID == element.TID);
                // console.log(">>fundSup" ,element.TID ," ",foundSup.length)
                foundSup.forEach(removelist => {
                    // PresentationList.splice(PresentationList.find((Sup) => Sup == removelist))
                    var index = PresentationList.findIndex((present) => present == removelist);
                    //    console.log("index check",index)
                    PresentationList.splice(index, 1)
                });
                // console.log(">>Prexse  1" , PresentationList.length)
                var foundObs = PresentationList.filter((Obs) => Obs.TID == element.OID || Obs.OID == element.OID);
                //    console.log(">>fundObs" ,element.OID ," ",foundSup.length)
                foundObs.forEach(removelist => {
                    // PresentationList.splice(PresentationList.find((Obs) => Obs == removelist))
                    var index = PresentationList.findIndex((present) => present == removelist);
                    PresentationList.splice(index, 1)
                });
                // console.log(">>Prexse 2" , PresentationList)
                // while (PresentationList.find((element2) => element.TID == element2.TID)) {
                //     var id = PresentationList.find((element2) => element.TID == element2.TID);
                //     var index = PresentationList.indexOf(id);
                //     console.log("have this person reduce sin case1")
                //     var removed = PresentationList.splice(index, 1);
                //     ans = copyarray(PresentationList);
                //     PresentationList = ans;
                // }
                // while (PresentationList.find((element2) => element.TID == element2.OID)) {
                //     var id = PresentationList.find((element2) => element.TID == element2.OID);
                //     var index = PresentationList.indexOf(id);
                //     console.log("have this person reduce sin case 2")

                //     var removed = PresentationList.splice(index, 1);
                //     // console.log(removed)

                //     ans = copyarray(PresentationList);
                //     // console.log(ans);
                //     PresentationList = ans;
                // }
                // while (PresentationList.find((element2) => element.OID == element2.TID)) {
                //     var id = PresentationList.find((element2) => element.OID == element2.TID);
                //     var index = PresentationList.indexOf(id);
                //     console.log("have this person reduce sin case 3")
                //     var removed = PresentationList.splice(index, 1);
                //     // console.log(removed)

                //     ans = copyarray(PresentationList);
                //     // console.log(ans);
                //     PresentationList = ans;
                // }
                // while (PresentationList.find((element2) => element.OID == element2.OID)) {
                //     var id = PresentationList.find((element2) => element.OID == element2.OID);
                //     var index = PresentationList.indexOf(id);
                //     console.log("have this person reduce sin case 4")

                //     var removed = PresentationList.splice(index, 1);
                //     // console.log(removed)

                //     ans = copyarray(PresentationList);
                //     // console.log(ans);
                //     PresentationList = ans;
                // }

            });
            // console.log(">> reduce Pair from selected ", PresentationList.length)
            return PresentationList;
        }

        function reducePairByTeachingStaff(StaffList, PresentationList) {
            // console.log("StaffList requires removal", StaffList)
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

        // function retrieveConsecList(PreviousList, PresentationList) {
        //     /** PreviousList == previous 3 timeslot
        //     *  return a list that teaching staff exist in previous timeslot before
        //     */
        //     var priorityList = new Array();
        //     if (PreviousList.length == 0) { return priorityList; }

        //     PreviousList.forEach(ScheduledTimeslots => {
        //         ScheduledTimeslots.forEach(ScheduledPresent => {
        //             var foundTID = PresentationList.filter((element) => element.TID == ScheduledPresent.TID || element.OID == ScheduledPresent.TID)
        //             var foundOID = PresentationList.filter((element) => element.TID == ScheduledPresent.OID || element.OID == ScheduledPresent.OID)
        //             priorityList.push(foundTID)
        //             priorityList.push(foundOID)
        //         });


        //     });
        //     priorityList = (uniquePresentationList(priorityList));
        //     // console.log(">>priorityList in retrieveConsecList",priorityList);
        //     return priorityList;
        // }

        // function uniquePresentationList(PresentationList) {
        //     if (PresentationList.length == 0) { return PresentationList; }
        //     var uniqueList = new Array();
        //     PresentationList.forEach(element => {
        //         if (!uniqueList.find((present) => present.SID == element.SID)) {
        //             uniqueList.push(element);
        //         }
        //     });
        //     PresentationList = uniqueList;
        //     return PresentationList;
        // }

        // function reduceConsec4Session(schedulePlan, PresentationList) {
        //     /** only getting previous 3 timeslot
        //      *  By default should not have a teaching staff sit for 4 session
        //      */

        //     var teacherList = new Array();
        //     if (schedulePlan.length == 0) { return PresentationList; }
        //     schedulePlan.forEach(timeslot => {
        //         timeslot.forEach(room => {
        //             if (!teacherList.find((element) => element.ID == room.TID)) {
        //                 var obj = JSON.parse(JSON.stringify({ ID: room.TID, count: 0 }))
        //                 teacherList.push(obj)
        //             }
        //             if (!teacherList.find((element) => element.ID == room.OID)) {
        //                 var obj = JSON.parse(JSON.stringify({ ID: room.OID, count: 0 }))
        //                 teacherList.push(obj)
        //             }
        //         });
        //     });

        //     var countingForSitting = 0;
        //     teacherList.forEach(teachingstaff => {
        //         schedulePlan.forEach(timeslot => {
        //             var found = false;
        //             timeslot.forEach(room => {
        //                 if (room.TID == teachingstaff.ID || room.OID == teachingstaff.ID) {
        //                     countingForSitting++;
        //                     found = true;
        //                 }
        //             });
        //             if (!found) {
        //                 countingForSitting = 0;
        //             } else {
        //                 teachingstaff.count = countingForSitting;
        //             }
        //         });
        //     });
        //     // console.log("teacherList   " ,teacherList.filter((staff) => staff.count >= 3))

        //     //first reduce those staff already sit for 3 session
        //     PresentationList = reducePairByTeachingStaff(teacherList.filter((staff) => staff.count >= 4), PresentationList);
        //     // console.log("PriorityList  1   ", PresentationList);
        //     // PresentationList = retrieveConsecList(schedulePlan, PresentationList);
        //     // console.log("PriorityList  2   ", PresentationList);
        //     return PresentationList;
        // }

        // function Consec3Session(schedulePlan, PresentationList) {
        //     /** only getting previous 3 timeslot
        //      *  By default should not have a teaching staff sit for 4 session
        //      */

        //     var teacherList = new Array();
        //     if (schedulePlan.length == 0) { return PresentationList; }
        //     schedulePlan.forEach(timeslot => {
        //         timeslot.forEach(room => {
        //             if (!teacherList.find((element) => element.ID == room.TID)) {
        //                 var obj = JSON.parse(JSON.stringify({ ID: room.TID, count: 0 }))
        //                 teacherList.push(obj)
        //             }
        //             if (!teacherList.find((element) => element.ID == room.OID)) {
        //                 var obj = JSON.parse(JSON.stringify({ ID: room.OID, count: 0 }))
        //                 teacherList.push(obj)
        //             }
        //         });
        //     });

        //     var countingForSitting = 0;
        //     teacherList.forEach(teachingstaff => {
        //         schedulePlan.forEach(timeslot => {
        //             var found = false;
        //             timeslot.forEach(room => {
        //                 if (room.TID == teachingstaff.ID || room.OID == teachingstaff.ID) {
        //                     countingForSitting++;
        //                     found = true;
        //                 }
        //             });
        //             if (!found) {
        //                 countingForSitting = 0;
        //             } else {
        //                 teachingstaff.count = countingForSitting;
        //             }
        //         });
        //     });

        //     return teacherList;
        // }

        // function reduceByCombination(SchedulePlans, PresentationList, thistimeslot, timeslotCombin) {
        //     var needremoval = false;
        //     var count = 0;
        //     // console.log("reduceByCombinationProblem")
        //     var removeElement = new Array();
        //     SchedulePlans.forEach(plans => {
        //         var count = 0;
        //         plans.Schd[thistimeslot].forEach(ScheduledPresent => {
        //             if (timeslotCombin.find((element) => element.SID == ScheduledPresent.SID)) {
        //                 count++;
        //             } else {

        //                 removeElement.push(ScheduledPresent);
        //             }
        //         });
        //         if (count == timeslotCombin.length) {
        //             needremoval = true;
        //         }
        //     });
        //     removeElement = uniquePresentationList(removeElement);

        //     PresentationList = reducePairBySID(removeElement, PresentationList);
        //     return PresentationList;
        // }

        function randomNum(arrayList) {

            return Math.floor(Math.random() * arrayList.length);

        }

        // function product_Range(a, b) {
        //     var prd = a, i = a;

        //     while (i++ < b) {
        //         prd *= i;
        //     }
        //     return prd;
        // }

        // function combinations(n, r) {
        //     if (n == r || r == 0) {
        //         return 1;
        //     }
        //     else {
        //         r = (r < n - r) ? n - r : r;
        //         return product_Range(r + 1, n) / product_Range(1, n - r);
        //     }
        // }

        // function calcPercentage(x, y, fixed = 2) {
        //     const percent = (x / y) * 100;

        //     if (!isNaN(percent)) {
        //         return (Number(percent.toFixed(fixed)) + "%");
        //     } else {
        //         return null;
        //     }
        // }

        async function InitialArrayTemplate(StudentList, TeachingList, TotalTimeslots, preSetClassroomList) {

            var Schedule = new Array();
            var checkRoomcounts;
            for (var timeslots = 0; timeslots < TotalTimeslots.length; timeslots++) {
                // for (var timeslots = 0; timeslots < 30; timeslots++) {
                var sessionstarttime = new Date(uniquetimeslotcounts[timeslots].availablestarttime);
                var sessionendtime = resetsessionendtime(sessionstarttime);
                var sqldatestring = sessionstarttime.toLocaleDateString("en-GB").split("/");
                sqldatestring = sqldatestring[2] + "-" + sqldatestring[1] + "-" + sqldatestring[0];
                sqldatestring.trim();
                var roomcount = 0;
                var availableclassroomlist = new Array();
                for (var room = 0; room < preSetClassroomList.length; room++) {
                    var roomttbresult = false;
                    var roomtimeslotresult = false;
                    if (req.body.typeOfPresent == "final") {

                        if (req.body.ClassroomTTB == "Yes") {
                            roomttbresult = await checkclassroomttb(preSetClassroomList[room], sessionstarttime.getDay(), sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                        } else {
                            roomttbresult = true;
                        }
                        var roomtimeslotresult = await checkclassroomtimeslot(preSetClassroomList[room], sqldatestring, sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                        // console.log(sqldatestring,"  ",sessionstarttime.toLocaleTimeString("en-GB")," ",preSetClassroomList[room])   
                        // console.log(roomttbresult , "  ",roomtimeslotresult)
                        if (roomttbresult && roomtimeslotresult) {
                            roomcount++;
                            availableclassroomlist.push(preSetClassroomList[room])
                        } else {
                            // console.log(sqldatestring,"  ",sessionstarttime.toLocaleTimeString("en-GB")," this room cant ", preSetClassroomList[room])
                        }
                    } else {
                        if (req.body.ClassroomTTB == "Yes") {
                            roomttbresult = await checkclassroomttb(preSetClassroomList[room], sessionstarttime.getDay(), sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                        } else {
                            roomttbresult = true;
                        }
                        var roomtimeslotresult = await checkclassroomtimeslot(preSetClassroomList[room], sqldatestring, sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                        if (roomtimeslotresult) {
                            roomcount++;
                            availableclassroomlist.push(preSetClassroomList[room])
                        }
                    }
                }
                var PresentationList = await availblepairsforthistimeslot(sqldatestring, sessionstarttime.toLocaleTimeString("en-GB"));
                var copyStudentAy = new Array();
                copyStudentAy = JSON.parse(JSON.stringify(StudentList));
                var copyTeachingAy = new Array()
                copyTeachingAy = JSON.parse(JSON.stringify(TeachingList));
                // console.log(copyTeachingAy, " org  ", TeachingList)
                PresentationList.forEach(element => {
                    var index = copyStudentAy.findIndex((student) => student.sid == element.SID)
                    // console.log(element.SID)
                    if (index >= 0) {
                        copyStudentAy[index].appears = 0
                        var tid = copyStudentAy[index].tid;
                        var oid = copyStudentAy[index].oid;
                        copyTeachingAy[copyTeachingAy.findIndex((staff) => staff.tid == tid)].appears = 0;
                        copyTeachingAy[copyTeachingAy.findIndex((staff) => staff.tid == oid)].appears = 0;
                    }

                });
                // console.log(copyStudentAy , "  ",copyTeachingAy)


                // console.log("this is copyteachingay", copyTeachingAy)
                // console.log(sqldatestring," ",sessionstarttime.toLocaleTimeString("en-GB"),"TotalTimeslots",copyStudentAy)

                availableclassroomlist.forEach(element => {
                    var ScheduleTimeslot = JSON.parse(JSON.stringify({
                        SQLdate: sqldatestring,
                        SQLtime: sessionstarttime.toLocaleTimeString("en-GB"),
                        timeslot: sessionstarttime,
                        roomcount: roomcount,
                        room: element,
                        StudentAy: copyStudentAy,
                        TeachingAy: copyTeachingAy

                    }))
                    Schedule.push(ScheduleTimeslot);
                    // console.log(Schedule.length)
                });

            }
            // console.log(Schedule)
            Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) || a.room - b.room)
            // console.log(Schedule.length)
            if (Schedule.length < StudentList.length) {
                checkRoomcounts = false;
            } else {
                checkRoomcounts = true;
            }
            Template = JSON.parse(JSON.stringify({
                Schedule: Schedule,
                tacklecount: 0,
                Penalty: 0,
                able: checkRoomcounts,
                List: preSetClassroomList
            }))
            // console.log(TotalTimeslots)
            var starttime = TotalTimeslots.sort((a, b) => new Date(a.availablestarttime) - new Date(b.availablestarttime))[0].availablestarttime;
            var endtime = TotalTimeslots.sort((a, b) => new Date(b.availablestarttime) - new Date(a.availablestarttime))[0].availablestarttime;
            starttime = new Date(starttime);
            endtime = new Date(endtime);

            console.log("Complete Generating Initial Template");
            // Template.Schedule.forEach((time)=> console.log(time.SQLdate))
            // console.log(Template)
            return Template;

        }

        function checkDuplicateStudentAy(arr1, arr2) {

            const objectsEqual = (o1, o2) => {
                if (o2 === null && o1 !== null) return false;
                return o1 !== null && typeof o1 === 'object' && Object.keys(o1).length > 0 ?
                    Object.keys(o1).length === Object.keys(o2).length &&
                    Object.keys(o1).every(p => objectsEqual(o1[p], o2[p]))
                    : (o1 !== null && Array.isArray(o1) && Array.isArray(o2) && !o1.length &&
                        !o2.length) ? true : o1 === o2;
            }
            return objectsEqual(arr1, arr2);
        }

        function setAppear(Schedule, pairs, setNum) {
            // console.log(pairs)
            // console.log(Schedule)
            if (pairs.hasOwnProperty("SID")) {
                // console.log("case 1", Schedule.StudentAy[Schedule.StudentAy.findIndex((student) => student.sid == pairs.SID)])
                // console.log(Schedule.StudentAy.findIndex((student) => student.sid == pairs.SID), " ", pairs, " ", setNum)
                Schedule.StudentAy[Schedule.StudentAy.findIndex((student) => student.sid == pairs.SID)].appears = setNum;
                Schedule.TeachingAy[Schedule.TeachingAy.findIndex((staff) => staff.tid == pairs.TID)].appears = setNum;
                Schedule.TeachingAy[Schedule.TeachingAy.findIndex((staff) => staff.tid == pairs.OID)].appears = setNum;
            } else {
                // console.log("case 2")
                // console.log(pairs, "set to ", setNum)
                // console.log(Schedule.StudentAy[Schedule.StudentAy.findIndex((student) => student.sid == pairs.sid)])
                Schedule.StudentAy[Schedule.StudentAy.findIndex((student) => student.sid == pairs.sid)].appears = setNum;
                var Sub = Schedule.TeachingAy.findIndex((staff) => staff.tid == pairs.tid)
                var Obs = Schedule.TeachingAy.findIndex((staff) => staff.tid == pairs.oid)
                Schedule.TeachingAy[Sub].appears = setNum;
                // console.log(Schedule.TeachingAy[Sub])
                Schedule.TeachingAy[Obs].appears = setNum;
                // console.log(Schedule.TeachingAy.filter((staff) => staff.tid == pairs.tid || staff.tid == pairs.oid))
            }
            // console.log(Schedule, " in set appear")
        }

        function reduceByCurrentExistingStudent(nowExist, PresentationList) {
            // console.log(nowExist)
            var newList = new Array();

            nowExist.forEach(student => {
                var thelist;
                if (PresentationList[0].hasOwnProperty("SID")) {
                    thelist = PresentationList.find((slots) => slots.SID == student.sid)
                } else {
                    thelist = PresentationList.find((slots) => slots.sid == student.sid)
                }

                // console.log(">> the list",thelist)
                if (thelist != undefined) {
                    newList.push(thelist)
                }

            });
            newList.flat();
            // console.log(">> newList ", newList)
            return newList;

        }

        function DeternminWhichCampusFirst(sameTimeslot) {
            var usedFSCRoom = 0;
            var usedRRSRoom = 0;


            sameTimeslot.forEach(element => {
                if (preSetFSCList.find((room) => room == element.room)) {
                    usedFSCRoom++;
                } else if (preSetRRSList.find((room) => room == element.room)) {
                    usedRRSRoom++;
                }
            });


            var roomsinFSC = sameTimeslot.filter((rooms) => preSetFSCList.find((inme) => inme == rooms.room) != undefined);
            var roomsinRRS = sameTimeslot.filter((rooms) => preSetRRSList.find((inme) => inme == rooms.room) != undefined);
            // roomsinFSC.forEach(element => {
            //     console.log(element.room)
            // });
            // console.log("\n\n")
            // roomsinRRS.forEach(element => {
            //     console.log(element.room)
            // });

            var firstemptyroomFSC = roomsinFSC.filter((rooms) => rooms.StudentAy.find((appeared) => appeared.appears == 1) == undefined);
            var firstemptyroomRRS = roomsinRRS.filter((rooms) => rooms.StudentAy.find((appeared) => appeared.appears == 1) == undefined);

            // firstemptyroomFSC.forEach(element => {
            //     console.log("empty",element.room)
            // });
            // console.log("\n\n")
            // firstemptyroomRRS.forEach(element => {
            //     console.log("empty",element.room)
            // });



            // console.log(sameTimeslot.filter((room) => room.StudentAy.find((present) => present.appears == 1) == undefined)," whoops")

            if (usedFSCRoom >= usedRRSRoom) {
                // console.log("case 1 in determin",sameTimeslot.filter((room) => room.room == preSetFSCList.find((room2) => room2 == room.room)).find((room)=> room.StudentAy.find((present)=> present.appears == 1) == undefined))
                // console.log("case 1.1 in determin",sameTimeslot.filter((room) => room.room ==preSetRRSList.find((room2) => room2 == room.room)).find((room)=> room.StudentAy.find((present)=> present.appears == 1) == undefined))

                if (firstemptyroomFSC.length > 0) {
                    // console.log("case 1 1 in determin");
                    // ,sameTimeslot.filter((room) => room.room == preSetFSCList.find((room2) => room2 == room.room)).find((room)=> room.StudentAy.find((present)=> present.appears == 1) == undefined));
                    return firstemptyroomFSC[0]
                } else if (firstemptyroomRRS.length > 0) {
                    // console.log("case 1 2 in determin")
                    // ,sameTimeslot.filter((room) => room.room ==preSetRRSList.find((room2) => room2 == room.room)).find((room)=> room.StudentAy.find((present)=> present.appears == 1) == undefined));
                    return firstemptyroomRRS[0]
                } else {
                    // console.log("case 1 3 in determin")
                    return undefined;
                }

            } else {
                // console.log("case 2  in determin", sameTimeslot.filter((room) => room.room == preSetRRSList.find((room2) => room2 == room.room)).find((room) => room.StudentAy.find((present) => present.appears == 1) == undefined))
                // console.log("case 2 1 in determin")
                if (firstemptyroomRRS.length > 0) {
                    // console.log("case 2 1  in determin")
                    // , sameTimeslot.filter((room) => room.room == preSetRRSList.find((room2) => room2 == room.room)).find((room) => room.StudentAy.find((present) => present.appears == 1) == undefined))
                    return firstemptyroomRRS[0]
                } else if (firstemptyroomFSC.length > 0) {
                    // console.log("case 2 2 in determin");
                    // , sameTimeslot.find((room) => sameTimeslot.filter((room) => room.room == preSetFSCList.find((room2) => room2 == room.room)).find((room) => room.StudentAy.find((present) => present.appears == 1) == undefined)))
                    return firstemptyroomFSC[0]
                } else {
                    // console.log("case 2 3 in determin")
                    return undefined;
                }
            }
        }

        // function sortTimeslotInOrder(Template) {
        //     // console.log(Template.Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) || a.room - b.room)[0].SQLdate," ",Template.Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) || a.room - b.room)[0].SQLtime)
        //     Template.Schedule = JSON.parse(JSON.stringify(Template.Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) || a.room - b.room)));
        //     // console.log(Template.Schedule[0].SQLdate," ",Template.Schedule[0].SQLtime)
        //     return Template
        // }

        // function sortTimeslotInPivot(Template) {
        //     var pivot = (new Date(Template.Schedule[Math.round((randomNum(Template.Schedule)) * 0.5)].timeslot)).getTime();
        //     Template.Schedule = JSON.parse(JSON.stringify(Template.Schedule.sort((a, b) => Math.abs((new Date(a.timeslot)).getTime() - pivot) - Math.abs((new Date(b.timeslot)).getTime() - pivot) || a.room - b.room)));
        //     return Template
        // }

        // function sortTimeslotInRandom(Template) {
        //     Template.Schedule = JSON.parse(JSON.stringify(Template.Schedule.sort((a, b) => 0.5 - Math.random() || a.room - b.room)))
        //     return Template
        // }

        async function InitialGeneration(Population, Template) {
            /**
             *   Must FullFill Constraints:
             * 
             * - No Sup or Obs duplication in all presentaions in the timeslot
             * - All Presentation must be scheduled and only happened once
             * - No Teaching Staff can have 4 consec session
            "" */
            console.log("Start Generation", Template.Schedule.length)
            var multi = new Multiprogress(process.stderr);

            var ProcessStart = new Date();
            function reduceDuplicate(Population, currentPop) {
                for (var PopNum = 0; PopNum < Population.length; PopNum++) {
                    var checkcount = 0;
                    var checkroomcount = 0;
                    // console.log("checking PopNum ", PopNum)
                    for (var time = 0; time < Population[PopNum].Schedule.length;) {
                        var thistimeslotCombin = Population[PopNum].Schedule.filter((timeslot) => timeslot.timeslot == Population[PopNum].Schedule[time].timeslot);
                        var currenttimeslotCombin = currentPop.Schedule.filter((timeslot) => timeslot.timeslot == Population[PopNum].Schedule[time].timeslot);
                        // console.log("thistimeslotCombin ",currenttimeslotCombin)

                        for (var roomcount = 0; roomcount < Population[PopNum].Schedule[time].roomcount; roomcount++) {
                            var result = checkDuplicateStudentAy(thistimeslotCombin[roomcount].StudentAy, currenttimeslotCombin[roomcount].StudentAy);
                            if (result) {
                                // console.log("oops in room   ",thistimeslotCombin[roomcount].StudentAy.filter((student)=> student.appears == 1)[0].sid, "  ",currenttimeslotCombin[roomcount].StudentAy.filter((student)=> student.appears == 1)[0].sid)
                                checkroomcount++;
                            } else {
                                // console.log(thistimeslotCombin[roomcount].StudentAy.filter((student)=> student.appears == 1)[0].sid, "  ",currenttimeslotCombin[roomcount].StudentAy.filter((student)=> student.appears == 1)[0].sid)
                                // console.log(currenttimeslotCombin[roomcount].StudentAy.filter((student)=> student.appears == 1))

                            }
                        };
                        // var result = checkDuplicateStudentAy(Population[PopNum].Schedule[time].StudentAy, currentPop.Schedule[time].StudentAy);
                        if (checkroomcount == Population[PopNum].Schedule[time].roomcount) {
                            // console.log("\n\noops  ",Population[PopNum].Schedule[time].StudentAy,"\n",currentPop.Schedule[time].StudentAy)
                            // console.log("oops in timeslot")
                            checkcount++;
                        } else {
                            // console.log("PopNum can break", PopNum)
                            break;
                        }
                        // console.log("  check time ", time, "  check combinlength   ", thistimeslotCombin.length)
                        time += thistimeslotCombin.length;
                    };
                    if (checkcount == Population[PopNum].Schedule[0].StudentAy.length) {
                        console.log("this case need to be reduced");
                        return true;;
                    }
                };
                return false;
            }

            var limit = 50;
            var progressbarA = multi.newBar("Initital Generation Progress: [:bar] :percent :etas", {
                complete: "=",
                incomplete: " ",
                width: 50,
                total: limit
            })

            const progressbarB = multi.newBar("Complete Generation Progress: [:bar] :percent :etas", {
                complete: "=",
                incomplete: " ",
                width: 50,
                total: Population
            })

            // while (AllPopulation.length < 1) {

            // copyTemplate.Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) || a.room - b.room);
            // copyTemplate.Schedule.sort(() => 0.5 - Math.random())
            // console.log(copyTemplate.Schedule[(copyTemplate.Schedule.length-1)*0.5])
            // console.log(Math.round((copyTemplate.Schedule.length-1)*0.5))
            // var pivot = (new Date(copyTemplate.Schedule[Math.round((randomNum(copyTemplate.Schedule)) * 0.5)].timeslot)).getTime();
            // copyTemplate.Schedule = copyarray(copyTemplate.Schedule.sort((a, b) => Math.abs((new Date(a.timeslot)).getTime() - pivot) - Math.abs((new Date(b.timeslot)).getTime() - pivot) || a.room - b.room ));
            // copyTemplate.Schedule.sort(() => 0.5 - Math.random())
            // console.log(copyTemplate.Schedule[0].timeslot)
            // for (var timeslot = 10; timeslot < 20; timeslot++) {
            // copyTemplate.Schedule.forEach(element => {
            //     console.log(element.room,"  ",element.SQLdate,"  ",element.SQLtime)
            // });

            var AllPopulation = new Array();
            var copyTemplate = JSON.parse(JSON.stringify(Template))
            var AllGenedVersion = new Array();

            var generationcount = 0;

            var WholePlanAccordingtoTime = new Array();
            var WholePlanSelectedAy = new Array();
            var copyTemplatecount = 0;
            var sameTimeslotinsertcount = 0;
            var thisTimeslotSelectedAy = new Array();

            // copyTemplate.Schedule.sort(() => 0.6 - Math.random())
            // console.log(copyTemplate.Schedule[0])
            console.log(AllPopulation.length, "  ", Population)

            while (AllPopulation.length < Population) {
                var copyTemplate = JSON.parse(JSON.stringify(Template))
                var WholePlanAccordingtoTime = new Array();
                var WholePlanSelectedAy = new Array();
                var copyTemplatecount = 0;
                var sameTimeslotinsertcount = 0;
                var thisTimeslotSelectedAy = new Array();
                var method = Math.floor(Math.random() * 3)

                switch (method) {
                    case 0:
                        copyTemplate.Schedule = copyTemplate.Schedule.sort((a, b) => a.SQLdate - b.SQLdate && new Date(a.timeslot) - new Date(b.timeslot) && a.room - b.room);
                        break;
                    case 1:
                        copyTemplate.Schedule = copyTemplate.Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) && a.room - b.room);
                        var pivot = (new Date(copyTemplate.Schedule[Math.round((randomNum(Template.Schedule)) * 0.5)].timeslot)).getTime();
                        copyTemplate.Schedule = copyTemplate.Schedule.sort((a, b) => Math.abs((new Date(a.timeslot)).getTime() - pivot) - Math.abs((new Date(b.timeslot)).getTime() - pivot) || a.room - b.room);

                        break;
                    case 2:
                        copyTemplate.Schedule = copyTemplate.Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) && a.room - b.room);
                        copyTemplate.Schedule = copyTemplate.Schedule.sort((a, b) => 0.5 - Math.random() || a.room - b.room)
                        break;
                    default:
                        break;

                }
                // console.log(method, " ", copyTemplate.Schedule[0].SQLdate," ",copyTemplate.Schedule[0].SQLtime)
                // copyTemplate.Schedule.sort(() => 0.6 - Math.random())
                // copyTemplate.Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot))
                // console.log(copyTemplate," at head")
                for (var timeslot = 0; timeslot < copyTemplate.Schedule.length; timeslot++) {
                    // console.log(copyTemplate.Schedule[timeslot].StudentAy.find((present)=> present.appears==1))
                    if (copyTemplate.Schedule[timeslot].StudentAy.find((present) => present.appears == 1) == undefined) {


                        var themostFirstroom;
                        var PresentationList = await availblepairsforthistimeslot(copyTemplate.Schedule[timeslot].SQLdate, copyTemplate.Schedule[timeslot].SQLtime);
                        // console.log("hello",copyTemplate.Schedule[timeslot].SQLdate, "  ", copyTemplate.Schedule[timeslot].SQLtime)
                        // console.log("before reduce ", PresentationList.length)
                        PresentationList = reduceByCurrentExistingStudent(copyTemplate.Schedule[timeslot].StudentAy, PresentationList);
                        PresentationList = reducePairBySID(WholePlanSelectedAy, PresentationList);
                        var themostFirstroom = copyTemplate.Schedule.filter((time) => time.timeslot == copyTemplate.Schedule[timeslot].timeslot).sort((a, b) => a.room - b.room)


                        sameTimeslotinsertcount = copyTemplate.Schedule.filter((time) => time.timeslot == copyTemplate.Schedule[timeslot].timeslot).sort((a, b) => a.room - b.room).length;
                        // console.log(sameTimeslotinsertcount," the total caninsert count");

                        var insertedroom = copyarray(JSON.parse(JSON.stringify(themostFirstroom))).filter((emptyroom) => emptyroom.StudentAy.find((present) => present.appears == 1));
                        themostFirstroom = copyarray(JSON.parse(JSON.stringify(themostFirstroom))).filter((emptyroom) => emptyroom.StudentAy.find((present) => present.appears == 1) == undefined);
                        sameTimeslotinsertcount = copyTemplate.Schedule.filter((time) => time.timeslot == copyTemplate.Schedule[timeslot].timeslot).sort((a, b) => a.room - b.room).length - insertedroom.length;
                        // console.log(sameTimeslotinsertcount," after minus the emptyroom num count");

                        themostFirstroom = DeternminWhichCampusFirst(copyTemplate.Schedule.filter((time) => time.timeslot == copyTemplate.Schedule[timeslot].timeslot).sort((a, b) => a.room - b.room))
                        thisTimeslotSelectedAy = WholePlanSelectedAy.filter((present) => present.availablestarttime == copyTemplate.Schedule[timeslot].timeslot)
                        if (sameTimeslotinsertcount != 0 && sameTimeslotinsertcount != undefined) {

                            // thisTimeslotSelectedAy == WholePlanSelectedAy.filter((present)=> present.availablestarttime == copyTemplate.Schedule[themostFirstroom].startTime)
                            PresentationList = reducePairBySupObs(thisTimeslotSelectedAy, PresentationList);
                        }
                        // console.log(PresentationList.length,"  hellop")
                        var tempstore = timeslot;
                        if (PresentationList.length != 0) {
                            while (themostFirstroom == undefined) {
                                if (tempstore != copyTemplate.Schedule.length - 1) {
                                    tempstore++;
                                    // console.log(" ",tempstore, "/", copyTemplate.Schedule.length, " addind tempstore ")
                                    PresentationList = await availblepairsforthistimeslot(copyTemplate.Schedule[tempstore].SQLdate, copyTemplate.Schedule[tempstore].SQLtime);
                                    // console.log(copyTemplate.Schedule[tempstore].SQLdate, "  ", copyTemplate.Schedule[tempstore].SQLtime)
                                    // console.log("before reduce ", PresentationList.length)
                                    PresentationList = reduceByCurrentExistingStudent(copyTemplate.Schedule[tempstore].StudentAy, PresentationList);
                                    PresentationList = reducePairBySID(WholePlanSelectedAy, PresentationList);
                                    themostFirstroom = copyTemplate.Schedule.filter((time) => time.timeslot == copyTemplate.Schedule[tempstore].timeslot).sort((a, b) => a.room - b.room)


                                    sameTimeslotinsertcount = copyTemplate.Schedule.filter((time) => time.timeslot == copyTemplate.Schedule[tempstore].timeslot).sort((a, b) => a.room - b.room).length;
                                    // console.log(sameTimeslotinsertcount," the total caninsert count");

                                    insertedroom = copyarray(JSON.parse(JSON.stringify(themostFirstroom))).filter((emptyroom) => emptyroom.StudentAy.find((present) => present.appears == 1));
                                    themostFirstroom = copyarray(JSON.parse(JSON.stringify(themostFirstroom))).filter((emptyroom) => emptyroom.StudentAy.find((present) => present.appears == 1) == undefined);
                                    sameTimeslotinsertcount = copyTemplate.Schedule.filter((time) => time.timeslot == copyTemplate.Schedule[tempstore].timeslot).sort((a, b) => a.room - b.room).length - insertedroom.length;
                                    // console.log(sameTimeslotinsertcount," after minus the emptyroom num count");

                                    themostFirstroom = DeternminWhichCampusFirst(copyTemplate.Schedule.filter((time) => time.timeslot == copyTemplate.Schedule[tempstore].timeslot).sort((a, b) => a.room - b.room))
                                    thisTimeslotSelectedAy = WholePlanSelectedAy.filter((present) => present.availablestarttime == copyTemplate.Schedule[tempstore].timeslot)
                                    if (sameTimeslotinsertcount != 0 && sameTimeslotinsertcount != undefined) {

                                        // thisTimeslotSelectedAy == WholePlanSelectedAy.filter((present)=> present.availablestarttime == copyTemplate.Schedule[themostFirstroom].startTime)
                                        PresentationList = reducePairBySupObs(thisTimeslotSelectedAy, PresentationList);
                                    }
                                    // console.log(themostFirstroom)
                                } else {
                                    break;
                                }

                            }
                        }




                        // insertedroom.forEach(element => {
                        //     console.log(element.StudentAy.filter((stu)=>stu.appears == 1))
                        // });

                        if (themostFirstroom != undefined && PresentationList.length > 0) {
                            themostFirstroom = copyTemplate.Schedule.findIndex((room) => room.timeslot == themostFirstroom.timeslot && room.room == themostFirstroom.room)
                            // console.log("check timeslot count", timeslot, "  ", themostFirstroom);

                            //   console.log(WholePlanSelectedAy)
                            var checkingbeforeredue = 0;
                            checkingbeforeredue = PresentationList.length;
                        } else {
                            // if (themostFirstroom == undefined) {
                            //     var remainingchoice = copyTemplate.Schedule.filter((slot) => slot.StudentAy.find((present) => present.appears == 1) == undefined);
                            //     // console.log(remainingchoice.length, " hello")
                            //     tempstore = copyTemplate.Schedule.findIndex((room) => room.timeslot == remainingchoice[0].timeslot)

                            //     PresentationList = await availblepairsforthistimeslot(copyTemplate.Schedule[tempstore].SQLdate, copyTemplate.Schedule[tempstore].SQLtime);
                            //     // console.log(copyTemplate.Schedule[tempstore].SQLdate, "  ", copyTemplate.Schedule[tempstore].SQLtime)
                            //     // console.log("before reduce ", PresentationList.length)
                            //     PresentationList = reduceByCurrentExistingStudent(copyTemplate.Schedule[tempstore].StudentAy, PresentationList);
                            //     PresentationList = reducePairBySID(WholePlanSelectedAy, PresentationList);
                            //     themostFirstroom = copyTemplate.Schedule.filter((time) => time.timeslot == copyTemplate.Schedule[tempstore].timeslot).sort((a, b) => a.room - b.room)


                            //     sameTimeslotinsertcount = copyTemplate.Schedule.filter((time) => time.timeslot == copyTemplate.Schedule[tempstore].timeslot).sort((a, b) => a.room - b.room).length;
                            //     // console.log(sameTimeslotinsertcount," the total caninsert count");

                            //     insertedroom = copyarray(JSON.parse(JSON.stringify(themostFirstroom))).filter((emptyroom) => emptyroom.StudentAy.find((present) => present.appears == 1));
                            //     themostFirstroom = copyarray(JSON.parse(JSON.stringify(themostFirstroom))).filter((emptyroom) => emptyroom.StudentAy.find((present) => present.appears == 1) == undefined);
                            //     sameTimeslotinsertcount = copyTemplate.Schedule.filter((time) => time.timeslot == copyTemplate.Schedule[tempstore].timeslot).sort((a, b) => a.room - b.room).length - insertedroom.length;
                            //     //    console.log(themostFirstroom,"ithemostFirstroom");

                            //     themostFirstroom = DeternminWhichCampusFirst(copyTemplate.Schedule.filter((time) => time.timeslot == copyTemplate.Schedule[tempstore].timeslot).sort((a, b) => a.room - b.room))
                            //     //    console.log(themostFirstroom)
                            //     thisTimeslotSelectedAy = WholePlanSelectedAy.filter((present) => present.availablestarttime == copyTemplate.Schedule[tempstore].timeslot)
                            //     if (sameTimeslotinsertcount != 0 && sameTimeslotinsertcount != undefined) {

                            //         // thisTimeslotSelectedAy == WholePlanSelectedAy.filter((present)=> present.availablestarttime == copyTemplate.Schedule[themostFirstroom].startTime)
                            //         PresentationList = reducePairBySupObs(thisTimeslotSelectedAy, PresentationList);
                            //     }
                            //     // console.log(themostFirstroom)

                            // }

                        }
                        if (themostFirstroom == undefined) {
                            console.log("whoops")
                        }

                        // console.log("after reduce SID", PresentationList.length)
                        // console.log(thisTimeslotSelectedAy)

                        // if (copyTemplate.Schedule[timeslot].SQLdate == "2024-04-17") {
                        //     console.log(themostFirstroom)
                        //     console.log( checkingbeforeredue," after reduce reducePairBySupObs", PresentationList.length," ",copyTemplate.Schedule[timeslot].SQLdate,"  ",copyTemplate.Schedule[timeslot].SQLtime)
                        // }
                        // console.log("after reduce reducePairBySupObs", PresentationList.length)
                        // console.log("check time array ", WholePlanAccordingtoTime.length, " ", thisTimeslotSelectedAy.length, " ", sameTimeslotinsertcount)
                        if (PresentationList.length > 0) {
                            // console.log("have presentation candidates")
                            // console.log(copyTemplate.Schedule[timeslot].SQLdate, " ", copyTemplate.Schedule[timeslot].SQLtime, "  ", copyTemplate.Schedule[themostFirstroom].SQLdate, "  ", copyTemplate.Schedule[themostFirstroom].SQLtime, " ", copyTemplate.Schedule[themostFirstroom].room, " ", copyTemplate.Schedule[themostFirstroom].roomcount)

                            // console.log(sameTimeslotinsertcount," for this slot ", copyTemplate.Schedule[timeslot].SQLdate,"   ",copyTemplate.Schedule[timeslot].SQLtime)

                            var index = randomNum(PresentationList);
                            // var themostFirstroom = copyTemplate.Schedule.filter((time) => time.timeslot == copyTemplate.Schedule[timeslot].timeslot).sort((a, b) => a.room - b.room)
                            // themostFirstroom = themostFirstroom.filter((emptyroom) => emptyroom.StudentAy.find((present) => present.appears == 1) == undefined);
                            // if(themostFirstroom[0].SQLdate == "2024-04-12"){
                            //     console.log(themostFirstroom)
                            // }

                            // themostFirstroom = themostFirstroom[0];
                            // if(themostFirstroom.SQLdate == "2024-04-12"){
                            //     console.log(themostFirstroom.room)
                            // }
                            // console.log(themostFirstroom)

                            // themostFirstroom = copyTemplate.Schedule.findIndex((room) => room.timeslot == themostFirstroom.timeslot && room.room == themostFirstroom.room)
                            // console.log(themostFirstroom)


                            // var indexInArray = (copyTemplate.Schedule[timeslot].StudentAy).findIndex((element) => element.sid == PresentationList[index].SID);
                            // console.log(indexInArray)
                            // var indexInArray = copyTemplate.Schedule[themostFirstroom].StudentAy.findIndex((element) => element.sid == PresentationList[index].SID)
                            // console.log(indexInArray)
                            // console.log(PresentationList[index].SID," ",PresentationList[index].TID," ",PresentationList[index].OID," ",copyTemplate.Schedule[themostFirstroom])
                            // setAppear(copyTemplate.Schedule[timeslot], PresentationList[index], 1);
                            setAppear(copyTemplate.Schedule[themostFirstroom], PresentationList[index], 1);
                            if (copyTemplate.Schedule[themostFirstroom].TeachingAy.filter((staff) => staff.appears == 1).length > 2) {
                                console.log(copyTemplate.Schedule[themostFirstroom].TeachingAy.filter((staff) => staff.appears == 1), " ", PresentationList[index])
                                var checklist = copyTemplate.Schedule[themostFirstroom].TeachingAy.filter((staff) => staff.appears == 1 && staff.tid != PresentationList[index].TID && staff.tid != PresentationList[index].OID)

                                copyTemplate.Schedule.forEach(element => {
                                    var thelist = element.TeachingAy.filter((staff2) => staff2.appears == 1);
                                    var count = 0;
                                    thelist.forEach(ppl => {
                                        if (ppl.tid == checklist[0].tid || ppl.tid == checklist[1].tid) {
                                            count++;
                                        }
                                    });
                                    if (count == 2) {
                                        var index = copyTemplate.Schedule.findIndex((present) => present == element)
                                        console.log("the previous ", element.SQLdate, "  ", element.SQLtime, " ", element.room, " ", index, " ", copyTemplate.Schedule[index].TeachingAy.filter((staff3) => staff3.appears == 1), "  ", copyTemplate.Schedule[index].StudentAy.filter((staff3) => staff3.appears == 1));
                                        console.log("the current ", copyTemplate.Schedule[themostFirstroom].SQLdate, " ", copyTemplate.Schedule[themostFirstroom].SQLtime, " ", copyTemplate.Schedule[themostFirstroom].room, " ", timeslot)
                                    }

                                });
                            }

                            // if (copyTemplate.Schedule[themostFirstroom].SQLdate == "2024-04-17" || copyTemplate.Schedule[timeslot].SQLdate == "2024-04-17") {
                            //     console.log(themostFirstroom, "   ", copyTemplate.Schedule[themostFirstroom].room, "    ", copyTemplate.Schedule[themostFirstroom].SQLdate, " ", copyTemplate.Schedule[themostFirstroom].SQLtime, "    ", copyTemplate.Schedule[themostFirstroom].StudentAy.filter((student) => student.appears == 1)[0])
                            //     console.log(">> Selected ", PresentationList[index].SID, " checking ", copyTemplate.Schedule[timeslot].StudentAy[indexInArray]);

                            // }
                            // copyTemplate.Schedule[timeslot].StudentAy[indexInArray].appears = 1;
                            // console.log(">> Selected ", PresentationList[index].SID, " checking ", copyTemplate.Schedule[timeslot].StudentAy[indexInArray]);
                            copyTemplatecount++;
                            // console.log("adding tackle count in pop ", pop, "    ", copyTemplatecount)
                            WholePlanSelectedAy.push(PresentationList[index]);
                            thisTimeslotSelectedAy.push(PresentationList[index]);
                            // console.log(thisTimeslotSelectedAy)
                            sameTimeslotinsertcount++;
                            var currentdate = copyTemplate.Schedule[themostFirstroom].timeslot;
                            var lastdate;
                            // console.log(">> WholePlanAccordingtoTime ", WholePlanAccordingtoTime.length)
                            // console.log(">> thisTimeslotSelectedAy ", thisTimeslotSelectedAy.length)
                            // console.log(thisTimeslotSelectedAy)
                            if (WholePlanSelectedAy.length >= 0) {

                                lastdate = WholePlanSelectedAy[WholePlanSelectedAy.length - 1].availablestarttime;


                                // lastdate = WholePlanAccordingtoTime[WholePlanAccordingtoTime.length-1][0].availablestarttime;

                            } else {
                                // console.log(">> checkherer 5")
                                lastdate = currentdate;
                            }
                            // console.log(sameTimeslotinsertcount," for this slot ", copyTemplate.Schedule[timeslot].SQLdate,"   ",copyTemplate.Schedule[timeslot].SQLtime)
                            // console.log("check time array ", lastdate, " ", currentdate, " ")
                            if (sameTimeslotinsertcount == copyTemplate.Schedule[themostFirstroom].roomcount) {
                                // console.log("case 1 1 ", sameTimeslotinsertcount, " ", copyTemplate.Schedule[themostFirstroom].roomcount, " ", lastdate, "  ", currentdate)
                                WholePlanAccordingtoTime.push(thisTimeslotSelectedAy);
                                // sameTimeslotinsertcount = 0;
                                thisTimeslotSelectedAy = [];

                            } else if (sameTimeslotinsertcount <= copyTemplate.Schedule[themostFirstroom].roomcount && currentdate != lastdate) {
                                // console.log("case 1 2 ", sameTimeslotinsertcount, " ", copyTemplate.Schedule[themostFirstroom].roomcount, " ", lastdate, "  ", currentdate)
                                WholePlanAccordingtoTime.push(thisTimeslotSelectedAy);
                                // sameTimeslotinsertcount = 0;
                                thisTimeslotSelectedAy = [];
                            } else {
                                // console.log("case 1 3 ", sameTimeslotinsertcount, " ", copyTemplate.Schedule[themostFirstroom].roomcount, " ", lastdate, "  ", currentdate)
                                //     WholePlanAccordingtoTime.push(thisTimeslotSelectedAy);

                            }

                        } else {
                            var currentdate = copyTemplate.Schedule[timeslot].timeslot;
                            var lastdate;
                            // console.log(WholePlanAccordingtoTime.length)
                            if (WholePlanSelectedAy.length != 0) {
                                // console.log(WholePlanSelectedAy[WholePlanSelectedAy.length - 1])

                                // console.log(">> checkherer 3")
                                if (WholePlanSelectedAy[WholePlanSelectedAy.length - 1].hasOwnProperty('availablestarttime')) {
                                    // console.log(">> checkherer 1")
                                    lastdate = WholePlanSelectedAy[WholePlanSelectedAy.length - 1].availablestarttime;
                                } else {
                                    // console.log(">> checkherer 2")
                                }


                                // lastdate = WholePlanAccordingtoTime[WholePlanAccordingtoTime.length-1][0].availablestarttime;

                            } else {
                                // console.log(">> checkherer 5")
                                lastdate = currentdate;
                            }
                            // if (sameTimeslotinsertcount > 0) {
                            //     if (thisTimeslotSelectedAy.length > 0) {
                            //         console.log(copyTemplate.Schedule[themostFirstroom])
                            //         if (sameTimeslotinsertcount == copyTemplate.Schedule[themostFirstroom].roomcount) {
                            //             // console.log("case 2 1 ", sameTimeslotinsertcount, " ", copyTemplate.Schedule[timeslot].roomcount, " ", lastdate, "  ", currentdate)
                            //             WholePlanAccordingtoTime.push(thisTimeslotSelectedAy);
                            //             // sameTimeslotinsertcount = 0;
                            //             thisTimeslotSelectedAy = [];
                            //         } else if (sameTimeslotinsertcount <= copyTemplate.Schedule[themostFirstroom].roomcount && currentdate != lastdate) {
                            //             // console.log("case 2 2 ", sameTimeslotinsertcount, " ", copyTemplate.Schedule[timeslot].roomcount, " ", lastdate, "  ", currentdate)
                            //             WholePlanAccordingtoTime.push(thisTimeslotSelectedAy);
                            //             // sameTimeslotinsertcount = 0;
                            //             thisTimeslotSelectedAy = [];
                            //         } else {
                            //             // console.log("case 2 3 ", sameTimeslotinsertcount, " ", copyTemplate.Schedule[timeslot].roomcount, " ", lastdate, "  ", currentdate)
                            //         }
                            //     }
                            // }

                        }
                        // } 
                        // console.log(">> SelectedAY ", WholePlanSelectedAy.length);
                        // console.log(PresentationList);

                        // WholePlanSelectedAy.push(thisTimeslotSelectedAy);
                    }
                }
                copyTemplate.tacklecount = copyTemplatecount;
                // console.log("here ", copyTemplate.tacklecount, "/", Template.Schedule[0].StudentAy.length)
                // Print(copyTemplate)
                // if (copyTemplate.Schedule.find((present) => present.StudentAy.find((stu) => stu.appears == 1) != undefined) != undefined) {
                //     // console.log("good")
                //     // console.log(copyTemplate," at end")
                // } else {
                //     console.log("bad")
                //     // console.log(copyTemplate.Schedule[0].StudentAy)
                // }
                // Print(copyTemplate)
                // console.log(copyTemplate.tacklecount,"   ",Template.Schedule[0].StudentAy.length)
                if (copyTemplate.tacklecount == Template.Schedule[0].StudentAy.length) {
                    // console.log(copyTemplate)
                    if (!reduceDuplicate(AllPopulation, copyTemplate)) {
                        // console.log(copyTemplate.Schedule[0].StudentAy.filter((student)=> student.appears ==1));
                        copyTemplate.Penalty = await Penalty(copyTemplate.Schedule)
                        progressbarB.tick();
                        console.log("final tackle count ", copyTemplate.tacklecount, " current generating count", generationcount)
                        progressbarA = multi.newBar("Restart Initital Generation Progress: [:bar] :percent :etas", {
                            complete: "=",
                            incomplete: " ",
                            width: 50,
                            total: limit
                        })
                        AllPopulation.push(copyTemplate);
                        console.log("current population count  ", AllPopulation.length, " after ", generationcount, " times ")

                    } else {
                        console.log("Pity case")
                    }
                    generationcount = 0;
                } else {
                    // console.log(copyTemplate)
                    copyTemplate.Penalty = await Penalty(copyTemplate.Schedule)

                    AllGenedVersion.push(copyTemplate);
                    // Print(AllGenedVersion[AllGenedVersion.length-1])
                    generationcount++;
                    progressbarA.tick();
                    console.log("final tackle count ", copyTemplate.tacklecount, " current generating count", generationcount)
                    // console.log(AllGenedVersion[AllGenedVersion.length-1].Schedule[0].timeslot)
                }
                if (AllPopulation.length == Population) {
                    console.log("here 0", generationcount, "  ", AllPopulation.length)
                    break;
                } else if (generationcount == limit && AllPopulation.length % 2 == 0 && AllPopulation.length != 0) {
                    console.log("here 1", generationcount, "  ", AllPopulation.length)
                    break;
                } else if (generationcount == limit && AllPopulation.length > 2) {
                    console.log("here 2", generationcount, "  ", AllPopulation.length)
                    break;
                } else if (generationcount == limit && AllPopulation.length == 0) {
                    console.log("here 3", generationcount, "  ", AllPopulation.length)
                    break;
                } else if (generationcount == limit && AllPopulation.length % 2 == 1 && AllPopulation.length == 1) {
                    console.log("here 4", generationcount, "  ", AllPopulation.length)
                    break;
                }
            }
            var Obj;
            // console.log(AllPopulation.length)
            if (AllPopulation.length == Population) {
                console.log("case 1", limit, "  ", AllPopulation.length)
                Obj = JSON.parse(JSON.stringify({ AllPopulation: AllPopulation, status: 1 }))
            } else if (generationcount == limit && AllPopulation.length > 0) {
                console.log("case 2 have population but gencount == limit ", (AllGenedVersion.sort((a, b) => b.tacklecount - a.tacklecount))[0].tacklecount)
                if (AllPopulation.length > 2) {
                    AllGenedVersion = AllPopulation;
                } else if (AllGenedVersion.length > Population) {
                    AllGenedVersion.sort((a, b) => b.tacklecount - a.tacklecount);
                    AllGenedVersion.forEach(element => {
                        console.log(element.tacklecount);
                    });
                    var max = AllGenedVersion.sort((a, b) => b.tacklecount - a.tacklecount)[0].tacklecount;
                    AllGenedVersion = JSON.parse(JSON.stringify(AllGenedVersion.filter((plans) => plans.tacklecount == max)))
                    console.log("case 2 1have population but gencount == limit ", AllGenedVersion.length)
                    AllGenedVersion = AllGenedVersion.splice(0, Population);
                } else {
                    console.log("case 2 2 have population but gencount == limit ", AllGenedVersion.length)
                    var max = AllGenedVersion.sort((a, b) => b.tacklecount - a.tacklecount)[0].tacklecount;
                    AllGenedVersion = JSON.parse(JSON.stringify(AllGenedVersion.filter((plans) => plans.tacklecount == max)))
                    AllGenedVersion = AllGenedVersion.splice(0, AllGenedVersion.length);
                }
                if (AllGenedVersion.length != 1) {
                    Obj = JSON.parse(JSON.stringify({ AllPopulation: AllGenedVersion, status: 1 }))
                } else {
                    Obj = JSON.parse(JSON.stringify({ AllPopulation: AllGenedVersion, status: 0 }))
                }

            } else if (generationcount == limit && (AllPopulation.length == 0)) {
                console.log("case 3 no population but gencount == limit", AllGenedVersion.length);
                AllGenedVersion.sort((a, b) => b.tacklecount - a.tacklecount);
                AllGenedVersion.forEach(element => {
                    console.log(element.tacklecount);
                });
                var max = AllGenedVersion.sort((a, b) => b.tacklecount - a.tacklecount)[0].tacklecount;
                AllGenedVersion = JSON.parse(JSON.stringify(AllGenedVersion.filter((plans) => plans.tacklecount == max)))
                // Print(AllGenedVersion[AllGenedVersion.length-1])
                // console.log(AllGenedVersion[0].tacklecount)
                Obj = JSON.parse(JSON.stringify({ AllPopulation: AllGenedVersion, status: 0 }))
            }


            // console.log(Obj)

            var ProcessEnd = new Date()
            console.log("Complete Generating Initial Generation with status :", Obj.status, " ", Obj.AllPopulation[0].tacklecount);
            console.log("Initial Generation Time :", ((ProcessEnd.getTime() - ProcessStart.getTime()) / 1000), " s\n");
            return Obj;

        }

        async function Penalty(Schedule) {
            /**
             *  Calaculting the Pentaly marks for the plan that Not fulfilling the requirements
             * 
             *  - Supervisor can have maximum 4 consecutive session only
             *  - Supervisors preferences on movements
             *  - Supervisors preferences on days (minimizing)
             */
            // console.log("calculate Penalty")
            console.log(Schedule[0].StudentAy.filter((student) => student.appears == 1))
            // console.log("entering ",Schedule)
            var Penaltymark = 0;
            // var WholePlanAccordingtoTime = new Array();

            // for (var a = 0; a < Schedule.length;) {
            //     var thistimeslotAy = new Array();
            //     var thistimeslotCombin = Schedule.filter((timeslot) => timeslot.timeslot == Schedule[a].timeslot)

            //     thistimeslotCombin.forEach(element => {
            //         // console.log(element.StudentAy.filter((student) => student.appears == 1));
            //         if (element.StudentAy.filter((student) => student.appears == 1).length > 0) {
            //             var obj = JSON.parse(JSON.stringify(element.StudentAy.filter((student) => student.appears == 1)[0]))
            //             obj.room = element.room;
            //             obj.SQLdate = element.SQLdate;
            //             obj.SQLtime = element.SQLtime;
            //             obj.timeslot = element.timeslot;
            //             thistimeslotAy.push(obj)
            //         }
            //     });
            //     if (thistimeslotAy.length > 0) {
            //         WholePlanAccordingtoTime.push(thistimeslotAy);
            //     }
            //     a += thistimeslotCombin.length;
            // }
            var WholePlanAccordingtoTime = new Array();
            var orgPlaninorder = copyarray(Schedule);
            orgPlaninorder = orgPlaninorder.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) || a.room - b.room);

            for (var a = 0; a < orgPlaninorder.length;) {
                var thistimeslotAy = new Array();
                var thistimeslotCombin = Schedule.filter((timeslot) => timeslot.timeslot == orgPlaninorder[a].timeslot)

                thistimeslotCombin.forEach(element => {
                    // console.log(element.StudentAy.filter((student) => student.appears == 1));
                    if (element.StudentAy.filter((student) => student.appears == 1).length > 0) {
                        var obj = JSON.parse(JSON.stringify(element.StudentAy.filter((student) => student.appears == 1)[0]))
                        obj.room = element.room;
                        obj.SQLdate = element.SQLdate;
                        obj.SQLtime = element.SQLtime;
                        obj.timeslot = element.timeslot;
                        thistimeslotAy.push(obj)
                    }
                });
                if (thistimeslotAy.length > 0) {
                    WholePlanAccordingtoTime.push(thistimeslotAy);
                }
                a += thistimeslotCombin.length;
            }
            // console.log(WholePlanAccordingtoTime.length)
            var teachingList = copyarray(Schedule[0].TeachingAy);
            var teachteach = await getTeachingList();
            // console.log(teachteach)

            var PrefList = await getPrefList(teachteach);
            // console.log(PrefList)
            // counting marks for consective sessions


            PrefList.forEach(staff => {

                var roomPen = 0;
                var conseccount = 0;
                var isConsec = 0;
                var sitcount = 0;
                var movementCount = 0;
                var reward = 0;
                var usedRoom;
                var currentdate;
                var firstPresentationDate;
                var lastPresentationDate;
                var dayPen = 0;
                var appearingcount = 0;
                var usedRoomTime;
                function rewarding(sitcount) {
                    switch (sitcount) {
                        case 2:
                            reward += 1;
                            break;
                        case 3:
                            reward += 1.5;
                            break;
                        default:
                            break;
                    }

                }

                // console.log(WholePlanAccordingtoTime)
                WholePlanAccordingtoTime.forEach(timeslot => {
                    // console.log("enter here")
                    // console.log(timeslot.length,timeslot.filter((staff2) => staff2.tid == staff.tid || staff2.oid == staff.tid) )
                    // console.log("timeslot    1",timeslot.filter((staff2) => staff2.tid == staff.tid).length)
                    // if (timeslot.filter((staff2) => staff2.tid == staff.tid || staff2.oid == staff.tid).length > 1) {
                    //     console.log("timeslot    3",timeslot.filter((staff2) => staff2.tid == staff.tid),"  ",timeslot.filter((staff2) => staff2.tid == staff.tid).length)
                    //     appearingcount += timeslot.filter((staff2) => staff2.tid == staff.tid || staff2.oid == staff.tid).length;
                    // } else {
                    //     console.log("timeslot    2",timeslot.filter((staff2) => staff2.tid == staff.tid),"  ",timeslot.filter((staff2) => staff2.tid == staff.tid).length)
                    // }
                    if (currentdate == null || currentdate == undefined) {
                        currentdate = timeslot[0].SQLdate;
                    } else if (currentdate != timeslot[0].SQLdate) {
                        roomPen = 0;
                        if (conseccount >= 4) { isConsec++; }

                        conseccount = 0;
                        // isConsec = 0;
                        rewarding(sitcount);
                        sitcount = 0;
                        movementCount = 0;
                        usedRoom;
                        usedRoomTime;
                        currentdate = timeslot[0].SQLdate;
                    }
                    var index = timeslot.findIndex((present) => present.tid == staff.tid || present.oid == staff.tid);
                    if (index >= 0) {
                        conseccount++;
                        if (firstPresentationDate == null || firstPresentationDate == undefined) {
                            firstPresentationDate = timeslot[index].SQLdate;
                        }
                        // console.log(index)
                        var timediff;
                        var linktolastsession = false;

                        if (usedRoom == null || usedRoom == undefined) {
                            // console.log("case 0     ", timeslot[index].SQLdate + "  " + timeslot[index].SQLtime, "   ", staff.tid, "  ", movementCount, "  ", conseccount, "  ", sitcount, "    ", usedRoom, "  set  ", timeslot[index].room)
                            usedRoom = timeslot[index].room;
                            usedRoomTime = new Date(timeslot[index].timeslot);
                        }
                        if (req.body.typeOfPresent == "final") {
                            timediff = ((new Date(timeslot[index].timeslot)).getTime() - usedRoomTime.getTime()) <= 45 * 60 * 60 * 1000;


                        } else {
                            timediff = ((new Date(timeslot[index].timeslot)).getTime() - usedRoomTime.getTime()) <= 25 * 60 * 60 * 1000;


                        }
                        if (usedRoom == timeslot[index].room && timediff) {

                            // console.log("case 1     ", timeslot[index].SQLdate + "  " + timeslot[index].SQLtime, "   ", staff.tid, "  ", movementCount, "change to 0  ", conseccount, "  ", sitcount + 1, "    ", usedRoom, "  same  ", timeslot[index].room, "  roomPen  ", roomPen)
                            var currentsession = new Date(timeslot[index].timeslot);
                            // console.log(usedRoom, "   ", timeslot[index].room, "  ", usedRoomTime, "  ", currentsession, "  ", sitcount, "  ", movementCount)
                            sitcount++;
                            movementCount = 0;

                        } else if (usedRoom !== timeslot[index].room && timediff) {
                            // console.log("case 2     ", timeslot[index].SQLdate + "  " + timeslot[index].SQLtime, "   ", staff.tid, "  ", movementCount, "change to 0  ", conseccount, "  ", sitcount + 1, "    ", usedRoom, "  same  ", timeslot[index].room, "  roomPen  ", roomPen)

                            if ((preSetFSC8thList.find((room) => room == usedRoom) && preSetFSC8thList.find((room) => room == timeslot[index].room))
                                || (preSetFSC9thList.find((room) => room == usedRoom) && preSetFSC9thList.find((room) => room == timeslot[index].room))
                                || (preSetRRSList.find((room) => room == usedRoom) && preSetRRSList.find((room) => room == timeslot[index].room))) {
                                // console.log("case 1")
                                roomPen += 0.5;
                            } else if ((preSetFSCList.find((room) => room == usedRoom) && preSetFSCList.find((room) => room == timeslot[index].room))
                                || (preSetRRSList.find((room) => room == usedRoom) && preSetRRSList.find((room) => room == timeslot[index].room))) {
                                // console.log("case 2")
                                roomPen += 1;
                            } else {
                                // console.log("case 3")
                                roomPen += 2;
                            }
                            // console.log("case 2     ", timeslot[index].SQLdate + "  " + timeslot[index].SQLtime, "   ", staff.tid, "  ", movementCount + 1, "  ", conseccount, "  ", sitcount, "    ", usedRoom, "  changed  ", timeslot[index].room, "  roomPen  ", roomPen)
                            rewarding(sitcount);
                            sitcount = 0;
                            movementCount++;
                            usedRoom = timeslot[index].room
                        } else if (usedRoom == timeslot[index].room && !timediff) {
                            // console.log("case 3     ", timeslot[index].SQLdate + "  " + timeslot[index].SQLtime, "   ", staff.tid, "  ", movementCount, "change to 0  ", conseccount, " sitcount to 0 ", sitcount , "    ", usedRoom, "  same but not link  ", timeslot[index].room, "  roomPen  ", roomPen)

                            rewarding(sitcount);
                            usedRoom = timeslot[index].room;
                            sitcount = 0;
                            movementCount = 0;
                        }
                        // 
                        // console.log("conseccount for tid ", staff.tid, "  ", conseccount);
                        lastPresentationDate = timeslot[index].SQLdate;
                    } else {
                        // console.log("oh no consec?", conseccount, "  ", isConsec);
                        if (conseccount >= 4) { isConsec++; }
                        // movementCount += conseccount;
                        usedRoom = undefined;
                        conseccount = 0;
                        rewarding(sitcount);
                        sitcount = 0;
                    }

                });
                // console.log("\n\n\n");

                if (staff.movementpref == 0) {
                    roomPen = roomPen * 0.5
                } else {
                    roomPen = roomPen * 1.5

                }
                if (lastPresentationDate != undefined && firstPresentationDate != undefined) {
                    dayPen = ((new Date(lastPresentationDate)) - (new Date(firstPresentationDate))) / (60 * 60 * 24 * 1000);
                } else {
                    dayPen = 0
                }


                // console.log(lastPresentationDate == undefined,lastPresentationDate,"  ",firstPresentationDate , dayPen)
                if (staff.daypref == 0) {
                    dayPen = dayPen * 0.5
                }
                if (appearingcount <= 1) {
                    appearingcount = 0
                }
                // console.log(staff, "   ", sitcount, "  ", reward, "   ", isConsec, "    ", movementCount, "   ", roomPen, "   ", dayPen, " ", appearingcount, "\n")
                Penaltymark += (isConsec * 10) + (roomPen * 5) + (dayPen * 8) - (reward) + (appearingcount * 10000)
            });

            // console.log(Penaltymark)

            Penaltymark += (totalStudNum - Schedule[0].StudentAy.length) * 20;


            // var Whole2 = new Array();
            // var orgPlaninorder2 = copyarray(Schedule);
            // orgPlaninorder2 = orgPlaninorder2.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) || a.room - b.room);
            // for (var a = 0; a < orgPlaninorder2.length;) {
            //     var thisay = orgPlaninorder2.filter((present) => present.timeslot == orgPlaninorder2[a].timeslot);
            //     Whole2.push(thisay);
            //     a += thisay.length;
            // }
            // var PenPen = 0;

            // PrefList.forEach(staff => {
            //     var consec = 0;
            //     var firstappear;
            //     var lastappear;
            //     var sitcount = 0;
            //     var Penaltymark2 = 0;
            //     var lastroom;
            //     var reward;
            //     var movement = 0;
            //     var currentroom;
            //     var isCon = false;

            //     function reset() {
            //         consec = 0;
            //         sitcount = 0;
            //         movement = 0;
            //         lastroom;

            //     }
            //     function rewarding() {
            //         Penaltymark2 = Penaltymark2 - 5
            //     }
            //     function addconsec(pref) {
            //         console.log("addconsec b ",Penaltymark2)
            //         if (consec >= 4) {
            //             Penaltymark2 += 10
            //         } else {
            //             Penaltymark2 += (consec) * 10 * pref
            //         }
            //         console.log("addconsec a ",Penaltymark2)
            //     }

            //     function addmove(pref) {
            //         console.log("addmove b ",Penaltymark2)
            //         Penaltymark2 += movement * 5 * pref
            //         console.log("addmove a ",Penaltymark2)
            //     }

            //     function daypen(pref, daycount) {
            //         console.log("day b ",Penaltymark2)
            //         Penaltymark2 += daycount * pref * 8
            //         console.log("day a ",Penaltymark2)
            //     }
            //     Whole2.forEach((wholetime) => {
            //         var appeared = wholetime.filter((rooms) => rooms.TeachingAy.find((tt) => tt.appears == 1 & tt.tid == staff.tid));
            //         if (appeared.length > 0) {
            //             if (firstappear == undefined) {
            //                 firstappear = appeared[0].timeslot;
            //                 lastappear = appeared[0].timeslot;
            //             } else {
            //                 var lastsession = new Date(lastappear);
            //                 var current = new Date(appeared[0].timeslot);
            //                 var timediff = current.getTime() - lastsession.getTime();
            //                 // console.log(lastsession, "   ", current, " ", timediff)

            //                 if (req.body.typeOfPresent == "final") {

            //                     if (timediff <= 45 * 60 * 1000) {
            //                         isCon = true;
            //                         consec++;
            //                     } else {
            //                         isCon = false;
            //                         addconsec(staff.movementpref)
            //                     }

            //                 } else {
            //                     if (timediff <= 25 * 60 * 1000) {
            //                         isCon = true;
            //                         consec++;
            //                     } else {
            //                         isCon = false;
            //                         addconsec(staff.movementpref)
            //                     }
            //                 }

            //                 lastappear = appeared[0].timeslot;

            //             }
            //             if (lastroom == undefined) {
            //                 lastroom = appeared[0].room;
            //                 currentroom = appeared[0].room;

            //             } else {
            //                 currentroom = appeared[0].room;
            //                 var mark = 0;
            //                 if (lastroom == currentroom) {
            //                     if (!isCon) {
            //                         addmove(staff.movementpref)
            //                     } else {
            //                         rewarding();
            //                     }

            //                     movement = 0;
            //                 } else {
            //                     if (isCon) {
            //                         if ((preSetFSC8thList.find((room) => room == lastroom) && preSetFSC8thList.find((room) => room == currentroom))
            //                             || (preSetFSC9thList.find((room) => room == lastroom) && preSetFSC9thList.find((room) => room == currentroom))
            //                             || (preSetRRSList.find((room) => room == lastroom) && preSetRRSList.find((room) => room == currentroom))) {
            //                             // console.log("case 1")
            //                             movement += 0.5

            //                         } else if ((preSetFSCList.find((room) => room == lastroom) && preSetFSCList.find((room) => room == currentroom))
            //                             || (preSetRRSList.find((room) => room == lastroom) && preSetRRSList.find((room) => room == currentroom))) {
            //                             // console.log("case 2")
            //                             movement += 1
            //                         } else {
            //                             // console.log("case 3")
            //                             movement += 2
            //                         }
            //                     } else {
            //                         addmove(staff.movementpref)
            //                         movement = 0;
            //                     }

            //                 }
            //             }



            //              console.log("in 1 ",Penaltymark2)
            //         } else {
            //             if(consec >0){
            //                 addconsec(staff.movementpref);
            //                 addmove(staff.movement);
            //             }



            //             reset()
            //             console.log("in 2 ",Penaltymark2)
            //             // reset();
            //         }

            //     })

            //     var totaltime = (new Date(lastappear)).getTime() - (new Date(firstappear)).getTime();

            //     totaltime = Math.round(totaltime / (24 * 60 * 60 * 1000));
            //     daypen(staff.daypref, totaltime);
            //     PenPen += Penaltymark2
            //     console.log(totaltime, " ", staff, " ", Penaltymark2,"  ",PenPen)
            //     // PenPen += Penaltymark2

            // })


            // console.log(Penaltymark ,"   ",PenPen);
            return Penaltymark;
        }

        function SelectForMixing(Genes, size) {
            // console.log("int selection ", Genes , "  ",size)
            var pairs = new Array();
            var count = 0;

            while (count != size) {

                var GeneA = randomNum(Genes);
                var GeneB = randomNum(Genes);
                while (GeneA == GeneB) {
                    GeneB = randomNum(Genes);
                }
                if (GeneA.Penalty <= GeneB.Penalty) {
                    if (!pairs.find((inserted) => inserted == Genes[GeneA])) {
                        pairs.push(Genes[GeneA]);
                        count++;
                    }
                } else {
                    if (!pairs.find((inserted) => inserted == Genes[GeneB])) {
                        pairs.push(Genes[GeneB]);
                        count++;
                    }
                }

            }
            // console.log(">>check selected 2 ", pairs)
            return pairs.sort((a, b) => a.Penalty - b.Penalty);
        }

        async function MixingGene(Pairs) {
            Pairs[0].Schedule = Pairs[0].Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) || a.room - b.room)

            Pairs[1].Schedule = Pairs[1].Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) || a.room - b.room)
            // var randomMethod = Math.random();
            // randomMethod = 0.6;
            // if (randomMethod >= 0.5) {
            //changeByStudent();
            var randomStudentA = randomNum(Pairs[0].Schedule[0].StudentAy)
            var randomStudentB = randomNum(Pairs[0].Schedule[0].StudentAy)
            // console.log(randomStudentA, " ", randomStudentB, "   ", randomStudentA == randomStudentB)
            while (randomStudentA == randomStudentB) {
                randomStudentB = randomNum(Pairs[0].Schedule[0].StudentAy);
                // console.log("regened   ", randomStudentA, " ", randomStudentB, "   ", randomStudentA == randomStudentB)
            }
            /**
             *  Ensuring the slot selected by random method randomStudentA will be the student index that earlier than randomStudentB
             */
            if (randomStudentA > randomStudentB) {
                var temp = randomStudentA;
                randomStudentA = randomStudentB;
                randomStudentB = temp;
            }
            // console.log(randomStudentA, "  ", randomStudentB);
            // console.log(Pairs[0].Schedule[0].StudentAy, "  ", Pairs[1].Schedule[0].StudentAy)

            return await MixByStudent(Pairs, randomStudentA, randomStudentB);

        }

        async function MixByStudent(Pairs, StudentStart, StudentEnd) {
            Pairs[0].Schedule = Pairs[0].Schedule.sort((a, b) => (new Date(a.timeslot) - new Date(b.timeslot) && a.room - b.room))
            Pairs[1].Schedule = Pairs[1].Schedule.sort((a, b) => (new Date(a.timeslot) - new Date(b.timeslot) && a.room - b.room))
            countTackle(Pairs[0])
            countTackle(Pairs[1])
            // console.log(Pairs[0].Schedule[0].SQLdate + " ", Pairs[1].Schedule[0].SQLtime + " Pairs before1 " + Pairs[1].Schedule[0].SQLdate + " ", Pairs[1].Schedule[0].SQLtime)
            // console.log(Pairs[0].Schedule[S] + " before1 " + Pairs[1].tacklecount)
            var ChildA = JSON.parse(JSON.stringify(Pairs[0]));
            var ChildB = JSON.parse(JSON.stringify(Pairs[1]));

            var AChangetoB = new Array();
            var BChangetoA = new Array();


            /**
             * Copying the changes
            */
            Pairs[0].Schedule.forEach(timeslot => {
                // console.log(copyarray(timeslot.StudentAy.slice(StudentStart, StudentEnd)));
                var Obj = JSON.parse(JSON.stringify({
                    timeslot: timeslot.timeslot,
                    room: timeslot.room,
                    StudentAy: copyarray(timeslot.StudentAy.slice(StudentStart, StudentEnd)),

                }))
                AChangetoB.push(Obj);
            });
            Pairs[1].Schedule.forEach(timeslot => {
                var Obj = JSON.parse(JSON.stringify({
                    timeslot: timeslot.timeslot,
                    room: timeslot.room,
                    StudentAy: copyarray(timeslot.StudentAy.slice(StudentStart, StudentEnd)),

                }))
                BChangetoA.push(Obj);
            });

            // console.log(AChangetoB);
            var count = 0;
            var removeListA = copyarray(AChangetoB[0].StudentAy);
            var removeListB = copyarray(BChangetoA[0].StudentAy);


            // console.log(removeListA)
            /** 
             * replacing the changings
             */
            // Print(Pairs[0])
            ChildB.Schedule.forEach(timeslot => {

                // console.log("check here",timeslot.StudentAy.length)
                var orgStudent = timeslot.StudentAy.find((student) => student.appears == 1);


                var newStudent = AChangetoB[count].StudentAy.find((student) => student.appears == 1);
                // console.log(">>old ", orgStudent)
                // console.log(">>new ", newStudent)
                if (newStudent != undefined) {

                    if (orgStudent != undefined) {
                        if (newStudent.sid != orgStudent.sid) {
                            // console.log("ChildB case1", orgStudent, " ", newStudent, " ",timeslot.room," ",timeslot.SQLdate," ",timeslot.SQLtime);
                            setAppear(timeslot, orgStudent, 0)
                            setAppear(timeslot, newStudent, 1)
                            var anyotherroom = ChildB.Schedule.filter((orgrm) => orgrm.timeslot != timeslot.timeslot && orgrm.StudentAy.find((present) => present.sid == newStudent.sid && present.appears == 1) != undefined)
                            if (anyotherroom.length > 0) {
                                anyotherroom.forEach(element => {
                                    // console.log(element)
                                    setAppear(element, newStudent, 0);
                                });
                            }
                            var anyotherroom = ChildB.Schedule.filter((orgrm) => orgrm.timeslot != timeslot.timeslot && orgrm.StudentAy.find((present) => present.sid == orgStudent.sid && present.appears == 1) != undefined)
                            if (anyotherroom.length > 0) {
                                anyotherroom.forEach(element => {
                                    // console.log(element)
                                    setAppear(element, orgStudent, 0);
                                });
                            }
                        } else {
                            // console.log("ChildB case2", orgStudent, " ", newStudent , " ",timeslot.room," ",timeslot.SQLdate," ",timeslot.SQLtime);
                            // console.log(ChildB.Schedule.find((orgrm)=> orgrm.StudentAy.find((present)=> present.sid == newStudent.sid && present.appears ==1) != undefined))
                            // var orgroom = 
                            setAppear(timeslot, newStudent, 1)
                            var anyotherroom = ChildB.Schedule.filter((orgrm) => orgrm.timeslot != timeslot.timeslot && orgrm.StudentAy.find((present) => present.sid == newStudent.sid && present.appears == 1) != undefined)
                            if (anyotherroom.length > 0) {
                                anyotherroom.forEach(element => {
                                    // console.log(element)
                                    setAppear(element, newStudent, 0);
                                });
                            }
                            var anyotherroom = ChildB.Schedule.filter((orgrm) => orgrm.timeslot != timeslot.timeslot && orgrm.StudentAy.find((present) => present.sid == orgStudent.sid && present.appears == 1) != undefined)
                            if (anyotherroom.length > 0) {
                                anyotherroom.forEach(element => {
                                    // console.log(element)
                                    setAppear(element, orgStudent, 0);
                                });
                            }
                            // setAppear(orgroom,newStudent,0)
                            // console.log("case 2 room ",orgroom.SQLdate," ",orgroom.SQLtime," ",orgroom.room)
                        }
                        // change orgstu orgSup and orgOb appears to 0
                        // console.log("case1",orgStudent , " ",newStudent)
                        // console.log(timeslot.StudentAy.find((student) => student.appears == 1));

                        // setAppear(timeslot, orgStudent, 0)
                        // console.log(timeslot.TeachingAy)
                        // timeslot.StudentAy.find((student) => student.sid == orgStudent.sid).appears = 0;

                        // console.log(timeslot.TeachingAy);

                        // console.log(timeslot.StudentAy.find((student) => student.appears == 1));



                        // var orgSupObs = timeslot.TeachingAy.filter((staff) => staff.appears == 1)


                        // console.log(timeslot.TeachingAy.filter((staff) => staff.appears == 1));


                        // orgSupObs.forEach(staff2 => { timeslot.TeachingAy.find((staff) => staff.tid == staff2.tid).appears = 0; });



                        // console.log(timeslot.TeachingAy.find((staff) => staff.appears == 1));
                        // setAppear(timeslot, newStudent, 1)

                        // var foundnewStudentOrgPlace = ChildB.Schedule.find((timeslot) => timeslot.find((room)=> room.sid == newStudent.sid)!=undefined);
                        // console.log(foundnewStudentOrgPlace);
                        // console.log(timeslot.TeachingAy)
                        // var newSupObs = timeslot.TeachingAy.filter((staff) => staff.tid == newStudent.tid).concat(timeslot.TeachingAy.filter((staff) => staff.tid == newStudent.oid))
                        //change newstu newSup and newobs appears to 1

                        // console.log(timeslot.TeachingAy);
                        // newSupObs.forEach(staff2 => { timeslot.TeachingAy.find((staff) => staff.tid == staff2.tid).appears = 1; });
                        // timeslot.StudentAy.find((student) => student.sid == newStudent.sid).appears = 1;


                        // console.log(timeslot.StudentAy.filter((student) => student.appears == 1));
                        // console.log(timeslot.TeachingAy.filter((staff) => staff.appears == 1));
                        // Print(ChildB)

                    } else {
                        // console.log("ChildB case3", orgStudent, " ", newStudent, " ",timeslot.room," ",timeslot.SQLdate," ",timeslot.SQLtime)
                        setAppear(timeslot, newStudent, 1)
                        var anyotherroom = ChildB.Schedule.filter((orgrm) => orgrm.timeslot != timeslot.timeslot && orgrm.StudentAy.find((present) => present.sid == newStudent.sid && present.appears == 1) != undefined)
                        if (anyotherroom.length > 0) {
                            anyotherroom.forEach(element => {
                                // console.log(element)
                                setAppear(element, newStudent, 0);
                            });
                        }
                        // timeslot.StudentAy.splice.apply(timeslot.StudentAy, [StudentStart, StudentEnd].concat(copyarray(AChangetoB[count].StudentAy)));
                    }

                } else {

                    if (orgStudent != undefined) {
                        // console.log("ChildB case4", orgStudent, " ", newStudent, " ",timeslot.room," ",timeslot.SQLdate," ",timeslot.SQLtime)

                        var anyotherroom = ChildB.Schedule.filter((orgrm) => orgrm.timeslot != timeslot.timeslot && orgrm.StudentAy.find((present) => present.sid == orgStudent.sid && present.appears == 1) != undefined)
                        if (anyotherroom.length > 0) {
                            anyotherroom.forEach(element => {
                                // console.log(element)
                                setAppear(element, orgStudent, 0);
                            });
                        }
                        // console.log("checking", removeListA.find((stu) => stu.sid == orgStudent.sid))
                        if (removeListA.find((stu) => stu.sid == orgStudent.sid) != undefined) {
                            // console.log("ChildB case5", orgStudent, " ", newStudent, " ",timeslot.room," ",timeslot.SQLdate," ",timeslot.SQLtime);
                            setAppear(timeslot, removeListA.find((stu) => stu.sid == orgStudent.sid), 0);
                            var removeindex = removeListA.findIndex((stu) => stu.sid == orgStudent.sid);
                            removeListA = removeListA.filter((stu) => stu.sid != removeListA[removeindex].sid)
                            var anyotherroom = ChildB.Schedule.filter((orgrm) => orgrm.timeslot != timeslot.timeslot && orgrm.StudentAy.find((present) => present.sid == orgStudent.sid && present.appears == 1) != undefined)
                            if (anyotherroom.length > 0) {
                                anyotherroom.forEach(element => {
                                    // console.log(element)
                                    setAppear(element, orgStudent, 0);
                                });
                            }

                        }


                    } else {
                        // console.log("case 6", orgStudent, " ", newStudent)

                    }
                }
                // console.log("check here 2",timeslot.StudentAy.length)
                // console.log(timeslot.StudentAy)


                // timeslot.StudentAy.splice(StudentStart, StudentEnd - StudentStart, copyarray(AChangetoB[count].StudentAy))


                timeslot.StudentAy = timeslot.StudentAy.flat(Infinity);
                // timeslot.StudentAy.splice.apply(timeslot.StudentAy, [StudentStart, StudentEnd].concat(copyarray(AChangetoB[count].StudentAy)));
                // (timeslot.TeachingAy.find((staff) => staff.tid == newSupObs.tid || staff.tid == newSupObs.oid )).forEach(staff => {
                //     staff.appears = 1;
                // });
                // console.log("after  ", timeslot.StudentAy.filter((student) => student.appears == 1), "  ", timeslot.TeachingAy.filter((student) => student.appears == 1));
                // console.log("after  ", timeslot.TeachingAy);
                // console.log("check here3",timeslot.StudentAy.length)
                // console.log(timeslot.StudentAy)
                count++;
            });

            count = 0;
            // Print(Pairs[1])
            ChildA.Schedule.forEach(timeslot => {

                // console.log("check here",timeslot.StudentAy.length)
                var orgStudent = timeslot.StudentAy.find((student) => student.appears == 1);

                // console.log(">>old ", orgStudent)
                var newStudent = BChangetoA[count].StudentAy.find((student) => student.appears == 1);

                // console.log(">>new ", newStudent)
                if (newStudent != undefined) {

                    if (orgStudent != undefined) {
                        if (newStudent.sid != orgStudent.sid) {
                            // console.log("ChildA case1", orgStudent, " ", newStudent, " ", timeslot.room, " ", timeslot.SQLdate, " ", timeslot.SQLtime);
                            setAppear(timeslot, orgStudent, 0)
                            setAppear(timeslot, newStudent, 1)

                            var anyotherroom = ChildA.Schedule.filter((orgrm) => orgrm.timeslot != timeslot.timeslot && orgrm.StudentAy.find((present) => present.sid == newStudent.sid && present.appears == 1) != undefined)
                            if (anyotherroom.length > 0) {
                                anyotherroom.forEach(element => {
                                    // console.log("Removed  for new in 1", element.SQLdate, " ", element.SQLtime, " ", element.room)
                                    setAppear(element, newStudent, 0);
                                });
                            }


                            // Print(ChildA)
                        } else {
                            // console.log("ChildA case2", orgStudent, " ", newStudent, " ",timeslot.room," ",timeslot.SQLdate," ",timeslot.SQLtime);
                            setAppear(timeslot, newStudent, 1)
                            var anyotherroom = ChildA.Schedule.filter((orgrm) => orgrm.timeslot != timeslot.timeslot && orgrm.StudentAy.find((present) => present.sid == newStudent.sid && present.appears == 1) != undefined)
                            if (anyotherroom.length > 0) {
                                anyotherroom.forEach(element => {
                                    // console.log("Removed  for new in 2", element.SQLdate, " ", element.SQLtime, " ", element.room)
                                    setAppear(element, newStudent, 0);
                                });
                            }
                        }
                        // change orgstu orgSup and orgOb appears to 0
                        // console.log("case1",orgStudent , " ",newStudent)
                        // console.log(timeslot.StudentAy.find((student) => student.appears == 1));

                        // setAppear(timeslot, orgStudent, 0)
                        // console.log(timeslot.TeachingAy)
                        // timeslot.StudentAy.find((student) => student.sid == orgStudent.sid).appears = 0;

                        // console.log(timeslot.TeachingAy);

                        // console.log(timeslot.StudentAy.find((student) => student.appears == 1));



                        // var orgSupObs = timeslot.TeachingAy.filter((staff) => staff.appears == 1)


                        // console.log(timeslot.TeachingAy.filter((staff) => staff.appears == 1));


                        // orgSupObs.forEach(staff2 => { timeslot.TeachingAy.find((staff) => staff.tid == staff2.tid).appears = 0; });



                        // console.log(timeslot.TeachingAy.find((staff) => staff.appears == 1));
                        // setAppear(timeslot, newStudent, 1)

                        // var foundnewStudentOrgPlace = ChildB.Schedule.find((timeslot) => timeslot.find((room)=> room.sid == newStudent.sid)!=undefined);
                        // console.log(foundnewStudentOrgPlace);
                        // console.log(timeslot.TeachingAy)
                        // var newSupObs = timeslot.TeachingAy.filter((staff) => staff.tid == newStudent.tid).concat(timeslot.TeachingAy.filter((staff) => staff.tid == newStudent.oid))
                        //change newstu newSup and newobs appears to 1

                        // console.log(timeslot.TeachingAy);
                        // newSupObs.forEach(staff2 => { timeslot.TeachingAy.find((staff) => staff.tid == staff2.tid).appears = 1; });
                        // timeslot.StudentAy.find((student) => student.sid == newStudent.sid).appears = 1;


                        // console.log(timeslot.StudentAy.filter((student) => student.appears == 1));
                        // console.log(timeslot.TeachingAy.filter((staff) => staff.appears == 1));
                        // Print(ChildA)

                    } else {
                        // console.log("ChildA case3", orgStudent, " ", newStudent, " ",timeslot.room," ",timeslot.SQLdate," ",timeslot.SQLtime);
                        setAppear(timeslot, newStudent, 1)
                        // timeslot.StudentAy.splice.apply(timeslot.StudentAy, [StudentStart, StudentEnd].concat(copyarray(AChangetoB[count].StudentAy)));
                        var anyotherroom = ChildA.Schedule.filter((orgrm) => orgrm.timeslot != timeslot.timeslot && orgrm.StudentAy.find((present) => present.sid == newStudent.sid && present.appears == 1) != undefined)
                        if (anyotherroom.length > 0) {
                            anyotherroom.forEach(element => {
                                // console.log("Removed  for new in 3", element.SQLdate, " ", element.SQLtime, " ", element.room)
                                setAppear(element, newStudent, 0);
                            });
                        }
                    }
                } else {

                    if (orgStudent != undefined) {
                        // console.log("ChildA case4", orgStudent, " ", newStudent, " ",timeslot.room," ",timeslot.SQLdate," ",timeslot.SQLtime);
                        var anyotherroom = ChildA.Schedule.filter((orgrm) => orgrm.timeslot != timeslot.timeslot && orgrm.StudentAy.find((present) => present.sid == orgStudent.sid && present.appears == 1) != undefined)
                        if (anyotherroom.length > 0) {
                            anyotherroom.forEach(element => {
                                // console.log("Removed  for org in 4", element.SQLdate, " ", element.SQLtime, " ", element.room)
                                setAppear(element, orgStudent, 0);
                            });
                        }



                    } else {
                        // console.log("case4",orgStudent , " ",newStudent)

                    }
                }
                // console.log("check here 2",timeslot.StudentAy.length)
                // console.log(timeslot.StudentAy)


                // timeslot.StudentAy.splice(StudentStart, StudentEnd - StudentStart, copyarray(BChangetoA[count].StudentAy))


                timeslot.StudentAy = timeslot.StudentAy.flat(Infinity);
                // timeslot.StudentAy.splice.apply(timeslot.StudentAy, [StudentStart, StudentEnd].concat(copyarray(BChangetoA[count].StudentAy)));
                // (timeslot.TeachingAy.find((staff) => staff.tid == newSupObs.tid || staff.tid == newSupObs.oid )).forEach(staff => {
                //     staff.appears = 1;
                // });
                // console.log("after  ", timeslot.StudentAy.filter((student) => student.appears == 1), "  ", timeslot.TeachingAy.filter((student) => student.appears == 1));
                // console.log("after  ", timeslot.TeachingAy);
                // console.log("check here3",timeslot.StudentAy.length)
                // console.log(timeslot.StudentAy)
                count++;
            });
            var childAbefore = ChildA.tacklecount;
            var childBbefore = ChildB.tacklecount;
            // console.log(ChildA.tacklecount + " child before " + ChildB.tacklecount)

            ChildA = await Repair(ChildA);
            ChildB = await Repair(ChildB);

            if (ChildA.tacklecount != childAbefore) {
                // console.log("child A problem")
                // Print(Pairs[1])
                // Print(ChildA)
            }

            if (ChildB.tacklecount != childBbefore) {
                // console.log("child B problem")
                // Print(Pairs[0])
                // Print(ChildB)
            }
            // console.log(childAbefore, " & ", childBbefore, "  =>  ", ChildA.tacklecount + " after " + ChildB.tacklecount)
            // console.log(ChildA.Penalty + "  " + ChildB.Penalty)
            return [ChildA, ChildB];
        }

        // function MixByTimeslot(Pairs, TimeslotStart, TimeslotEnd) {
        //     var ChildA = JSON.parse(JSON.stringify(Pairs[0]));
        //     var ChildB = JSON.parse(JSON.stringify(Pairs[1]));

        //     // console.log(copyarray(timeslot.StudentAy.slice(StudentStart, StudentEnd)));

        //     var AChangetoB = copyarray(Pairs[0].Schedule.slice(TimeslotStart, TimeslotEnd))
        //     var BChangetoA = copyarray(Pairs[1].Schedule.slice(TimeslotStart, TimeslotEnd))




        // }

        function countTackle(Plan) {
            // console.log(Plan)
            var tacklecount = 0;
            Plan.Schedule.forEach(timeslot => {
                // console.log(timeslot.StudentAy.find((Stu) => Stu.appears == 1), " ",timeslot.room)
                if (timeslot.StudentAy.find((Stu) => Stu.appears == 1) != undefined) {
                    tacklecount++;
                }
            });
            Plan.tacklecount = tacklecount;
        }

        function Print(Plan) {
            console.log("\n\n Printing\n")
            var count = 0;
            var tacklecount = 0;
            Plan.Schedule.forEach(timeslot => {
                var printA = timeslot.StudentAy.filter((student) => student.appears == 1)
                var printB = timeslot.TeachingAy.filter((staff) => staff.appears == 1);
                if (printA.length == 0) { printA = "empty" }
                if (printB.length == 0) { printB = "empty" }
                if (printA != "empty" && printB != "empty") {
                    tacklecount++;
                    console.log(count, " ", printA[0].sid, "   ", printB, "   ", tacklecount, "  ", timeslot.room, "  ", timeslot.roomcount, "  ", timeslot.SQLdate, "  ", timeslot.SQLtime)
                } else if (printA == "empty" && printB == "empty") {
                    console.log(count, " ", "  empty  ", "   ", "  empty  ", timeslot.room, "  ", timeslot.roomcount, "  ", timeslot.SQLdate, "  ", timeslot.SQLtime)
                } else if (printA == "empty") {
                    console.log(count, "  empty  ", printB, "   ", timeslot.room, "  ", timeslot.roomcount, "  ", timeslot.SQLdate, "  ", timeslot.SQLtime)

                } else if (printB == "empty") {
                    console.log(count, " ", printA, "   ", "  empty  ", timeslot.room, "  ", timeslot.roomcount, "  ", timeslot.SQLdate, "  ", timeslot.SQLtime)

                }
                count++
            });
            console.log("\nFinish Printing\n\n")
        }

        async function Repair(Plan) {
            /**
             *  To check any Hard Constraints has been violated for Child Plan
             *  - All presentation need to be scheduled and no repeat
             *  - no Sup or Obs will be appear in more than one room in the same time.
             */
            // countTackle(Plan)

            Plan.Schedule = Plan.Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) || a.room - b.room)

            var appear = new Array();
            Plan.Schedule.forEach(element => {
                var thisslot = Plan.Schedule.filter((times) => times.timeslot == element.timeslot).sort((a, b) => a.room - b.room);
                var inserted = thisslot.filter((rooms) => rooms.StudentAy.find((present) => present.appears == 1) != undefined)
                var empty = thisslot.filter((rooms) => rooms.StudentAy.find((present) => present.appears == 1) == undefined)
                inserted.forEach(element => {
                    var pairs = element.StudentAy.find((present) => present.appears == 1)
                    var Supappear = thisslot.filter((rooms) => rooms.TeachingAy.find((staff) => staff.tid == pairs.tid && staff.appears == 1) != undefined)

                    if (Supappear.length > 1) {
                        setAppear(element, pairs, 0)
                    }
                    var Obsappear = thisslot.filter((rooms) => rooms.TeachingAy.find((staff) => staff.tid == pairs.oid && staff.appears == 1) != undefined)
                    if (Obsappear.length > 1) {
                        setAppear(element, pairs, 0)
                    }

                });

                if (element.StudentAy.find((present) => present.appears == 1) != undefined) {
                    var presentor = element.StudentAy.find((present) => present.appears == 1)
                    if (appear.length == 0) {
                        appear.push(presentor)
                        // console.log("inserted ", presentor, " ", appear.length)
                    } else {
                        if (appear.find((stu) => presentor.sid == stu.sid) == undefined) {
                            appear.push(presentor)
                            // console.log("inserted ", presentor, " ", appear.length)
                        } else if (appear.find((stu) => stu.sid == presentor.sid) != undefined) {
                            var appearedlist = Plan.Schedule.filter((presents) => presents.StudentAy.find((stu) => stu.sid == presentor.sid && stu.appears == 1) != undefined)
                            setAppear(appearedlist[randomNum(appearedlist)], presentor, 0)
                            // console.log("removed this ", presentor)
                        }
                    }


                }
            });
            countTackle(Plan)
            // console.log(Plan.tacklecount, " In repair")
            var beforecount = Plan.tacklecount;
            var pairinglist = await getPairingList();
            pairinglist = reduceByCurrentExistingStudent(Plan.Schedule[0].StudentAy, pairinglist)
            var WholePlanAccordingtoTime = new Array();
            var orgPlaninorder = copyarray(Plan.Schedule)
            orgPlaninorder = orgPlaninorder.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot));

            for (var a = 0; a < orgPlaninorder.length;) {
                var thistimeslotAy = new Array();
                var thistimeslotCombin = Plan.Schedule.filter((timeslot) => timeslot.timeslot == orgPlaninorder[a].timeslot)

                thistimeslotCombin.forEach(element => {
                    // console.log(element.StudentAy.filter((student) => student.appears == 1));
                    if (element.StudentAy.filter((student) => student.appears == 1).length > 0) {
                        var obj = JSON.parse(JSON.stringify(element.StudentAy.filter((student) => student.appears == 1)[0]))
                        obj.room = element.room;
                        obj.roomcount = element.roomcount
                        obj.SQLdate = element.SQLdate;
                        obj.SQLtime = element.SQLtime;
                        obj.timeslot = element.timeslot;
                        thistimeslotAy.push(obj)
                    }
                });
                if (thistimeslotAy.length > 0) {
                    WholePlanAccordingtoTime.push(thistimeslotAy);
                }
                a += thistimeslotCombin.length;
            }

            // var tackled = new Array();
            // var untackled = new Array();
            // Plan.Schedule.forEach(element => {
            //     var presentor = element.StudentAy.find((stu) => stu.appears == 1);
            //     if (presentor != undefined) {
            //         if (tackled.length == 0 || tackled.find((stu) => stu.sid == presentor.sid) == undefined) {
            //             // presentor.spacesa
            //             tackled.push(presentor);
            //         }
            //     }
            // });
            // console.log(tackled.length)

            // Plan.Schedule[0].StudentAy.forEach((checking) => {
            //     // console.log(checking.sid ," ",tackled.find((stu)=> stu.sid == checking.sid));

            //     var found = tackled.find((stu) => stu.sid == checking.sid)
            //     if (found == undefined) {
            //         if (untackled.length == 0 || untackled.find((stu2) => stu2.sid == checking.sid) == undefined) {
            //             untackled.push(checking)
            //         }
            //     }
            // })
            // console.log(untackled)


            // var copyTemplate = JSON.parse(JSON.stringify(Plan))


            // for (var a = 0; a < 1; a++) {



            //         for (var b = 0; b < Plan.Schedule.length; b++) {
            //             var thepara = Plan.Schedule.filter((para) => para.timeslot == Plan.Schedule[b].timeslot);
            //             // console.log(thepara)
            //             var indexinuntackled = undefined;
            //             var emptyroom = thepara.filter((room) => room.StudentAy.find((stu) => stu.appears == 1) == undefined)
            //             if (emptyroom.length > 0) {
            //             var checkSup = thepara.find((room) => room.TeachingAy.find((tid) => tid.appeares == 1 && tid.tid == untackled[a].tid) != undefined);
            //             var checkObs = thepara.find((room) => room.TeachingAy.find((tid) => tid.appeares == 1 && tid.tid == untackled[a].oid) != undefined);
            //             if (checkSup != undefined && checkObs != undefined) {
            //                 // console.log(untackled[a].tid, "  ", checkSup, "  ", untackled[a].oid, "  ", checkObs)
            //             } else {
            //                 // console.log(untackled[a])
            //                 // console.log(thepara)
            //                 var theinsertroom = Plan.Schedule.find((room) => room.timeslot == thepara[0].timeslot && (room.StudentAy.find((present) => present.appeares == 1) == undefined))
            //                 console.log(theinsertroom.SQLdate, " ", theinsertroom.SQLtime, " ", theinsertroom.room)
            //                 if (theinsertroom != undefined) {
            //                     if (theinsertroom.StudentAy.filter((stu) => stu.sid == untackled[a].sid && stu.appears == 0).length > 0) {
            //                         console.log(untackled[a], "can insert here", theinsertroom)
            //                         indexinuntackled = untackled.findIndex((stu) => stu == untackled[a]);
            //                         var index = Plan.Schedule.findIndex((room) => room.timeslot == theinsertroom.timeslot && room.room == theinsertroom.room);
            //                         setAppear(Plan.Schedule[index], untackled[a], 1);
            //                         console.log(Plan.Schedule[index])
            //                         Print(Plan)
            //                         //  untackled.splice(indexinuntackled,1)
            //                         // console.log(untackled.length)
            //                         break;
            //                     }else{
            //                         console.log( theinsertroom.StudentAy)

            //                     }

            //                 } else {
            //                     console.log("oops")
            //                 }
            //             }

            //         }
            //         // console.log(untackled.length)


            //         // console.log(untackled.length)
            //     }





            // }



            // Print(Plan)
            // // console.log(WholePlanAccordingtoTime)



            WholePlanAccordingtoTime.forEach(timeslot => {
                if (!timeslot.hasOwnProperty("empty")) {
                    timeslot.forEach(room => {
                        var presentation = pairinglist.find((present) => present.sid == room.sid)

                        if (presentation != undefined) {
                            if (!presentation.hasOwnProperty("checkStudent")) {
                                presentation.checkStudent = true;
                            } else {
                                presentation.checkStudent = "";
                                presentation.checkStudent += room.timeslot + " ";
                            }
                        }
                        var searchSupInSameTime = timeslot.filter((room) => room.tid == presentation.tid || room.oid == presentation.tid);
                        // console.log(searchSupInSameTime);
                        if (searchSupInSameTime != undefined && searchSupInSameTime.length > 1) {
                            // console.log(presentation.tid, " Sup appears in parallel")
                            // console.log(timeslot)
                            // console.log(presentation)
                            // console.log(">>search for Sup ", searchSupInSameTime)
                            if (presentation.hasOwnProperty("checkSup")) {
                                presentation.checkSup = "";
                                presentation.checkSup += room.timeslot + " ";
                            } else {
                                presentation.checkSup = room.timeslot + " ";
                            }


                        } else {
                            // console.log(presentation.tid, "Sup ok")
                            if (!presentation.hasOwnProperty("checkSup")) {
                                presentation.checkSup = true;
                            }
                        }

                        var searchObsInSameTime = timeslot.filter((room) => room.oid == presentation.oid || room.oid == presentation.oid);

                        if (searchObsInSameTime != undefined && searchObsInSameTime.length > 1) {
                            // console.log(presentation.tid, " Obs appears in parallel")
                            // console.log(timeslot)
                            // console.log(presentation)
                            // console.log(">>search for Obs ", searchObsInSameTime)
                            if (presentation.hasOwnProperty("checkObs")) {
                                presentation.checkObs = "";
                                presentation.checkObs += room.timeslot + " ";
                            } else {
                                presentation.checkObs = room.timeslot + " ";
                            }
                        } else {
                            // console.log(presentation.oid, "Obs ok")
                            if (!presentation.hasOwnProperty("checkObs")) {
                                presentation.checkObs = true;
                            }
                        }
                    });
                }


            });

            var tackled = new Array();
            Plan.Schedule.forEach((present) => {
                if (present.StudentAy.find((presentor) => presentor.appears == 1) != undefined) {
                    tackled.push(present.StudentAy.find((presentor) => presentor.appears == 1))
                }
            })
            var untackled = pairinglist.filter((pairs) => (tackled.find((stu) => stu.sid == pairs.sid)) != undefined);
            // console.log(untackled)

            // console.log(pairinglist);
            var notTackledPresentation = (pairinglist.filter((present) => !(present.hasOwnProperty("checkStudent")))).sort(() => Math.random() - 0.5);
            var duplicateStudent = pairinglist.filter((present) => present.hasOwnProperty("checkStudent") && present.checkStudent != true)

            notTackledPresentation.forEach(element => {
                if (notTackledPresentation.filter((stu) => stu.sid == element.sid).length > 1) {
                    while (notTackledPresentation.filter((stu) => stu.sid == element.sid).length > 1) {
                        var index = notTackledPresentation.find((stu) => stu.sid == element.sid);
                        notTackledPresentation.splice(index, 1)
                    }
                }
            });
            // console.log(">>notTackledStudent", notTackledPresentation);
            // console.log(">>duplicatedStudent", duplicateStudent);
            // console.log(WholePlanAccordingtoTime)
            var count = 0;
            var removeadded = new Array();


            notTackledPresentation.forEach(inputPairs => {
                //     var method = Math.floor(Math.random() * 3)
                // WholePlanAccordingtoTime = WholePlanAccordingtoTime.sort((a, b) => new Date(a[0].timeslot) - new Date(b[0].timeslot))
                // switch (method) {
                //     case 0:
                //         WholePlanAccordingtoTime = WholePlanAccordingtoTime.sort((a, b) => new Date(a[0].timeslot) - new Date(b[0].timeslot))
                //         break;
                //     case 1:
                //         var pivot = (new Date(WholePlanAccordingtoTime[Math.round((randomNum(WholePlanAccordingtoTime)) * 0.5)][0].timeslot)).getTime();
                //         WholePlanAccordingtoTime = WholePlanAccordingtoTime.sort((a, b) => Math.abs((new Date(a[0].timeslot)).getTime() - pivot) - Math.abs((new Date(b[0].timeslot)).getTime() - pivot));

                //         break;
                //     case 2:
                //         // WholePlanAccordingtoTime = copyTemplate.Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) && a.room - b.room);
                //         WholePlanAccordingtoTime = WholePlanAccordingtoTime.sort(() => 0.5 - Math.random())
                //         break;
                //     default:
                //         break;

                // }



                var currenttime = Plan.Schedule[0].timeslot;
                for (var a = 0; a < WholePlanAccordingtoTime.length; a++) {
                    WholePlanAccordingtoTime[a] = WholePlanAccordingtoTime[a].sort((a, b) => a.room - b.room)
                    // console.log(WholePlanAccordingtoTime[a])
                    if (WholePlanAccordingtoTime[a][0].roomcount != WholePlanAccordingtoTime[a].length) {

                        var thistimeslot = Plan.Schedule.filter((presentation) => presentation.timeslot == WholePlanAccordingtoTime[a][0].timeslot)

                        var emptyroom = thistimeslot.find((presentation) => (presentation.StudentAy.find((presentor) => presentor.appears == 1)) == undefined)
                        var emptyroom2 = thistimeslot.find((presentation) => (presentation.StudentAy.find((presentor) => presentor.appears == 1)) == undefined)
                        // console.log(emptyroom ,"  ",emptyroom2)
                        if (emptyroom != undefined) {

                            // console.log("Have room   ", emptyroom.room);
                            // var clearlist = emptyroom.TeachingAy.filter((staff) => staff.appears == 1)
                            // clearlist.forEach(element => {
                            //     element.appears = 0;
                            // });
                            // console.log("Have room   ", emptyroom.TeachingAy);
                            var appearedStaff = new Array();
                            thistimeslot.forEach(presentation => {
                                var thisRoomStaff = presentation.TeachingAy.filter((appearing) => appearing.appears == 1)
                                thisRoomStaff.forEach(staff => {
                                    appearedStaff.push(staff.tid)
                                });
                            });
                            // console.log(appearedStaff)
                            var CheckSupInSameTime = appearedStaff.find((id) => id == inputPairs.tid);
                            var CheckObsInSameTime = appearedStaff.find((id) => id == inputPairs.oid);
                            // console.log(thistimeslot)
                            // console.log(CheckSupInSameTime,"  ",CheckObsInSameTime)
                            if (CheckSupInSameTime == undefined && CheckObsInSameTime == undefined) {
                                var CheckSupAva = emptyroom.TeachingAy.find((Sup) => Sup.tid == inputPairs.tid && Sup.appears == 0);
                                var CheckObsAva = emptyroom.TeachingAy.find((Obs) => Obs.tid == inputPairs.oid && Obs.appears == 0);
                                var CheckStuAva = emptyroom.StudentAy.find((Stu) => Stu.sid == inputPairs.sid && Stu.appears == 0);


                                // console.log(CheckSupAva, " ", CheckStuAva, " ", CheckObsAva)
                                if (CheckSupAva != undefined && CheckObsAva != undefined && CheckStuAva != undefined) {

                                    // console.log(emptyroom.TeachingAy)

                                    var orgroom = Plan.Schedule.filter((orgroom) => orgroom.StudentAy.find((present) => inputPairs.sid == present.sid && present.appears == 1) != undefined && orgroom.room != emptyroom.room && orgroom.timeslot != emptyroom.timeslot)

                                    if (orgroom.length > 0) {
                                        orgroom.forEach(element => {
                                            // console.log("inserted 1 0", element.SQLdate, " ", element.SQLtime, " ", element.room, " ", element.StudentAy.filter((present) => present.appears == 1))
                                            if (element.appears == 1) {
                                                setAppear(element, inputPairs, 0);
                                            }

                                        });

                                    }
                                    if (emptyroom.StudentAy.find((stu) => stu.appear != -1 && stu.sid == inputPairs.sid) != undefined) {
                                        var count = 0;
                                        var insertedroom = thistimeslot.filter((rooms) => rooms.StudentAy.find((present) => present.appears == 1) != undefined)
                                        insertedroom.forEach(checkroom => {
                                            // console.log(checkroom)
                                            if (checkroom.TeachingAy.find((staff) => staff.tid == inputPairs.tid && staff.appear == 1) != undefined) {
                                                console.log(checkroom.SQLdate, " ", checkroom.SQLtime, " ", checkroom.room, " ", inputPairs.tid)
                                                count++;
                                            }
                                            if (checkroom.TeachingAy.find((staff) => staff.oid == inputPairs.tid && staff.appear == 1) != undefined) {
                                                console.log(checkroom.SQLdate, " ", checkroom.SQLtime, " ", checkroom.room, " ", inputPairs.oid)
                                                count++;
                                            }
                                        });

                                        var checkcanInsert = emptyroom.StudentAy.find((stu) => stu.appears != -1 && stu.sid == inputPairs.sid)

                                        if (count == 0 && checkcanInsert != undefined) {
                                            // console.log(emptyroom.StudentAy.find((stu) => stu.sid == inputPairs.sid))
                                            setAppear(emptyroom, inputPairs, 1);
                                            removeadded.push(inputPairs)

                                            // console.log("inserted 1", emptyroom.SQLdate, " ", emptyroom.SQLtime, " ", emptyroom.room, " ", inputPairs)
                                            var obj = JSON.parse(JSON.stringify(emptyroom.StudentAy.filter((student) => student.appears == 1)[0]))
                                            obj.room = emptyroom.room;
                                            obj.roomcount = emptyroom.roomcount
                                            obj.SQLdate = emptyroom.SQLdate;
                                            obj.SQLtime = emptyroom.SQLtime;
                                            obj.timeslot = emptyroom.timeslot;
                                            // console.log(obj)
                                            // delete WholePlanAccordingtoTime[a].empty;
                                            // delete WholePlanAccordingtoTime[a].timeslot;
                                            // WholePlanAccordingtoTime[a] = new Array();
                                            WholePlanAccordingtoTime[a].push(obj)
                                            // console.log("pushed", WholePlanAccordingtoTime[a])
                                            // console.log(removeadded)

                                            break;
                                        } else {
                                            // console.log("pity ", emptyroom.StudentAy.filter((stu) => stu.sid == inputPairs.sid))
                                        }

                                    }

                                    //    console.log(Plan.Schedule.find((timeslot) => timeslot.timeslot == emptyroom.timeslot && timeslot.room == emptyroom.room))

                                }
                            } else {
                                // console.log("pity")
                            }
                        }




                        // } else {
                        //     console.log("need to used timeslote never used before in this time", WholePlanAccordingtoTime[a][0].timeslot)
                        //     var AvaRoom = Plan.Schedule.find((presentation) => presentation.timeslot == WholePlanAccordingtoTime[a][0].timeslot);
                        //     // console.log(AvaRoom.TeachingAy)
                        //     var orgroom = Plan.Schedule.find((orgroom) => orgroom.StudentAy.find((present) => inputPairs.sid == present.sid && present.appears == 1) != undefined && orgroom.room != AvaRoom.room && orgroom.timeslot != AvaRoom.timeslot)
                        //     if (orgroom != undefined) {
                        //         // console.log("inserted 1 0",orgroom.SQLdate," ",orgroom.SQLtime," ",orgroom.room," ",orgroom.StudentAy.filter((present)=> present.appears == 1))
                        //         setAppear(orgroom, inputPairs, 0);
                        //     }
                        //     if (AvaRoom.StudentAy.find((stu) => stu.sid == inputPairs.sid && stu.appear != -1) != undefined) {
                        //         setAppear(AvaRoom, inputPairs, 1);
                        //         console.log("inserted 2", AvaRoom.SQLdate, " ", AvaRoom.SQLtime, " ", AvaRoom.room, " ", inputPairs)

                        //         // console.log("inserted ")
                        //         break;
                        //     }


                        // var thistimeslot = Plan.Schedule.filter((presentation) => presentation.timeslot == WholePlanAccordingtoTime[a].timeslot)
                        // console.log(thistimeslot.StudentAy)

                    }
                }

            });
            removeadded.forEach(element => {
                var index = notTackledPresentation.findIndex((stu) => stu.sid == element.sid)
                notTackledPresentation.splice(index, 1)
                // console.log(notTackledPresentation.length)

            });
            // console.log("remaining ", notTackledPresentation)
            removeadded = [];

            // var method = Math.floor(Math.random() * 3)
            Plan.Schedule = Plan.Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) || a.room - b.room)
            // switch (method) {
            //     case 0:
            //         Plan.Schedule = Plan.Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) || a.room-b.room)
            //         break;
            //     case 1:
            //         var pivot = (new Date(Plan.Schedule[Math.round((randomNum(Plan.Schedule)) * 0.5)].timeslot)).getTime();
            //         Plan.Schedule = Plan.Schedule.sort((a, b) => Math.abs((new Date(a.timeslot)).getTime() - pivot) - Math.abs((new Date(b.timeslot)).getTime() - pivot) || a.room-b.room);

            //         break;
            //     case 2:
            //         // WholePlanAccordingtoTime = copyTemplate.Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) && a.room - b.room);
            //         Plan.Schedule = Plan.Schedule.sort(() => 0.5 - Math.random())
            //         break;
            //     default:
            //         break;
            // }




            notTackledPresentation.forEach(inputPairs => {
                for (var a = 0; a < Plan.Schedule.length; a++) {
                    var thisslot = Plan.Schedule.filter((times) => times.timeslot == Plan.Schedule[a].timeslot).sort((a, b) => a.room - b.room);
                    var inserted = thisslot.filter((rooms) => rooms.StudentAy.find((present) => present.appears == 1) != undefined)
                    var empty = thisslot.filter((rooms) => rooms.StudentAy.find((present) => present.appears == 1) == undefined)


                    if (empty.length > 0) {
                        var usethis = DeternminWhichCampusFirst(thisslot)
                        var count = 0;
                        inserted.forEach(checkroom => {
                            // console.log(checkroom)
                            if (checkroom.TeachingAy.find((staff) => staff.tid == inputPairs.tid && staff.appear == 1) != undefined) {
                                console.log(checkroom.SQLdate, " ", checkroom.SQLtime, " ", checkroom.room, " ", inputPairs.tid)
                                count++;
                            }
                            if (checkroom.TeachingAy.find((staff) => staff.oid == inputPairs.tid && staff.appear == 1) != undefined) {
                                console.log(checkroom.SQLdate, " ", checkroom.SQLtime, " ", checkroom.room, " ", inputPairs.oid)
                                count++;
                            }
                        });

                        var checkcanInsert = usethis.StudentAy.find((stu) => stu.appears != -1 && stu.sid == inputPairs.sid)
                        if (count == 0 && checkcanInsert != undefined) {
                            setAppear(usethis, inputPairs, 1)
                            removeadded.push(inputPairs)
                            break;
                        }
                    }


                }
            });

            removeadded.forEach(element => {
                var index = notTackledPresentation.findIndex((stu) => stu.sid == element.sid)
                notTackledPresentation.splice(index, 1)
                // console.log(notTackledPresentation.length)

            });
            // console.log("remaining ", notTackledPresentation)

            countTackle(Plan);

            if (beforecount != Plan.tacklecount) {
                // Print(Plan)
                // console.log(beforecount, " check after ", Plan.tacklecount)
            }

            Plan.Penalty = await Penalty(Plan.Schedule);


            return Plan;
        }

        function NewGenReplaceOldGen(oldGen, NewGen) {
            function reduceDuplicate(Population, currentPop) {
                for (var PopNum = 0; PopNum < Population.length; PopNum++) {
                    var checkcount = 0;
                    var checkroomcount = 0;
                    // console.log("checking PopNum ", PopNum)
                    for (var time = 0; time < Population[PopNum].Schedule.length;) {
                        var thistimeslotCombin = Population[PopNum].Schedule.filter((timeslot) => timeslot.timeslot == Population[PopNum].Schedule[time].timeslot);
                        var currenttimeslotCombin = currentPop.Schedule.filter((timeslot) => timeslot.timeslot == Population[PopNum].Schedule[time].timeslot);
                        // console.log("thistimeslotCombin ",currenttimeslotCombin)

                        for (var roomcount = 0; roomcount < Population[PopNum].Schedule[time].roomcount; roomcount++) {
                            var result = checkDuplicateStudentAy(thistimeslotCombin[roomcount].StudentAy, currenttimeslotCombin[roomcount].StudentAy);
                            if (result) {
                                // console.log("oops in room   ",thistimeslotCombin[roomcount].StudentAy.filter((student)=> student.appears == 1)[0].sid, "  ",currenttimeslotCombin[roomcount].StudentAy.filter((student)=> student.appears == 1)[0].sid)
                                checkroomcount++;
                            } else {
                                // console.log(thistimeslotCombin[roomcount].StudentAy.filter((student)=> student.appears == 1)[0].sid, "  ",currenttimeslotCombin[roomcount].StudentAy.filter((student)=> student.appears == 1)[0].sid)
                                // console.log(currenttimeslotCombin[roomcount].StudentAy.filter((student)=> student.appears == 1))

                            }
                        };
                        // var result = checkDuplicateStudentAy(Population[PopNum].Schedule[time].StudentAy, currentPop.Schedule[time].StudentAy);
                        if (checkroomcount == Population[PopNum].Schedule[time].roomcount) {
                            // console.log("\n\noops  ",Population[PopNum].Schedule[time].StudentAy,"\n",currentPop.Schedule[time].StudentAy)
                            // console.log("oops in timeslot")
                            checkcount++;
                        } else {
                            // console.log("PopNum can break", PopNum)
                            break;
                        }
                        // console.log("  check time ", time, "  check combinlength   ", thistimeslotCombin.length)
                        time += thistimeslotCombin.length;
                    };
                    if (checkcount == Population[PopNum].Schedule[0].StudentAy.length) {
                        console.log("this case need to be reduced");
                        return true;;
                    }
                };
                return false;
            }
            NewGen.sort((a, b) => a.Penalty - b.Penalty);
            NewGen.forEach(child => {
                // console.log(reduceDuplicate(oldGen, child))
                // console.log(">>check in new gen",child.tacklecount)
                oldGen.sort((a, b) => a.Penalty - b.Penalty);
                if (!reduceDuplicate(oldGen, child) && oldGen[oldGen.length - 1].Penalty > child.Penalty && child.tacklecount >= oldGen[oldGen.length - 1].tacklecount) {
                    // console.log("replaced by newGen", oldGen[oldGen.length - 1].Penalty, " ", child.Penalty)
                }
                oldGen.pop();
                oldGen.push(child);

            });
            return oldGen;
        }

        async function Mutation(Plan) {
            Plan.Schedule = Plan.Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot) || a.room - b.room)

            // console.log("before Mutation ", Plan.tacklecount)
            var copyPlan = JSON.parse(JSON.stringify(Plan))
            // Print(Plan);
            var swapped = false;
            var count = 0;
            var limit = 1000;
            function CheckCanSwap(selectedPresentation, source, destination) {
                /**
             *  check stuAva SupAva Obs Ava
             */
                var CanSwap = false;
                var CheckStuAva = Plan.Schedule[destination].StudentAy.find((Stu) => Stu.sid == selectedPresentation.sid && Stu.appears != -1);
                var CheckSupAva = Plan.Schedule[destination].TeachingAy.find((Sup) => Sup.tid == selectedPresentation.tid && Sup.appears != -1);
                var CheckObsAva = Plan.Schedule[destination].TeachingAy.find((Obs) => Obs.tid == selectedPresentation.oid && Obs.appears != -1);
                // console.log(CheckStuAva, " ", CheckSupAva, " ", CheckObsAva)
                if (CheckStuAva != undefined && CheckSupAva != undefined && CheckObsAva != undefined) {
                    /**
                     * Check appear of Sup and Obs
                     * case 1 : changing involve the same Sup or Obs
                     * case 2 : changing involve the same Sup or Obs appears in other room
                     * case 3 : changing dont involve any Sup or Obs
                     */
                    var appearedStaffA = new Array();
                    var appearedStaffB = new Array();
                    var checkSubappearsinA = Plan.Schedule.filter((timeslot) => timeslot.timeslot == Plan.Schedule[source].timeslot)
                    var checkSubappearsinB = Plan.Schedule.filter((timeslot) => timeslot.timeslot == Plan.Schedule[destination].timeslot)

                    checkSubappearsinA.forEach(element => {
                        element.TeachingAy.filter((staff) => staff.appears == 1).forEach((staff) => appearedStaffA.push(staff.tid))

                    });
                    checkSubappearsinB.forEach(element => {
                        element.TeachingAy.filter((staff) => staff.appears == 1).forEach((staff) => appearedStaffB.push(staff.tid))

                    });
                    // console.log(Plan.Schedule[source].timeslot, "  ", appearedStaffA)
                    // console.log(Plan.Schedule[destination].timeslot, "  ", appearedStaffB)

                    var SupCheck = false
                    var ObsCheck = false
                    // check A sup appeared B timslote
                    if (appearedStaffB.filter((staff) => staff == selectedPresentation.tid) != undefined) {
                        // console.log("case 1")
                        // console.log(Plan.Schedule[destination].TeachingAy.find((thestaffinvolved) => thestaffinvolved.tid == selectedPresentation.tid && thestaffinvolved.appears != 1))
                        if (Plan.Schedule[destination].TeachingAy.find((thestaffinvolved) => thestaffinvolved.tid == selectedPresentation.tid && thestaffinvolved.appears != 1) != undefined) {
                            SupCheck = true;
                        }
                    } else {
                        // console.log("case 3")
                        // console.log(Plan.Schedule[destination].TeachingAy.find((thestaffinvolved) => thestaffinvolved.tid == selectedPresentation.tid && thestaffinvolved.appears != 1))

                        if (Plan.Schedule[destination].TeachingAy.find((thestaffinvolved) => thestaffinvolved.tid == selectedPresentation.tid && thestaffinvolved.appears != 1) != undefined) {
                            // console.log("case 4")
                        }
                    }
                    // check A sup appeared B timslote
                    if (appearedStaffB.filter((staff) => staff == selectedPresentation.oid) != undefined) {
                        // console.log("case 1")
                        // console.log(Plan.Schedule[destination].TeachingAy.find((thestaffinvolved) => thestaffinvolved.tid == selectedPresentation.oid && thestaffinvolved.appears != 1))
                        if (Plan.Schedule[destination].TeachingAy.find((thestaffinvolved) => thestaffinvolved.tid == selectedPresentation.oid && thestaffinvolved.appears != 1) != undefined) {
                            ObsCheck = true;
                        }
                    } else {
                        // console.log("case 3")
                        // console.log(Plan.Schedule[destination].TeachingAy.find((thestaffinvolved) => thestaffinvolved.tid == selectedPresentation.oid && thestaffinvolved.appears != 1))

                        if (Plan.Schedule[destination].TeachingAy.find((thestaffinvolved) => thestaffinvolved.tid == selectedPresentation.oid && thestaffinvolved.appears != 1) != undefined) {
                            // console.log("case 4")
                        }
                    }
                    if (!SupCheck && !ObsCheck) {
                        // console.log("happy")
                        CanSwap = true;
                    }

                }

                return CanSwap;
            }

            while (!swapped && count < limit) {
                var randomA = randomNum(Plan.Schedule);
                while (Plan.Schedule[randomA].StudentAy.find((presentor) => presentor.appears == 1) == undefined) {
                    randomA = randomNum(Plan.Schedule);
                    // console.log("I am A",Plan.Schedule[randomA].StudentAy.find((presentor) => presentor.appears == 1))
                }
                var randomB = randomNum(Plan.Schedule);
                // console.log(randomA, " ", randomB, " ", Plan.Schedule[randomB].StudentAy.find((presentor) => presentor.appears == 1))
                // console.log(randomA == randomB, " ", Plan.Schedule[randomB].StudentAy.find((presentor) => presentor.appears == 1) == undefined, "  ", randomB == randomA || (Plan.Schedule[randomB].StudentAy.find((presentor) => presentor.appears == 1) == undefined))
                while (randomB == randomA || (Plan.Schedule[randomB].StudentAy.find((presentor) => presentor.appears == 1) == undefined)) {
                    randomB = randomNum(Plan.Schedule);
                    // console.log("I am B",Plan.Schedule[randomB].StudentAy.find((presentor) => presentor.appears == 1))
                }
                var selectedAPresentation = Plan.Schedule[randomA].StudentAy.find((presentor) => presentor.appears == 1);
                var selectedBPresentation = Plan.Schedule[randomB].StudentAy.find((presentor) => presentor.appears == 1);
                // console.log(Plan.Schedule[randomA])
                // console.log(Plan.Schedule[randomB])

                // console.log("selected", selectedAPresentation, "  ", selectedBPresentation, "\n\n")




                if (CheckCanSwap(selectedAPresentation, randomA, randomB) && CheckCanSwap(selectedBPresentation, randomB, randomA)) {
                    /**
                     *  change A to B
                     */
                    if (selectedBPresentation.appears == 1) {
                        setAppear(Plan.Schedule[randomB], selectedBPresentation, 0)
                    }
                    setAppear(Plan.Schedule[randomB], selectedAPresentation, 1)

                    /**
                     *  change B to A
                     */
                    if (selectedAPresentation.appears == 1) {
                        setAppear(Plan.Schedule[randomA], selectedAPresentation, 0)
                    }
                    setAppear(Plan.Schedule[randomA], selectedBPresentation, 1)
                    // console.log("Swapped in Mutation")
                    swapped = true;
                }
                count++;
            }
            // console.log(Plan);
            // Print(Plan);
            countTackle(Plan);
            // console.log("After Mutation ", Plan.tacklecount)
            if (Plan.tacklecount < copyPlan) {
                Plan = copyPlan
            } else {
                Plan.Penalty = await Penalty(Plan.Schedule);
            }
            // console.log(">>checktackle in mutation ", Plan.tacklecount)

            // Print(Plan);
        }

        async function insertbox(planNo, element, sqldatestring, sqltimestring, room, planStatus, typeOfPresent) {
            // console.log(element)
            let boxid = 'boxID';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < 15) {
                boxid += characters.charAt(Math.floor(Math.random() * charactersLength));
                counter += 1;
            }

            var insertscheduleboxquery = "insert into allschedulebox values(\"" + boxid + "\",\"" + planNo + "\",\"" + planStatus + "\",\"" + sqldatestring + " " + sqltimestring + "\",\"" + typeOfPresent + "\","
                + "\"" + element.tid + "\",\"" + element.sid + "\",\"" + element.oid + "\","
                + "\"Sin Hang\",\"" + room + "\", now()) ;"
            // console.log(insertscheduleboxquery)

            db.query(insertscheduleboxquery, (err, results) => {
                try {
                    // console.log("inserted ")
                } catch (err) {
                    return err;
                }
            });

        }

        async function forceInsert(needToTackleCase, Schedule, planNo) {
            console.log("forceInsert   ", needToTackleCase)
            var orgPlaninorder = copyarray(Schedule.Schedule);
            orgPlaninorder = orgPlaninorder.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot))
            console.log(orgPlaninorder[0].SQLdate, "  ", orgPlaninorder[0].SQLtime)
            var BigPlanwithAllPresentation = new Array();
            var WholePlanAccordingtoTime = new Array();
            var timeslotaycombin = new Array();
            var emptyroomlist = new Array();
            var index = 0;

            for (var a = 0; a < orgPlaninorder.length;) {

                var thistimeslotCombin = Schedule.Schedule.filter((timeslot) => timeslot.timeslot == orgPlaninorder[a].timeslot)
                // console.log(thistimeslotCombin[0].SQLdate,"  ",thistimeslotCombin[0].SQLtime)
                timeslotaycombin.push(thistimeslotCombin)
                var emptyroom = thistimeslotCombin.filter((rooms) => rooms.StudentAy.find((present) => present.appears == 1) == undefined)
                emptyroomlist.push(emptyroom);

                a = a + thistimeslotCombin.length;
                // console.log(a)

            }
            // emptyroomlist.sort(() => 0.5 - Math.random());
            //    console.log(emptyroomlist[0])
            for (var a = 0; a < emptyroomlist.length; a++) {
                // console.log("emptyroomlist[a] length ",emptyroomlist[a].length)
                for (var b = 0; b < emptyroomlist[a].length; b++) {
                    // console.log("checking loop 2 ", a," ",b," ", emptyroomlist[a][b].SQLdate, "  ", emptyroomlist[a][b].SQLtime , "  ", emptyroomlist[a][b].room)
                    var insertedppl;
                    var presentationlist = await availblepairsforthistimeslot(emptyroomlist[a][b].SQLdate, emptyroomlist[a][b].SQLtime);
                    // console.log(presentationlist[0])
                    // console.log(needToTackleCase)
                    // console.log(presentationlist.find((present)=> present.SID == needToTackleCase[c].sid))
                    needToTackleCase.sort(() => 0.5 - Math.random());
                    for (var c = 0; c < needToTackleCase.length; c++) {
                        // console.log("checking loop ", a," ",b," ",c)
                        // console.log(emptyroomlist[a][b].SQLdate, "  ", emptyroomlist[a][b].SQLtime , "  ", emptyroomlist[a][b].room,"  ",needToTackleCase[c] , presentationlist.length , " ",presentationlist.find((present) => present.SID == needToTackleCase[c].sid) != undefined)
                        var inserted = false;
                        if (presentationlist.length > 0 && presentationlist.find((present) => present.SID == needToTackleCase[c].sid) != undefined) {
                            // console.log("this student can  ", needToTackleCase[c], "  ", emptyroomlist[a][b].SQLdate, "  ", emptyroomlist[a][b].SQLtime , "  ", emptyroomlist[a][b].room)
                            var stafflist = new Array();
                            // console.log( timeslotaycombin[0])
                            var thistimeslot = Schedule.Schedule.filter((time) => time.timeslot == emptyroomlist[a][b].timeslot)
                            // console.log( thistimeslot[0])
                            thistimeslot.forEach(element => {
                                // console.log(element.TeachingAy)
                                var StaffAy = element.TeachingAy.filter(((ppl) => ppl.appears == 1))
                                StaffAy.forEach(element2 => {
                                    stafflist.push(element2)
                                });
                            });
                            // console.log("this timeslot staff list", stafflist)

                            var checkobs = stafflist.find((inthelist) => inthelist.tid == needToTackleCase[c].oid)
                            var checksup = stafflist.find((inthelist) => inthelist.tid == needToTackleCase[c].tid)

                            if (checkobs == undefined && checksup == undefined) {
                                // console.log(" very good lets put here")
                                for (var d = 0; d < Schedule.Schedule.length; d++) {
                                    var presentationlist = await availblepairsforthistimeslot(Schedule.Schedule[d].SQLdate, Schedule.Schedule[d].SQLtime);
                                    if (presentationlist.find((present) => present.SID == needToTackleCase[c].sid)) {
                                        var obj = JSON.parse(JSON.stringify({
                                            sid: needToTackleCase[c].sid,
                                            tid: needToTackleCase[c].tid,
                                            oid: needToTackleCase[c].oid,
                                            appears: 0
                                        }))
                                        Schedule.Schedule[d].StudentAy.push(obj)
                                    } else {
                                        var obj = JSON.parse(JSON.stringify({
                                            sid: needToTackleCase[c].sid,
                                            tid: needToTackleCase[c].tid,
                                            oid: needToTackleCase[c].oid,
                                            appears: -1
                                        }))

                                        Schedule.Schedule[d].StudentAy.push(obj)
                                    }

                                }
                                // console.log(Schedule.Schedule[0].StudentAy)
                                var wantroom = emptyroomlist[a][b].room;
                                var wanttime = emptyroomlist[a][b].timeslot;

                                var index = Schedule.Schedule.findIndex((room) => room.timeslot == emptyroomlist[a][b].timeslot && room.room == emptyroomlist[a][b].room);
                                console.log(wantroom, "  ", wanttime, "  ", index, " inserted ",)
                                setAppear(Schedule.Schedule[index], needToTackleCase[c], 1);
                                insertbox(planNo, needToTackleCase[c],
                                    emptyroomlist[a][b].SQLdate, emptyroomlist[a][b].SQLtime, emptyroomlist[a][b].room, "Manual Handling", req.body.typeOfPresent)
                                inserted = true;
                            } else {
                                // console.log("obs / tid appears")
                            }

                        }
                        if (inserted) {
                            insertedppl = needToTackleCase[c];
                            c = needToTackleCase.length;
                        }
                    }
                    // console.log("insertedppl" ,insertedppl)
                    if (insertedppl != undefined) {
                        var index = needToTackleCase.findIndex((stu) => stu.sid == insertedppl.sid)
                        // console.log(index)
                        needToTackleCase.splice(index, 1);
                        // console.log(needToTackleCase)
                        insertedppl = undefined;
                    }
                    // console.log("check in loop end ",a," ",b)
                }
                // console.log("check in loop end2 ",a)
            }




            // var BigPlanwithAllPresentation = new Array();
            // var WholePlanAccordingtoTime = new Array();

            // var orgPlaninorder = copyarray(Schedule.Schedule);
            // orgPlaninorder = orgPlaninorder.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot))

            // for (var a = 0; a < orgPlaninorder.length;) {
            //     var thistimeslotAy = new Array();
            //     var thistimeslotCombin = Schedule.Schedule.filter((timeslot) => timeslot.timeslot == orgPlaninorder[a].timeslot)

            //     thistimeslotCombin.forEach(element => {
            //         // console.log(element.StudentAy.filter((student) => student.appears == 1));
            //         if (element.StudentAy.filter((student) => student.appears == 1).length > 0) {
            //             var obj = JSON.parse(JSON.stringify(element.StudentAy.filter((student) => student.appears == 1)[0]));
            //             var Stu = JSON.parse(JSON.stringify({ SID: element.StudentAy.filter((student) => student.appears == 1)[0].sid }));
            //             obj.room = element.room;
            //             obj.SQLdate = element.SQLdate;
            //             obj.SQLtime = element.SQLtime;
            //             obj.timeslot = element.timeslot;
            //             thistimeslotAy.push(obj)
            //             BigPlanwithAllPresentation.push(Stu);
            //         }
            //     });
            //     if (thistimeslotAy.length > 0) {
            //         WholePlanAccordingtoTime.push(thistimeslotAy);
            //     }
            //     a += thistimeslotCombin.length;
            // }
            // // console.log(BigPlanwithAllPresentation.length);
            // var insertList = new Array();
            // for (var a = 0; a < WholePlanAccordingtoTime.length; a++) {

            //     var thisparalle = Schedule.Schedule.filter((timeslot2) => timeslot2.timeslot == WholePlanAccordingtoTime[a][0].timeslot);
            //     // console.log(thisparalle.filter((room) => room.StudentAy.find((present) => present.appears == 1) == undefined))
            //     var emptyroomthisparalle = thisparalle.filter((present) => present.StudentAy.find((presentor) => presentor.appears == 1) == undefined);
            //     var thisparalleStaff = Schedule.Schedule.filter((presents) => presents.timeslot == WholePlanAccordingtoTime[a][0].timeslot &&
            //         presents.StudentAy.find((present2) => present2.appears == 1) != undefined)
            //     // console.log('thisparalleStaff   1', WholePlanAccordingtoTime[a]);

            //     var StaffAy = new Array();
            //     thisparalleStaff.forEach(element => {
            //         appearedStaff = element.StudentAy.find((staff) => staff.appears == 1);
            //         if (appearedStaff != undefined) {
            //             var Sup = JSON.parse(JSON.stringify({
            //                 ID: appearedStaff.tid
            //             }))
            //             var Obs = JSON.parse(JSON.stringify({
            //                 ID: appearedStaff.oid
            //             }))

            //             StaffAy.push(Sup);
            //             StaffAy.push(Obs);
            //         }
            //     });
            //     // console.log('emptyrooms ', emptyroomthisparalle.length)
            //     for (var emptyrooms = 0; emptyrooms < emptyroomthisparalle.length; emptyrooms++) {
            //         // console.log(emptyroomthisparalle[emptyrooms].room)
            //         if (insertList.find((room) => room.Index == Schedule.Schedule.findIndex((room) => room == emptyroomthisparalle[emptyrooms]) != undefined)
            //             && Schedule.Schedule[Schedule.Schedule.findIndex((room) => room == emptyroomthisparalle[emptyrooms])].StudentAy.find((stu) => stu.appears == 1) == undefined) {
            //             var obj = JSON.parse(JSON.stringify(
            //                 { parallelist: StaffAy, EmptyRoom: emptyroomthisparalle[emptyrooms], Index: Schedule.Schedule.findIndex((room) => room == emptyroomthisparalle[emptyrooms]) }
            //             ))
            //             insertList.push(obj)
            //         }
            //     }
            // }
            // // console.log(insertList.length)
            // // insertList.forEach(element => {
            // //     console.log(element.EmptyRoom.SQLdate, " ", element.EmptyRoom.SQLtime, " ", element.EmptyRoom.room)
            // // });


            // for (var a = 0; a < insertList.length; a++) {
            //     var PresentationList = await availblepairsforthistimeslot(insertList[a].EmptyRoom.SQLdate, insertList[a].EmptyRoom.SQLtime)
            //     var CanList = new Array();
            //     needToTackleCase.forEach(element => {
            //         PresentationList = reducePairByTeachingStaff(insertList[a].parallelist, PresentationList);
            //         if (PresentationList.find((stu) => stu.SID == element.sid)) {
            //             // console.log("found this stu in this timeslot ", insertList[a].parallelist, " ", element, " ", insertList[a].EmptyRoom.SQLdate, "  ", insertList[a].EmptyRoom.SQLtime)
            //             CanList.push(element)
            //         }

            //     });
            //     insertList[a].CanList = CanList;
            //     // console.log("her ",insertList[a])
            // }
            // // console.log("insertList ", insertList)

            // insertList.sort(() => 0.5 - Math.random());

            // needToTackleCase.forEach(element => {
            //     //  console.log(insertList[0].CanList)
            //     var uniqueList = insertList.filter((session) => session.hasOwnProperty("CanList") && session.CanList.filter((stu) => stu.sid == element.sid).length > 0)
            //     // console.log("this stu have ", uniqueList)
            // });
            // var counter = 0;
            // // console.log(insertList.length)
            // // console.log(needToTackleCase);
            // // console.log(insertList[0])

            // needToTackleCase.sort(() => 0.5 - Math.random());
            // // console.log(needToTackleCase)
            // var remaining = new Array();

            // for (var b = 0; b < needToTackleCase.length; b++) {
            //     var inserted = false;
            //     var insertedIndex = -1;

            //     for (var a = 0; a < insertList.length; a++) {

            //         var room = insertList[a].EmptyRoom.room;
            //         var timetime = insertList[a].EmptyRoom.timeslot;
            //         var theslot = Schedule.Schedule.findIndex((present) => (present.room == room) && (present.timeslot == timetime))
            //         var checkstaff = false;
            //         var checkstudent = false;
            //         if (!insertList[a].parallelist.find((sup) => sup.ID == needToTackleCase[b].tid || sup.ID == needToTackleCase[b].oid)) {
            //             checkstaff = true;
            //         }
            //         if (insertList[a].CanList.length != 0 && insertList[a].CanList.find((stu) => stu.sid == needToTackleCase[b].sid) && insertList[a].EmptyRoom.StudentAy.find((stu) => stu.appears == 1) == undefined) {
            //             checkstudent = true;
            //         }

            //         if (checkstaff && checkstudent) {

            //             var obj = JSON.parse(JSON.stringify(needToTackleCase[b]));
            //             obj.appears = 0;
            //             // console.log("this works", obj)
            //             Schedule.Schedule.forEach(slots => {
            //                 slots.StudentAy.push(JSON.parse(JSON.stringify(obj)));
            //             });
            //             // console.log(Schedule.Schedule[0].StudentAy)
            //             var Sup = JSON.parse(JSON.stringify({
            //                 ID: needToTackleCase[b].tid
            //             }))
            //             var Obs = JSON.parse(JSON.stringify({
            //                 ID: needToTackleCase[b].oid
            //             }))

            //             insertList.filter((allsameslot) => allsameslot.EmptyRoom.timeslot == timetime).forEach((change) => {
            //                 change.parallelist.push(Sup);
            //                 change.parallelist.push(Obs);
            //             })
            //             inserted = true
            //             insertedIndex = a;
            //             setAppear(Schedule.Schedule[insertList[b].Index], obj, 1)


            //         }
            //         if (inserted) {
            //             // console.log("here", a, " ", needToTackleCase[b], insertList[a].EmptyRoom.room, "  ", insertList[a].EmptyRoom.SQLdate, insertList[a].EmptyRoom.SQLtime)
            //             break;
            //         }
            //     }
            //     if (inserted && insertedIndex >= 0) {

            //         insertList.splice(insertedIndex, 1)

            //         // Print(Schedule)
            //         await insertbox(planNo, needToTackleCase[b], Schedule.Schedule[insertedIndex].SQLdate, Schedule.Schedule[insertedIndex].SQLtime, Schedule.Schedule[insertedIndex].room, "Manual Handling", req.body.typeOfPresent);
            //     } else {
            //         remaining.push(needToTackleCase[b])
            //     }
            // };

            countTackle(Schedule);
            Schedule.Penalty = await Penalty(Schedule.Schedule);
            // console.log(needToTackleCase.length)
            // Print(Schedule)

            return JSON.parse(JSON.stringify({ Schedule: Schedule, needToTackleCase: needToTackleCase }));
        }



        async function checkAnyManalHandling(Plan, PlanNo) {
            var TotalStudentList = await getPairingList();
            var appeared = new Array();
            Plan.Schedule.forEach(element => {
                if (element.StudentAy.find((present) => present.appears == 1) != undefined) {
                    appeared.push(element.StudentAy.find((present) => present.appears == 1))
                }
            });
            if (TotalStudentList.length >= appeared.length) {
                var needtoTackle = new Array();
                var count = 0;
                TotalStudentList.forEach(Student => {
                    if (appeared.find((presentor) => presentor.sid == Student.sid) == undefined) {
                        needtoTackle.push(Student)
                    }
                });
                // console.log("need to Tackle ", needtoTackle.length, "  ", needtoTackle);
                var result = await forceInsert(needtoTackle, Plan, PlanNo);
                // var result2 = await forceinsert2(needtoTackle, Plan, PlanNo);
                // console.log("return in manal ");
                Plan = result.Schedule;

                // console.log(Plan);
                // console.log("return in manal ");
                Plan.Penalty = await Penalty(Plan.Schedule);
                countTackle(Plan)
                console.log(Plan.tacklecount, "  ", Plan.Penalty);
                needtoTackle = result.needToTackleCase;

                if (needtoTackle.length == 0) {
                    var UpdateQuery = "update allschedulebox set planStatus = \"Successful\" where planNo = " + PlanNo + " "
                    // console.log(insertManualCasequery)
                    db.query(UpdateQuery, (err, results) => {
                        try {
                            // console.log("inserted ")
                        } catch (err) {
                            return err;
                        }
                    })

                } else {
                    for (var a = 0; a < needtoTackle.length; a++) {
                        var insertManualCasequery = "insert ignore into manualhandlecase values (\"" + needtoTackle[a].sid + "\",\"" + needtoTackle[a].tid + "\",\"" + needtoTackle[a].oid + "\",\"" + PlanNo + "\")"
                        console.log(insertManualCasequery)
                        db.query(insertManualCasequery, (err, results) => {
                            try {
                                // console.log("inserted ")
                            } catch (err) {
                                return err;
                            }
                        })
                    }

                }

            }

            console.log(Plan.tacklecount, "  ", Plan.Penalty);
            return Plan;

        }

        function reduceTemplateDates(BigTemplate, datecombin) {
            // console.log(BigTemplate)
            var smallTemplate = new Array();
            datecombin.forEach((datetime) => {

                if (BigTemplate.Schedule.find((timeslot) => ((new Date(timeslot.timeslot)).toLocaleDateString('en-GB')) == ((new Date(datetime)).toLocaleDateString('en-GB'))) != undefined) {

                    //  console.log(BigTemplate.Schedule.filter((timeslot)=> ((new Date(timeslot.timeslot)).toLocaleDateString('en-GB')) == ((new Date(datetime)).toLocaleDateString('en-GB'))))

                    smallTemplate.push(copyarray(BigTemplate.Schedule.filter((timeslot) => ((new Date(timeslot.timeslot)).toLocaleDateString('en-GB')) == ((new Date(datetime)).toLocaleDateString('en-GB')))).flat())
                }
            })
            smallTemplate = smallTemplate.flat(Infinity);
            // console.log(smallTemplate)
            var NewTemplate = JSON.parse(JSON.stringify(BigTemplate));
            NewTemplate.Schedule = smallTemplate.flat();
            var checkroomcount = 0;
            NewTemplate.Schedule.forEach(element => {
                checkroomcount += element
            });
            // console.log(NewTemplate)
            return NewTemplate;
        }

        function changeRoom(Plan2, datecombin) {
            /** move rooms in between */
            var Plan = Plan2.Schedule


            Plan = Plan.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot))

            var Wy = new Array();

            for (var a = 0; a < Plan.length;) {
                var thisay = Plan.filter((time) => time.timeslot == Plan[a].timeslot);
                Wy.push(thisay);
                a += thisay.length;
            }

            for (var a = 1; a < Wy.length; a++) {
                Wy[a].forEach(room => {
                    var present = room.StudentAy.find((present) => present.appears == 1);

                    var tid;
                    var oid;
                    if (present != undefined) {
                        tid = present.tid;
                        oid = present.oid;
                    }
                    Wy[a - 1].forEach((room2) => {
                        var present2 = room2.StudentAy.find((present) => present.appears == 1 && (present.tid == tid || present.oid == oid));
                        var present2index = Plan.findIndex((present) => present == room2)
                        // var present2 = room2.TeachingAy.find((present) => present.tid == tid || present.tid == oid);
                        if (present2 != undefined) {
                            // console.log(room)
                            // console.log(room2)
                            if (room.room != room2.room) {
                                var obj2 = room.StudentAy.filter((present) => present.appears == 1)[0]
                                console.log("move this ", obj2, " from ", room.room, " ", room.SQLdate, "  ", room.SQLtime, " to ", room2.room, " ", room2.SQLdate, "  ", room2.SQLtime)



                                var present3 = Wy[a].find((present) => present.room == room2.room);
                                if (present3 != undefined) {
                                    // console.log(present3.room , "   ",present3.SQLdate,"  ",present3.SQLtime )
                                    var obj3 = present3.StudentAy.filter((present) => present.appears == 1)
                                    var present3index = Plan.findIndex((present) => present == present3)

                                    setAppear(Plan[present2index], obj2, 0)
                                    if (obj3.length > 0) {

                                        // console.log(obj3[0])
                                        obj3 = obj3[0];
                                        setAppear(Plan[present2index], obj3, 1)
                                        setAppear(Plan[present3index], obj3, 0)
                                        console.log(obj3, "from ", Plan[present3index].SQLdate, "  ", Plan[present3index].SQLtime, "  ", Plan[present3index].room, " to ", Plan[present2index].SQLdate, "  ", Plan[present2index].SQLtime, "  ", Plan[present2index].room)
                                    }
                                    setAppear(Plan[present3index], obj2, 1)
                                    console.log(obj2, "from ", Plan[present2index].SQLdate, "  ", Plan[present2index].SQLtime, "  ", Plan[present2index].room, " to ", Plan[present3index].SQLdate, "  ", Plan[present3index].SQLtime, "  ", Plan[present3index].room)


                                } else {

                                }




                            }
                        }
                    })
                });
            }



        }

        function LastCheck(Plan) {
            var copyarray1 = copyarray(Plan.Schedule);
            console.log(copyarray1.length)
            copyarray1.forEach(element => {
                var onetimeslot = copyarray1.filter((timetime) => timetime.timeslot == element.timeslot);
                console.log(onetimeslot)
                var arranged = new Array();
                onetimeslot.forEach(element => {
                    var pre = element.StudentAy.find((present) => present.appears == 1)
                    console.log(pre)
                    arranged.push(pre)
                });
                if (arranged.length != 0) {
                    arranged.forEach(element => {
                        var studentcheck = -1;
                        var supcheck = -1;
                        var obscheck = -1;
                        if (arranged.filter((presentation) => presentation.sid == element.sid).length > 1) {
                            studentcheck =arranged.lastIndexOf((presentation) => presentation.sid == element.sid) ;
                        }
                        if (arranged.filter((presentation) => presentation.tid == element.tid).length > 1) {
                            supcheck =arranged.lastIndexOf((presentation) => presentation.tid == element.tid) ;
                        }
                        if (arranged.filter((presentation) => presentation.oid == element.oid).length > 1) {
                            obscheck =arranged.lastIndexOf((presentation) => presentation.oid == element.oid) ;
                        }
                        if(studentcheck !=-1){
                            console.log("student check hv problem ", element.sid)
                        }
                        if(supcheck !=-1){
                            console.log("sup check hv problem ", element.tid)
                        }
                        if(obscheck !=-1){
                            console.log("obs check hv problem ", element.oid)
                        }

                    });
                }

            });
        }

        var totalStudNum = await getStudentnum();
        var studenList = await getPairingList();
        var teachingList = await getTeachingList();
        var StudentList = new Array();
        var TeachingList = new Array();
        var Generation = 1000;
        studenList.forEach(element => {
            var Obj = JSON.parse(JSON.stringify({
                sid: element.sid,
                tid: element.tid,
                oid: element.oid,
                appears: -1
            }))
            StudentList.push(Obj);
        });
        teachingList.forEach(element => {
            var Obj = JSON.parse(JSON.stringify({
                tid: element.tid,
                appears: -1
            }))
            TeachingList.push(Obj)
        });
        var finalResultOfPlans = new Array();
        // console.log(possibledatecombination)
        console.log("Total plans requires process", possibledatecombination.length, "\n\n")
        var ProcessStart = new Date();
        var PlansRequiresRRSRoom = new Array();
        var PlansCanSetinFSCRooms = new Array();
        var InitialGenNum = 10
        var countingshuffledate = 0;
        var uniquetimeslotcounts = await checkuniquetimeslotcountforoneday(possibledatecombination[possibledatecombination.length - 1]);
        // console.log(StudentList.Length, " ", TeachingList.length, " ", possibledatecombination[possibledatecombination.length - 1], " ", req.body.roomList)
        var BigTemplate = await InitialArrayTemplate(StudentList, TeachingList, uniquetimeslotcounts, req.body.roomList);

        var checking = new Array();
        BigTemplate.Schedule.forEach((room) => {
            if (checking.length == 0 || checking.find((ex) => ex == room.room) == undefined) {
                checking.push(room.room);

            }
        })
        // console.log(checking)
        var finalduration = possibledatecombination[possibledatecombination.length - 1]

        var plans = 10;

        for (var datecombin = 0; datecombin < plans; datecombin++) {

            // for (var datecombin = 20; datecombin < 25; datecombin++) {
            // for (var datecombin = 10; datecombin < 15; datecombin++) {
            // console.log("For Plan", datecombin, possibledatecombination[datecombin])
            console.log("For Plan", datecombin, finalduration)
            var totalStudNum = await getStudentnum();
            var studenList = await getPairingList();
            var teachingList = await getTeachingList();
            var StudentList = new Array();
            var TeachingList = new Array();
            var Generation = 1000;
            studenList.forEach(element => {
                var Obj = JSON.parse(JSON.stringify({
                    sid: element.sid,
                    tid: element.tid,
                    oid: element.oid,
                    appears: -1
                }))
                StudentList.push(Obj);
            });
            teachingList.forEach(element => {
                var Obj = JSON.parse(JSON.stringify({
                    tid: element.tid,
                    appears: -1
                }))
                TeachingList.push(Obj)
            });
            var BigTemplate = await InitialArrayTemplate(StudentList, TeachingList, uniquetimeslotcounts, req.body.roomList);

            var checking = new Array();
            BigTemplate.Schedule.forEach((room) => {
                if (checking.length == 0 || checking.find((ex) => ex == room.room) == undefined) {
                    checking.push(room.room);

                }
            })
            // var Template = reduceTemplateDates(BigTemplate, possibledatecombination[datecombin])
            var Template = reduceTemplateDates(BigTemplate, finalduration)

            // console.log(Template)

            if (Template.able) {
                console.log("\nhere Table.able",);

                // console.log( Template.Schedule[0].StudentAy);
                // console.log( Template.Schedule[0].TeachingAy);
                var allpossiblePopulation = new Array();

                var AllPopulation = await InitialGeneration(InitialGenNum, Template);

                while (AllPopulation.status != 1) {
                    // console.log("here")
                    AllPopulation = AllPopulation.AllPopulation
                    // console.log(AllPopulation)
                    var newStudentList = new Array();
                    var SelectedOne;
                    if (AllPopulation.length > 1) {
                        var randomnumber = randomNum(AllPopulation)
                        SelectedOne = AllPopulation[randomnumber].Schedule
                    } else {
                        SelectedOne = AllPopulation[0].Schedule
                    }

                    SelectedOne.forEach(element => {
                        // console.log(element)
                        var obj = element.StudentAy.find((student) => student.appears == 1);
                        if (obj != undefined) {
                            obj.appears = -1;
                            newStudentList.push(obj)
                        }
                    });
                    // console.log(newStudentList)
                    // console.log("Template length ", Template.length)
                    BigTemplate = await InitialArrayTemplate(newStudentList, TeachingList, uniquetimeslotcounts, req.body.roomList);
                    // Template = reduceTemplateDates(BigTemplate, possibledatecombination[datecombin])
                    Template = reduceTemplateDates(BigTemplate, finalduration)
                    // console.log(Template.Schedule[0].length)
                    AllPopulation = await InitialGeneration(InitialGenNum, Template);

                }


                // console.log(allpossiblePopulation[alltimediff[0].Index].List)

                if (AllPopulation.status == 1) {
                    console.log("enter  Template.able && AllPopulation.status != 0")
                    AllPopulation = AllPopulation.AllPopulation
                    AllPopulation.forEach(element => {
                        element.Schedule.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot))
                    });
                    // Print(AllPopulation.tacklecount)
                    // AllPopulation.forEach(element => {
                    //     Print(element)
                    // });
                    // var AllPopulation = await InitialGeneration(2, Template);
                    AllPopulation.sort((GeneA, GeneB) => GeneA.Penalty - GeneB.Penalty);
                    // AllPopulation.forEach(element => {
                    //     console.log(element.Penalty);
                    // });
                    var counter = 0;
                    var String = "";
                    AllPopulation.sort((GeneA, GeneB) => GeneA.Penalty - GeneB.Penalty);
                    var total = 0;
                    AllPopulation.forEach(element => {
                        String += element.Penalty + "  "
                        total += element.Penalty
                    });
                    console.log("Plan ", datecombin, "'s Penalty Before : ", String)
                    console.log("total: ", total, "\n")
                    // total = 0;
                    // String = "";
                    while (counter < Generation) {

                        // console.log("\nCurrent Generation ", counter);
                        // this need to be done in while loops
                        var newGeneration;
                        if (AllPopulation.length > 1) {
                            // console.log("\nhere  for mixing 1",);
                            var pairs = SelectForMixing(AllPopulation, 2);
                            newGeneration = await MixingGene(pairs);
                        }

                        await Mutation(AllPopulation[randomNum(AllPopulation)]);






                        if (newGeneration != undefined) {
                            AllPopulation = NewGenReplaceOldGen(AllPopulation, newGeneration);
                        }



                        counter++;

                    }
                    String = "";
                    total = 0;
                    var String2 = "";
                    AllPopulation.sort((GeneA, GeneB) => GeneA.Penalty - GeneB.Penalty);
                    AllPopulation.forEach(element => {
                        String += element.Penalty + "  "
                        total += element.Penalty
                        String2 += element.tacklecount + "  "
                    });
                    console.log("Plan ", datecombin, "'s Penalty After : ", String)
                    console.log("Plan ", datecombin, "'s tackle  After : ", String2)
                    console.log("total: ", total, "\n")
                    // AllPopulation.forEach(element => {
                    //     Print(element)
                    // });
                    var bestresults = AllPopulation.filter((Plans) => Plans.Penalty == AllPopulation[0].Penalty);
                    // console.log(" here")
                    var bestPlan = bestresults[randomNum(bestresults)];
                    // console.log(" here")
                    var checkSuccess = false;
                    // LastCheck(bestPlan)
                    if (bestPlan.tacklecount == totalStudNum) {
                        checkSuccess = true;
                    }
                    // changeRoom(bestPlan, possibledatecombination[datecombin])
                    // finalResultOfPlans.push(bestPlan);
                    for (var timeslot = 0; timeslot < bestPlan.Schedule.length; timeslot++) {
                        if (bestPlan.Schedule[timeslot].StudentAy.find((presentation) => presentation.appears == 1) != undefined) {
                            if (checkSuccess) {
                                insertbox(datecombin, bestPlan.Schedule[timeslot].StudentAy.find((presentation) => presentation.appears == 1),
                                    bestPlan.Schedule[timeslot].SQLdate, bestPlan.Schedule[timeslot].SQLtime, bestPlan.Schedule[timeslot].room, "Successful", req.body.typeOfPresent)
                            } else {
                                // await checkAnyManalHandling(bestPlan, datecombin)
                                insertbox(datecombin, bestPlan.Schedule[timeslot].StudentAy.find((presentation) => presentation.appears == 1),
                                    bestPlan.Schedule[timeslot].SQLdate, bestPlan.Schedule[timeslot].SQLtime, bestPlan.Schedule[timeslot].room, "Manual Handling", req.body.typeOfPresent)

                            }

                        }
                    }
                    console.log(checkSuccess, " here")
                    if (checkSuccess) {

                        finalResultOfPlans.push(JSON.parse(JSON.stringify({ planNo: datecombin, planStatus: 0, Penalty: bestPlan.Penalty, tacklecount: bestPlan.tacklecount })))
                    } else {
                        //                         var checkNewPatched = await checkAnyManalHandling(bestPlan, datecombin)
                        // Print(checkNewPatched)
                        //                         countTackle(checkNewPatched);
                        //                         checkNewPatched.Penaltymark = await Penalty(checkNewPatched)
                        //                         bestPlan = checkNewPatched;
                        // await checkAnyManalHandling(bestPlan, datecombin

                        bestPlan = await checkAnyManalHandling(bestPlan, datecombin)
                        console.log("here!!!1 ", bestPlan.Penalty, " ", bestPlan.tacklecount)
                        if (bestPlan.tacklecount == totalStudNum) {
                            checkSuccess = true;

                        }
                        if (checkSuccess) {
                            finalResultOfPlans.push(JSON.parse(JSON.stringify({ planNo: datecombin, planStatus: 0, Penalty: bestPlan.Penalty, tacklecount: bestPlan.tacklecount })))

                        } else {
                            finalResultOfPlans.push(JSON.parse(JSON.stringify({ planNo: datecombin, planStatus: 1, Penalty: bestPlan.Penalty, tacklecount: bestPlan.tacklecount })))
                        }

                    }

                }
                // Print(bestPlan)
                console.log("current results ", finalResultOfPlans)


            } else {
                var allpossiblePopulation = new Array();

                var AllPopulation = await InitialGeneration(InitialGenNum, Template);

                while (AllPopulation.status != 1) {
                    console.log("here")
                    AllPopulation = AllPopulation.AllPopulation
                    // console.log(AllPopulation)
                    var newStudentList = new Array();
                    var SelectedOne;
                    if (AllPopulation.length > 1) {
                        var randomnumber = randomNum(AllPopulation)
                        SelectedOne = AllPopulation[randomnumber].Schedule
                    } else {
                        SelectedOne = AllPopulation[0].Schedule
                    }

                    SelectedOne.forEach(element => {
                        console.log(element)
                        var obj = element.StudentAy.find((student) => student.appears == 1);
                        if (obj != undefined) {
                            obj.appears = -1;
                            newStudentList.push(obj)
                        }
                    });
                    // console.log(newStudentList)
                    // console.log("Template length ", Template.length)
                    BigTemplate = await InitialArrayTemplate(newStudentList, TeachingList, uniquetimeslotcounts, req.body.roomList);
                    // Template = reduceTemplateDates(BigTemplate, possibledatecombination[datecombin])
                    Template = reduceTemplateDates(BigTemplate, finalduration)
                    // console.log(Template.Schedule[0].length)
                    AllPopulation = await InitialGeneration(InitialGenNum, Template);

                }


                // console.log(allpossiblePopulation[alltimediff[0].Index].List)

                if (AllPopulation.status == 1) {
                    console.log("enter  Template.able && AllPopulation.status != 0")
                    AllPopulation = AllPopulation.AllPopulation
                    // Print(AllPopulation.tacklecount)
                    // AllPopulation.forEach(element => {
                    //     Print(element)
                    // });
                    // var AllPopulation = await InitialGeneration(2, Template);
                    AllPopulation.sort((GeneA, GeneB) => GeneA.Penalty - GeneB.Penalty);
                    // AllPopulation.forEach(element => {
                    //     console.log(element.Penalty);
                    // });
                    var counter = 0;
                    var String = "";
                    AllPopulation.sort((GeneA, GeneB) => GeneA.Penalty - GeneB.Penalty);
                    var total = 0;
                    AllPopulation.forEach(element => {
                        String += element.Penalty + "  "
                        total += element.Penalty
                    });
                    console.log("Plan ", datecombin, "'s Penalty Before : ", String)
                    console.log("total: ", total, "\n")
                    // total = 0;
                    // String = "";
                    while (counter <= Generation) {

                        // console.log("\nCurrent Generation ", counter);
                        // this need to be done in while loops
                        var newGeneration;
                        if (AllPopulation.length > 1) {
                            // console.log("\nhere  for mixing 1",);
                            var pairs = SelectForMixing(AllPopulation, 2);
                            newGeneration = await MixingGene(pairs);
                        }

                        await Mutation(AllPopulation[randomNum(AllPopulation)]);






                        if (newGeneration != undefined) {
                            AllPopulation = NewGenReplaceOldGen(AllPopulation, newGeneration);
                        }



                        counter++;

                    }
                    String = "";
                    total = 0;
                    var String2 = "";
                    AllPopulation.sort((GeneA, GeneB) => GeneA.Penalty - GeneB.Penalty);
                    AllPopulation.forEach(element => {
                        String += element.Penalty + "  "
                        total += element.Penalty
                        String2 += element.tacklecount + "  "
                    });
                    console.log("Plan ", datecombin, "'s Penalty After : ", String)
                    console.log("Plan ", datecombin, "'s tackle  After : ", String2)
                    console.log("total: ", total, "\n")
                    var bestresults = AllPopulation.filter((Plans) => Plans.Penalty == AllPopulation[0].Penalty);
                    // console.log(" here")
                    var bestPlan = bestresults[randomNum(bestresults)];
                    // console.log(" here")
                    var checkSuccess = false;
                    // AllPopulation.forEach(element => {
                    //         Print(element.Schedule)
                    // });
                    if (bestPlan.tacklecount == totalStudNum) {
                        checkSuccess = true;
                    }

                    // changeRoom(bestPlan.Schedule, possibledatecombination[datecombin])
                    // changeRoom(bestPlan.Schedule, finalduration)
                    // finalResultOfPlans.push(bestPlan);
                    for (var timeslot = 0; timeslot < bestPlan.Schedule.length; timeslot++) {
                        if (bestPlan.Schedule[timeslot].StudentAy.find((presentation) => presentation.appears == 1) != undefined) {
                            if (checkSuccess) {
                                insertbox(datecombin, bestPlan.Schedule[timeslot].StudentAy.find((presentation) => presentation.appears == 1),
                                    bestPlan.Schedule[timeslot].SQLdate, bestPlan.Schedule[timeslot].SQLtime, bestPlan.Schedule[timeslot].room, "Successful", req.body.typeOfPresent)
                            } else {
                                await checkAnyManalHandling(bestPlan, datecombin)
                                insertbox(datecombin, bestPlan.Schedule[timeslot].StudentAy.find((presentation) => presentation.appears == 1),
                                    bestPlan.Schedule[timeslot].SQLdate, bestPlan.Schedule[timeslot].SQLtime, bestPlan.Schedule[timeslot].room, "Manual Handling", req.body.typeOfPresent)

                            }

                        }
                    }
                    console.log(checkSuccess, " here")
                    if (checkSuccess) {

                        finalResultOfPlans.push(JSON.parse(JSON.stringify({ planNo: datecombin, planStatus: 0, Penalty: bestPlan.Penalty, tacklecount: bestPlan.tacklecount })))
                    } else {
                        //                         var checkNewPatched = await checkAnyManalHandling(bestPlan, datecombin)
                        // Print(checkNewPatched)
                        //                         countTackle(checkNewPatched);
                        //                         checkNewPatched.Penaltymark = await Penalty(checkNewPatched)
                        //                         bestPlan = checkNewPatched;
                        await checkAnyManalHandling(bestPlan, datecombin)
                        bestPlan = await checkAnyManalHandling(bestPlan, datecombin)
                        if (bestPlan.tacklecount == totalStudNum) {
                            checkSuccess = true;
                        }
                        if (checkSuccess) {
                            finalResultOfPlans.push(JSON.parse(JSON.stringify({ planNo: datecombin, planStatus: 0, Penalty: bestPlan.Penalty, tacklecount: bestPlan.tacklecount })))

                        } else {
                            finalResultOfPlans.push(JSON.parse(JSON.stringify({ planNo: datecombin, planStatus: 1, Penalty: bestPlan.Penalty, tacklecount: bestPlan.tacklecount })))
                        }
                    }

                }
                console.log("current results ", finalResultOfPlans)

            }
        }
        // AllPopulation.forEach((element)=>{
        //     Print(element)
        // })
        var ProcessEnd = new Date();
        console.log("Whole Excecution Time  ", ((ProcessEnd.getTime() - ProcessStart.getTime()) / 1000), " Seconds");
        console.log("Average Time used for ", finalResultOfPlans.length, " Plans", ((ProcessEnd.getTime() - ProcessStart.getTime()) / 1000 / finalResultOfPlans.length), " Seconds");

        finalResultOfPlans.sort((a, b) => a.Penalty - b.Penalty || b.tacklecount - a.tacklecount || a.planNo - b.planNo)
        console.log(finalResultOfPlans)
        return res.redirect("/scheduledesign/scheduleList?planNo=" + finalResultOfPlans[0].planNo);

    },

    nqueenversion: async function (req, res) {
        console.log("\n\nStart Processing with N-queen version");

        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        console.log(req.body);

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
        while (designdate.toLocaleDateString("en-GB") <= setting3.presentenddate.toLocaleDateString("en-GB")) {
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
        // console.log(presentperiod)
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
        var preSetClassroomList = req.body.roomList

        // // gen combination of date for possible plans
        // var presentperiod = new Array();
        // var possibledatecombination = new Array();
        // var designdate = new Date();
        // designdate.setTime(setting3.presentstartdate.getTime());
        // // console.log(">>designdate", designdate.toLocaleDateString("en-GB")," ",designdate.toLocaleTimeString("en-GB"));
        // while (designdate.toLocaleDateString("en-GB") != setting3.presentenddate.toLocaleDateString("en-GB")) {
        //     // console.log(">>designdate2", designdate.toLocaleDateString("en-GB")," ",designdate.toLocaleTimeString("en-GB"));
        //     if (designdate.getDay() != 0) {
        //         presentperiod.push(designdate);
        //     }

        //     // console.log(">>presentperiod ",presentperiod);
        //     // presentperiod.forEach(item=>{
        //     //     console.log(">>designdate3 ", item.toLocaleDateString("en-GB")," ",item.toLocaleTimeString("en-GB"));
        //     // })
        //     // console.log("\n");
        //     designdate = new Date(designdate.getTime() + 60 * 60 * 24 * 1000);
        //     // console.log(">>designdate", designdate.toLocaleDateString("en-GB")," ",designdate.toLocaleTimeString("en-GB"));
        // }
        // for (var a = 0; a < presentperiod.length; a++) {
        //     var ans = copyarray(presentperiod);
        //     var combinationforthisday = new Array();
        //     for (var b = 0; b < a; b++) {
        //         ans.shift(ans[b]);
        //     }
        //     // console.log(">>after cutting top ",ans,"\n")
        //     for (var b = presentperiod.length - 1; b >= a; b--) {
        //         // console.log(">>cutting bottom ",ans,"\n")
        //         var copycopy = copyarray(ans);
        //         combinationforthisday.push(copycopy)
        //         // console.log(">>combinationforthisday ",combinationforthisday)
        //         ans.pop(ans[b]);

        //     }
        //     // console.log(">>final combinationforthisday ",combinationforthisday)
        //     combinationforthisday.forEach(item => { possibledatecombination.push(item); })
        // }
        // possibledatecombination.sort((a, b) => a.length - b.length);
        // var preSetClassroomList = ['FSC801C', 'FSC801D', 'FSC901C', 'FSC901D', 'FSC901E', 'RRS638', 'RRS735']

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
            if (req.body.typeOfPresent == "final") {
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
            if (selectedArray == null) {
                return PresentationList;
            }
            if (selectedArray.length == 0) { return PresentationList; }

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

        function reduceByCombination(SchedulePlans, PresentationList, thistimeslot, timeslotCombin) {
            var needremoval = false;
            var count = 0;
            // console.log("reduceByCombinationProblem")
            var removeElement = new Array();
            SchedulePlans.forEach(plans => {
                var count = 0;
                plans.Schd[thistimeslot].forEach(ScheduledPresent => {
                    if (timeslotCombin.find((element) => element.SID == ScheduledPresent.SID)) {
                        count++;
                    } else {

                        removeElement.push(ScheduledPresent);
                    }
                });
                if (count == timeslotCombin.length) {
                    needremoval = true;
                }
            });
            removeElement = uniquePresentationList(removeElement);

            PresentationList = reducePairBySID(removeElement, PresentationList);
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
        function checkDuplicate(arr1, arr2) {

            const objectsEqual = (o1, o2) => {
                if (o2 === null && o1 !== null) return false;
                return o1 !== null && typeof o1 === 'object' && Object.keys(o1).length > 0 ?
                    Object.keys(o1).length === Object.keys(o2).length &&
                    Object.keys(o1).every(p => objectsEqual(o1[p], o2[p]))
                    : (o1 !== null && Array.isArray(o1) && Array.isArray(o2) && !o1.length &&
                        !o2.length) ? true : o1 === o2;
            }
            return objectsEqual(arr1, arr2);
        }
        var totalStudNum = await getStudentnum();
        var finalResultOfPlans = new Array();
        console.log("Total plans requires process", possibledatecombination.length, "\n\n")
        var ProcessStart = new Date();
        // for (var datecombin = 14; datecombin < possibledatecombination.length; datecombin++) {
        for (var datecombin = possibledatecombination.length - 1; datecombin < possibledatecombination.length; datecombin++) {
            var SchedulesforThisDateCombin = new Array();
            console.log("Current process status ", calcPercentage((datecombin + 1), possibledatecombination.length))
            var uniquetimeslotcounts = await checkuniquetimeslotcountforoneday(possibledatecombination[datecombin]);
            var Successfulplannum = 0;
            var SelectedPlan;
            var PlanProcessStart = new Date();
            // console.log(uniquetimeslotcounts);
            for (var possibleplan = 0; possibleplan < 1000; possibleplan++) {
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
                    for (var room = 0; room < preSetClassroomList.length; room++) {
                        var roomttbresult = false;
                        var roomtimeslotresult = false;
                        if (req.body.typeOfPresent == "final") {

                            if (req.body.ClassroomTTB == "Yes") {
                                roomttbresult = await checkclassroomttb(preSetClassroomList[room], sessionstarttime.getDay(), sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                            } else {
                                roomttbresult = true;
                            }
                            var roomtimeslotresult = await checkclassroomtimeslot(preSetClassroomList[room], sqldatestring, sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                            if (roomttbresult && roomtimeslotresult) {
                                // roomcount++;
                                availableclassroomlist.push(preSetClassroomList[room])
                            }
                        } else {
                            if (req.body.ClassroomTTB == "Yes") {
                                roomttbresult = await checkclassroomttb(preSetClassroomList[room], sessionstarttime.getDay(), sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                            } else {
                                roomttbresult = true;
                            }
                            var roomtimeslotresult = await checkclassroomtimeslot(preSetClassroomList[room], sqldatestring, sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                            if (roomtimeslotresult) {
                                // roomcount++;
                                availableclassroomlist.push(preSetClassroomList[room])
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
                if (SchedulesforThisDateCombin.length == 0) {
                    SchedulesforThisDateCombin.push(ScheduleJSON);
                } else if (SchedulesforThisDateCombin[0].Untackle >= ScheduleJSON.Untackle) {
                    SchedulesforThisDateCombin.push(ScheduleJSON);
                    SchedulesforThisDateCombin = copyarray(SchedulesforThisDateCombin.filter((element) => element.Untackle == ScheduleJSON.Untackle));
                }

                // if (Successfulplannum > 0.005 * (combinations(totalStudNum, 4))) { //case for many No untackled plans
                if (ScheduleJSON.Untackle == 0) { //case for getting the first Successful Plan
                    // console.log("Having this number of successful plan", Successfulplannum)



                    /**
                     * case for many No untackled plans
                     
                    if ( SchedulesforThisDateCombin.filter((plans) => plans.Preference == true).length > 0) {
                        SchedulesforThisDateCombin =  SchedulesforThisDateCombin.filter((plans) => plans.Preference == true);
                    }
                    SelectedPlan = randomNum(SchedulesforThisDateCombin);
                    */


                    SelectedPlan = ScheduleJSON;
                    console.log("case 1")
                    break;
                    // } else if ((0.05 * (combinations(totalStudNum, 4)))+1  >= SchedulesforThisDateCombin.length && SchedulesforThisDateCombin.length >= 0.05 * (combinations(totalStudNum, 4))){
                } else if (possibleplan % 100 == 0) {

                    SchedulesforThisDateCombin.sort(function (a, b) { return a.Untackle - b.Untackle; })
                    var untackledMinIndex = SchedulesforThisDateCombin[0].Untackle;
                    var CurrentEnd = new Date();
                    console.log("Current Excecution Time  ", ((CurrentEnd.getTime() - PlanProcessStart.getTime()) / 1000), " Seconds");
                    console.log(">> check point ", possibleplan, " Min untacklecd == ", untackledMinIndex)
                    // var uniqueUntackle = new Array();
                    // SchedulesforThisDateCombin.forEach(element => {
                    //     if (!uniqueUntackle.find((number) => number == element.Untackle)) {
                    //         uniqueUntackle.push(element.Untackle);
                    //     }
                    // });
                    // console.log(">> CheckPoint 5% this plan has the following untackle values", uniqueUntackle);
                    // console.log("case 2")
                } else if (possibleplan == 999) {
                    console.log("case 3")
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
                    console.log("Selected Plan here ", SelectedPlan);
                    SelectedPlan = SchedulesforThisDateCombin[SelectedPlan];
                    break;
                }

            }
            var PlanProcessEnd = new Date();
            console.log("Plan Excecution Time  ", ((PlanProcessEnd.getTime() - PlanProcessStart.getTime()) / 1000), " Seconds");
            /** change the SelectedPlan insert to SQL */


            console.log(SelectedPlan)
            console.log("For datecombination: ", (datecombin + 1), "  Untackle Case Count:  ", SelectedPlan.Untackle, "   Successful rate:  ", calcPercentage((totalStudNum - SelectedPlan.Untackle), totalStudNum))

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
                        insertbox((datecombin + 1), SelectedPlan.Schd[timeslot][room], sqldatestring, sessionstarttime, "Successful", req.body.typeOfPresent);
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

                        insertbox((datecombin + 1), SelectedPlan.Schd[timeslot][room], sqldatestring, sessionstarttime, "Manual Handling", req.body.typeOfPresent);
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
            //             insertbox((datecombin + 1), SelectedPlan.Schd[timeslot][room], sqldatestring, sessionstarttime, "Successful", req.body.typeOfPresent);
            //         } else {
            //             finalResultOfPlans.push(JSON.parse(JSON.stringify({ planNo: (datecombin + 1), planStatus: 1 })))
            //             insertbox((datecombin + 1), SelectedPlan.Schd[timeslot][room], sqldatestring, sessionstarttime, "Manual Handling", req.body.typeOfPresent);
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
        console.log(finalResultOfPlans)
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
        // var presentperiod = new Array();
        // var possibledatecombination = new Array();
        // var designdate = new Date();
        // designdate.setTime(setting3.presentstartdate.getTime());
        // // console.log(">>designdate", designdate.toLocaleDateString("en-GB")," ",designdate.toLocaleTimeString("en-GB"));
        // while (designdate.toLocaleDateString("en-GB") != setting3.presentenddate.toLocaleDateString("en-GB")) {
        //     // console.log(">>designdate2", designdate.toLocaleDateString("en-GB")," ",designdate.toLocaleTimeString("en-GB"));
        //     if (designdate.getDay() != 0) {
        //         presentperiod.push(designdate);
        //     }

        //     // console.log(">>presentperiod ",presentperiod);
        //     // presentperiod.forEach(item=>{
        //     //     console.log(">>designdate3 ", item.toLocaleDateString("en-GB")," ",item.toLocaleTimeString("en-GB"));
        //     // })
        //     // console.log("\n");
        //     designdate = new Date(designdate.getTime() + 60 * 60 * 24 * 1000);
        //     // console.log(">>designdate", designdate.toLocaleDateString("en-GB")," ",designdate.toLocaleTimeString("en-GB"));
        // }

        // console.log(">>presentperiod", presentperiod);

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
        while (designdate.toLocaleDateString("en-GB") <= setting3.presentenddate.toLocaleDateString("en-GB")) {
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
        // console.log(presentperiod)
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
        var preSetClassroomList = req.body.roomList
        // for (var a = 0; a < presentperiod.length; a++) {
        //     var ans = copyarray(presentperiod);
        //     var combinationforthisday = new Array();
        //     for (var b = 0; b < a; b++) {
        //         ans.shift(ans[b]);
        //     }
        //     // console.log(">>after cutting top ",ans,"\n")
        //     for (var b = presentperiod.length - 1; b >= a; b--) {
        //         // console.log(">>cutting bottom ",ans,"\n")
        //         var copycopy = copyarray(ans);
        //         combinationforthisday.push(copycopy)
        //         // console.log(">>combinationforthisday ",combinationforthisday)
        //         ans.pop(ans[b]);

        //     }
        //     // console.log(">>final combinationforthisday ",combinationforthisday)
        //     combinationforthisday.forEach(item => { possibledatecombination.push(item); })
        // }
        // possibledatecombination.sort((a, b) => a.length - b.length);
        // // console.log(">> final possibledatecombination ", possibledatecombination)

        // var preSetClassroomList = ['FSC801C', 'FSC801D', 'FSC901C', 'FSC901D', 'RRS638']
        // // console.log(">> preSetClassroomList ", preSetClassroomList);
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
            if (req.body.typeOfPresent == "final") {
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
            // ((date(\"" + dateoftoday + " " + endtime + "\") between Date(concat(startdate,\" \",starttime)) and date(concat(enddate,\" \",endtime))) and (date(\"" + dateoftoday + " " + starttime + "\") between Date(concat(startdate,\" \",starttime)) and date(concat(enddate,\" \",endtime)))
            // console.log("select * from  allclassroomtimeslot where RID = \"" + classroom + "\" and   ((date(\"" + dateoftoday + " " + endtime + "\") between Date(concat(startdate,\" \",starttime)) and date(concat(enddate,\" \",endtime))) and (date(\"" + dateoftoday + " " + starttime + "\") between Date(concat(startdate,\" \",starttime)) and date(concat(enddate,\" \",endtime))))")
            var checking = await new Promise((resolve) => {
                pool.query("select * from  allclassroomtimeslot where RID = \"" + classroom + "\" and  ((date(\"" + dateoftoday + " " + endtime + "\") between Date(concat(startdate,\" \",starttime)) and date(concat(enddate,\" \",endtime))) and (date(\"" + dateoftoday + " " + starttime + "\") between Date(concat(startdate,\" \",starttime)) and date(concat(enddate,\" \",endtime))))", (err, results) => {
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
            // console.log("checking in room timeslot ", checking)
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
                type: req.body.typeOfPresent,
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
            if (req.body.typeOfPresent == "final") {
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
            if (req.body.typeOfPresent == "final") {
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
        for (var a = possibledatecombination.length - 1; a < possibledatecombination.length; a++) {
            // for (var a = 0; a < 1; a++) {
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
                for (var d = 0; d < req.body.roomList.length; d++) {
                    var roomttbresult = false;
                    var roomtimeslotresult = false;
                    if (req.body.typeOfPresent == "final") {
                        if (req.body.ClassroomTTB == "Yes") {
                            roomttbresult = await checkclassroomttb(preSetClassroomList[d], sessionstarttime.getDay(), sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                        } else {
                            roomttbresult = true;
                        }
                        var roomtimeslotresult = await checkclassroomtimeslot(preSetClassroomList[d], sqldatestring, sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                        if (roomttbresult && roomtimeslotresult) {
                            availableclassroomlist.push(preSetClassroomList[d]);
                        }
                    } else {
                        var roomtimeslotresult = await checkclassroomtimeslot(preSetClassroomList[d], sqldatestring, sessionstarttime.toLocaleTimeString("en-GB"), sessionendtime.toLocaleTimeString("en-GB"));
                        if (roomtimeslotresult) {
                            availableclassroomlist.push(preSetClassroomList[d]);
                        }
                    }

                }

                console.log("availableclassroomlist.length   ", availableclassroomlist.length, availableclassroomlist)
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

            console.log("maualhandlecase ", manualhandlecase)

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
                    if (req.body.typeOfPresent == "final") {
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

        var checkplanduration = await processArray(successschedule)




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
        var getallsupervisor = "select tid,submission from supervisor"
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
                        return res.status(401).json("error happened when excuting ScheduleController.nodraft.getallinfo.retrievepairinglist");
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
        // console.log("in schedulelist",plannumber)
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
                return res.status(401).json("Error happened when excuting ScheduleController.checksetting")
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
            + "and availabledate in (select availabledate from threeparty where sid = \"" + CurrentBox.SID + "\"  and tid = \"" + CurrentBox.TID + "\" and oid = \"" + CurrentBox.OID + "\") "
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
            // var getRoomquery = "select distinct(rid) as Room from classroom where Campus = \"" + req.query.Campus + "\" and status = \"Open\" and rid != \"\" "
            //     + " and (rid not in (select rid from allclass where Campus = \"" + req.query.Campus + "\" and weekdays = \"" + newdate.getDay() + "\" and (endtime > time(\"" + newdate.toLocaleTimeString("en-GB") + "\") and time(\"" + newdate.toLocaleTimeString("en-GB") + "\") > starttime)) "
            //     + " and rid not in (select rid from allclassroomtimeslot where Campus =  \"" + req.query.Campus + "\" and (timestamp(concat(StartDate,\" \",startTime)) < timestamp(\"" + timestampstring + "\") and timestamp(concat(endDate,\" \",endTime)) > timestamp(\"" + timestampstring + "\")))"
            //     + " and concat(campus,rid) not in (select concat(campus,rid) from allschedulebox where boxdate = \"" + timestampstring + "\"));"
            // ;
            var getRoomquery = "select distinct(rid) as Room  from classroom where Campus = \"" + req.query.Campus + "\" and status = \"Open\" and rid !=\"\" "
                + "and (rid not in (select rid from allclass where Campus =\"" + req.query.Campus + "\" and weekdays = \"" + newdate.getDay() + "\" and (time(\"" + newdate.toLocaleTimeString("en-GB") + "\") between starttime and endtime)  ))"
                + "and (rid not in (select rid from allclassroomtimeslot where Campus = \"" + req.query.Campus + "\" and (time(\"" + newdate.toLocaleTimeString("en-GB") + "\") between starttime and endtime)  )) "
                + "and (rid not in (select rid from allschedulebox where boxdate = \"" + timestampstring + "\"))"
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

    getData2: async function (req, res) {
        var pool = await sails.helpers.database2();
        var getRoom = await new Promise((resolve) => {
            pool.query("select rid from classroom where Campus = \"" + req.query.Campus + "\"", (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                resolve(ans)
            })
        }).catch((err) => {
            console.log("Error happened in ScheduleController.getData")
        })
        return res.status(200).json(getRoom)
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

    ReGen: async function (req, res) {

        const importer = await sails.helpers.importer()
        //console.log(importer)
        // Recursive function to get files
        const fs = require("fs");

        const sqlfiles = '../SQL/Standard/RemoveFile/RemoveAllSchedule.sql'

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

        // var getManualBox = await new Promise((resolve) => {
        //     db.query("select t2.sid as StuID, t1.supname as SupName, t3.supname as ObsName from manualhandlecase as t2 left join supervisor as t1 on t1.tid =t2.tid left join supervisor as t3 on t3.tid = t2.oid where planno = \"" + req.body.planNo + "\"", (err, res) => {
        //         try {
        //             var string = JSON.stringify(res);
        //             var json = JSON.parse(string);
        //             var ans = json;
        //             resolve(ans)
        //         } catch (err) { console.log(err) }

        //     })
        // }).catch((err) => {
        //     errmsg = "error happened in ScheduleController.outputCSV.getPlanBox"
        // })

        const opts = {};
        const parser = new Parser(opts);
        const csv = parser.parse(getPlanBox);

        // const parser2 = new Parser(opts);
        // const csv2 = parser2.parse(getManualBox);


        // console.log(csv);
        // console.log(csv2);
        return res.json(csv);
    },

    Select: async function (req, res) {
        var db = await sails.helpers.database();

        var removepreviousselection = await new Promise((resolve) => {
            db.query("update allschedulebox set planstatus = \"Success\" where planno != \"" + req.body.planNo + "\" and planstatus = \"Selected\"", (err, res) => {
                try {
                    console.log(
                        "update previous selection as Success"
                    )
                    resolve(res)
                } catch (err) { console.log(err) }

            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.Select.removepreviousselection"
        })

        var updateQu = await new Promise((resolve) => {
            db.query("update allschedulebox set planstatus = \"Selected\" where planno = \"" + req.body.planNo + "\"", (err, res) => {
                try {
                    console.log(
                        "update current selection as Selected"
                    )
                    resolve(res)
                } catch (err) { console.log(err) }

            })
        }).catch((err) => {
            errmsg = "error happened in ScheduleController.Select.updateQu"
        })
        return res.status(200).json("ok");
    }


}
