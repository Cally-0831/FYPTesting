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
                console.log("sth happened here " + err);

            }


        });




    },

    deleterequest: async function (req, res) {

        let thisistheline = "";
        if (req.session.role == "sup") {
            thisistheline = "DELETE FROM allrequestfromsupervisor WHERE reqid= \"" + req.body.ReqID + "\"\n";
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

        console.log(req.body);
        console.log(typeof req.body.avatar);
        console.log(req.body.avatar);

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
                thisistheline = "Update allrequestfromstudent set picdata= \"" + data + "\", status = \"Pending\" ,submission = now() where sid=\"" + req.session.userid + "\" and reqid = \""+req.params.ReqID+"\"";
                //console.log(thisistheline);
                db.query(thisistheline, function (error, result) {
                    try {

                        console.log("Submitted")
                        return res.redirect("/requestdetail/"+req.params.ReqID);
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

    }

}