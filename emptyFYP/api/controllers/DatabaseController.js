module.exports = {

    viewdbmanagement: async function (req, res) {
        if (req.session.userid != null) { return res.view('user/admin/dbmanagement') } else { return res.view('/') }
    },
    removeData: async function (req, res) {
        const importer = await sails.helpers.importer()
        //console.log(importer)
        // Recursive function to get files
        const fs = require("fs");
        var sqlfiles ="";
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
            case "Supervisor": break;
            case "Timetable": break;
            case "Unavailable Timeslots": break;
            case "Schedule": break;
            case "Class": break;
            case "Data": break;

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