

#Sample User
insert into allusers values("Apple","sid11111","spw11111","active","0","stu");
insert into allusers values("Betty","sid22222","spw22222","active","0","stu");

INSERT INTO  allusers VALUES ("Prof Chan","tid00001","tpw00001","Active",0,"sup");
INSERT INTO  allusers VALUES ("Prof Lam","tid00002","tpw00002","Active",0,"sup");
INSERT INTO  allusers VALUES ("Admin","admin","P@ssw0rd","Active",0,"adm");



#sample data
INSERT INTO  student_take_course VALUES("s01","c01");
insert into allrequestfromsupervisor values("askhjdfoasdjfi","tid00001","2023-04-03","00:00", "14:00");

insert into student_take_course values("COMP100500001","111");
insert into classroom 	values("Campus A","RM101","Open");
insert into classroom 	values("Campus B","RM102","Open");
insert into classroom 	values("Campus A","RM102","Open");
insert into classroom 	values("Campus B","RM103","Open");
insert into classroom 	values("Campus A","RM103","Open");
insert into classroom 	values("Campus B","RM101","Open");
insert into allclassroomtimeslot values("Campus_B_RM102_0sdf1","Campus B","RM102","2023-07-13","2023-07-13","00:00","23:59","remarks");
insert into allnotice values("nid0001","admin","","2023-07-07 11:21:42","title1","Testing");
insert into allnotice values("nid0002","tid00001","",now(),"title2","Testing2");
insert into allnotice values("nid0003","tid00002","",now(),"title3","Testing3");

insert into allclass values("COMP","1005","00001","","Campus A","RM101","MON","08:30","09:20");
insert into allclass values("COMP","1005","00002","","Campus B","RM101","MON","08:30","09:20");
insert into allclass values("COMP","1005","10101","","Campus A","RM101","MON","10:30","12:20");
insert into allclass values("COMP","1005","10102","","Campus A","RM101","TUE","09:00","09:20");
insert into allclass values("COMP","1005","10201","","Campus A","RM101","MON","09:30","10:20");

insert into allclass values("COMP","2005","00001","","Campus A","RM101","FRI","08:30","09:20");
insert into allclass values("COMP","2005","10001","","Campus B","RM101","TUE","10:30","12:20");
insert into allclass values("COMP","2005","10002","","Campus B","RM103","WED","09:00","09:20");
insert into allclass values("COMP","2005","10003","","Campus A","RM101","THU","09:30","10:20");