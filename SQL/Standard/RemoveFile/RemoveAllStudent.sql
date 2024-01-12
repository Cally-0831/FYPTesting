DELETE FROM alltakecourse WHERE pid in (select sid from student);
Delete from supervisoravailable;
Delete from studentavailable;
Delete from allschedulebox;
Delete from manualhandlecase;
Delete from threeparty;
Delete from supervisorpairstudent;
Delete from observerpairstudent;
Delete from allstudenttakecourse;
Delete from allrequestfromstudent;
Delete from student;
DELETE FROM allusers WHERE role = "stu";

