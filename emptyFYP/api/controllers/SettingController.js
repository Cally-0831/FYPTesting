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
        var delthisline = "";

        if (req.body.command == "insert") {
            if (req.body.type == 3) {
                thisistheline = "Insert into allsupersetting (stid,creator,typeofsetting,startdate,starttime,enddate,endtime)values(\"" + stid + "\",\"" + req.session.userid + "\",\"" + req.body.type + "\",\"" + req.body.startdate + "\",\"" + req.body.starttime + "\",\"" + req.body.enddate + "\",\"" + req.body.endtime + "\")"
            } else {
                thisistheline = "Insert into allsupersetting (stid,creator,typeofsetting,deadlinedate,deadlinetime)values(\"" + stid + "\",\"" + req.session.userid + "\",\"" + req.body.type + "\",\"" + req.body.date + "\",\"" + req.body.time + "\")"

            }


        } else if (req.body.command == "update") {
            if (req.body.type == 3) {
                thisistheline = "Insert into allsupersetting (stid,creator,typeofsetting,startdate,starttime,enddate,endtime)values(\"" + stid + "\",\"" + req.session.userid + "\",\"" + req.body.type + "\",\"" + req.body.startdate + "\",\"" + req.body.starttime + "\",\"" + req.body.enddate + "\",\"" + req.body.endtime + "\")"
                delthisline = "DELETE FROM allsupersetting WHERE typeofsetting = \"" + req.body.type + "\" and Announcetime is null"
                //thisistheline = "update allsupersetting set lastUpdate = now(), startdate =\"" + req.body.startdate + "\" , starttime=\"" + req.body.starttime + "\", enddate =\"" + req.body.enddate + "\" , endtime=\"" + req.body.endtime + "\",announcetime=null where creator=\"" + req.session.userid + "\" and typeofsetting=\"" + req.body.type + "\" "

            } else {
                thisistheline = "Insert into allsupersetting (stid,creator,typeofsetting,deadlinedate,deadlinetime)values(\"" + stid + "\",\"" + req.session.userid + "\",\"" + req.body.type + "\",\"" + req.body.date + "\",\"" + req.body.time + "\")"
                delthisline = "DELETE FROM allsupersetting WHERE typeofsetting = \"" + req.body.type + "\" and Announcetime is null"

                //thisistheline = "update allsupersetting set lastUpdate = now(), deadlinedate =\"" + req.body.date + "\" , deadlinetime=\"" + req.body.time + "\",announcetime=null where creator=\"" + req.session.userid + "\" and typeofsetting=\"" + req.body.type + "\" "

            }

        }
        console.log(thisistheline);
        console.log(delthisline)
        if (delthisline != "") {
            db.query(delthisline, (err, results) => {
                try {
                    console.log("del empty done")
                } catch (err) {
                    console.log("sth happened here");
                }
            });
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

                return res.view('user/setting', { thissupersetting: supersetting });
            } catch (err) {
                console.log("error happened when excuting SettingController.getsetting");

            }


        });
    },

    nodraft: async function (req, res) {
        let thisistheline2 = " select * from allsupersetting where announcetime is not null order by typeofsetting asc";
        var supersetting;
        db.query(thisistheline2, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                supersetting = json;

                var today = new Date();
                var checking = -1;
                var msg = "";
                var realreleaseday;
                var presentstartday;
                var presentendday;
                var warning = 200;
                for (var i = 0; i < supersetting.length; i++) {

                    if (supersetting[i].deadlinedate != null) {
                        /** this is for setting 1/2/4 */
                        var settingday = new Date(supersetting[i].deadlinedate).toDateString();
                        var settingtime = supersetting[i].deadlinetime;
                        var stringstring = settingday + " " + settingtime;
                        var dday = new Date(stringstring);
                        if (supersetting[i].typeofsetting == 4) {
                            realreleaseday = dday
                        }

                        if (today < dday) {
                            if (i == 3) {
                                checking = -1
                            } else {
                                checking = 1;
                            }
                            msg += supersetting[i].typeofsetting + "&"

                        }
                    } else {
                        /** this is for setting 3 */
                        var settingstartday = new Date(supersetting[i].startdate).toDateString();
                        var settingstarttime = supersetting[i].starttime;
                        var settingendday = new Date(supersetting[i].enddate).toDateString();
                        var settingendtime = supersetting[i].endtime;

                        var stringstring1 = settingstartday + " " + settingstarttime;
                        var stringstring2 = settingendday + " " + settingendtime;
                        var startdday = new Date(stringstring1);
                        presentstartday = startdday
                        presentendday = new Date(stringstring2);

                        if (today > startdday) {
                            msg += supersetting[i].typeofsetting + "&"
                            checking = 1;
                        }
                    }

                  //  console.log(i + "     " + checking + "       " + msg)
                }
                if (checking > 0) {
                 //   console.log(checking + "    " + msg)
                    warning = 401;

                } else {
                    warning = 200;
                }
                return res.view("user/admin/scheduledesign", {
                    havedraft: "N",
                    warning: warning, msg: msg,
                    realreleaseday: realreleaseday,
                    presentstartday: presentstartday,
                    presentendday: presentendday,

                });




            } catch (err) {
                console.log("sth happened here");

            }


        });

    },

    checksetting: async function (req, res) {
        let thisistheline = " select draft from supervisor";

        db.query(thisistheline, (err, results) => {
            var string = JSON.stringify(results);
            //console.log('>> string: ', string );
            var json = JSON.parse(string);
            var havedraft = json[0].draft;
            //console.log('>> havedraft: ', havedraft);
            if (havedraft == "Y") {
                return res.status(200).json("redirect");
            } else {
                return res.status(200).json("go")
            }

        });

    },

    

}