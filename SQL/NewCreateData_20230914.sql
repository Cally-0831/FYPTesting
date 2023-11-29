


#Sample User
insert into allusers values("Apple","sid11111","spw11111","active","0","stu");
insert into allusers values("Betty","sid32222","spw22222","active","0","stu");
INSERT INTO  allusers VALUES ("Admin","admin","P@ssw0rd","Active",0,"adm");

#INSERT INTO  allusers VALUES ("Prof Chan","tid00001","tpw00001","Active",0,"sup");
#INSERT INTO  allusers VALUES ("Prof Lam","tid00002","tpw00002","Active",0,"sup");
#INSERT INTO  allusers VALUES ("Dr Amantha","tid00003","tpw00003","Active",0,"sup");
#INSERT INTO  allusers VALUES ("Dr Banana","tid00004","tpw00004","Active",0,"sup");


#sample data
#INSERT INTO  alltakecourse VALUES("COMP1005_10101","sid11111");
#insert into alltakecourse values("COMP1005_00001","sid11111");
#insert into allrequestfromsupervisor values("tid00001sdQER","tid00001","2024-04-03","00:00", "14:00");


insert into classroom 	values("Campus A","RM101","Open");
insert into classroom 	values("Campus B","RM102","Open");
insert into classroom 	values("Campus A","RM102","Open");
insert into classroom 	values("Campus B","RM103","Open");
insert into classroom 	values("Campus A","RM103","Open");
insert into classroom 	values("Campus B","RM101","Open");
insert into allclassroomtimeslot values("Campus_B_RM102_0sdf1","Campus B","RM102","2023-07-13","2023-07-13","00:00","23:59","remarks");
insert into allnotice values("nid0001","admin","","2023-07-07 11:21:42","1","title1","Testing");
insert into allnotice values("nid0002","tid00001","",now(),"2","title2","Testing2");
insert into allnotice values("nid0003","tid00002","",now(),"3","title3","Testing3");


insert into allclass values("EMPTY","","","","","","0","08:30","09:30","0");


#Yr3S2 ttb
insert into allclass values("COMP","4107","00001","","Sin Hang","FSC901C","1","10:30","12:20","0");
insert into allclass values("COMP","4107","00001","","Sin Hang","FSC901C","3","08:30","09:20","0");
insert into allclass values("COMP","4025","00001","","Sin Hang","CEC911","5","11:30","13:20","0");
insert into allclass values("COMP","4025","10001","","Sin Hang","FSC901C","1","12:30","14:20","0");
insert into allclass values("GCAP","3205","00001","","AAB","AAB610","2","09:30","12:20","0");
insert into allclass values("COMP","4057","00001","","Sin Hang","FSC801C","4","08:30","11:20","0");
insert into allclass values("COMP","4096","00001","","Sin Hang","LMC509","5","14:30","17:20","0");
insert into allclass values("COMP","4097","00001","","AAB","AAB509","5","14:30","17:20","0");



insert into alltakecourse values("COMP4107_00001","sid11111");
insert into alltakecourse values("COMP4096_00001","sid11111");
insert into alltakecourse values("COMP4057_00001","sid11111");
insert into alltakecourse values("COMP4025_00001","sid11111");
insert into alltakecourse values("COMP4025_10001","sid11111");
insert into alltakecourse values("GCAP3205_00001","sid11111");

insert into alltakecourse values("COMP4107_00001","sid22222");

