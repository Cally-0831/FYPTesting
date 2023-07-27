var mysql = require('mysql');
const date = require('date-and-time')
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

    liststudent: async function (req, res) {
        var stdlist;
        var obslist;



        thisistheline = "select student.stdname, student.sid,supervisorpairstudent.Topic,student.ttbsubmission,observer.obsname,observerpairstudent.oid from student"
            + "\n" + "left join supervisorpairstudent on student.sid = supervisorpairstudent.sid"
            + "\n" + "left join observerpairstudent on student.sid = observerpairstudent.sid"
            + "\n" + "left join supervisorpairobserver on supervisorpairobserver.oid = observerpairstudent.oid"
            + "\n" + "left join observer on observer.oid = observerpairstudent.oid"
            + "\n" + "where supervisorpairstudent.tid = \"" + req.session.userid + "\"";

        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                stdlist = json;
                //console.log('>> stdlist: ', stdlist); 
                thisistheline = "SELECT observer.obsname , observer.oid,observer.submission,student.stdname,student.sid FROM observer"
                    + "\n" + "left join observerpairstudent on observerpairstudent.oid = observer.oid"
                    + "\n" + "left join supervisorpairobserver on supervisorpairobserver.OID = observer.oid"
                    + "\n" + "left join student on observerpairstudent.sid = student.sid"
                    + "\n" + "where supervisorpairobserver.tid = \"" + req.session.userid + "\"";
                +"\n" + "order by observer.oid asc , student.sid asc;"
                db.query(thisistheline, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        //console.log('>> string: ', string );
                        var json = JSON.parse(string);
                        //console.log('>> json: ', json);  
                        obslist = json;
                        return res.view('user/liststudent', { allstdlist: stdlist, allobslist: obslist });
                    } catch (err) {
                        console.log("sth happened here");
                    }

                })

            } catch (err) {
                console.log("sth happened here");

            }


        });


    },

    gettopic: async function (req, res) {
        var topiclist = new Array();
        console.log(topiclist)
        console.log(topiclist.length)

        let thisistheline = "SELECT  topics FROM supervisor where tid =\"" + req.session.userid + "\"\;";

        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);

                var json = JSON.parse(string);
                //   console.log('>> json: ', json);  
                var stringstring = json[0].topics.split("/").sort()
                topiclist = stringstring;


                console.log(">>topiclist final   " + topiclist)
                return res.view('user/createnewstudent', { alltopiclist: topiclist });
            } catch (err) {

                console.log("sth happened here" + err);

            }


        });
    },

    readsinglestudent: async function (req, res) {
        var studentresult;
        var type;
       
        if (req.params.id.charAt(0) == "s") {
            type = "stu";
            thisistheline = "select student.stdname, student.sid,supervisorpairstudent.Topic,student.ttbsubmission,observer.obsname,observerpairstudent.oid from student"
                + "\n" + "left join supervisorpairstudent on student.sid = supervisorpairstudent.sid"
                + "\n" + "left join observerpairstudent on student.sid = observerpairstudent.sid"
                + "\n" + "left join supervisorpairobserver on supervisorpairobserver.oid = observerpairstudent.oid"
                + "\n" + "left join observer on observer.oid = observerpairstudent.oid"
                + "\n" + "where supervisorpairstudent.tid = \"" + req.session.userid + "\""
                + "\n and student.sid = \"" + req.params.id + "\"\;";
        } else {
            type = "obs";
            thisistheline = "SELECT observer.obsname , observer.oid,observer.submission,student.stdname,student.sid FROM observer"
                + "\n" + "left join observerpairstudent on observerpairstudent.oid = observer.oid"
                + "\n" + "left join supervisorpairobserver on supervisorpairobserver.OID = observer.oid"
                + "\n" + "left join student on observerpairstudent.sid = student.sid"
                + "\n" + "where supervisorpairobserver.tid = \"" + req.session.userid + "\""
                + "\n" + " and observer.oid = \"" + req.params.id + "\"";
        }






       
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                studentresult = json;
                //console.log('>> stdlist: ',studentresult);  
                return res.view('user/read', { type: type, thatstudent: studentresult });
            } catch (err) {
                console.log("sth happened here");

            }


        });

    },


    deletestudent: async function (req, res) {
        var studentresult;
        var checktype = req.params.id.split('&');
        console.log(checktype);

        //remove pair
        if(checktype.length > 1){
            thisistheline = "DELETE FROM observerpairstudent WHERE sid= \"" + checktype[0] + "\"\n";
            db.query(thisistheline, (err, results) => {
                if (err) { console.log("sth happened here"); }
            });
        }else{
            //remove single ppl
            console.log(String(req.params.id).charAt(0))
            if (String(req.params.id).charAt(0) == "s") {
                let thisistheline = "DELETE FROM allusers WHERE pid= \"" + req.params.id + "\"\n";
                console.log('delete excution');
                console.log(thisistheline);
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });
    
                thisistheline = "DELETE FROM student WHERE sid= \"" + req.params.id + "\"\n";
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });
    
                thisistheline = "DELETE FROM supervisorpairstudent WHERE sid= \"" + req.params.id + "\"\n";
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });
                thisistheline = "DELETE FROM observerpairstudent WHERE sid= \"" + req.params.id + "\"\n";
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });
            } else {
                let thisistheline = "DELETE FROM allusers WHERE pid= \"" + req.params.id + "\"\n";
                console.log('delete excution');
                console.log(thisistheline);
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });
    
                thisistheline = "DELETE FROM observer WHERE oid= \"" + req.params.id + "\"\n";
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });
    
                thisistheline = "DELETE FROM supervisorpairobserver WHERE oid= \"" + req.params.id + "\"\n";
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });
                thisistheline = "DELETE FROM observerpairstudent WHERE oid= \"" + req.params.id + "\"\n";
                db.query(thisistheline, (err, results) => {
                    if (err) { console.log("sth happened here"); }
                });
            }
    
        }
        
       




        return res.ok("Deleted");
    },

    createnewstudent: async function (req, res) {
        var stdlist;

        let pw = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < 8) {
            pw += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }


        //console.log(pw);
        thisistheline = "insert IGNORE into allusers values(\"" +
            req.body.studentname + "\"\,\""
            + req.body.sid + "\"\,\"" +
            pw + "\"\,\"ACTIVE\"\,\"0\"\,\"stu\"\)\;\n";
        //  console.log(thisistheline);
        db.query(thisistheline, function (err, result) {
            if (err) {
                res.status(401).json("Error happened when excuting : " + thisistheline);
            };
            console.log("1 record inserted");
        });



        if (req.body.topic != "") {

            thisistheline = "insert IGNORE into supervisorpairstudent values(\"" +
                req.session.userid + "\"\,\""
                + req.body.sid + "\"\,\"" +
                req.body.topic + "\"\);";

        } else {
            thisistheline = "insert IGNORE into supervisorpairstudent values(\"" +
                req.session.userid + "\"\,\""
                + req.body.sid + "\"\,\"" +
                req.body.othertext + "\"\);";
        }

     
        db.query(thisistheline, function (err, result) {
            if (err) {
                res.status(401).json("Error happened when excuting : " + thisistheline);
            };
            console.log("1 record inserted");
        });

        return res.ok("created");
    },
    createnewobs: async function (req, res) {
        var stdlist;
        console.log(req.body);
        let pw = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < 8) {
            pw += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }


        //console.log(pw);
        thisistheline = "insert IGNORE into allusers values(\"" +
            req.body.observername + "\"\,\""
            + req.body.oid + "\"\,\"" +
            pw + "\"\,\"ACTIVE\"\,\"0\"\,\"obs\"\)\;\n";
        //  console.log(thisistheline);
        db.query(thisistheline, function (err, result) {
            if (err) {
                res.status(401).json("Error happened when excuting : " + thisistheline);
            };
            console.log("1 record inserted");
        });





        thisistheline = "insert IGNORE into supervisorpairobserver values(\"" +
            req.session.userid + "\"\,\""
            + req.body.oid + "\"\)";




        console.log(thisistheline)
        db.query(thisistheline, function (err, result) {
            if (err) {
                res.status(401).json("Error happened when excuting : " + thisistheline);
            };
            console.log("1 record inserted");
        });

        return res.ok("created");
    },

}