
module.exports = {

    listclassroom: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var classroomlist;

        let thisistheline = "SELECT * FROM classroom";

        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);
                classroomlist = json;
                //console.log('>> stdlist: ', stdlist);  
                return res.view('user/admin/classroomlist', { allClassroomlist: classroomlist });
            } catch (err) {
                console.log("sth happened here");

            }


        });


    },

    deleteclassroom: async function (req, res) {

        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();

        let thisistheline = "DELETE FROM classroom WHERE rid= \"" + req.body.RID + "\" and campus = \"" + req.body.Campus + "\"";
        //console.log('delete excution');
        //console.log(thisistheline);
        db.query(thisistheline, (err, results) => {
            try {
                console.log("Record deleted")

            } catch (err) {
                if (err) {
                    //console.log("sth happened here");
                    res.status(401).json("Error");
                }
            }

        });
        return res.json("deleted");
    },

    getcampus: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var campuslist;
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        let thisistheline = "SELECT DISTINCT campus FROM classroom";
        console.log(thisistheline)
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string);
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                campuslist = json;
                //console.log('>> stdlist: ', stdlist);  
                return res.view('user/admin/createnewclassroom', { allCampuslist: campuslist });
            } catch (err) {

                console.log("sth happened here");

            }


        });
    },

    createnewclassroom: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        thisistheline = "insert ignore into classroom values(\"" +
            req.body.Campus + "\"\,\""
            + req.body.RID + "\",\"Open\"\)\;\n";
        console.log(thisistheline);
        db.query(thisistheline, function (err, result) {
            if (err) {
                res.status(401).json("Error happened when excuting : " + thisistheline);
            };
            console.log("1 record inserted");
        });



        return res.ok("created");
    },

    getsingleroom: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        const roominfo = {
            Campus: req.params.campus,
            RID: req.params.rid
        };
        //console.log(roominfo);
        return res.view('user/admin/createnewclassroomtimeslot', { roominfo: roominfo });

    },

    addclassroomtimeslot: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        let reqid = '' + req.params.campus + "_" + req.params.rid + '_';
        reqid = reqid.replace(/ /g, "_");
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < 5) {
            reqid += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }

        let thisistheline;
        let checkline;
        console.log(">>>>>>>>>>" + req.body.Unavailabletype)
        console.log(req.body.Unavailabletype == "timeslot")
        console.log(req.body.Unavailabletype == "wholeday")
        console.log(req.body.Unavailabletype == "dayrange")
        if (req.body.Unavailabletype == "timeslot") {
            console.log("enter case 1")
            thisistheline = "insert into allclassroomtimeslot values(\"" + reqid + "\",\"" + req.params.campus + "\",\"" + req.params.rid
                + "\",\"" + req.body.notokstartday + "\",\"" + req.body.notokstartday + "\",\"" + req.body.starttime
                + "\",\"" + req.body.endtime + "\",\"" + req.body.remarks + "\")";

            checkline = "select * from allclassroomtimeslot where Campus = \"" + req.params.campus + "\" and RID = \"" + req.params.rid +
                "\" and StartDate = \"" + req.body.notokstartday + "\" and EndDate = \"" + req.body.notokstartday + "\" and( \"" + req.body.starttime + "\" between starttime and EndTime)"

        } else if (req.body.Unavailabletype == "wholeday") {
            console.log("enter case 2")
            thisistheline = "insert into allclassroomtimeslot values(\"" + reqid + "\",\"" + req.params.campus + "\",\"" + req.params.rid
                + "\",\"" + req.body.notokstartday + "\",\"" + req.body.notokstartday + "\",\"00:00\",\"23:59\",\"" + req.body.remarks + "\")";
            checkline = "select * from allclassroomtimeslot where Campus = \"" + req.params.campus + "\" and RID = \"" + req.params.rid +
                "\" and StartDate = \"" + req.body.notokstartday + "\" and EndDate = \"" + req.body.notokstartday + "\" and StartTime = \"00:00\" and EndTime = \"23:59\""

        } else if (req.body.Unavailabletype == "dayrange") {
            console.log("enter case 3")
            thisistheline = "insert into allclassroomtimeslot values(\"" + reqid + "\",\"" + req.params.campus + "\",\"" + req.params.rid
                + "\",\"" + req.body.notokstartday + "\",\"" + req.body.notokendday + "\",\"" + req.body.starttime
                + "\",\"" + req.body.endtime + "\",\"" + req.body.remarks + "\")";
            checkline = "select * from allclassroomtimeslot where Campus = \"" + req.params.campus + "\" and RID = \"" + req.params.rid + "\""
                + "and (((\"" + req.body.notokstartday + "\" between startdate and enddate) or (( startdate  = \"" + req.body.notokstartday + "\" and \"" + req.body.starttime + "\" >= starttime)))"
                + " or  ((\"" + req.body.notokstartday + "\" between startdate and enddate) and (\"" + req.body.notokstartday + "\" between startdate and enddate))"
                + "or  ((\"" + req.body.notokendday + "\" between startdate and enddate) or (( enddate  = \"" + req.body.notokendday + "\" and \"" + req.body.endtime + "\" >= endtime)))"
                + " or (\"" + req.body.notokstartday + "\"< startdate and \"" + req.body.notokendday + "\">enddate) )";
        }
        console.log("\n\n\n" + checkline + "\n\n\n" + thisistheline)
        db.query(checkline, function (err, result) {
            if (err) {
                return res.status(401).json("Error happened when excuting checking : " + checkline);

            } else {
                var question = "";
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                if (json.length == 0) {
                    db.query(thisistheline, function (err, result) {
                        if (err) {
                            return res.status(401).json("Error happened when excuting : " + err);
                        } else {
                            console.log("1 record inserted");
                            return res.status(200).json(req.params.campus + "&" + req.params.rid);
                        }

                    });
                } else {
                    for (var i = 0; i < json.length; i++) {
                        question += json[i].ReqID + "\n";
                    }
                    return res.status(401).json("This unavailable info has already been inputed or involved submitted timeslot." + "\n\n Please Review your inputs and submitted timeslots :\n\n" + question);

                }

            }
        })




    },

    listalltimeslot: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var timeslotlist;

        let thisistheline = "SELECT * FROM allclassroomtimeslot ORDER BY startdate,starttime;";
        db.query(thisistheline, function (err, results) {
            if (err) {
                return res.status(401).json("Error happened when excuting : " + thisistheline);
            } else {
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                timeslotlist = json;
                //console.log(timeslotlist)
                return res.view('user/admin/managetimeslot', { thetimeslotlist: timeslotlist });
            }

        });
    },

    deletetimeslot: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();


        if (req.session.role = "adm") {
            let thisistheline = "DELETE FROM  allclassroomtimeslot WHERE reqid= \"" + req.body.ReqID + "\"\n";
            console.log('delete excution');
            console.log(thisistheline);
            db.query(thisistheline, (err, results) => {
                try {

                    return res.ok("Deleted");
                } catch (err) {
                    if (err) {
                        console.log("error happened when excuting ClassroomlistController.deletetimeslot");
                    }
                }

            });
        }
    },

    getinfobycampus: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var roomlist;
        let thisistheline = "SELECT * FROM allclassroomtimeslot order by campus,RID,startdate,enddate;";
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                roomlist = json;
                return res.view('user/admin/classroommanagement', { allClassroomlist: roomlist });

            } catch (err) {
                if (err) {
                    cconsole.log("error happened when excuting ClassroomlistController.getinfobycampus");
                }
            }

        });

    },

    getsingleroomtimeslot: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        const roominfo = {
            Campus: req.params.campus,
            RID: req.params.rid
        };
        var timeslotlist;

        let thisistheline = "SELECT * FROM allclassroomtimeslot where campus = \"" + req.params.campus + "\" and RID =\"" + req.params.rid + "\" order by startdate,enddate;";
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                timeslotlist = json;
                //console.log(json);
                return res.view('user/admin/view', { roominfo: roominfo, thetimeslotlist: timeslotlist });
            } catch (err) {
                if (err) {
                    console.log("error happened when excuting ClassroomlistController.getsingleroomtimeslot");
                }
            }

        });
        //console.log(roominfo);

    },

    getoneroom: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var thistimeslotinfo;
        let thisistheline = "SELECT * FROM allclassroomtimeslot where reqid = \"" + req.params.reqid + "\""
        db.query(thisistheline, (err, result) => {
            try {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                thistimeslotinfo = json;
                //console.log(json);
                return res.view('user/admin/updatetime', { thistimeslotinfo: thistimeslotinfo });
            } catch (err) {
                console.log("error happened when excuting ClassroomlistController.getoneroom");

            }

        });
    },

    updatetimeslot: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        let thisistheline = "UPDATE allclassroomtimeslot SET StartDate = \"" + req.body.newstartday.split('T')[0] +
            "\", EndDate = \"" + req.body.newendday.split('T')[0] + "\" , StartTime = \"" + req.body.newstarttime + "\", EndTime = \"" + req.body.newendtime + "\", Remarks = \"" + req.body.newremarks + "\""
            + "where ReqID = \"" + req.body.ReqID + "\"";

        let checkline = "select * from allclassroomtimeslot where Campus= \"" + req.body.Campus + "\" and RID = \"" + req.body.RID + "\""
            + "and (((\"" + req.body.newstartday + "\" between startdate and enddate) or (( startdate  = \"" + req.body.newendday + "\" and \"" + req.body.newstarttime + "\" >= starttime)))"
            + " or  ((\"" + req.body.newstartday + "\" between startdate and enddate) and (\"" + req.body.newstartday + "\" between startdate and enddate))"
            + "or  ((\"" + req.body.newendday + "\" between startdate and enddate) or (( enddate  = \"" + req.body.newendday + "\" and \"" + req.body.newendtime + "\" >= endtime)))"
            + " or (\"" + req.body.newstartday + "\"< startdate and \"" + req.body.newendday + "\">enddate) ) and ReqID not like \"" + req.body.ReqID + "\"";

        console.log(thisistheline + "\n\n\n\n\n" + checkline)
        db.query(checkline, function (err, result) {

            if (err) {
                console.log("error happened when excuting ClassroomlistController.updatetimeslot");
            } else {
                var question = "";
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                //console.log(json.length)
                //console.log(json)
                if (json.length == 0) {
                    db.query(thisistheline, function (err, result) {
                        if (err) {
                            console.log("error happened when excuting ClassroomlistController.updatetimeslot");
                            k
                        } else {
                            console.log("1 record updated");
                            return res.status(200).json();
                        }

                    });
                } else {

                    for (var i = 0; i < json.length; i++) {
                        question += json[i].ReqID + "\n";
                    }
                    return res.status(401).json("This unavailable info has already been inputed or involved submitted timeslot." + "\n\n Please Review your inputs and submitted timeslots :\n\n" + question);


                }

            }
        })



    },

    changestatus: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var thisistheline;
        if (req.body.Status == "Open") {
            thisistheline = "Update classroom set status = \"Close\" where Campus = \"" + req.body.Campus + "\" and rid = \"" + req.body.RID + "\""
        } else {
            thisistheline = "Update classroom set status = \"Open\" where Campus = \"" + req.body.Campus + "\" and rid = \"" + req.body.RID + "\""
        }
        //console.log(thisistheline);
        db.query(thisistheline, (err, results) => {
            try {

                return res.ok("Updated");
            } catch (err) {
                if (err) { console.log("error happened when excuting ClassroomlistController.changestatus"); }
            }

        });
    },
    uploadclassroom: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();

        if (!req.body[0].hasOwnProperty("Campus") && !req.body[0].hasOwnProperty("RID")) {
            return res.status(401).json("Invalid Inputs")
        } else {
            console.log(req.body);
        }
        req.body.forEach(classroom => {
            var insertline = "insert ignore into classroom values(\"" + classroom.Campus + "\",\"" + classroom.RID + "\",\"Open\");"
            console.log(insertline)
            db.query(insertline, function (err, result) {
                try {
                } catch (err) {
                    console.log("Error happened when excuting StudentListContorller.uploadclassroomlist.insertline\n"+insertline)
                    return res.status(401).json("Insert Fail, please report this issue");
                }
            });
        });
        return res.status(200).json("Complete create")

    },
}