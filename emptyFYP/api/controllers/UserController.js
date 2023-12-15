

module.exports = {

    login: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        console.log(req.body);
        const user = {
            allusersname: "",
            pid: "",
            password: "",
            status: "",
            errortime: 0,
            role: ""

        };

        if (req.method == "GET") return res.view('user/login');

        if (!req.body.username || !req.body.pw) return res.status(401).json("Please enter both username and password");
        var searchingname = req.body.username;
        var searchingpw = req.body.pw;

        //  console.log(searchingname + "  " + searchingpw);

        var thisistheline = "SELECT * FROM allusers where pid = \'" + searchingname + "\';";
        console.log(thisistheline);

        // Start a new session for the new login user



        db.query(thisistheline, (err, results) => {
            try {
                // This is the important function
                console.log('>> results: ', results);
                var string = JSON.stringify(results);
                console.log('>> string: ', string);
                var json = JSON.parse(string);
                console.log('>> json: ', json);
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


                    console.log("generate session for this ppl");
                    return res.status(200).json(user);
                });
            } catch (err) {
                console.log(err)
                if (user.pid != searchingname) return res.status(401).json("User not found");

            }


        });



    },

    logout: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        req.session.destroy(function (err) {

            if (err) return res.serverError(err);

            return res.redirect("/");
        });
    },

    submitrequest: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        console.log(req.body);
        console.log(typeof req.body.avatar);
        console.log(req.body.avatar);

        var reqid = '' + req.session.userid + '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        var counter = 0;
        while (counter < 5) {
            reqid += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }


        var thisistheline = "";


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

    home: async function (req, res) {
        console.log(req.session.userid);
        if (req.session.userid == "" || req.session.userid == null || req.session.userid == undefined) {
            return res.view('user/login')
        } else {
            return res.view('user/home')
        }
    }


}