
module.exports = {
    uploadlesson: async function (req, res) {
        var db = await sails.helpers.database();
        console.log(req.body);
        try{
            if(req.body[0].Cdept == undefined || req.body[0].CSecCode == undefined 
            || req.body[0].Campus == undefined || req.body[0].RID == undefined 
            || req.body[0].weekdays == undefined || req.body[0].startTime == undefined|| req.body[0].endTime == undefined){
                return res.status(401).json("Invalid Input")
            }
        }catch(err){return res.status(401).json("Invalid Input")}
        for (var i = 0; i < req.body.length; i++) {
            let thisistheline = "insert ignore into allclass values(\"" + req.body[i].Cdept + "\",\"" + req.body[i].Ccode + "\",\""
                + req.body[i].CSecCode + "\",\"\",\"" + req.body[i].Campus + "\",\"" + req.body[i].RID + "\",\"" + req.body[i].weekdays + "\",\""
                + req.body[i].startTime + "\",\"" + req.body[i].endTime + "\",\"0\");"
            console.log(thisistheline)
            db.query(thisistheline, function (err, result) {
                try{
                     console.log("1 record inserted");
                }catch(err){
                    console.log(err);
                    return res.status(401).json("Error happened when excuting : " + thisistheline);
                }
            });



        }
        return res.status(200).json("ok");
    },

    listlesson: async function (req, res) {
        var db = await sails.helpers.database();

        let thisistheline = "select * from allclass order by CID asc , campus asc , RID asc";
        db.query(thisistheline, function (err, result) {

            try {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                return res.view('user/admin/lessonlist', { lessonlist: json });
            } catch (err) {
                return res.status(401).json("Error happened when excuting : " + thisistheline);
            }


        });

    },

    deletelesson: async function (req, res) {
        var db = await sails.helpers.database();
        let thisistheline = "DELETE from allclass where CID = \""+req.body.CID+"\""
        db.query(thisistheline, function (err, result) {

            try {
               
                return res.ok();
            } catch (err) {
                return res.status(401).json("Error happened when excuting : " + thisistheline);
            }


        });
    },

    viewlesson :async function (req, res) {
        var db = await sails.helpers.database();
        
        
        let thisistheline = "select * from allclass where CID like \""+req.params.CID+"%\" order by weekdays asc, startTime asc, endtime asc";
        db.query(thisistheline, function (err, result) {

            try {
                var string = JSON.stringify(result);
                var json = JSON.parse(string);
                //console.log(json)
                return res.view("user/admin/lessondetails",{lessoninfo : json});
            } catch (err) {
                return res.status(401).json("Error happened when excuting : " + thisistheline);
            }


        });

    },

    
}