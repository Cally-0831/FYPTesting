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

    viewschdulepage: async function (req, res) {

    },
    viewfinalschdule: async function (req, res) {
        var thisistheline;
        var releasedate;
        var releasetime;

        if (req.session.role == "obs") {
            thisistheline = "select * from allsupersetting inner join supervisorpairobserver on allsupersetting.Creator = supervisorpairobserver.tid  where supervisorpairobserver.oid = \"" + req.session.userid + "\" and typeofsetting = \"4\""
        } else if (req.session.role == "stu") {
            thisistheline = "select * from allsupersetting inner join supervisorpairstudent on allsupersetting.Creator = supervisorpairstudent.tid  where supervisorpairstudent.sid = \"" + req.session.userid + "\" and typeofsetting = \"4\""
        }

        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                console.log('>> json: ', json); 
                if(json.length ==0){
                    releasedate = null
                    releasetime = null
                } else{
                    releasedate = json[0].deadlinedate;
                    releasetime = json[0].deadlinetime;
                }
                
                //console.log('>> stdlist: ', stdlist);  
                return res.view('user/checkschdule', { releasedate : releasedate , releasetime : releasetime });
            } catch (err) {
                console.log("sth happened here");

            }


        });
    },
}