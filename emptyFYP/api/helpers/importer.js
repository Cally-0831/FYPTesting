
const host = 'localhost';
const user = 'root';
const password = 'Psycho.K0831';
const database = 'fypdeploy';
const port = 3306

const Importer = require('mysql2-import');
const importer = new Importer({host,port, user, password, database});

module.exports = {

    fn: async function () {
         return importer;
     },
 
    
 }