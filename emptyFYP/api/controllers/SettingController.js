
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
                thisistheline = "Insert into allsupersetting (stid,creator,typeofsetting,startdate,starttime,enddate,endtime)values(\"" + stid + "\",\"" + req.session.userid + "\",\"" + req.body.type + "\",\"" + req.body.startdate + "\",\"09:00:00\",\"" + req.body.enddate + "\",\"18:30:00\")"
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

    FastUpdateSetting: async function (req, res) {
       
        var importer= await sails.helpers.importer();
        const sqlfiles = [
            '../SQL/Standard/SettingUpdateForFastTesting.sql'
          ]
         
          importer.onProgress(progress=>{
            var percent = Math.floor(progress.bytes_processed / progress.total_bytes * 10000) / 100;
            console.log(`${percent}% Completed`);
          });
        
          importer.onDumpCompleted(callback=>{
            var path = callback.file_path;
            var result = callback.error;
            console.log(path,+"     ",result);
          });
        
          for (let f of sqlfiles) {
            console.log(f)
           await importer.import(f);
            var files_imported = importer.getImported();
            console.log(`${files_imported.length} SQL file(s) imported.`);
          }
        
        return res.status(200).json("SQL excuetion complete");

    },
}