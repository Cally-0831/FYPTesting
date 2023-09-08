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

    listallnotice: async function (req, res) {
        var noticelist;

        if (req.session.role == "adm") {
            let thisistheline = "SELECT  NID, allusersname,content,CreateDate,Creatorname,title from allnotice inner join allusers on allnotice.Creator = allusers.pid order by allnotice.CreateDate DESC;";
            //  console.log(thisistheline)
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    var json = JSON.parse(string);
                    noticelist = json;
                    //         console.log('>> noticelist: ', noticelist);
                    return res.view('user/notice', { thisusernoticetlist: noticelist });
                } catch (err) {
                    console.log("sth happened here");

                }


            });
        } else if (req.session.role == "sup") {
            let thisistheline = " SELECT  allnotice.NID, allusers.allusersname,allnotice.content,allnotice.CreateDate,allnotice.Creator,allnotice.Creatorname,allnotice.title from allnotice" +
                "\ninner join allusers on allnotice.Creator = allusers.pid "
                + " where allnotice.creator = \"admin\" or allnotice.creator= \"" + req.session.userid + "\" order by allnotice.CreateDate DESC;";

            //    console.log(thisistheline)
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    //console.log('>> string: ', string );
                    var json = JSON.parse(string);
                    //console.log('>> json: ', json);  
                    noticelist = json;
                    //            console.log('>> noticelist: ', noticelist);
                    return res.view('user/notice', { thisusernoticetlist: noticelist });
                } catch (err) {
                    console.log("sth happened here");
                }
            });
        } else {
            let thisistheline = "select distinct allnotice.nid, allnotice.Creator,allnotice.Creatorname,allnotice.CreateDate, allnotice.title, allnotice.content from allnotice "
                + "inner join  supervisorpairstudent on supervisorpairstudent.sid=\"" + req.session.userid + "\" "
                + "and  allnotice.Creator =supervisorpairstudent.tid or allnotice.type= \"1\" order by allnotice.CreateDate DESC;"
            console.log(thisistheline)
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    //console.log('>> string: ', string );
                    var json = JSON.parse(string);
                    //console.log('>> json: ', json);  
                    noticelist = json;
                    //       console.log('>> noticelist: ', noticelist);
                    return res.view('user/notice', { thisusernoticetlist: noticelist });
                } catch (err) {
                    console.log("sth happened here");
                }
            });
        }

    },

    addnotice: async function (req, res) {
        console.log(req.body);
        let nid = 'nid';
        var thisistheline;

        if (req.body.id == undefined) {
            // not setting related notices

            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < 5) {
                nid += characters.charAt(Math.floor(Math.random() * charactersLength));
                counter += 1;
            }
            thisistheline = "insert into allnotice values(\"" + nid + "\",\"" + req.session.userid + "\",\"" + req.session.username + "\",now(), \"" + req.body.level + "\",\"" + req.body.title + "\",\"" + req.body.content + "\"\);"
            console.log(thisistheline);
            db.query(thisistheline, (err, results) => {
                try {
                    console.log("insert new notice");
                } catch (err) {
                    console.log("error happened when excuteing NoticeListController: addnotice");
                }


            });
        } else if (req.body.oldid != "") {
            // setting related notice and is an update

            thisistheline = "select * from allsupersetting where stid=\"" + req.body.oldid + "\"";
            console.log(thisistheline)
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    var json = JSON.parse(string);
                    var oldinfo = json;
                    console.log('>> oldinfo: ', oldinfo);

                    thisistheline = "select * from allsupersetting where stid=\"" + req.body.id + "\"";
                    console.log(thisistheline)

                    db.query(thisistheline, (err, results) => {
                        try {
                            var string = JSON.stringify(results);
                            var json = JSON.parse(string);
                            var newinfo = json;
                            console.log('>> newinfo: ', newinfo);
                            if (oldinfo[0].typeofsetting != 3) {
                                var updatedate = (new Date(newinfo[0].deadlinedate)).toLocaleDateString("en-GB").split("/");
                                console.log(updatedate)

                                thisistheline = "update allsupersetting set deadlinedate = \"" + updatedate[2] + "-" + updatedate[1] + "-" + updatedate[0] + "\" ,deadlinetime= \"" + newinfo[0].deadlinetime + "\", LastUpdate = now(), Announcetime = now() where stid=\"" + req.body.oldid + "\"";
                                console.log(thisistheline)

                                db.query(thisistheline, (err, results) => {
                                    try {

                                        console.log('done update');
                                        thisistheline = "delete from allsupersetting where stid=\"" + req.body.id + "\"";
                                        console.log(thisistheline)
                                        db.query(thisistheline, (err, results) => {
                                            try {

                                                console.log('done delete');
                                                nid += req.body.id;
                                                thisistheline = "insert into allnotice values(\"" + nid + "\",\"" + req.session.userid + "\",\"" + req.session.username + "\",now(),\"" + req.body.level + "\",\"" + req.body.title + "\",\"" + req.body.content + "\"\);"
                                                console.log(thisistheline);
                                                db.query(thisistheline, (err, results) => {
                                                    try {
                                                        console.log("insert new notice");
                                                        if (oldinfo[0].typeofsetting == 1) {
                                                            thisistheline = "update student set student.ttbdeadline = \"" + updatedate[2] + "-" + updatedate[1] + "-" + updatedate[0] + " " + newinfo[0].deadlinetime + "\" where student .sid in (select distinct(supervisorpairstudent.sid) from allsupersetting join supervisorpairstudent on allsupersetting.Creator = \"" + req.session.userid + "\");";
                                                            console.log(thisistheline)
                                                            db.query(thisistheline, (err, results) => {
                                                                if (err) { console.log("error happened when excuteing NoticeListController: addnotice"); }
                                                            })
                                                        } else {
                                                            thisistheline = "update student set student.requestdeadline = \"" + updatedate[2] + "-" + updatedate[1] + "-" + updatedate[0] + " " + newinfo[0].deadlinetime + "\" where student .sid in (select distinct(supervisorpairstudent.sid) from allsupersetting join supervisorpairstudent on allsupersetting.Creator = \"" + req.session.userid + "\");";
                                                            console.log(thisistheline)
                                                            db.query(thisistheline, (err, results) => {
                                                                if (err) { console.log("error happened when excuteing NoticeListController: addnotice"); }
                                                            })
                                                        }
                                                    } catch (err) {
                                                        console.log("error happened when excuteing NoticeListController: addnotice");
                                                    }
                                                });
                                            } catch (err) {
                                                console.log("error happened when excuteing NoticeListController: addnotice");
                                            }
                                        });
                                    } catch (err) {
                                        console.log("error happened when excuteing NoticeListController: addnotice");
                                    }
                                });

                            } else {
                                var updatestartdate = (new Date(newinfo[0].startdate)).toLocaleDateString("en-GB").split("/");
                                var updateenddate = (new Date(newinfo[0].enddate)).toLocaleDateString("en-GB").split("/");
                                thisistheline = "update allsupersetting set startdate = \"" + updatestartdate[2] + "-" + updatestartdate[1] + "-" + updatestartdate[0] + "\" , starttime= \"" + newinfo[0].starttime + "\", enddate = \"" + updateenddate[2] + "-" + updateenddate[1] + "-" + updateenddate[0] + "\", endtime = \"" + newinfo[0].endtime + "\" , LastUpdate = now(), Announcedtime = now()  where stid=\"" + req.body.oldid + "\"";
                                console.log(thisistheline)

                                db.query(thisistheline, (err, results) => {
                                    try {

                                        console.log('done update');
                                        thisistheline = "delete from allsupersetting where stid=\"" + req.body.id + "\"";
                                        console.log(thisistheline)
                                        db.query(thisistheline, (err, results) => {
                                            try {

                                                console.log('done delete');
                                                nid += req.body.id;
                                                thisistheline = "insert into allnotice values(\"" + nid + "\",\"" + req.session.userid + "\",\"" + req.session.username + "\",now(),\"" + req.body.level + "\",\"" + req.body.title + "\",\"" + req.body.content + "\"\);"
                                                console.log(thisistheline);
                                                db.query(thisistheline, (err, results) => {
                                                    try {
                                                        console.log("insert new notice");
                                                    } catch (err) {
                                                        console.log("error happened when excuteing NoticeListController: addnotice");
                                                    }
                                                });
                                            } catch (err) { console.log("error happened when excuteing NoticeListController: addnotice"); }
                                        });
                                    } catch (err) { console.log("error happened when excuteing NoticeListController: addnotice"); }
                                });
                            }
                        } catch (err) { console.log("error happened when excuteing NoticeListController: addnotice"); }
                    });
                } catch (err) { console.log("error happened when excuteing NoticeListController: addnotice"); }
            });
        } else {
            //setting related but the first notice of this type
            nid += req.body.id;
            thisistheline = "insert into allnotice values(\"" + nid + "\",\"" + req.session.userid + "\",\"" + req.session.username + "\",now(),\"" + req.body.level + "\",\"" + req.body.title + "\",\"" + req.body.content + "\"\);"
            console.log(thisistheline);
            db.query(thisistheline, (err, results) => {
                try {
                    console.log("insert new notice");
                } catch (err) { console.log("error happened when excuteing NoticeListController: addnotice"); }
            });
        }
        var sendemaillist;
        if (req.body.level == 1) {
            thisistheline = "select pid as emailadd from allusers"
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    var json = JSON.parse(string);
                    sendemaillist = json;

                    return res.status(200).json({type:req.body.level,sendemaillist:sendemaillist});
                } catch (err) { console.log("error happened when excuteing NoticeListController: addnotice"); }
            });
        } else if (req.body.level == 3) {
            thisistheline = "select tid as emailadd from supervisor"
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    var json = JSON.parse(string);
                    sendemaillist = json;
                    return res.status(200).json({type:req.body.level,sendemaillist:sendemaillist});
                } catch (err) { console.log("error happened when excuteing NoticeListController: addnotice"); }
            });
        }


    },

    viewnoticepage: async function (req, res) {

        if (req.query.type == null) {
            return res.view('user/createnewnotice', { title: null, content: null, id: null });
        }


        var title;
        var content;

        if (req.query.type == 0) {
            title = "Deadline for Submitting Sememster Timetable";
            content = "The deadline of submitting semester timetable has been set as follows:\n"
                + "Date: " + req.query.date
                + "\nTime: " + req.query.time
                + "\n\nPlease be remined that to upload your timetable pic from Buniport as proof."
                + "\nSubmission without valid proof will not be reviewd by Supervisor."
                + "\n\nFor Student who enrolled 0 course this sememster, should all input an entry as a declaration."
        } else if (req.query.type == 1) {
            title = "Deadline for Submitting Unavailable Timeslots";
            content = "The deadline of submitting unavailable timeslots has been set as follows:\n"
                + "Date: " + req.query.date
                + "\nTime: " + req.query.time
                + "\n\nPlease be remined that to upload a valid proof."
                + "\nSubmission without valid proof will not be reviewd by Supervisor."
                + "\n\nReasons like part-time job will not be approved."
        } else if (req.query.type == 2) {
            title = "Presentation Period Date";
            content = "The presentation period date has been set as follows:\n"
                + "From : " + req.query.startdate + " , " + req.query.starttime + "\n"
                + "To   : " + req.query.enddate + " , " + req.query.endtime
                + "\n\nStudents should start applying their unavaliable timeslots for the presentation period."
                + "\nReasons like parttime job will not be acceptable."
                + "\n\nPlease be reminded that to provide valid proof to your supervisor when submitting the request,"
                + "\nor else the request will not be consider."

        } else if (req.query.type == 3) {
            title = "Presentation Schdeule Release Date";
            content = "The release date for presentation schdeule has been set as follows:\n"
                + "Date: " + req.query.date
                + "\nTime: " + req.query.time
                + "\n\nAll users can check and their personal timeslots after the release of the schdeule."

        } else if (req.query.type == 4) {
            title = "Deadline for Student List Upload";
            content = "The deadline of uploading student list has been set as follows:\n"
                + "Date: " + req.query.date
                + "\nTime: " + req.query.time
                + "\n\n After gathering all the student list from supervisors, observer for students will be arranged."

        }
        console.log(req.query)

        return res.view('user/createnewnotice', { title: title, content: content, id: req.query.STID, oldid: req.query.oldSTID, level: req.query.level });





    }
}