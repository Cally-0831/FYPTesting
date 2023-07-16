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


        let thisistheline = "SELECT student.stdname, student.sid,supervisorpairstudent.Topic,student.submission " +
            "\n FROM supervisorpairstudent " + "\n INNER JOIN student ON student.sid=supervisorpairstudent.sid" +
            "\n where supervisorpairstudent.tid = \"" + req.session.userid + "\"\;";

        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                stdlist = json;
                //console.log('>> stdlist: ', stdlist);  
                return res.view('user/liststudent', { allstdlist: stdlist });
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


        let thisistheline = "SELECT student.stdname, student.sid,supervisorpairstudent.Topic " +
            "\n FROM supervisorpairstudent " + "\n INNER JOIN student ON student.sid=supervisorpairstudent.sid" +
            "\n where supervisorpairstudent.tid = \"" + req.session.userid + "\"" +
            "\n and student.sid = \"" + req.params.sid + "\"\;";

        console.log('>> the line: ', thisistheline);
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                studentresult = json;
                //console.log('>> stdlist: ',studentresult);  
                return res.view('user/read', { thatstudent: studentresult });
            } catch (err) {
                console.log("sth happened here");

            }


        });

    },

    deletestudent: async function (req, res) {
        var studentresult;


        let thisistheline = "DELETE FROM allusers WHERE pid= \"" + req.params.sid + "\"\n";
        console.log('delete excution');
        console.log(thisistheline);
        db.query(thisistheline, (err, results) => {
            if (err) { console.log("sth happened here"); }
        });

        thisistheline = "DELETE FROM student WHERE sid= \"" + req.params.sid + "\"\n";
        db.query(thisistheline, (err, results) => {
            if (err) { console.log("sth happened here"); }
        });

        thisistheline = "DELETE FROM supervisorpairstudent WHERE sid= \"" + req.params.sid + "\"\n";
        db.query(thisistheline, (err, results) => {
            if (err) { console.log("sth happened here"); }
        });

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

        console.log(thisistheline)
        db.query(thisistheline, function (err, result) {
            if (err) {
                res.status(401).json("Error happened when excuting : " + thisistheline);
            };
            console.log("1 record inserted");
        });

        return res.ok("created");
    },

    readsinglestudentttb : async function(req,res){

        let thisistheline;
       
            thisistheline = "select allclass.CID, allclass.rid, allclass.weekdays,allclass.startTime,allclass.endTime,allstudenttakecourse.picdata,allstudenttakecourse.confirmation,allstudenttakecourse.Submissiontime from allstudenttakecourse inner join allclass on allclass.cid = allstudenttakecourse.cid and PID=\"" + req.params.SID + "\" ORDER BY  startTime asc ,weekdays asc";

        // console.log(thisistheline);
        db.query(thisistheline, function (err, result) {
            try {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                personallist = json;
                // console.log(personallist)
                
                return res.view("user/readttb",{ 
                    date:date,
                    allpersonallist: personallist,
                    SID : req.params.SID})

            } catch (err) {
                // console.log(' getpersonalallclass MySQL Problem' + "    " + err);
            }

        });
        
    }

}