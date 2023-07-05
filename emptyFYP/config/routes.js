/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  //'/': { view: 'pages/homepage' },

  '/': "/user/login",
  
  'GET /user/login': "UserController.login",
  'POST /user/login': "UserController.login",
  
  'GET /user/logout': 'UserController.logout',

  'GET /home': { view: 'user/home' },

  'GET /user/createnewclassroom':  "ClassroomListController.getcampus",
  'POST /user/createnewclassroom': "ClassroomListController.createnewclassroom",

 'GET /user/classroomlist': "ClassroomListController.listclassroom",
 'DELETE /user/classroomlist': "ClassroomListController.deleteclassroom",
 
  'GET /user/checkrequest': "UserController.listrequest",
  'DELETE /user/checkrequest': "UserController.deleterequest",

  'GET /user/submitrequest': "UserController.submitrequest",
  'POST /user/submitrequest': "UserController.submitrequest",

  'GET /user/uploadstudentlist': "UserController.uploadstudentlist",
  'POST /user/uploadstudentlist': "UserController.uploadstudentlist",

  'GET /user/liststudent': "StudentListController.liststudent",
  'POST /user/liststudent': "StudentListController.liststudent",

  'GET /user/createnewstudent': "StudentListController.gettopic",
  'POST /user/createnewstudent': "StudentListController.createnewstudent",

  'GET /user/read/:sid': "StudentListController.readsinglestudent",
  'DELETE /user/read/:sid': "StudentListController.deletestudent",



  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
