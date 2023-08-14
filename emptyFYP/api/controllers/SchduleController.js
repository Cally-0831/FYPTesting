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
        console.log("\n\n\n\n\n");
        let thisistheline = "Select draft from supervisor  where tid = \"" + req.session.userid + "\"";
        db.query(thisistheline, (err, results) => {
            if (err) {
                return res.status(401).json("Error happened when updating")
            } else {
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                if (json[0].draft == "N") {
                    thisistheline = "Update supervisor set draft= \"Y\" where tid = \"" + req.session.userid + "\"";
                    db.query(thisistheline, (err, results) => {
                        if (err) { return res.status(401).json("Error happened when updating") }
                    });
                } else {
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
                        var thisistheline2 = "select allclass.CID, allclass.rid, allclass.weekdays,allclass.startTime,allclass.endTime,allsupertakecourse.confirmation,allsupertakecourse.Submissiontime from allsupertakecourse inner join allclass on allclass.cid = allsupertakecourse.cid and PID=\"" + req.session.userid + "\" ORDER BY  startTime asc, weekdays asc";
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
                                //console.log('>> personalrequestlist: ', personalrequestlist);
                                var thisistheline4 = "select *  from classroom inner join allclass where classroom.Campus = allclass.Campus and classroom.RID = allclass.RID";
                                /** Get classroom's ttb */
                                db.query(thisistheline4, (err, results) => {
                                    var string = JSON.stringify(results);
                                    var json = JSON.parse(string);
                                    var classroomusagelist = json;
                                    console.log('>> classroomusagelist: ', classroomusagelist);
                                    var thisistheline5 = "select *  from allclassroomtimeslot where ((startdate between \"" + startstart + "\" and \"" + endend + "\") or (enddate between \"" + startstart + "\" and \"" + endend + "\"))";
                                    /** Get classroom's unavailble timeslot */
                                    db.query(thisistheline5, (err, results) => {
                                        var string = JSON.stringify(results);
                                        var json = JSON.parse(string);
                                        var classroomtimeslotlist = json;
                                        //     console.log('>> classroomtimeslotlist: ', classroomtimeslotlist);
                                        return res.view("user/createdraft", {
                                            pagenum: req.params.Page,
                                            orgstart: orgstart,
                                            startdate: ansstartdate, enddate: ansenddate,

                                            personalrequestlist: personalrequestlist, personalttb: personalttb,
                                            classroomusagelist: classroomusagelist, classroomtimeslotlist: classroomtimeslotlist
                                        });
                                    });
                                });

                            });
                        })

                    });

                }
            }
        });




    },
}