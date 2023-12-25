
const host = 'fypdeploy-mysql';
const user = 'root';
const password = 'Psycho.K0831';
const database = 'fypdeploy';
const port = 3306;
const timezone = "Asia/Hong_Kong";


const Importer = require('mysql2-import');
//const importer = new Importer({host, user, password});
const importer = new Importer({host, user, password,database,timezone});
module.exports = {

    fn: async function () {
         return importer;
     },
 
    
 }