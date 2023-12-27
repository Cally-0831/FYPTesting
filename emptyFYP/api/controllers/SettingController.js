
module.exports = {

    submitsetting: async function (req, res) {
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
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
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        let thisistheline = " select * from allsupersetting where creator=\"" + req.session.userid + "\" order by typeofsetting asc";
        var supersetting;
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                //console.log('>> string: ', string );
                var json = JSON.parse(string);
                //console.log('>> json: ', json);  
                supersetting = json;

                return res.view('user/admin/setting', { thissupersetting: supersetting });
            } catch (err) {
                console.log("error happened when excuting SettingController.getsetting");

            }


        });
    },

    nodraft: async function (req, res) {
        let getallsetting = " select * from allsupersetting where announcetime is not null order by typeofsetting asc";
        var supersetting;
        var db = await sails.helpers.database();
        var pool = await sails.helpers.database2();
        var checking = false;

        var checkarrangedobs = "select * from student where sid not in (select sid from observerpairstudent)";
        var arranged = await new Promise((resolve) => {
            pool.query(checkarrangedobs, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                console.log("pairing result :", ans)
                if (ans.length > 0) {
                    ans = false
                } else {
                    ans = true
                }
                console.log(ans + "    jdshfjashdf")
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "Error happened in SettingController.nodraft.checkarrangedobs"
        })

        var checkdeadline = "select deadlinedate , deadlinetime,typeofsetting from allsupersetting where typeofsetting != 3 and Announcetime is not null order by typeofsetting asc";
        var setting1 = await new Promise((resolve) => {
            pool.query(checkdeadline, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                if (ans.length > 0) {
                    for (var a = 0; a < ans.length; a++) {
                        var deadlinedate = new Date(ans[a].deadlinedate);
                        var deadlinetime = ans[a].deadlinetime.split(":");
                        deadlinedate.setHours(deadlinetime[0]);
                        deadlinedate.setMinutes(deadlinetime[1]);
                        deadlinedate.setSeconds(deadlinetime[2]);
                        ans[a].deadlinedate = deadlinedate;
                    }


                } else {
                    ans = undefined
                }
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "Error happened in SettingController. nodraft.setting1"
        })



        checkdeadline = "select startdate , starttime,enddate,endtime from allsupersetting where typeofsetting = 3 and Announcetime is not null";
        var setting3 = await new Promise((resolve) => {
            pool.query(checkdeadline, (err, res) => {
                var string = JSON.stringify(res);
                var json = JSON.parse(string);
                var ans = json;
                console.log(ans)
                if (ans.length > 0) {

                    var settingstartday = new Date(ans[0].startdate).toDateString();
                    var settingstarttime = ans[0].starttime;
                    var settingendday = new Date(ans[0].enddate).toDateString();
                    var settingendtime = ans[0].endtime;

                    var stringstring1 = settingstartday + " " + settingstarttime;
                    var stringstring2 = settingendday + " " + settingendtime;
                    var startdday = new Date(stringstring1);
                    presentstartday = startdday
                    presentendday = new Date(stringstring2);
                    ans = JSON.parse(JSON.stringify({ "presentstartday": presentstartday, "presentendday": presentendday }))
                } else {
                    ans = undefined
                }
                resolve(ans)
            })
        }).catch((err) => {
            errmsg = "Error happened in SettingController. nodraft.setting3"
        })

        console.log(">>setting1", setting1)
        console.log(">>setting3", setting3)

        var today = new Date();
        var errormsg = ""
        for (var a = 0; a < setting1.length; a++) {
            console.log("handling   " + setting1[a].typeofsetting)
            if (setting1[a].typeofsetting == 4 && a != setting1.length - 1) {
                setting1.push(setting1.splice(a, 1)[0])
            } else if (setting1[a].typeofsetting == 4 && a == setting1.length - 1) {
                if (new Date(setting3.presentstartday) > today) {
                    checking = true;
                } else {
                    checking = false;
                    errormsg += "3&"
                }


                if (setting1[a].deadlinedate > today) {
                    checking = true;
                } else {
                    checking = false;
                    errormsg += setting1[a].typeofsetting + "&";

                }


            }
            console.log("handling now  " + setting1[a].typeofsetting)
            if (setting1[a].typeofsetting != 4 && setting1[a].deadlinedate < today) {
                checking = true
            } else if (setting1[a].typeofsetting != 4 && setting1[a].deadlinedate > today) {
                checking = false;
                errormsg += setting1[a].typeofsetting + "&"

            }
        }
        var warning;
        var erray = errormsg.split("&");
        erray = erray.filter((word) => word.length > 0);


        console.log(arranged + "    " + erray)
        if (arranged) {
            if (erray.length == 1 && erray.includes("4")) {
                warning = "200";
                console.log("here1")
            } else {
                warning = "401";
                console.log("here2");
            }

        } else {
            warning = "401";
            erray.push("A");
            console.log("here3")
        }
        console.log("erray", erray);

        return res.view("user/admin/scheduledesign", {
            havedraft: "N",
            warning: warning, msg: errormsg,
            erray: erray,
            realreleaseday: setting1.find((element) => element.typeofsetting == 4).deadlinedate,
            presentstartday: new Date(setting3.presentstartday),
            presentendday: new Date(setting3.presentendday),

        });
    },
    resetDB: async function (req, res) {
        const importer = await sails.helpers.importer();
        const fs = require("fs");

        const sqlfiles = [
            '../SQL/Standard/dropcommand.sql',
            '../SQL/Standard/TableCreate.sql',
            '../SQL/Standard/TriggerCreate.sql',
            '../SQL/Standard/SampleData.sql',
            '../SQL/Standard/Setting.sql',
            '../SQL/Standard/AllclassSQL.sql'
        ]
        importer.onProgress(progress => {
            var percent = Math.floor(progress.bytes_processed / progress.total_bytes * 10000) / 100;
            console.log(`${percent}% Completed`);
        });

        importer.onDumpCompleted(callback => {
            var path = callback.file_path;
            var result = callback.error;
            console.log(path, +"     ", result);
        });

        for (let f of sqlfiles) {
            console.log(f)
            await importer.import(f);
            var files_imported = importer.getImported();
            console.log(`${files_imported.length} SQL file(s) imported.`);
        }
        return res.status(200).json("ok");

    },
}