module.exports = {

    viewdbmanagement: async function (req, res) {
        if (req.session.userid != null) { return res.view('user/admin/dbmanagement') } else { return res.view('/') }
    },
    removeData: async function (req, res) {
        const importer = await sails.helpers.importer()
        //console.log(importer)
        // Recursive function to get files
        const fs = require("fs");
        var sqlfiles = "";
        console.log(req.body.command)
        switch (req.body.command) {
            case "User":
                sqlfiles = '../SQL/Standard/RemoveFile/RemoveAllUser.sql';
                await importer.import(sqlfiles);
                var files_imported = importer.getImported();
                console.log(`${files_imported.length} SQL file(s) imported.`);
                break;
            case "Student":
                sqlfiles = '../SQL/Standard/RemoveFile/RemoveAllStudent.sql';
                await importer.import(sqlfiles);
                var files_imported = importer.getImported();
                console.log(`${files_imported.length} SQL file(s) imported.`);
                break;
            case "Timetable":
                sqlfiles = '../SQL/Standard/RemoveFile/RemoveAllTimetable.sql';
                await importer.import(sqlfiles);
                var files_imported = importer.getImported();
                console.log(`${files_imported.length} SQL file(s) imported.`);
                break;
            case "Unavailable Timeslots":
                sqlfiles = '../SQL/Standard/RemoveFile/RemoveAllUnavaTime.sql';
                await importer.import(sqlfiles);
                var files_imported = importer.getImported();
                console.log(`${files_imported.length} SQL file(s) imported.`);
                break;
            case "Schedule":
                sqlfiles = '../SQL/Standard/RemoveFile/RemoveAllSchedule.sql';
                await importer.import(sqlfiles);
                var files_imported = importer.getImported();
                console.log(`${files_imported.length} SQL file(s) imported.`);
                break;
            case "Class":
                sqlfiles = '../SQL/Standard/RemoveFile/RemoveAllClass.sql';
                await importer.import(sqlfiles);
                var files_imported = importer.getImported();
                console.log(`${files_imported.length} SQL file(s) imported.`);
                break;
            case "Data":
                sqlfiles = '../SQL/Standard/RemoveFile/RemoveAll.sql';
                await importer.import(sqlfiles);
                var files_imported = importer.getImported();
                console.log(`${files_imported.length} SQL file(s) imported.`);
                break;
                break;
            default:
                break;

        }

        // const sqlfiles = '../SQL/Standard/RemoveRecords.sql'

        // await importer.import(sqlfiles);
        // var files_imported = importer.getImported();
        // console.log(`${files_imported.length} SQL file(s) imported.`);


        return res.status(200).json("ok");
    },

}