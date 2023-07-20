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

    listallnotice: async function (req, res) {
        var noticelist;

        if (req.session.role == "adm") {
            let thisistheline = "SELECT  NID, allusersname,content,CreateDate,Creatorname,title from allnotice inner join allusers on allnotice.Creator = allusers.pid order by allnotice.CreateDate DESC;";
            //  console.log(thisistheline)
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    //console.log('>> string: ', string );
                    var json = JSON.parse(string);
                    //console.log('>> json: ', json);  
                    noticelist = json;
                    //         console.log('>> noticelist: ', noticelist);
                    return res.view('user/notice', { thisusernoticetlist: noticelist });
                } catch (err) {
                    console.log("sth happened here");

                }


            });
        } else if (req.session.role == "sup") {
            let thisistheline = " SELECT  allnotice.NID, allusers.allusersname,allnotice.content,allnotice.CreateDate,allnotice.Creator,allnotice.Creatorname,allnotice.title from allnotice" +
                "\ninner join allusers on allnotice.Creator = allusers.pid "
                + " where allnotice.creator = \"admin\" or allnotice.creator= \"" + req.session.userid + "\" order by allnotice.CreateDate DESC;";

            //    console.log(thisistheline)
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    //console.log('>> string: ', string );
                    var json = JSON.parse(string);
                    //console.log('>> json: ', json);  
                    noticelist = json;
                    //            console.log('>> noticelist: ', noticelist);
                    return res.view('user/notice', { thisusernoticetlist: noticelist });
                } catch (err) {
                    console.log("sth happened here");
                }
            });
        } else {
            let thisistheline = "select distinct allnotice.nid, allnotice.Creator,allnotice.Creatorname,allnotice.CreateDate, allnotice.title, allnotice.content from allnotice "
                + "inner join  supervisorpairstudent on supervisorpairstudent.sid=\"" + req.session.userid + "\" "
                + "and  allnotice.Creator =supervisorpairstudent.tid or allnotice.Creator = \"admin\" order by allnotice.CreateDate DESC;"
            console.log(thisistheline)
            db.query(thisistheline, (err, results) => {
                try {
                    var string = JSON.stringify(results);
                    //console.log('>> string: ', string );
                    var json = JSON.parse(string);
                    //console.log('>> json: ', json);  
                    noticelist = json;
                    //       console.log('>> noticelist: ', noticelist);
                    return res.view('user/notice', { thisusernoticetlist: noticelist });
                } catch (err) {
                    console.log("sth happened here");
                }
            });
        }

    },

    addnotice: async function (req, res) {
        console.log(req.body);

        let nid = 'nid';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < 5) {
            nid += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }

        let thisistheline = "insert into allnotice values(\"" + nid + "\",\"" + req.session.userid + "\",\"" + req.session.username + "\",now(),\"" + req.body.title + "\",\"" + req.body.content + "\"\);"
        //    console.log(thisistheline);
        db.query(thisistheline, (err, results) => {
            try {
                console.log("insert new notice");
                return res.json("ok");
            } catch (err) {
                console.log("sth happened here");

            }


        });
    },

    viewnoticepage: async function (req, res) {
        if(req.body == null){
            return res.view('user/createnewnotice', { title: null, content: null });
        }
       
            console.log(req.body)
            

            var title;
            var content;

            if (req.body.type == 0) {
                title = "Deadline for Submitting Sememster Timetable";
                content = "The deadline of submitting semester timetable has been set as follows:\n"
                    + "Date: " + req.body.date
                    + "\nTime: " + req.body.time
                    + "\n\nPlease be remined that to upload your timetable pic from Buniport as proof."
                    + "\nSubmission without valid proof will not be reviewd by Supervisor."
                    + "\n\nFor Student who enrolled 0 course this sememster, should all input an entry as a declaration."
            } else if (req.body.type == 1) {
                title = "Deadline for Submitting Unavailable Timeslots";
                content = "The deadline of submitting unavailable timeslots has been set as follows:\n"
                    + "Date: " + req.body.date
                    + "\nTime: " + req.body.time
                    + "\n\nPlease be remined that to upload a valid proof."
                    + "\nSubmission without valid proof will not be reviewd by Supervisor."
                    + "\n\nReasons like part-time job will not be approved."
            } else if (req.body.type == 2) {
                title = "Presentation Schdeule Release Date";
                content = "The release date for presentation schdeule has been set as follows:\n"
                    + "Date: " + req.body.date
                    + "\nTime: " + req.body.time
                    + "\n\nStudents should check and follow their personal timeslots after the release of the schdeule."

            }
            try {
                return res.view('user/createnewnotice', { title: title, content: content });
            } catch (err) {
                console.log(err)
            }

        
    }


}