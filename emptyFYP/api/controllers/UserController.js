var mysql = require('mysql');
//var url = new url(sails.config.datastores.mysql.url);
console.log(mysql);
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
    //console.log('MySQL Connected');
});

module.exports = {

    login: async function (req, res) {
        const user = {
            allusersname: "",
            pid: "",
            password: "",
            status: "",
            errortime: 0,
            rol: ""

        };

        if (req.method == "GET") return res.view('user/login');

        if (!req.body.username || !req.body.pw) return res.status(401).json("Please enter both username and password");





        var searchingname = req.body.username;
        var searchingpw = req.body.pw;

        //  console.log(searchingname + "  " + searchingpw);

        let thisistheline = "SELECT * FROM allusers where pid = \'" + searchingname + "\'";
        //  console.log(thisistheline);

        // Start a new session for the new login user


        db.query(thisistheline, (err, results) => {
            try {
                // This is the important function
                //  console.log('>> results: ', results );
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);
                user.allusersname = json[0].allusersname;
                user.pid = json[0].pid;
                user.password = json[0].password;
                user.status = json[0].status;
                user.errortime = json[0].errortime;
                user.role = json[0].role;
                console.log('>> username: ' + user.allusersname);
                console.log('>> pid: ' + user.pid);
                console.log('>> pid: ' + user.role);
                if (user.password != searchingpw) {
                    return res.status(401).json("Wrong Password");
                }
                req.session.regenerate(function (err) {
                    if (err) return res.serverError(err);

                    req.session.role = user.role;
                    req.session.username = user.allusersname;
                    req.session.userid = user.pid;
                    req.session.boo = false;

                    return res.json(user);
                });
            } catch (err) {
                if (user.pid != searchingname) return res.status(401).json("User not found");

            }


        });

    },

    logout: async function (req, res) {

        req.session.destroy(function (err) {

            if (err) return res.serverError(err);

            return res.redirect("/");
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
                    + "\",\"00:00\", \"23:59\",\"" + req.body.reason + "\",\"" + req.body.prooffile + "\",\"Pending\",\"\");";
            } else {
                thisistheline = "insert into allrequestfromstudent values(\"" + reqid + "\",\"" + req.session.userid + "\",\"" + req.body.notokday + "\",\"" +
                    req.body.starttime + "\", \"" + req.body.endtime + "\",\"" + req.body.reason + "\",\"" + req.body.prooffile + "\",\"Pending\",\"\");";
            }
        }

        console.log(thisistheline);
        /**
        db.query(thisistheline, (err, results) => {
            try {
                return res.json("ok");
                //console.log("1 row added");

            } catch (err) {
                return res.stauts(401).json("Error happened when excuting");
            }


        });

 */

    },

    uploadstudentlist: async function (req, res) {


        if (req.method == "GET") return res.view('user/uploadstudentlist');

        console.log(req.body);


        for (var i = 0; i < req.body.length; i++) {
            console.log(req.body[i].sid);

            thisistheline = "insert IGNORE into allusers values(\"" +
                req.body[i].studentname + "\"\,\""
                + req.body[i].sid + "\"\,\"" +
                req.body[i].password + "\"\,\"ACTIVE\"\,\"0\"\,\"stu\"\)\;\n";
            console.log(thisistheline);
            db.query(thisistheline, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(401).json("Error happened when excuting : " + thisistheline);
                };
                console.log("1 record inserted");
            });

        }


        for (var i = 0; i < req.body.length; i++) {
            console.log(req.body[i].sid);
            thisistheline = "insert IGNORE into supervisorpairstudent values(\"" +
                req.session.userid + "\"\,\""
                + req.body[i].sid + "\"\,\"" +
                req.body[i].topic + "\"\);";
            db.query(thisistheline, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(401).json("Error happened when excuting : " + thisistheline);

                };
                console.log("1 record inserted");
            });

        }






        return res.json();

    },

    uploadobserverlist: async function (req, res) {


        if (req.method == "GET") return res.view('user/uploadstudentlist');



        for (var i = 0; i < req.body.length; i++) {
            console.log(req.body[i].oid);

            thisistheline = "insert IGNORE into allusers values(\"" +
                req.body[i].observername + "\"\,\""
                + req.body[i].oid + "\"\,\"" +
                req.body[i].password + "\"\,\"ACTIVE\"\,\"0\"\,\"obs\"\)\;\n";
            console.log(thisistheline);
            db.query(thisistheline, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(401).json("Error happened when excuting : " + thisistheline);
                };
                console.log("1 record inserted");
            });

        }


        for (var i = 0; i < req.body.length; i++) {
            console.log(req.body[i].oid);
            thisistheline = "insert IGNORE into supervisorpairobserver values(\"" +
                req.session.userid + "\"\,\""
                + req.body[i].oid + "\"\);";
            db.query(thisistheline, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(401).json("Error happened when excuting : " + thisistheline);

                };
                console.log("1 record inserted");
            });

        }

        return res.json();

    },

    uploadpairlist: async function (req, res) {

        for (var i = 0; i < req.body.length; i++) {
            console.log("\n\n\n\n\n")
            console.log(req.body[i]);


            thisistheline = "insert IGNORE into allusers values(\"" +
                req.body[i].studentname + "\"\,\""
                + req.body[i].sid + "\"\,\"" +
                req.body[i].stupassword + "\"\,\"ACTIVE\"\,\"0\"\,\"stu\"\)\;\n";
            console.log(thisistheline);
            db.query(thisistheline, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(401).json("Error happened when excuting : " + thisistheline);
                };
                console.log("1 stu record inserted");


            });
            thisistheline = "insert IGNORE into supervisorpairstudent values(\"" +
                req.session.userid + "\"\,\""
                + req.body[i].sid + "\"\,\"" +
                req.body[i].topic + "\"\);";
            db.query(thisistheline, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(401).json("Error happened when excuting : " + thisistheline);

                };
                console.log("1 suppairstu record inserted");
            });

        }





        for (var i = 0; i < req.body.length; i++) {


            thisistheline = "insert IGNORE into allusers values(\"" +
                req.body[i].observername + "\"\,\""
                + req.body[i].oid + "\"\,\"" +
                req.body[i].obspassword + "\"\,\"ACTIVE\"\,\"0\"\,\"obs\"\)\;\n";
            console.log(thisistheline);
            db.query(thisistheline, function (err, result) {
                console.log(thisistheline);
                if (err) {
                    console.log(err);
                    res.status(401).json("Error happened when excuting : " + thisistheline);
                };
                console.log("1 obs record inserted");
            });
            thisistheline = "insert IGNORE into supervisorpairobserver values(\"" +
                req.session.userid + "\"\,\""
                + req.body[i].oid + "\"\);";
            db.query(thisistheline, function (err, result) {
                if (err) {
                    console.log(err);
                    res.status(401).json("Error happened when excuting : " + thisistheline);

                };
                console.log("1 suppairobs record inserted");
            });

        }
        console.log("\n\n\n\n\n")

        for (var i = 0; i < req.body.length; i++) {

            thisistheline = "insert IGNORE into observerpairstudent values(\"" +
            req.body[i].oid + "\"\,\""
            + req.body[i].sid + "\"\);";
        db.query(thisistheline, function (err, result) {
            if (err) {
                console.log(err);
                res.status(401).json("Error happened when excuting : " + thisistheline);

            };
            console.log("1 obspairstud record inserted");
        });

        }

        return res.ok();


    }
}