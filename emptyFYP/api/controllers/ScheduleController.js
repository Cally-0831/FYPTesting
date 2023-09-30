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

    viewschedulepage: async function (req, res) {

    },
    viewfinalschedule: async function (req, res) {
        var getsettinginfo;
        var getschedulebox;
        var thisistheline3;
        var releasedate;
        var releasetime;

        if (req.session.role == "sup") {
            getsettinginfo = "select * from allsupersetting where where announcetime is not null and  typeofsetting= \"4\""
            getschedulebox = "select * from allschedulebox where tid = \"" + req.session.userid + "\" or oid =\"" + req.session.userid + "\"";
        } else if (req.session.role == "stu") {
            getsettinginfo = "select * from allsupersetting where announcetime is not null and  typeofsetting= \"4\"";
            getschedulebox = "select * from allschedulebox where sid = \"" + req.session.userid + "\""
        }

        db.query(getsettinginfo, (err, results) => {
            try {
                //get setting check can the system show now
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                if (json.length == 0) {
                    releasedate = null
                    releasetime = null
                } else {
                    releasedate = json[0].deadlinedate;
                    releasetime = json[0].deadlinetime;
                }
                //console.log('>> checkschedeulerelease: ', json);

                db.query(getschedulebox, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        var personalschedulebox = json;
                        return res.view('user/checkschedule', {
                            releasedate: releasedate, releasetime: releasetime,
                            personalschedulebox: personalschedulebox
                        });

                    } catch (err) {
                        console.log("sth happened here");
                    }
                });
            } catch (err) {
                console.log("sth happened here");
            }
        });
    },

    getallneededinfo: async function (req, res) {
        var getpairing = "select tid,supervisorpairstudent.sid,oid from supervisorpairstudent left join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid"
        //get the pairs
        db.query(getpairing, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                var threepartylist = json;
                thisistheline2 = "select startdate, starttime,enddate,endtime from allsupersetting where typeofsetting = \"3\" and Announcetime is not null;"
                /** Get present time */
                db.query(thisistheline2, (err, results) => {
                    var string = JSON.stringify(results);
                    var json = JSON.parse(string);
                    var presentdate = json
                    console.log(">>  presentdate:", presentdate)
                    var startstart = new Date(presentdate[0].startdate);
                    var endend = new Date(presentdate[0].enddate);
                    var strstarttime = presentdate[0].starttime.split(":");
                    var strendtime = presentdate[0].endtime.split(":");

                    var ansstartdate;
                    var ansenddate;
                    var adddate;
                    startstart.setHours(strstarttime[0], strstarttime[1], strstarttime[2]);
                    endend.setHours(strendtime[0], strendtime[1], strendtime[2]);
                    var strstartstart = startstart.toISOString().toString().split("T")[0];
                    var strendend = endend.toISOString().toString().split("T")[0];

                    var thisistheline3 = "select *  from classroom inner join allclass where classroom.Campus = allclass.Campus and classroom.RID = allclass.RID and allclass.Campus != \"\" and classroom.status != \"Close\" order by classroom.Campus asc ,classroom.RID asc, weekdays asc,startTime asc";
                    /** Get classroom's ttb */
                    db.query(thisistheline3, (err, results) => {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        var classroomusagelist = json;
                        console.log('>> classroomusagelist: ', classroomusagelist);
                        var thisistheline4 = "select  *  from allclassroomtimeslot left join classroom on classroom.campus = allclassroomtimeslot.campus and classroom.rid = allclassroomtimeslot.rid where classroom.status != \"Close\"and ((startdate between \"" + strstartstart + "\"  and \"" + strendend + "\") or (enddate between \"" + strstartstart + "\" and \"" + strendend + "\")) order by allclassroomtimeslot.Campus asc,allclassroomtimeslot.RID asc, allclassroomtimeslot.startTime asc"
                        /** Get classroom's unavailble timeslot */
                        db.query(thisistheline4, (err, results) => {
                            var string = JSON.stringify(results);
                            var json = JSON.parse(string);
                            var classroomtimeslotlist = json;
                            console.log('>> classroomtimeslotlist: ', classroomtimeslotlist);
                            var thisistheline5 = "select distinct(Campus) from classroom where Campus != \"\"";
                            db.query(thisistheline5, (err, results) => {
                                var string = JSON.stringify(results);
                                var json = JSON.parse(string);
                                var Campuslist = json;
                                console.log('>> Campuslist: ', Campuslist);
                                var thisistheline6 = "select * from classroom where Campus!=\"\" and status != \"Close\"";
                                db.query(thisistheline6, (err, results) => {
                                    var string = JSON.stringify(results);
                                    var json = JSON.parse(string);
                                    var allclassroomlist = json;
                                    console.log('>>allclassroomlist: ', allclassroomlist);
                                    var thisistheline7 = "select * from allsupertakecourse left join allclass on allsupertakecourse.CID = allclass.CID where confirmation = \"1\""
                                    db.query(thisistheline7, (err, results) => {
                                        var string = JSON.stringify(results);
                                        var json = JSON.parse(string);
                                        var superttb = json;
                                        console.log('>>superttb : ', superttb);
                                        var thisistheline8 = "select * from allstudenttakecourse left join allclass onallstudenttakecourse.CID = allclass.CID where confirmation = \"1\""
                                        db.query(thisistheline8, (err, results) => {
                                            var string = JSON.stringify(results);
                                            var json = JSON.parse(string);
                                            var stuttb = json;
                                            console.log('>>stuttb: ', stuttb);

                                        })
                                    })
                                })
                            })
                        })
                    })
                    return res.ok()
                })
            } catch (err) {
                console.log("error happened when excuting SchduleController.getallneededinfo")
            }
        })
    },


    createdraft: async function (req, res) {
        var campusfortoday;

        var supweeklist = [], obsweeklist = [], stdweeklist = [];

        for (var a = 0; a < 6; a++) {
            supweeklist.push([]);
            obsweeklist.push([]);
            stdweeklist.push([]);
        }

        var startday = new Date(req.body.fullstartday);
        var startime = startday.toLocaleTimeString("en-GB");
        var endday = new Date(req.body.fullendday);
        var endtime = endday.toLocaleTimeString("en-GB");
        //console.log((endday - startday) / 1000 / 60 / 60 / 24)
        var sessionduration = 0;
        var typeofpresent = req.body.typeofpresent;

        if (typeofpresent == "midterm") {
            sessionduration = 20;
        } else {
            sessionduration = 60;
        }

        var getallclassinfo = "select * from allclass"
        db.query(getallclassinfo, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                var classttb = json;
                var getallclassroominschool = "select * from classroom where status != \"Closed\" and rid != \"\" order by Campus asc, rid asc"
                db.query(getallclassroominschool, (err, results) => {
                    try {
                        var string = JSON.stringify(results);
                        var json = JSON.parse(string);
                        var classroomlist = json;
                        let distinctcampuslist = (classroomlist) => {
                            let unique_values = classroomlist
                                .map((item) => item.Campus)
                                .filter(
                                    (value, index, current_value) => current_value.indexOf(value) === index
                                );
                            return unique_values;
                        };

                        var campuslist = distinctcampuslist(classroomlist);

                        var getclassroomtimeslot = "select * from allclassroomtimeslot"
                        db.query(getclassroomtimeslot, (err, results) => {
                            try {
                                var string = JSON.stringify(results);
                                var json = JSON.parse(string);
                                var classroomtimeslot = json;
                                var getsupttb = "select * from allsupertakecourse left join allclass on allsupertakecourse.CID = allclass.CID where allsupertakecourse.pid = \"" + req.body.tid + "\" and confirmation = \"1\" order by weekdays asc, startTime asc"
                                //console.log(getsupttb)
                                db.query(getsupttb, (err, results) => {
                                    try {
                                        var string = JSON.stringify(results);
                                        var json = JSON.parse(string);
                                        var superttb = json;
                                        for (var a = 0; a < superttb.length; a++) {
                                            supweeklist[parseInt(superttb[a].weekdays) - 1].push(superttb[a]);
                                        }
                                        var getsuprequest = "select * from allrequestfromsupervisor where tid = \"" + req.body.tid + "\" and (RequestDate >= Date(\"" + req.body.startdaydate + "\") and RequestDate <= Date(\"" + req.body.enddaydate + "\")) order by RequestDate asc, requeststarttime asc "

                                        db.query(getsuprequest, (err, results) => {
                                            try {
                                                var string = JSON.stringify(results);
                                                var json = JSON.parse(string);
                                                var superrequest = json;
                                                var getsupschedulebox = "select * from allschedulebox where tid = \"" + req.body.tid + "\" order by boxdate asc , boxtime asc";
                                                db.query(getsupschedulebox, (err, results) => {
                                                    try {
                                                        var string = JSON.stringify(results);
                                                        var json = JSON.parse(string);
                                                        var superschedulebox = json;
                                                        var getobsttb = "select * from allsupertakecourse left join allclass on allsupertakecourse.CID = allclass.CID where allsupertakecourse.pid = \"" + req.body.oid + "\" and confirmation = \"1\" order by weekdays asc, startTime asc"
                                                        //console.log(getobsttb)
                                                        db.query(getobsttb, (err, results) => {
                                                            try {
                                                                var string = JSON.stringify(results);
                                                                var json = JSON.parse(string);
                                                                var obsttb = json;
                                                                for (var a = 0; a < obsttb.length; a++) { obsweeklist[parseInt(obsttb[a].weekdays) - 1].push(obsttb[a]); }
                                                                var getobsschedulebox = "select * from allschedulebox where tid = \"" + req.body.oid + "\" order by boxdate asc , boxtime asc";
                                                                db.query(getobsschedulebox, (err, results) => {
                                                                    try {
                                                                        var string = JSON.stringify(results);
                                                                        var json = JSON.parse(string);
                                                                        var obsschedulebox = json;
                                                                        var getstdttb = "select * from allstudenttakecourse left join allclass on allstudenttakecourse.CID = allclass.CID where allstudenttakecourse.pid = \"" + req.body.sid + "\" and confirmation = \"2\" order by weekdays asc, startTime asc"
                                                                        var getobsrequest = "select * from allrequestfromsupervisor where tid = \"" + req.body.oid + "\" and (RequestDate >= Date(\"" + req.body.startdaydate + "\") and RequestDate <= Date(\"" + req.body.enddaydate + "\")) order by RequestDate asc, requeststarttime asc "
                                                                        db.query(getobsrequest, (err, results) => {
                                                                            try {
                                                                                var string = JSON.stringify(results);
                                                                                var json = JSON.parse(string);
                                                                                var obsrequest = json;
                                                                                db.query(getstdttb, (err, results) => {
                                                                                    try {
                                                                                        var string = JSON.stringify(results);
                                                                                        var json = JSON.parse(string);
                                                                                        var stdttb = json;

                                                                                        for (var a = 0; a < stdttb.length; a++) { stdweeklist[parseInt(stdttb[a].weekdays) - 1].push(stdttb[a]); }
                                                                                        for (var a = 0; a < stdweeklist.length; a++) {
                                                                                            if (stdweeklist[a].length == 0) { stdweeklist[a].push("EMPTY") }
                                                                                            if (obsweeklist[a].length == 0) { obsweeklist[a].push("EMPTY") }
                                                                                            if (supweeklist[a].length == 0) { supweeklist[a].push("EMPTY") }
                                                                                        }
                                                                                        
                                                                                        var getstdrequest = "select * from allrequestfromstudent where sid =\"" + req.body.sid + "\" and (RequestDate >= Date(\"" + req.body.startdaydate + "\") and RequestDate <= Date(\"" + req.body.enddaydate + "\")) and status = \"Approved\" order by RequestDate asc, requeststarttime asc "
                                                                                        // console.log(getstdrequest)
                                                                                        db.query(getstdrequest, (err, results) => {
                                                                                            try {
                                                                                                var string = JSON.stringify(results);
                                                                                                var json = JSON.parse(string);
                                                                                                var stdrequest = json;
                                                                                                var getsuppreference = "select allpreffromsup.tid , priority, prefno  from allpreffromsup  left join supervisor on supervisor.tid = allpreffromsup.tid where allpreffromsup.tid = \"" + req.body.tid + "\" or allpreffromsup.tid = \"" + req.body.oid + "\" order by priority asc"
                                                                                                //console.log(getsuppreference)
                                                                                                db.query(getsuppreference, (err, results) => {
                                                                                                    try {
                                                                                                        var string = JSON.stringify(results);
                                                                                                        var json = JSON.parse(string);
                                                                                                        var suppref = json;

                                                                                                        // console.log("\n\n\n")

                                                                                                        var startindex = startday.getDay();
                                                                                                        for (var daynum = 0; daynum < Math.floor((endday - startday) / 1000 / 60 / 60 / 24); daynum++) {
                                                                                                            var presentday = new Date(startday.getTime() + (daynum * 86400000));
                                                                                                            var currentsessiontimeinpresentday = presentday.toLocaleTimeString("en-GB");
                                                                                                            var currentsessionendtimeinpresentday = (new Date(presentday.getTime() + (1000 * 60 * sessionduration))).toLocaleTimeString("en-GB");
                                                                                                            var checker = 0;

                                                                                                            if (presentday.getDay() != 0) {

                                                                                                                for (var timebox = 0; timebox < 12; timebox++) {
                                                                                                                    var fitcase;
                                                                                                                    var campus;
                                                                                                                    //var checker = 0;

                                                                                                                    for (var a = 0; a < superschedulebox.length; a++) {
                                                                                                                        if (superschedulebox[a].boxdate == presentday.toLocaleDateString("en-GB") && superschedulebox[a].boxtime == currentsessiontimeinpresentday) {
                                                                                                                            checker = -1;
                                                                                                                            console.log("superschedule skip")
                                                                                                                            break;
                                                                                                                        } else {
                                                                                                                            checker = 1;
                                                                                                                        }
                                                                                                                    }
                                                                                                                    for (var b = 0; b < req.body.boxlist.length; b++) {
                                                                                                                        req.body.boxlist[b].presentday = new Date(req.body.boxlist[b].presentday);
                                                                                                                        if ((req.body.boxlist[b].tid == req.body.tid || req.body.boxlist[b].oid == req.body.tid) && req.body.boxlist[b].presentday.toLocaleDateString("en-GB") == presentday.toLocaleDateString("en-GB") && req.body.boxlist[b].presentstartTime == currentsessiontimeinpresentday) {
                                                                                                                            checker = -1;
                                                                                                                            console.log("superboxlist skip")
                                                                                                                            break;
                                                                                                                        } else {
                                                                                                                            checker = 1;
                                                                                                                        }
                                                                                                                    }
                                                                                                                    for (var b = 0; b < superrequest.length; b++) {
                                                                                                                        superrequest[b].RequestDate = new Date(superrequest[b].RequestDate);
                                                                                                                        if (superrequest[b].RequestDate.toLocaleDateString("en-GB") == presentday.toLocaleDateString("en-GB") &&
                                                                                                                            !(currentsessiontimeinpresentday >= superrequest[b].RequestEndTime
                                                                                                                                && currentsessionendtimeinpresentday <= superrequest[b].RequestStartTime)) {
                                                                                                                            checker = -1;
                                                                                                                            console.log("superrequest skip")
                                                                                                                            break;

                                                                                                                        } else {
                                                                                                                            checker = 1;
                                                                                                                        }
                                                                                                                    }
                                                                                                                    for (var b = 0; b < superttb.length; b++) {

                                                                                                                        if ((superttb[b].weekdays == presentday.getDay() && (superttb[b].startime >= currentsessionendtimeinpresentday || currentsessiontimeinpresentday >= superttb[b].endtime))) {
                                                                                                                            checker = -1;
                                                                                                                            console.log("superttb skip")
                                                                                                                            break;
                                                                                                                        } else {
                                                                                                                            campus = superttb[b].Campus;
                                                                                                                            checker = 1;
                                                                                                                        }
                                                                                                                    }
                                                                                                                    if (campus == undefined || campus == null) {
                                                                                                                        campus = campuslist[0].Campus;
                                                                                                                    }
                                                                                                                    //console.log("check superschedule ", checker)
                                                                                                                    if (checker >= 0) {
                                                                                                                        for (var a = 0; a < obsschedulebox.length; a++) {
                                                                                                                            if (obsschedulebox[a].boxdate == presentday.toLocaleDateString("en-GB") && obsschedulebox[a].boxtime == currentsessiontimeinpresentday) {
                                                                                                                                checker = -1;
                                                                                                                                console.log("obsschedule skip")
                                                                                                                                break;
                                                                                                                            } else {
                                                                                                                                checker = 1;
                                                                                                                            }
                                                                                                                        }
                                                                                                                        for (var b = 0; b < req.body.boxlist.length; b++) {
                                                                                                                            req.body.boxlist[b].presentday = new Date(req.body.boxlist[b].presentday);
                                                                                                                            if ((req.body.boxlist[b].tid == req.body.oid || req.body.boxlist[b].oid == req.body.oid) && req.body.boxlist[b].presentday.toLocaleDateString("en-GB") == presentday.toLocaleDateString("en-GB") && req.body.boxlist[b].presentstartTime == currentsessiontimeinpresentday) {
                                                                                                                                checker = -1;
                                                                                                                                console.log("obsboxlist skip")
                                                                                                                                break;
                                                                                                                            } else {
                                                                                                                                checker = 1;
                                                                                                                            }
                                                                                                                        }
                                                                                                                        for (var b = 0; b < obsrequest.length; b++) {
                                                                                                                            obsrequest[b].RequestDate = new Date(obsrequest[b].RequestDate);
                                                                                                                            if (obsrequest[b].RequestDate.toLocaleDateString("en-GB") == presentday.toLocaleDateString("en-GB") &&
                                                                                                                                !(currentsessiontimeinpresentday >= obsrequest[b].RequestEndTime
                                                                                                                                    && currentsessionendtimeinpresentday <= obsrequest[b].RequestStartTime)) {
                                                                                                                                checker = -1;
                                                                                                                                console.log("obsrequest skip")
                                                                                                                                break;

                                                                                                                            } else {
                                                                                                                                checker = 1;
                                                                                                                            }
                                                                                                                        }
                                                                                                                        for (var a = 0; a < obsttb.length; a++) {
                                                                                                                            if ((obsttb[a].weekdays == presentday.getDay() && (obsttb[a].startime >= currentsessionendtimeinpresentday || currentsessiontimeinpresentday >= obsttb[a].endtime))) {
                                                                                                                                checker = -1;
                                                                                                                                console.log("obsttb skip")
                                                                                                                                break;
                                                                                                                            } else {
                                                                                                                                checker = 1;
                                                                                                                            }
                                                                                                                        }
                                                                                                                        //console.log("check obschedule ", checker)
                                                                                                                    }


                                                                                                                    if (checker >= 0) {
                                                                                                                        for (var b = 0; b < stdrequest.length; b++) {
                                                                                                                            stdrequest[b].RequestDate = new Date(stdrequest[b].RequestDate);
                                                                                                                            if (stdrequest[b].RequestDate.toLocaleDateString("en-GB") == presentday.toLocaleDateString("en-GB") &&
                                                                                                                                !(currentsessiontimeinpresentday >= stdrequest[b].RequestEndTime
                                                                                                                                    && currentsessionendtimeinpresentday <= stdrequest[b].RequestStartTime)) {
                                                                                                                                checker = -1;
                                                                                                                                break;

                                                                                                                            } else {
                                                                                                                                checker = 1;
                                                                                                                            }
                                                                                                                        }
                                                                                                                        for (var a = 0; a < stdttb.length; a++) {
                                                                                                                            if ((stdttb[a].weekdays == presentday.getDay() && (stdttb[a].startime >= currentsessionendtimeinpresentday || currentsessiontimeinpresentday >= stdxttb[a].endtime))) {
                                                                                                                                checker = -1;
                                                                                                                                break;
                                                                                                                            } else {
                                                                                                                                checker = 1;
                                                                                                                            }
                                                                                                                        }
                                                                                                                        //  console.log("check stdttb ", checker)
                                                                                                                    }
                                                                                                                    if (checker >= 0) {
                                                                                                                        var finalcampus = undefined;
                                                                                                                        var finalrid = undefined;
                                                                                                                        var indexforcampusinlist = 0;

                                                                                                                        while (finalcampus == undefined || finalrid == undefined) {

                                                                                                                            for (var a = 0; a < classroomlist.length; a++) {
                                                                                                                                if (campus == undefined) { campus = campuslist[indexforcampusinlist]; }
                                                                                                                                if (classroomlist[a].Campus == campus) {
                                                                                                                                    var currentcheckingroom = classroomlist[a].RID;

                                                                                                                                    for (var b = 0; b < classroomtimeslot.length; b++) {
                                                                                                                                        var unavailblestarttime = new Date(classroomtimeslot[b].StartDate);
                                                                                                                                        var unavailblestarttimetr = classroomtimeslot[b].StartTime.split(":")
                                                                                                                                        unavailblestarttime.setHours(unavailblestarttimetr[0])
                                                                                                                                        unavailblestarttime.setMinutes(unavailblestarttimetr[1])
                                                                                                                                        var unavailbleendtime = new Date(classroomtimeslot[b].EndDate);
                                                                                                                                        var unavailbleendtimetr = classroomtimeslot[b].EndTime.split(":")
                                                                                                                                        unavailbleendtime.setHours(unavailbleendtimetr[0])
                                                                                                                                        unavailbleendtime.setMinutes(unavailbleendtimetr[1])
                                                                                                                                        //console.log(classroomtimeslot)
                                                                                                                                        if (classroomtimeslot[b].Campus == campus && classroomtimeslot[b].rid == currentcheckingroom
                                                                                                                                            && (unavailblestarttime.toLocaleDateString() == presentday.toLocaleDateString()
                                                                                                                                                && !(unavailblestarttime.toLocaleTimeString("en-GB") >= currentsessionendtimeinpresentday
                                                                                                                                                    || unavailbleendtime.toLocaleTimeString("en-GB") <= currentsessiontimeinpresentday)
                                                                                                                                            )
                                                                                                                                        ) {
                                                                                                                                            checker = -1; break;
                                                                                                                                        } else {
                                                                                                                                            finalcampus = classroomlist[a].Campus;
                                                                                                                                            finalrid = currentcheckingroom;
                                                                                                                                            checker = 1;
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                }
                                                                                                                                if (checker >= 0) {
                                                                                                                                    //next step check classroomttb

                                                                                                                                    for (var b = 0; b < classttb.length; b++) {
                                                                                                                                        if (classttb[b].Campus == finalcampus && classttb[b].RID == finalrid && presentday.getDay() == classttb[b].weekdays
                                                                                                                                            && !(classttb[b].startTime >= currentsessionendtimeinpresentday || classttb[b].endTime <= currentsessiontimeinpresentday)) {
                                                                                                                                            checker = -1;
                                                                                                                                            finalcampus = undefined;
                                                                                                                                            finalrid = undefined;
                                                                                                                                            break;
                                                                                                                                        } else {
                                                                                                                                            checker = 1;
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                } else {
                                                                                                                                    campus = campuslist[indexforcampusinlist]
                                                                                                                                    indexforcampusinlist++;
                                                                                                                                }
                                                                                                                            }
                                                                                                                            //    console.log("get location ", finalcampus, " ", finalrid)
                                                                                                                        }
                                                                                                                    }
                                                                                                                    if (checker >= 0) {
                                                                                                                        break;
                                                                                                                    } else {
                                                                                                                        presentday.setHours(presentday.getHours() + 1);
                                                                                                                        currentsessiontimeinpresentday = presentday.toLocaleTimeString("en-GB");
                                                                                                                        currentsessionendtimeinpresentday = (new Date(presentday.getTime() + (1000 * 60 * sessionduration))).toLocaleTimeString("en-GB");
                                                                                                                    }
                                                                                                                }
                                                                                                                if (checker >= 0) { break; }
                                                                                                            }
                                                                                                        }
                                                                                                        // console.log(req.body.tid, " ", req.body.sid, " ", req.body.oid, " ", finalcampus, " ", finalrid, " ", presentday, " ", currentsessiontimeinpresentday)
                                                                                                        return res.status(200).json({
                                                                                                            tid: req.body.tid,
                                                                                                            sid: req.body.sid,
                                                                                                            oid: req.body.oid,
                                                                                                            finalcampus: finalcampus,
                                                                                                            finalrid: finalrid,
                                                                                                            presentday: presentday,
                                                                                                            presentstartTime: currentsessiontimeinpresentday,
                                                                                                            presentendTime: currentsessionendtimeinpresentday
                                                                                                        })
                                                                                                        //return res.ok();
                                                                                                    } catch (err) { console.log(err); return res.status(401).json("Error happened when excuting ScheduleController.createdraft.getsuppref") }
                                                                                                })
                                                                                            } catch (err) { return res.status(401).json("Error happened when excuting ScheduleController.createdraft.stdrequest") }
                                                                                        })
                                                                                    } catch (err) { return res.status(401).json("Error happened when excuting ScheduleController.createdraft.stdttb") }
                                                                                })
                                                                            } catch (err) { return res.status(401).json("Error happened when excuting ScheduleController.createdraft.getobsrequest") }
                                                                        })
                                                                    } catch (err) { return res.status(401).json("Error happened when excuting ScheduleController.createdraft.getobsschedulebox") }
                                                                })
                                                            } catch (err) { return res.status(401).json("Error happened when excuting ScheduleController.createdraft.obsttb") }
                                                        })
                                                    } catch (err) { return res.status(401).json("Error happened when excuting ScheduleController.createdraft.getsupschedulebox") }
                                                })
                                            } catch (err) { return res.status(401).json("Error happened when excuting ScheduleController.createdraft.suprequest") }
                                        })
                                    } catch (err) { return res.status(401).json("Error happened when excuting ScheduleController.createdraft.supttb") }
                                })
                            } catch (err) { return res.status(401).json("Error happened when excuting ScheduleController.create.getclassroomtimelist") }
                        })
                    } catch (err) { return res.status(401).json("Error happened when excuting ScheduleController.createdraft.getcampuslist") }
                })
            } catch (err) { return res.status(401).json("Error happened when excuting ScheduleController.createdraft.classttb") }
        })
    },

    savebox: async function (req, res) {
        // console.log(req.body.boxlist);
        var boxlist = req.body.boxlist;
        updatesupdraftexist = "Update supervisor set draft= \"Y\" where tid = \"" + boxlist[0].tid + "\"";
        /**
        db.query( updatesupdraftexist, (err, results) => {
            if (err) { return res.status(401).json("Error happened when excuting ScheduleController.savebox.updatesupdraftexist") };
        });
 */
        for (var a = 0; a < boxlist.length; a++) {
            updateobsdraftexist = "Update supervisor set draft= \"Y\" where tid = \"" + boxlist[a].oid + "\"";
            /**
            db.query(updateobsdraftexist, (err, results) => {
                if (err) { return res.status(401).json("Error happened when excuting ScheduleController.savebox.updateobsdraftexist") };
            });
            */
            boxid = "" + (boxlist[a].presentday.split("T"))[0] + "_" + boxlist[a].presentstartTime;

            insertline = "insert ignore into allschedulebox values(\"" + boxid + "\",\"" + boxlist[a].presentday + "\",\"" + boxlist[a].presentstartTime + "\",\"" + boxlist[a].tid + "\",\"" + boxlist[a].sid + "\",\"" + boxlist[a].oid + "\",\"" + boxlist[a].finalcampus + "\",\"" + boxlist[a].finalrid + "\",now())";
            updateline = "Update allschedulebox set boxdate = \"" + boxlist[a].presentday + "\", boxtime = \"" + boxlist[a].presentstartTime + "\" ,SID =\"" + boxlist[a].sid + "\", OID = \"" + boxlist[a].oid + "\", Campus = \"" + boxlist[a].finalcampus + "\", RID = \"" + boxlist[a].finalrid + "\", LastUpdate = now() where boxid = \"" + boxid + "\"";
            console.log(boxid)
            console.log(insertline)
            console.log(updateline)
            /**
            db.query(insertline, (err, result) => {
                if (err) {
                    errstring = "";
                    errstring += "error happened for:" + insertline + "\n"
                    statuscode = 401;
                }

            })
            db.query(updateline, (err, result) => {
                if (err) {
                    errstring = "";
                    errstring += "error happened for:" + thisistheline + "\n"
                    statuscode = 401;
                }
            })
           */

        }

        /** 
        var errstring = "ok";
        var statuscode = 200;
        var arrayint = [];

        thisistheline = "Update supervisor set draft= \"Y\" where tid = \"" + req.session.userid + "\"";
        db.query(thisistheline, (err, results) => {
            if (err) { return res.status(401).json("Error happened when updating") }
        });

        for (var a = 0; a < req.body.length; a++) {
            console.log("\n\n\n\n");
            console.log(req.body[a].boxid);
            console.log(req.body[a].stu);
            console.log(req.body[a].obs);
            console.log(req.body[a].Campus);
            console.log(req.body[a].RID);
            insertline = "insert ignore into allschedulebox values(\"" + req.body[a].boxid + "\",\"" + req.body[a].boxdate + "\",\"" + req.body[a].boxtime + "\",\"" + req.session.userid + "\",\"" + req.body[a].stu + "\",\"" + req.body[a].obs + "\",\"" + req.body[a].Campus + "\",\"" + req.body[a].RID + "\",now())";

            thisistheline = "Update allschedulebox set boxdate = \"" + req.body[a].boxdate + "\", boxtime = \"" + req.body[a].boxtime + "\" ,SID =\"" + req.body[a].stu + "\", OID = \"" + req.body[a].obs + "\", Campus = \"" + req.body[a].Campus + "\", RID = \"" + req.body[a].RID + "\", LastUpdate = now() where boxid = \"" + req.body[a].boxid + "\"";

            console.log(thisistheline)
            db.query(insertline, (err, result) => {
                if (err) {
                    errstring = "";
                    errstring += "error happened for:" + insertline + "\n"
                    statuscode = 401;
                }

            })
            db.query(thisistheline, (err, result) => {
                if (err) {
                    errstring = "";
                    errstring += "error happened for:" + thisistheline + "\n"
                    statuscode = 401;
                }
            })
          
        }
*/
        return res.ok();
    },

    getrequestroomlist: async function (req, res) {
        var thisistheline = "select * from classroom where Campus = \"" + req.query.Campus + "\" and RID not in ((select RID from allclass where Campus = \"" + req.query.Campus + "\" and weekdays = \"" + req.query.Weekday + "\"and !(startTime > Time(\"" + req.query.Time + "\") || endTime < Time(\"" + req.query.Time + "\")))) and RID not in (select RID from allclassroomtimeslot where Campus = \"" + req.query.Campus + "\" and !(timestamp(concat(StartDate,\" \",startTime)) > timestamp(\"" + req.query.Date + " " + req.query.Time + "\")  || timestamp(concat(EndDate,\" \",endTime)) < timestamp(\"" + req.query.Date + " " + req.query.Time + "\") ) )";

        db.query(thisistheline, (err, result) => {
            if (err) { return res.status(401).json("Error happened when updating") } else {
                var string = JSON.stringify(result);
                var roomlist = JSON.parse(string);
                return res.json(roomlist);
            }
        });



    },

    getrequestobslist: async function (req, res) {
        var thisistheline = "select * from supervisorpairobserver where tid = \"" + req.session.userid + "\" and OID not in (select OID from allrequestfromobserver where (timestamp(\"" + req.query.Date + " " + req.query.Time + "\")>= timestamp(concat(RequestDate,\" \",RequestStartTime)) and timestamp(\"" + req.query.Date + " " + req.query.Time + "\")< timestamp(concat(RequestDate,\" \",RequestEndTime)))) and OID not in (select pid from allobstakecourse inner join allclass on allclass.CID = allobstakecourse.CID where weekdays =" + req.query.Weekday + " and  (time(\"" + req.query.Time + "\")>= allclass.startTime and time(\"" + req.query.Time + "\")< allclass.endTime))"

        db.query(thisistheline, (err, result) => {
            if (err) { return res.status(401).json("Error happened when updating") } else {
                var string = JSON.stringify(result);
                var okobslist = JSON.parse(string);
                return res.json(okobslist);
            }
        });


    },

    getpairing: async function (req, res) {
        thisistheline = "select tid,supervisorpairstudent.sid,oid from supervisorpairstudent left join observerpairstudent on supervisorpairstudent.sid = observerpairstudent.sid";
        db.query(thisistheline, (err, results) => {
            try {
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                var pairinglist = json;
                console.log(pairinglist)
                return res.status(200).json({ pairinglist: pairinglist })
            } catch (err) {
                return res.status(401).json("error happened when excuting SettingController.nodraft.getallinfo.retrievepairinglist");
            }

        })

    },

}
