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
        //console.log(req.body);
        if (req.method == "GET") return res.view('user/submitrequest');

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
        db.query(thisistheline, (err, results) => {
            try {
                return res.json("ok");
                //console.log("1 row added");

            } catch (err) {
                return res.stauts(401).json("Error happened when excuting");
            }


        });



    },

    uploadstudentlist: async function (req, res) {


        if (req.method == "GET") return res.view('user/uploadstudentlist');

        console.log(req.body.length);



        for (var i = 0; i < req.body.length; i++) {
            console.log(req.body[i].sid);

            thisistheline = "insert into allusers values(\"" +
                req.body[i].studentname + "\"\,\""
                + req.body[i].sid + "\"\,\"" +
                req.body[i].password + "\"\,\"ACTIVE\"\,\"0\"\,\"stu\"\)\;\n";
            console.log(thisistheline);
            db.query(thisistheline, function (err, result) {
                if (err) {
                    res.status(401).json("Error happened when excuting : " + thisistheline);
                };
                console.log("1 record inserted");
            });

        }


        for (var i = 0; i < req.body.length; i++) {
            console.log(req.body[i].sid);
            thisistheline = "insert into supervisorpairstudent values(\"" +
                req.session.userid + "\"\,\""
                + req.body[i].sid + "\"\,\"" +
                req.body[i].topic + "\"\);";
            db.query(thisistheline, function (err, result) {
                if (err) {

                    res.status(401).json("Error happened when excuting : " + thisistheline);

                };
                console.log("1 record inserted");
            });

        }



        return res.json();

    },

}