

#Sample User
insert into allusers values("Apple","sid11111","spw11111","active","0","stu");
insert into allusers values("Betty","sid22222","spw22222","active","0","stu");

INSERT INTO  allusers VALUES ("Prof Chan","tid00001","tpw00001","Active",0,"sup");
INSERT INTO  allusers VALUES ("Prof Lam","tid00002","tpw00002","Active",0,"sup");
INSERT INTO  allusers VALUES ("Admin","admin","P@ssw0rd","Active",0,"adm");



#sample data
#INSERT INTO  alltakecourse VALUES("COMP1005_10101","sid11111");
#insert into alltakecourse values("COMP1005_00001","sid11111");
insert into allrequestfromsupervisor values("askhjdfoasdjfi","tid00001","2023-04-03","00:00", "14:00");


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

insert into allclass values("COMP","1005","00001","","Campus A","RM101","1","08:30","09:20");
insert into allclass values("COMP","1005","00002","","Campus B","RM101","1","08:30","09:20");
insert into allclass values("COMP","1005","10101","","Campus A","RM101","1","10:30","12:20");
insert into allclass values("COMP","1005","10102","","Campus A","RM101","2","09:00","09:20");
insert into allclass values("COMP","1005","10201","","Campus A","RM101","1","09:30","10:20");

insert into allclass values("COMP","2005","00001","","Campus A","RM101","5","08:30","09:20");
insert into allclass values("PHYS","2005","10001","","Campus B","RM101","2","10:30","12:20");
insert into allclass values("COMP","2005","10002","","Campus B","RM103","3","09:00","09:20");
insert into allclass values("MATH","2005","10003","","Campus A","RM101","4","09:30","10:20");

#Yr3S2 ttb
insert into allclass values("COMP","4107","00001","","Sin Hang","FSC901C","1","10:30","12:20");
insert into allclass values("COMP","4107","00001","","Sin Hang","FSC901C","3","08:30","09:20");
insert into allclass values("COMP","4025","00001","","Sin Hang","CEC911","5","11:30","13:20");
insert into allclass values("COMP","4025","10001","","Sin Hang","FSC901C","1","12:30","14:20");
insert into allclass values("GCAP","3205","00001","","AAB","AAB610","2","09:30","12:20");
insert into allclass values("COMP","4057","00001","","Sin Hang","FSC801C","4","08:30","11:20");
insert into allclass values("COMP","4096","00001","","Sin Hang","LMC509","5","14:30","17:20");

insert into alltakecourse values("COMP4107_00001","tid00001");
insert into alltakecourse values("COMP4096_00001","tid00001");
insert into alltakecourse values("COMP4057_00001","tid00001");
insert into alltakecourse values("COMP4025_00001","tid00001");
insert into alltakecourse values("COMP4025_10001","tid00001");
insert into alltakecourse values("GCAP3205_00001","tid00001");
