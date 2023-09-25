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

    getview: async function (req, res) {
        let thisistheline = "select deadlinedate,deadlinetime from allsupersetting where  typeofsetting =\"2\" and Announcetime is not null";
        db.query(thisistheline, (err, results) => {
            try {

                var deadline;
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                if (json[0] != null) {
                    var deadline = new Date(json[0].deadlinedate);
                    var deadlinetime = json[0].deadlinetime.split(":");
                    deadline.setHours(deadlinetime[0]);
                    deadline.setMinutes(deadlinetime[1]);
                    deadline.setSeconds(deadlinetime[2]);

                    console.log('>> request deadline: ', deadline);
                }
                return res.view('user/submitrequest', { theday: deadline });



            } catch (err) {
                console.log("sth happened here");

            }
        })
    },

    listrequest: async function (req, res) {
        var requestlist;

        if (req.session.role == "sup") {
            let thisistheline = "SELECT * FROM allrequestfromsupervisor where tid = \"" + req.session.userid + "\"\;";
            //console.log(thisistheline)
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    //console.log('>> string: ', string );
                    var json = JSON.parse(string);
                    //console.log('>> json: ', json);  
                    requestlist = json;
                    // console.log('>> stdlist: ', requestlist);
                    return res.view('user/checkrequest', { thisuserRequestlist: requestlist });
                } catch (err) {
                    console.log("sth happened here");

                }


            });
        } else if (req.session.role == "obs") {
            let thisistheline = "SELECT * FROM allrequestfromobserver where oid = \"" + req.session.userid + "\"\;";
            //console.log(thisistheline)
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    //console.log('>> string: ', string );
                    var json = JSON.parse(string);
                    //console.log('>> json: ', json);  
                    requestlist = json;
                    // console.log('>> stdlist: ', requestlist);
                    return res.view('user/checkrequest', { thisuserRequestlist: requestlist });
                } catch (err) {
                    console.log("sth happened here");

                }


            });
        } else if (req.session.role == "stu") {
            let thisistheline = "SELECT * FROM allrequestfromstudent where sid = \"" + req.session.userid + "\"\;";
            console.log(thisistheline)
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    //console.log('>> string: ', string );
                    var json = JSON.parse(string);
                    //console.log('>> json: ', json);  
                    requestlist = json;
                    console.log('>> my request ist: ', requestlist);
                    return res.view('user/checkrequest', { thisuserRequestlist: requestlist });
                } catch (err) {
                    console.log("sth happened here");

                }


            });
        }



    },

    liststudentrequest: async function (req, res) {
        var studentrequestlist;
        var observerrequestlist;

        let thisistheline = "select * from allrequestfromstudent inner join supervisorpairstudent "
            + "on allrequestfromstudent.sid = supervisorpairstudent.sid and supervisorpairstudent.tid = \"" + req.session.userid + "\" ;";
        //console.log(thisistheline)
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                studentrequestlist = json;
                //console.log('>> stdlist: ', studentrequestlist);

                return res.view('user/readstudentrequestlist', { thisstudentrequestlist: studentrequestlist });

            } catch (err) {
                return res.status(401).json("error happened when getting students' request list");

            }


        });




    },

    listsupervisorrequest: async function (req, res) {
        var supervisorrequestlist;


        let thisistheline = "select * from allrequestfromsupervisor";
        //console.log(thisistheline)
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                supervisorrequestlist = json;
                console.log('>> supreqlist: ', supervisorrequestlist);

                return res.view('user/admin/readsupervisorrequestlist', { thissupervisorrequestlist: supervisorrequestlist });

            } catch (err) {
                return res.status(401).json("error happened when getting supervisor' request list");

            }


        });




    },

    deleterequest: async function (req, res) {

        let thisistheline = "";
        if (req.session.role == "sup") {
            thisistheline = "DELETE FROM allrequestfromsupervisor WHERE reqid= \"" + req.body.ReqID + "\"\n";
            console.log('delete excution');
            console.log(thisistheline);
        } else if (req.session.role == "obs") {
            thisistheline = "DELETE FROM allrequestfromobserver WHERE reqid= \"" + req.body.ReqID + "\"\n";
            console.log('delete excution');
            console.log(thisistheline);
        } else if (req.session.role == "stu") {
            thisistheline = "DELETE FROM allrequestfromstudent WHERE reqid= \"" + req.body.ReqID + "\"\n";
            console.log('delete excution');
            console.log(thisistheline);
        }

        db.query(thisistheline, (err, results) => {
            try {
                return res.ok("Deleted");
            } catch (err) {
                if (err) { console.log("sth happened here"); }
            }
        });

    },

    viewstudentrequestdeatils: async function (req, res) {

        var viewthisrequestinfo;

        if (req.session.role == "sup") {
            let thisistheline = "select * from allrequestfromstudent where reqid = \"" + req.params.ReqID + "\"";
            //console.log(thisistheline)
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    //console.log('>> string: ', string );
                    var json = JSON.parse(string);
                    //console.log('>> json: ', json);  
                    viewthisrequestinfo = json[0];
                    console.log('>> stdlist: ', viewthisrequestinfo);
                    return res.view('user/requestdetail', { thisrequestdetails: viewthisrequestinfo });
                } catch (err) {
                    console.log("sth happened here " + err);

                }
            });
        } else if (req.session.role == "stu") {
            let thisistheline = "select * from allrequestfromstudent where reqid = \"" + req.params.ReqID + "\"";
            //console.log(thisistheline)
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    //console.log('>> string: ', string );
                    var json = JSON.parse(string);
                    //console.log('>> json: ', json);  
                    viewthisrequestinfo = json[0];
                    //console.log('>> stdlist: ', studentrequestlist);
                    return res.view('user/requestdetail', { thisrequestdetails: viewthisrequestinfo });
                } catch (err) {
                    console.log("sth happened here " + err);

                }
            });
        }


    },

    replystudentrequest: async function (req, res) {

        let thisistheline = "UPDATE allrequestfromstudent SET status = \"" + req.body.status + "\" , reply=\"" + req.body.comment
            + "\", submission = now() WHERE ReqID =\"" + req.body.ReqID + "\";";
        console.log(thisistheline)
        db.query(thisistheline, (err, results) => {
            try {
                console.log("Updated");
                return res.json("ok");
            } catch (err) {
                console.log("sth happened here " + err);
            }
        });

    },

    submitrequest: async function (req, res) {
        var today = new Date();
        var deadline = new Date(req.body.deadlinedate)

        if (req.session.role == "stu") {
            if (req.body.deadlinedate != null) {
                if (today > deadline) {
                    return res.status(401).json("Submission Box was closed\n"
                        + "Current Time       :  " + today.toLocaleDateString() + " " + today.toLocaleTimeString('en-us') + "\n"
                        + "Submission Deadline:  " + deadline.toLocaleDateString() + " " + deadline.toLocaleTimeString('en-us'));
                }
            }
        }

        let reqid = '' + req.session.userid + '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < 5) {
            reqid += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }


        let thisistheline = "";


        if (req.session.role == "sup") {
            console.log("enter sup");
            if (req.body.starttime == undefined) {
                thisistheline = "insert into allrequestfromsupervisor values(\"" + reqid + "\",\"" + req.session.userid + "\",\"" + req.body.notokday
                    + "\",\"00:00\", \"23:59\");";
            } else {
                thisistheline = "insert into allrequestfromsupervisor values(\"" + reqid + "\",\"" + req.session.userid + "\",\"" + req.body.notokday + "\",\"" +
                    req.body.starttime + "\", \"" + req.body.endtime + "\");";
            }
        } else if (req.session.role == "obs") {
            console.log("enter obs");
            if (req.body.starttime == undefined) {
                thisistheline = "insert into allrequestfromobserver values(\"" + reqid + "\",\"" + req.session.userid + "\",\"" + req.body.notokday
                    + "\",\"00:00\", \"23:59\");";
            } else {
                thisistheline = "insert into allrequestfromobserver values(\"" + reqid + "\",\"" + req.session.userid + "\",\"" + req.body.notokday + "\",\"" +
                    req.body.starttime + "\", \"" + req.body.endtime + "\");";
            }
        } else if (req.session.role == "stu") {
            console.log("enter stu");

            if (req.body.starttime == undefined) {
                thisistheline = "insert into allrequestfromstudent values(\"" + reqid + "\",\"" + req.session.userid + "\",\"" + req.body.notokday
                    + "\",\"00:00\", \"23:59\",\"" + req.body.reason + "\",null,\"Require Proof\",\"\",now());";
            } else {
                thisistheline = "insert into allrequestfromstudent values(\"" + reqid + "\",\"" + req.session.userid + "\",\"" + req.body.notokday + "\",\"" +
                    req.body.starttime + "\", \"" + req.body.endtime + "\",\"" + req.body.reason + "\",null,\"Require Proof\",\"\",now());";
            }
        }

        console.log(thisistheline);


        db.query(thisistheline, (err, results) => {
            try {
                return res.json("ok");
                //console.log("1 row added");

            } catch (err) {
                return res.stauts(401).json("Error happened when excuting");
            }


        });



    },

    upload: function (req, res) {
        req.file('avatar').upload(function (err, files) {
            console.log(files[0].fd);

            const fs = require('fs');

            fs.readFile(files[0].fd, { encoding: 'base64' }, (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }
                //    console.log(data);

                //console.log(req.file('avatar'));
                thisistheline = "Insert into stdpic values(\"" + req.session.userid + "\",\"" + req.params.ReqID + "\",\"" + data + "\")";
                db.query(thisistheline, function (error, result) {
                    try {

                        console.log("Submitted")
                        
                    } catch (err) {
                        console.log(' submitpersonalallclass MySQL Problem' + "    " + error);
                    }

                });

                thisistheline = "Update allrequestfromstudent set picdata= \"" + data + "\", status = \"Pending\" ,submission = now() where sid=\"" + req.session.userid + "\" and reqid = \"" + req.params.ReqID + "\"";
                //console.log(thisistheline);
                db.query(thisistheline, function (error, result) {
                    try {

                        console.log("Submitted")
                        return res.redirect("/requestdetail/" + req.params.ReqID);
                    } catch (err) {
                        console.log(' submitpersonalallclass MySQL Problem' + "    " + error);
                    }

                });
            });
            fs.unlink(files[0].fd, function (err) {
                if (err) return console.log(err); // handle error as you wish
                // file deleted... continue your logic
            });
        });

    },

    getpreference: async function (req, res) {
        thisistheline = "select * from allpreffromsup where tid = \"" + req.session.userid + "\"";
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                var preference = json;
                thisistheline = "select * from allsupersetting where typeofsetting = \"6\"  and announcetime is not null";
                db.query(thisistheline, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        var deadlinedate;
                        var deadlinetime;
                        if (json.length > 0) {
                            deadlinedate = new Date(json[0].deadlinedate);
                            deadlinetime = json[0].deadlinetime.split(":");
                            deadlinedate.setHours(deadlinetime[0]);
                            deadlinedate.setMinutes(deadlinetime[1]);
                            deadlinedate.setMinutes(deadlinetime[2]);
                        }
                        thisistheline = "select * from allsupersetting where typeofsetting = \"3\"  and announcetime is not null";
                        db.query(thisistheline, (err, results) => {
                            try {
                                var string = JSON.stringify(results);
                                var json = JSON.parse(string);
                                var presentperiodstartdate;
                                var presentperiodenddate;
                                var presentperiodstarttime;
                                var presentperiodendtime;
                                if (json.length > 0) {
                                    presentperiodstartdate = new Date(json[0].startdate);
                                    presentperiodenddate = new Date(json[0].enddate);
                                    presentperiodstarttime = json[0].starttime.split(":");
                                    presentperiodendtime = json[0].endtime.split(":");
                                    presentperiodstartdate.setHours(presentperiodstarttime[0])
                                    presentperiodstartdate.setMinutes(presentperiodstarttime[1])
                                    presentperiodstartdate.setSeconds(presentperiodstarttime[2])
                                    presentperiodenddate.setHours(presentperiodendtime[0])
                                    presentperiodenddate.setMinutes(presentperiodendtime[1])
                                    presentperiodenddate.setSeconds(presentperiodendtime[2])
                                }

                                thisistheline = "select count(*) as needtolisten from supervisorpairstudent left join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid where tid = \"" + req.session.userid + "\" or oid = \"" + req.session.userid + "\""
                                db.query(thisistheline, (err, results) => {
                                    try {
                                        var string = JSON.stringify(results);
                                        var json = JSON.parse(string);
                                        var studentnum = json[0].needtolisten;
                                        thisistheline = "select * from allpreffromsup where tid = \"" + req.session.userid + "\""
                                        db.query(thisistheline, (err, results) => {
                                            try {
                                                var string = JSON.stringify(results);
                                                var json = JSON.parse(string);
                                                var oldpref = json[0]
                                                
                                                return res.view('user/preference', {
                                                    preference: preference, deadlinedate: deadlinedate,
                                                    presentperiodstartdate: presentperiodstartdate,
                                                    presentperiodenddate: presentperiodenddate,
                                                    studentnum: studentnum,
                                                    oldpref: oldpref
                                                });
                                            } catch (err) {
                                                return res.stauts(401).json("Error happened when excuting RequestController.getpreference");
                                            }


                                        })

                                    } catch (err) {
                                        return res.stauts(401).json("Error happened when excuting RequestController.getpreference");
                                    }
                                })
                            } catch (err) {
                                return res.stauts(401).json("Error happened when excuting RequestController.getpreference");
                            }
                        });
                    } catch (err) {
                        return res.stauts(401).json("Error happened when excuting RequestController.getpreference");
                    }
                });
            } catch (err) {
                return res.stauts(401).json("Error happened when excuting RequestController.getpreference");
            }
        });
    },

    submitpreference: async function (req, res) {
        console.log(req.body.prefnumstr)
        if (req.body.command == "Submit") {
            thisistheline = "insert into allpreffromsup values(\"" + req.session.userid + "\",\"" + req.body.prefnumstr + "\",now());";
        } else if (req.body.command == "Update") {
            thisistheline = "Update allpreffromsup set prefno = \"" + req.body.prefnumstr + "\", LastUpdate = now() where tid = \""+req.session.userid+"\"";
        }
        
        console.log(thisistheline)
        db.query(thisistheline, (err, results) => {
            if(err){return res.status(401).json("error exist when excueting RequestController.submitpreference")}else{return res.status(200).json("ok")}
        })
    },

}