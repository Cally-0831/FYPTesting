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
        } else if(req.session.role == "obs"){
            let thisistheline = "select distinct allnotice.nid, allnotice.Creator,allnotice.Creatorname,allnotice.CreateDate, allnotice.title, allnotice.content from allnotice "
                + "inner join  supervisorpairobserver on supervisorpairobserver.oid=\"" + req.session.userid + "\" "
                + "and  allnotice.Creator =supervisorpairobserver.tid or allnotice.Creator = \"admin\" order by allnotice.CreateDate DESC;"
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
        }else {
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
        if (req.body.id == "") {

            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < 5) {
                nid += characters.charAt(Math.floor(Math.random() * charactersLength));
                counter += 1;
            }

        } else if (req.body.id != "") {
            nid +=req.body.id;
        }
        console.log(nid)
        let thisistheline = "insert into allnotice values(\"" + nid + "\",\"" + req.session.userid + "\",\"" + req.session.username + "\",now(),\"" + req.body.title + "\",\"" + req.body.content + "\"\);"
           console.log(thisistheline);
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

        if (req.query.type == null) {
            return res.view('user/createnewnotice', { title: null, content: null, id: null });
        }


        var title;
        var content;

        if (req.query.type == 0) {
            title = "Deadline for Submitting Sememster Timetable";
            content = "The deadline of submitting semester timetable has been set as follows:\n"
                + "Date: " + req.query.date
                + "\nTime: " + req.query.time
                + "\n\nPlease be remined that to upload your timetable pic from Buniport as proof."
                + "\nSubmission without valid proof will not be reviewd by Supervisor."
                + "\n\nFor Student who enrolled 0 course this sememster, should all input an entry as a declaration."
        } else if (req.query.type == 1) {
            title = "Deadline for Submitting Unavailable Timeslots";
            content = "The deadline of submitting unavailable timeslots has been set as follows:\n"
                + "Date: " + req.query.date
                + "\nTime: " + req.query.time
                + "\n\nPlease be remined that to upload a valid proof."
                + "\nSubmission without valid proof will not be reviewd by Supervisor."
                + "\n\nReasons like part-time job will not be approved."
        } else if (req.query.type == 2) {
            title = "Presentation Period Date";
            content = "The presentation period date has been set as follows:\n"
                + "From : " + req.query.startdate+" , " + req.query.starttime+"\n"
                + "To   : " + req.query.enddate+" , " + req.query.endtime
                + "\n\nStudents should start applying their unavaliable timeslots for the presentation period."
                + "\nReasons like parttime job will not be acceptable."
                + "\n\nPlease be reminded that to provide valid proof to your supervisor when submitting the request,"
                + "\nor else the request will not be consider."

        }else if (req.query.type == 3) {
            title = "Presentation Schdeule Release Date";
            content = "The release date for presentation schdeule has been set as follows:\n"
                + "Date: " + req.query.date
                + "\nTime: " + req.query.time
                + "\n\nStudents should check and follow their personal timeslots after the release of the schdeule."

        }
        console.log(req.query)

        return res.view('user/createnewnotice', { title: title, content: content, id: req.query.STID });





    }
}