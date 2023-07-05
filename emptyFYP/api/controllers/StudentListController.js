module.exports = {

    liststudent: async function (req, res) {
        var stdlist;
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

        let thisistheline = "SELECT student.stdname, student.sid,supervisorpairstudent.Topic "+
        "\n FROM supervisorpairstudent "+"\n INNER JOIN student ON student.sid=supervisorpairstudent.sid"+
        "\n where supervisorpairstudent.tid = \""+req.session.userid+"\"\;";

        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                stdlist=json;    
                //console.log('>> stdlist: ', stdlist);  
                return res.view('user/liststudent',{allstdlist : stdlist});  
            } catch (err) {
               console.log("sth happened here");

            }


        });
        
        
    },

    gettopic: async function (req, res) {
        var topiclist;
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
            console.log('the gettopic MySQL Connected');
        });

        let thisistheline = "SELECT topic FROM supervisorpairstudent where supervisorpairstudent.tid =\""+req.session.userid+"\"\;";

        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                topiclist=json;    
                //console.log('>> stdlist: ', stdlist);  
                return res.view('user/createnewstudent',{alltopiclist : topiclist});  
            } catch (err) {
throw err;
               console.log("sth happened here" + err);

            }


        });
    },

    readsinglestudent : async function(req,res){
        var studentresult;
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
        console.log(req.params.sid);

        let thisistheline = "SELECT student.stdname, student.sid,supervisorpairstudent.Topic "+
        "\n FROM supervisorpairstudent "+"\n INNER JOIN student ON student.sid=supervisorpairstudent.sid"+
        "\n where supervisorpairstudent.tid = \""+req.session.userid+"\""+
        "\n and student.sid = \""+req.params.sid+"\"\;";

        console.log('>> the line: ', thisistheline );
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                studentresult=json;    
                //console.log('>> stdlist: ',studentresult);  
                return res.view('user/read', { thatstudent: studentresult }); 
            } catch (err) {
               console.log("sth happened here");

            }


        });
       
    },

    deletestudent : async function(req,res){
        var studentresult;
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
        
        let thisistheline = "DELETE FROM allusers WHERE pid= \""+req.params.sid+"\"\n";
        console.log('delete excution');
        console.log(thisistheline);
        db.query(thisistheline, (err, results) => {
           if(err) {console.log("sth happened here");}
        });

        thisistheline = "DELETE FROM student WHERE sid= \""+req.params.sid+"\"\n";
        db.query(thisistheline, (err, results) => {
            if(err) {console.log("sth happened here");}
         });

         thisistheline ="DELETE FROM supervisorpairstudent WHERE sid= \""+req.params.sid+"\"\n";
         db.query(thisistheline, (err, results) => {
            if(err) {console.log("sth happened here");}
         });
        
        return res.ok("Deleted"); 
    },

    createnewstudent: async function (req, res) {}
}