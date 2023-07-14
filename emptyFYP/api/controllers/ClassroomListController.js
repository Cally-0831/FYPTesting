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

    listclassroom: async function (req, res) {
        var classroomlist;
        
        let thisistheline = "SELECT * FROM classroom";

        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                console.log('>> json: ', json);  
                classroomlist = json;
                //console.log('>> stdlist: ', stdlist);  
                return res.view('user/classroomlist', { allClassroomlist: classroomlist });
            } catch (err) {
                console.log("sth happened here");

            }


        });


    },

    deleteclassroom: async function (req, res) {

        let thisistheline = "DELETE FROM classroom WHERE rid= \"" + req.body.RID + "\" and campus = \"" + req.body.Campus + "\"";
        console.log('delete excution');
        console.log(thisistheline);
        db.query(thisistheline, (err, results) => {
            try {
                console.log("Record deleted")

            } catch (err) {
                if (err) {
                    console.log("sth happened here");
                    res.status(401).json("Error");
                }
            }

        });
        return res.json("deleted");
    },

    getcampus: async function (req, res) {
        var campuslist;
        
        let thisistheline = "SELECT DISTINCT campus FROM classroom";
        console.log(thisistheline)
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                console.log('>> string: ', string);
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                campuslist = json;
                //console.log('>> stdlist: ', stdlist);  
                return res.view('user/createnewclassroom', { allCampuslist: campuslist });
            } catch (err) {

                console.log("sth happened here");

            }


        });
    },

    createnewclassroom: async function (req, res) {

        thisistheline = "insert into classroom values(\"" +
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
        const roominfo = {
            Campus: req.params.campus,
            RID: req.params.rid
        };
        //console.log(roominfo);
        return res.view('user/createnewclassroomtimeslot', { roominfo: roominfo });

    },

    addclassroomtimeslot: async function (req, res) {
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
        if (req.body.Unavailabletype == "timeslot") {
            thisistheline = "insert into allclassroomtimeslot values(\"" + reqid + "\",\"" + req.params.campus + "\",\"" + req.params.rid
                + "\",\"" + req.body.notokstartday + "\",\"" + req.body.notokstartday + "\",\"" + req.body.starttime
                + "\",\"" + req.body.endtime + "\",\"" + req.body.remarks + "\")";
        } else if (req.body.Unavailabletype == "wholeday") {
            thisistheline = "insert into allclassroomtimeslot values(\"" + reqid + "\",\"" + req.params.campus + "\",\"" + req.params.rid
                + "\",\"" + req.body.notokstartday + "\",\"" + req.body.notokstartday + "\",\"00:00\",\"23:59\",\"" + req.body.remarks + "\")";
        } else if (req.body.Unavailabletype == "dayrange") {
            thisistheline = "insert into allclassroomtimeslot values(\"" + reqid + "\",\"" + req.params.campus + "\",\"" + req.params.rid
                + "\",\"" + req.body.notokstartday + "\",\"" + req.body.notokendday + "\",\"" + req.body.starttime
                + "\",\"" + req.body.endtime + "\",\"" + req.body.remarks + "\")";
        }


        db.query(thisistheline, function (err, result) {
            if (err) {
                return res.status(401).json("Error happened when excuting : " + thisistheline);
            } else {
                console.log("1 record inserted");
                return res.json("created");
            }

        });

    },

    listalltimeslot: async function (req, res) {
        var timeslotlist;
       
        let thisistheline = "SELECT * FROM allclassroomtimeslot ORDER BY startdate,starttime;";
        db.query(thisistheline, function (err, results) {
            if (err) {
               return res.status(401).json("Error happened when excuting : " + thisistheline);
            }else{
                var string = JSON.stringify(results);
                var json = JSON.parse(string); 
                timeslotlist = json;
            console.log(timeslotlist)
                return res.view('user/managetimeslot', { thetimeslotlist: timeslotlist });
            }
            
        });
    },

    deletetimeslot: async function (req, res) {

        if (req.session.role = "adm") {
            let thisistheline = "DELETE FROM  allclassroomtimeslot WHERE reqid= \"" + req.body.ReqID + "\"\n";
            console.log('delete excution');
            console.log(thisistheline);
            db.query(thisistheline, (err, results) => {
                try {

                    return res.ok("Deleted");
                } catch (err) {
                    if (err) { console.log("sth happened here"); }
                }

            });
        }
    },

    getinfobycampus: async function (req, res) {
      var roomlist;
        let thisistheline="SELECT * FROM allclassroomtimeslot order by campus,RID,startdate,enddate;";
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string); 
                roomlist = json;
                return res.view('user/classroommanagement', { allClassroomlist:roomlist});
           
            } catch (err) {
                if (err) { console.log("sth happened here"); }
            }

        });
    
    },

    getsingleroomtimeslot: async function (req, res) {
        const roominfo = {
            Campus: req.params.campus,
            RID: req.params.rid
        };
        var timeslotlist ;
       
        let thisistheline="SELECT * FROM allclassroomtimeslot where campus = \""+req.params.campus+"\" and RID =\""+req.params.rid+"\" order by startdate,enddate;";
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string); 
                timeslotlist=json;
                console.log(json);
                return res.view('user/view', { roominfo: roominfo , thetimeslotlist : timeslotlist});
            } catch (err) {
                if (err) { console.log("sth happened here"); }
            }

        });
        //console.log(roominfo);
        
    }

}