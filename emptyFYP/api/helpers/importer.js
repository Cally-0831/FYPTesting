
const host = 'fypdeploy-mysql';
const user = 'root';
const password = 'Psycho.K0831';
const database = 'fypdeploy';
const port = 3306;


const Importer = require('mysql2-import');
//const importer = new Importer({host, user, password});
const importer = new Importer({host, user, password,database});
module.exports = {

    fn: async function () {
         return importer;
     },
 
    
 }