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
    submitsetting: async function (req, res) {
        let stid = 'stid';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < 5) {
            stid += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        let thisistheline = "";

        if (req.body.command == "insert") {
            if (req.body.type == 3) {
                thisistheline = "Insert into allsupersetting (stid,creator,typeofsetting,startdate,starttime,enddate,endtime)values(\"" + stid + "\",\"" + req.session.userid + "\",\"" + req.body.type + "\",\"" + req.body.startdate + "\",\"" + req.body.starttime + "\",\"" + req.body.enddate + "\",\"" + req.body.endtime + "\")"
            } else {
                thisistheline = "Insert into allsupersetting (stid,creator,typeofsetting,deadlinedate,deadlinetime)values(\"" + stid + "\",\"" + req.session.userid + "\",\"" + req.body.type + "\",\"" + req.body.date + "\",\"" + req.body.time + "\")"

            }

            console.log(thisistheline);
        } else if (req.body.command == "update") {
            if (req.body.type == 3) {
                thisistheline = "update allsupersetting set lastUpdate = now(), startdate =\"" + req.body.startdate + "\" , starttime=\"" + req.body.starttime + "\", enddate =\"" + req.body.enddate + "\" , endtime=\"" + req.body.endtime + "\",announcetime=null where creator=\"" + req.session.userid + "\" and typeofsetting=\"" + req.body.type + "\" "

            } else {
                thisistheline = "update allsupersetting set lastUpdate = now(), deadlinedate =\"" + req.body.date + "\" , deadlinetime=\"" + req.body.time + "\",announcetime=null where creator=\"" + req.session.userid + "\" and typeofsetting=\"" + req.body.type + "\" "

            }
            console.log(thisistheline);
        }

        db.query(thisistheline, (err, results) => {
            try {
                console.log("setting done")
                return res.json("ok")
            } catch (err) {
                console.log("sth happened here");

            }


        });
    },

    getsetting: async function (req, res) {
        let thisistheline = " select * from allsupersetting where creator=\"" + req.session.userid + "\" order by typeofsetting asc";
        var supersetting;
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                supersetting = json;
                console.log("getting done")
                return res.view('user/setting', { thissupersetting: supersetting });
            } catch (err) {
                console.log("sth happened here");

            }


        });
    },

}