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
        let sid = 'sid';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < 5) {
            sid += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        let thisistheline = "";
        
        if (req.body.command == "insert") {

            thisistheline = "Insert into allsupersetting (sid,creator,typeofsetting,deadlinedate,deadlinetime)values(\"" + sid + "\",\"" + req.session.userid + "\",\"" + req.body.type + "\",\"" + req.body.date + "\",\"" + req.body.time + "\")"
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
    }
}