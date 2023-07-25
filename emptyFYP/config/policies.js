/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {


  UserController: {
    uploadstudentlist: "isSuper",
  },
  TimetableController: {
    judgettb: "isSuper",
    readsinglestudentttb: "isSuper"
  },
  StudentListController: {
    "*": "isSuper"
  },
  SettingController: {
    "*": "isSuper"
  },
  RequestController: {
    liststudentrequest: "isSuper",
    viewstudentrequestdeatils: "isSuper",
    replystudentrequest:"isSuper"
  },
  NoticeListController: {
    addnotice:"isSuper",
    addnotice:"isAdmin",
  },
  ClassroomListController: {
    '*': "isAdmin"
  }

  

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  // '*': true,

};
