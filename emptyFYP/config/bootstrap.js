/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */

// const host = 'localhost';
// const user = 'root';
// const password = 'Psycho.K0831';
// const database = 'fyptesting';

// const Importer = require('mysql2-import');
// const importer = new Importer({host, user, password, database});

const host = 'localhost';
const user = 'root';
const password = 'Psycho.K0831';
const database = 'fypdeploy';
const port = 3306



//var fs = require('fs');


module.exports.bootstrap = async function () {


  // By convention, this is a good place to set up fake data during development.
  //
  // For example:
  // ```
  // // Set up fake development data (or if we already have some, avast)

  
// const Importer = require('mysql-import');
// const importer = new Importer({host, user, password, database,port});
  // Recursive function to get files
  const fs = require("fs");

  const sqlfiles = [
    '../SQL/Standard/dropcommand.sql',
    '../SQL/Standard/TableCreate.sql',
    '../SQL/Standard/TriggerCreate.sql',
    '../SQL/Standard/SampleData.sql',
    '../SQL/Standard/Setting.sql',
    '../SQL/Standard/AllclassSQL.sql'
  ]

  // New onProgress method, added in version 5.0!
  var importer = await sails.helpers.importer();
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
    var result = await importer.import(f);
    var files_imported = importer.getImported();
    console.log(`${files_imported.length} SQL file(s) imported.`);
  }

  // importer.import('path/to/dump.sql').then(()=>{
  //   var files_imported = importer.getImported();
  //   console.log(`${files_imported.length} SQL file(s) imported.`);
  // }).catch(err=>{
  //   console.error(err);
  // });
  // Read the SQL file
  // var dropcommand = fs.readFileSync("../SQL/Standard/dropcommand.sql").toString().split("\n");
  // var TableCreate = fs.readFileSync('../SQL/Standard/TableCreate.sql').toString().split("\n");
  // var TriggerCreate = fs.readFileSync('../SQL/Standard/TriggerCreate.sql').toString()
  // var SampleData = fs.readFileSync('../SQL/Standard/SampleData.sql').toString().split("\n");
  // var Setting = fs.readFileSync('../SQL/Standard/Setting.sql').toString().split("\n");
  // var AllclassSQL = fs.readFileSync('../SQL/Standard/AllclassSQL.sql').toString().split("\n");
  // const files = [
  //   fs.readFileSync("../SQL/Standard/dropcommand.sql","utf8").toString().split("\n"),
  //   fs.readFileSync('../SQL/Standard/TableCreate.sql','utf8').toString().split("\n"),
  //   fs.readFileSync('../SQL/Standard/TriggerCreate.sql','utf8').toString().split("\n"),
  //   //fs.readFileSync('../SQL/Standard/SampleData.sql','utf8').toString().split("\n"),
  //   //fs.readFileSync('../SQL/Standard/Setting.sql','utf8').toString().split("\n"),
  //   //fs.readFileSync('../SQL/Standard/AllclassSQL.sql','utf8').toString().split("\n")
  // ];
  // console.log(files)

  // var connection = await sails.helpers.database();
  
  // for (let q of files) {
  //   await connection.execute(q)
  // }
  // console.log(dropcommand, TableCreate);
  // files.push(dropcommand, TableCreate,TriggerCreate, SampleData, Setting, AllclassSQL);
  //files.push(dropcommand);
  // Setup the database connection


  // Convert the SQL string to array so that you can run them one at a time.
  // You can split the strings using the query delimiter i.e. `;` in // my case I used `);` because some data in the queries had `;`.


  // db.serialize ensures that your queries are one after the other depending on which one came first in your `dataArr`

  // for (var a = 0; a < files.length; a++) {
  //   //console.log(files[a].length)
  //   for (var b = 0; b < files[a].length; b++) {
  //     if (files[a][b] != "") {
  //       //console.log(files[a][b])
  //       var db = await sails.helpers.database();
  //       var pool = await sails.helpers.database2();
  //       var checkcampusandroom = await new Promise((resolve) => {
  //         pool.query(files[a][b], (err, res) => {
  //           if (err) {
  //             console.log(err);
  //           };
  //           console.log("done 1")
  //           resolve(res);
  //         })
  //       }).catch((err) => {
  //         errmsg = "error happened in ScheduleController.genavailble.getcampusandroomquery"
  //       })
  //     }
  //   }
  // }
  // var string = "";
  // for (var a = 0; a < TriggerCreate.length; a++) {
    /** 
    console.log(TriggerCreate[a].trim(" ")+"\n\n")
    if (TriggerCreate[a].trim(" ") == "delimiter $$") {
      string += "delimiter $$ \n"
    } else {
      string += TriggerCreate[a];
      console.log("\n\n\n\n",string,"\n\n\n\n")
      var checkcampusandroom = await new Promise((resolve) => {
        pool.query(string, (err, res) => {
          if (err) {
            console.log(err);
          };
          console.log(TriggerCreate[a])
          resolve(res);
        })
      }).catch((err) => {
        errmsg = "error happened in ScheduleController.genavailble.getcampusandroomquery"
      })
      string = "";
      
    }
*/


    
  // }

/**
  if (await User.count() > 0) {
    return;
  }
  await User.create({ allusersname: "Admin", id: "admin", password: "P@ssw0rd", status: "Active", errortime: 0, role: "adm" });
     
  //   etc.

  var ans = await User.find()
  console.log(ans)
 */



};
