INSERT INTO  allusers VALUES ("Admin","admin","P@ssw0rd","Active",0,"adm");
insert into allclass values("EMPTY","","","","","","0","08:30","09:30","0");

insert IGNORE into allusers values("Prof Chan","tid00001","tpw00001","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00001";

insert IGNORE into allusers values("Prof Lam","tid00002","tpw00002","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00002";

insert IGNORE into allusers values("Dr Amantha","tid00003","tpw00003","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00003";
insert IGNORE into allusers values("Dr Banana","tid00004","tpw00004","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00004";

insert IGNORE into allusers values("Prof Catie","tid00005","tpw00005","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00005";

insert IGNORE into allusers values("Dr dabbie","tid00006","tpw00006","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00006";

insert IGNORE into allusers values("Dr Eva","tid00007","tpw00007","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00007";

insert IGNORE into allusers values("Prof Fanny","tid00008","tpw00008","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00008";

insert IGNORE into allusers values("Dr George","tid00009","tpw00009","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00009";

insert IGNORE into allusers values("Prof Harry","tid00010","tpw00010","ACTIVE","0","sup");
update supervisor set priority = "1" where tid = "tid00010";



insert IGNORE into allusers values("1Helena","sid10000","spw10000","ACTIVE","0","stu");
insert IGNORE into allusers values("1Cathy","sid11111","spw11111","ACTIVE","0","stu");
insert IGNORE into allusers values("1Dorthy","sid12222","spw12222","ACTIVE","0","stu");
insert IGNORE into allusers values("1Emily","sid13333","spw13333","ACTIVE","0","stu");
insert IGNORE into allusers values("1Fiona","sid14444","spw14444","ACTIVE","0","stu");
insert IGNORE into allusers values("1Gloria","sid15555","spw15555","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00001","sid11111","how to get abc");
insert IGNORE into supervisorpairstudent values("tid00001","sid12222","where is abc");
insert IGNORE into supervisorpairstudent values("tid00001","sid13333","how to get abc");
insert IGNORE into supervisorpairstudent values("tid00001","sid14444","where is abc");
insert IGNORE into supervisorpairstudent values("tid00001","sid15555","how to get abc");
insert IGNORE into supervisorpairstudent values("tid00001","sid10000","where is abc");

insert IGNORE into allusers values("2Fanny","sid20000","spw20000","ACTIVE","0","stu");
insert IGNORE into allusers values("2Emily","sid21111","spw21111","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00002","sid21111","how to get efg");
insert IGNORE into supervisorpairstudent values("tid00002","sid20000","where is efg");

insert IGNORE into allusers values("3Apple","sid30000","spw30000","ACTIVE","0","stu");
insert IGNORE into allusers values("3Cathy","sid31111","spw31111","ACTIVE","0","stu");
insert IGNORE into allusers values("3Dorthy","sid32222","spw32222","ACTIVE","0","stu");
insert IGNORE into allusers values("3Emily","sid33333","spw33333","ACTIVE","0","stu");
insert IGNORE into allusers values("3Fiona","sid34444","spw34444","ACTIVE","0","stu");
insert IGNORE into allusers values("3Gloria","sid35555","spw35555","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00003","sid30000","topic 3 for tid3");
insert IGNORE into supervisorpairstudent values("tid00003","sid31111","topic 3 for tid3");
insert IGNORE into supervisorpairstudent values("tid00003","sid32222","topic 4 for tid3");
insert IGNORE into supervisorpairstudent values("tid00003","sid33333","topic 4 for tid3");
insert IGNORE into supervisorpairstudent values("tid00003","sid34444","topic 3 for tid3");
insert IGNORE into supervisorpairstudent values("tid00003","sid35555","topic 4 for tid3");

insert IGNORE into allusers values("4Cathy","sid40000","spw40000","ACTIVE","0","stu");
insert IGNORE into allusers values("4Dorthy","sid41111","spw41111","ACTIVE","0","stu");
insert IGNORE into allusers values("4Emily","sid42222","spw42222","ACTIVE","0","stu");
insert IGNORE into allusers values("4Fiona","sid43333","spw43333","ACTIVE","0","stu");
insert IGNORE into allusers values("4Gloria","sid44444","spw44444","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00004","sid40000","topic 5 for tid4");
insert IGNORE into supervisorpairstudent values("tid00004","sid41111","topic 5 for tid4");
insert IGNORE into supervisorpairstudent values("tid00004","sid42222","topic 6 for tid4");
insert IGNORE into supervisorpairstudent values("tid00004","sid43333","topic 5 for tid4");
insert IGNORE into supervisorpairstudent values("tid00004","sid44444","topic 7 for tid4");

insert IGNORE into allusers values("5Cathy","sid50000","spw50000","ACTIVE","0","stu");
insert IGNORE into allusers values("5Dorthy","sid51111","spw51111","ACTIVE","0","stu");
insert IGNORE into allusers values("5Emily","sid52222","spw52222","ACTIVE","0","stu");
insert IGNORE into allusers values("5Fiona","sid53333","spw53333","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00005","sid50000","topic 8 for tid5");
insert IGNORE into supervisorpairstudent values("tid00005","sid51111","topic 8 for tid5");
insert IGNORE into supervisorpairstudent values("tid00005","sid52222","topic 9 for tid5");
insert IGNORE into supervisorpairstudent values("tid00005","sid53333","topic 8 for tid5");

insert IGNORE into allusers values("6Cathy","sid60000","spw60000","ACTIVE","0","stu");
insert IGNORE into allusers values("6Lowrance","sid61111","spw61111","ACTIVE","0","stu");
insert IGNORE into allusers values("6Brenda","sid62222","spw62222","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00006","sid60000","topic 10 for tid6");
insert IGNORE into supervisorpairstudent values("tid00006","sid61111","topic 11 for tid6");
insert IGNORE into supervisorpairstudent values("tid00006","sid62222","topic 11 for tid6");

insert IGNORE into allusers values("7Iris","sid70000","spw70000","ACTIVE","0","stu");
insert IGNORE into allusers values("7Jack","sid71111","spw71111","ACTIVE","0","stu");
insert IGNORE into allusers values("7Kelvin","sid72222","spw72222","ACTIVE","0","stu");
insert IGNORE into allusers values("7Lemon","sid73333","spw73333","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00007","sid70000","topic 12 for tid7");
insert IGNORE into supervisorpairstudent values("tid00007","sid71111","topic 13 for tid7");
insert IGNORE into supervisorpairstudent values("tid00007","sid72222","topic 14 for tid7");
insert IGNORE into supervisorpairstudent values("tid00007","sid73333","topic 14 for tid7");

#requestdata
#supevisor wholeday
#insert into allrequestfromsupervisor values("tid00001FsId5","tid00001","2024-01-19","00:00", "23:59");
#supevisorday
insert into allrequestfromsupervisor values("tid00001nKCo9","tid00001","2024-01-20","08:30", "10:30");
insert into allrequestfromsupervisor values("tid00002nKCo9","tid00002","2024-01-22","08:30", "12:30");
insert into allrequestfromsupervisor values("tid00003nKCo9","tid00003","2024-01-23","08:30", "09:30");
insert into allrequestfromsupervisor values("tid00004nKCo9","tid00004","2024-01-24","11:30", "12:30");
insert into allrequestfromsupervisor values("tid00005nKCo9","tid00005","2024-01-19","15:30", "16:30");

insert into allpreffromsup values("tid00001","1/2/3/0/0/",now());
insert into allpreffromsup values("tid00002","1/0/0/1/0/",now());
insert into allpreffromsup values("tid00003","1/0/0/1/0/",now());
insert into allpreffromsup values("tid00004","1/0/0/0/1/",now());
insert into allpreffromsup values("tid00005","0/0/0/1/0/",now());
insert into allpreffromsup values("tid00006","0/1/0/0/2/",now());
insert into allpreffromsup values("tid00010","1/0/1/0/0/",now());












