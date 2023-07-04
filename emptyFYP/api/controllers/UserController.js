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

console.log("check1")
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



        var searchingname = req.body.username;
        var searchingpw = req.body.pw;

        console.log(searchingname + "  " + searchingpw);

        let thisistheline = "SELECT * FROM allusers where pid = \'" + searchingname + "\'";
        console.log(thisistheline);

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
                if(user.password != searchingpw){
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

    submitrequest :async function (req, res) {
        if (req.method == "GET") return res.view('user/submitrequest');




    },


}