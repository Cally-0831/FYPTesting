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

  '/': { view: 'user/login' },

  'GET /user/login': "UserController.login",
  'POST /user/login': "UserController.login",

  'GET /user/logout': 'UserController.logout',

  'GET /home': { view: 'user/home' },

  "GET /readttb/:SID": "TimetableController.readsinglestudentttb",
  "POST /readttb/:SID": "TimetableController.judgettb",

  'GET /notice': "NoticeListController.listallnotice",
  //'GET /notice/createnewnotice': { view: 'user/createnewnotice' },
  'GET /notice/createnewnotice': "NoticeListController.viewnoticepage",
  'GET /notice/createnewnotice/auto': "NoticeListController.viewnoticepage",
  'POST /notice/createnewnotice': "NoticeListController.addnotice",
  
  
  'GET /timetable/submitttb': "TimetableController.getallclass",
 //'GET /timetable/submitttb/': "TimetableController.checkdeadline",
  'GET /timetable/submitttb/get_data': "TimetableController.getotherfield",
  'POST /timetable/submitttb': "TimetableController.submitclass",
  'POST /timetable/submitttb/deadline': "TimetableController.checkdeadline",
  'POST /timetable/submitempty': "TimetableController.submitempty",

  'GET /timetable': "TimetableController.getpersonalallclass",
  'DELETE /timetable': "TimetableController.delpersonalallclass",
  'POST /timetable': "TimetableController.submitpersonalallclass",
  'POST /timetable/pic': "TimetableController.upload",
  'POST /timetable/deadline': "TimetableController.checkdeadline",
  
  'GET /readstudentrequestlist': "RequestController.liststudentrequest",
  'GET /requestdetail/:ReqID': "RequestController.viewstudentrequestdeatils",
  'POST /requestdetail/:ReqID': "RequestController.replystudentrequest",
  "POST /requestdetail/proof/:ReqID":"RequestController.upload",

  'GET /classroommanagement': "ClassroomListController.getinfobycampus",

  'GET /createnewclassroom': "ClassroomListController.getcampus",
  'POST /createnewclassroom': "ClassroomListController.createnewclassroom",

  'GET /classroomlist': "ClassroomListController.listclassroom",
  'DELETE /classroomlist': "ClassroomListController.deleteclassroom",

  'GET /view/:campus/:rid': "ClassroomListController.getsingleroomtimeslot",
  'DELETE /view': "ClassroomListController.deletetimeslot",

  'GET /addtimeslot/:campus/:rid': "ClassroomListController.getsingleroom",
  'POST /addtimeslot/:campus/:rid': "ClassroomListController.addclassroomtimeslot",

  'GET /managetimeslot': "ClassroomListController.listalltimeslot",
  'DELETE /managetimeslot': "ClassroomListController.deletetimeslot",

  'GET /checkrequest': "RequestController.listrequest",
  'DELETE /checkrequest': "RequestController.deleterequest",

  //'GET /submitrequest': { view: 'user/submitrequest' },
  'GET /submitrequest': "RequestController.getview",
  'POST /submitrequest': "RequestController.submitrequest",
  'POST /submitrequest/pic': "RequestController.upload",

  'GET /uploadstudentlist': "UserController.uploadstudentlist",
  'POST /uploadstudentlist': "UserController.uploadstudentlist",

  'GET /liststudent': "StudentListController.liststudent",
  'POST /liststudent': "StudentListController.liststudent",

  'GET /createnewstudent': "StudentListController.gettopic",
  'POST /createnewstudent': "StudentListController.createnewstudent",

  'GET /read/:sid': "StudentListController.readsinglestudent",
  'DELETE /read/:sid': "StudentListController.deletestudent",
  "GET /setting": "SettingController.getsetting",
  "POST /setting": "SettingController.submitsetting",
  //"POST /setting/createnotice": "NoticeListController.viewnoticepage",

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
