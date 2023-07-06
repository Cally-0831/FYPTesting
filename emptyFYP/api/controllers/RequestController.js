module.exports = {

    listrequest: async function (req, res) {
        var requestlist;
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
            console.log('list request MySQL Connected');
        });

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
        }



    },

    liststudentrequest: async function (req, res) {
        var studentrequestlist;
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
            console.log('list request MySQL Connected');
        });

        
            let thisistheline = "select * from allrequestfromstudent inner join supervisorpairstudent "
            +"on allrequestfromstudent.sid = supervisorpairstudent.sid and supervisorpairstudent.tid = \""+req.session.userid+"\" ;";
            //console.log(thisistheline)
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    //console.log('>> string: ', string );
                    var json = JSON.parse(string);
                    //console.log('>> json: ', json);  
                    studentrequestlist = json;
                    //console.log('>> stdlist: ', studentrequestlist);
                    return res.view('user/readstudentrequestlist', { thisstudentrequestlist : studentrequestlist });
                } catch (err) {
                    console.log("sth happened here "+ err);

                }


            });
          



    },

    deleterequest: async function (req, res) {
        console.log(req.session.role);

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
            console.log('deleterequest MySQL Connected');
        });
        console.log(req.body);
        let thisistheline="";
        if (req.session.role == "sup") {
           thisistheline = "DELETE FROM allrequestfromsupervisor WHERE reqid= \"" + req.body.ReqID + "\"\n";
            console.log('delete excution');
            console.log(thisistheline);
        }else if(req.session.role == "stu"){
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

    viewstudentrequest: async function (req, res) {

        var viewthisrequestinfo;
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
            console.log('view student request MySQL Connected');
        });

        let thisistheline = "select * from allrequestfromstudent where reqid = \""+req.params.ReqID+"\"";
        //console.log(thisistheline)
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    //console.log('>> string: ', string );
                    var json = JSON.parse(string);
                    //console.log('>> json: ', json);  
                    viewthisrequestinfo = json;
                    //console.log('>> stdlist: ', studentrequestlist);
                    return res.view('user/approvalpage', { thisrequestdetails :  viewthisrequestinfo });
                } catch (err) {
                    console.log("sth happened here "+ err);

                }


            });
          
    }
}