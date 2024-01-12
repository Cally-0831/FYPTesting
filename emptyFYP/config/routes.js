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

  // login & logout
  'GET /': "UserController.login",
  'GET /login': "UserController.login",
  'POST /login': "UserController.login",
  'GET /user/logout': 'UserController.logout',

  //homepage
  'GET /home': 'UserController.home',
  


  //admin scheduling
  "POST /scheduledesign/removerecords":  "ScheduleController.RemoveRecords",
  "POST /supervisorschedulelist/modifyschedule":  "ScheduleController.EditRecords",
  "GET /supervisorschedulelist": "ScheduleController.supervisorschedulelist",
  "GET /supervisorschedulelist/modifyschedule/:tid/:Page": "ScheduleController.retrievesinglesupervisorschedule",
  "GET /supervisorschedulelist/modifyschedule/:tid/:Page/HandleManualCase": "ScheduleController.HandleManualCase",
  'GET /supervisorschedulelist/modifyschedule/:tid/:Page/HandleManualCase/getdata': "ScheduleController.GetData",
  "POST /supervisorschedulelist/modifyschedule/:tid/:Page/HandleManualCase": "ScheduleController.EditScheduleBox",

  //admin setting
  "GET /setting": "SettingController.getsetting",
  "POST /setting": "SettingController.submitsetting",
  "GET /FastUpdateSetting" : "SettingController.FastUpdateSetting",

  //admin classroom
  "GET /uploadclassroomlist" : { view: 'user/admin/uploadclassroomlist' },
  "POST /uploadclassroomlist" : "ClassroomListController.uploadclassroom",

  //admin listuser
  "POST /listuser/uploadobssql":"StudentListController.uploadobssql",
  'GET /listuser': "StudentListController.liststudent",
  'POST /listuser': "StudentListController.liststudent",
  'POST /listuser/genobs': "StudentListController.generateobs",
  'DELETE /listuser/:id': "StudentListController.deletestudent",

  //admin dbmanagement
  "GET /dbmanagement" :  "DatabaseController.viewdbmanagement",
  "POST /dbmanagement" :  "DatabaseController.removeData",
  'POST /resetDB': "DatabaseController.resetDB",

  "GET /usermanagement": { view: 'user/admin/usermanagement' },

  //'GET /home': { view: 'user/home' },
  
  'GET /scheduledesign': "SettingController.nodraft",
  'GET /checkdraft': "ScheduleController.checksetting",
  "GET /checkschedule": "ScheduleController.viewfinalschedule",


  "GET /scheduledesign/getpairing": "ScheduleController.getpairing",


  //"POST /createschedule/createdraft": "ScheduleController.createdraft",
  //"POST /createschedule/createdraft/savebox": "ScheduleController.savebox",
  //"POST /savebox":"ScheduleController.savebox",

  "GET /savebox/get_roomlist_bycampus": "ScheduleController.getrequestroomlist",
  "GET /savebox/get_okobslist": "ScheduleController.getrequestobslist",
  //"POST /createschedule/createdraft/checkpref": "ScheduleController.checkpref",


  "GET /uploadlesson": { view: "user/admin/uploadlesson" },
  "POST /uploadlesson": "LessonController.uploadlesson",
  "GET /lessonlist": "LessonController.listlesson",
  "DELETE /lessonlist": "LessonController.deletelesson",
  "GET /lessonlist/:CID": "LessonController.viewlesson",


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
  "POST /timetable/submitttb/checkduplication": "TimetableController.checkduplication",

  'GET /timetable': "TimetableController.getpersonalallclass",
  'DELETE /timetable': "TimetableController.delpersonalallclass",
  'POST /timetable': "TimetableController.submitpersonalallclass",
  'POST /timetable/pic': "TimetableController.upload",
  'POST /timetable/deadline': "TimetableController.checkdeadline",


  'GET /readsupervisorrequestlist': "RequestController.listsupervisorrequest",
  'GET /readstudentrequestlist': "RequestController.liststudentrequest",
  'GET /requestdetail/:ReqID': "RequestController.viewstudentrequestdeatils",
  'POST /requestdetail/:ReqID': "RequestController.replystudentrequest",
  "POST /requestdetail/proof/:ReqID": "RequestController.upload",


  'GET /Mainclassroommanagement': { view: 'user/admin/Mainclassroommanagement' },
  'GET /classmanagement': { view: 'user/admin/classmanagement' },

  'GET /createnewclassroom': "ClassroomListController.getcampus",
  'POST /createnewclassroom': "ClassroomListController.createnewclassroom",

  'GET /classroomlist': "ClassroomListController.listclassroom",
  'POST /classroomlist': "ClassroomListController.changestatus",
  'DELETE /classroomlist': "ClassroomListController.deleteclassroom",

  'GET /view/:campus/:rid': "ClassroomListController.getsingleroomtimeslot",
  'DELETE /view': "ClassroomListController.deletetimeslot",
  'GET /updatetime/:reqid': "ClassroomListController.getoneroom",
  'POST /updatetime/:reqid': "ClassroomListController.updatetimeslot",

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

  'GET /uploadstudentlist': "StudentListController.checkuploadstudentlistdeadline",
  'POST /uploadstudentlist': "StudentListController.uploadstudentlist",
  'GET /uploadsupervisorlist': { view: 'user/admin/uploadsupervisorlist' },
  'POST /uploadsupervisorlist': "StudentListController.uploadsupervisorlist",
  //'POST /uploadpairlist': "StudentListController.uploadpairlist",


 

  'GET /createnewstudent': "StudentListController.gettopic",
  'POST /createnewstudent': "StudentListController.createnewstudent",
  'GET /createnewsup': { view: 'user/createnewsup' },
  'POST /createnewsup': "StudentListController.createnewsup",

  'GET /read/:id': "StudentListController.readsingleppl",
  'POST /read/:id': "StudentListController.addpairing",
  'DELETE /read/:id': "StudentListController.deletestudent",

  "POST /scheduledesign/genAvailable": "ScheduleController.genAvailable",

  "GET /preference": "RequestController.getpreference",
  "POST /preference": "RequestController.submitpreference",

  
  //"POST /setting/createnotice": "NoticeListController.viewnoticepage",

  "GET /viewFinalSchedule": "ScheduleController.viewFinalSchedule",
 
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
