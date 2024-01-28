INSERT INTO  allusers VALUES ("Admin","admin","P@ssw0rd","Active",0,"adm");
insert into allclass values("EMPTY","","","","","","0","08:30","09:30","0");

insert IGNORE into allusers values("Dr. LIU, Yang","tid00001","tpw00001","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00001";

insert IGNORE into allusers values("Dr. ZHANG, Eric Lu","tid00002","tpw00002","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00002";

insert IGNORE into allusers values("Dr. WAN, Renjie","tid00003","tpw00003","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00003";

insert IGNORE into allusers values("Dr Yu, Wilson Shih Bun","tid00004","tpw00004","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00004";

insert IGNORE into allusers values("Prof. CHEUNG, Yiu Ming","tid00005","tpw00005","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00005";

insert IGNORE into allusers values("Dr. ZHOU, Kaiyang","tid00006","tpw00006","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00006";

insert IGNORE into allusers values("Prof. Xu, Jianliang","tid00007","tpw00007","ACTIVE","0","sup");
update supervisor set priority = "1" where tid = "tid00007";

insert IGNORE into allusers values("Dr. HAN, Bo","tid00008","tpw00008","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00008";

insert IGNORE into allusers values("Dr. DAI, Henry Hong Ning","tid00009","tpw00009","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00009";

insert IGNORE into allusers values("Prof. YUEN, Pong Chi","tid00010","tpw00010","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00010";

insert IGNORE into allusers values("Prof. LEUNG,Yiu Wing","tid00011","tpw00011","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00011";

insert IGNORE into allusers values("Dr. FENG, Jian","tid00012","tpw00012","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00012";

insert IGNORE into allusers values("Dr. WANG, Juncheng","tid00013","tpw00013","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00013";

insert IGNORE into allusers values("Dr. YANG, Renchi","tid00014","tpw00014","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00014";



insert IGNORE into allusers values("1Cathy","sid011111","spw011111","ACTIVE","0","stu");
insert IGNORE into allusers values("1Dorthy","sid012222","spw012222","ACTIVE","0","stu");
insert IGNORE into allusers values("1Emily","sid013333","spw013333","ACTIVE","0","stu");
insert IGNORE into allusers values("1Fiona","sid014444","spw014444","ACTIVE","0","stu");
insert IGNORE into allusers values("1Gloria","sid015555","spw015555","ACTIVE","0","stu");
insert IGNORE into allusers values("1Helena","sid016666","spw016666","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00001","sid011111","Computational Modeling of Public Health Decision Making for Effective Disease Control");
insert IGNORE into supervisorpairstudent values("tid00001","sid012222","Time scheduling of the FYP presentation");
insert IGNORE into supervisorpairstudent values("tid00001","sid013333","Time scheduling of the FYP presentation");
insert IGNORE into supervisorpairstudent values("tid00001","sid014444","Nil");
insert IGNORE into supervisorpairstudent values("tid00001","sid015555","Time scheduling of the FYP presentation");
insert IGNORE into supervisorpairstudent values("tid00001","sid016666","Computational Modeling of Public Health Decision Making for Effective Disease Control");

insert IGNORE into allusers values("2Emily","sid021111","spw021111","ACTIVE","0","stu");
insert IGNORE into allusers values("2Fanny","sid022222","spw022222","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00002","sid021111","A Mobile App to search for the food addictives by computer vision");
insert IGNORE into supervisorpairstudent values("tid00002","sid022222","Python Online Practice System");


insert IGNORE into allusers values("3Cathy","sid031111","spw031111","ACTIVE","0","stu");
insert IGNORE into allusers values("3Dorthy","sid032222","spw032222","ACTIVE","0","stu");
insert IGNORE into allusers values("3Emily","sid033333","spw033333","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00003","sid031111","Develop a system for a bright new world");
insert IGNORE into supervisorpairstudent values("tid00003","sid032222","A mobile app based attendance recording system");
insert IGNORE into supervisorpairstudent values("tid00003","sid033333","A mobile app based attendance recording system");



insert IGNORE into allusers values("4Dorthy","sid041111","spw041111","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00004","sid041111","Smart Building Analytics #1 - Information Management and Visualization");



insert IGNORE into allusers values("5Dorthy","sid051111","spw051111","ACTIVE","0","stu");
insert IGNORE into allusers values("5Emily","sid052222","spw052222","ACTIVE","0","stu");
insert IGNORE into allusers values("5Fiona","sid053333","spw053333","ACTIVE","0","stu");
insert IGNORE into allusers values("5Cathy","sid054444","spw054444","ACTIVE","0","stu");
insert IGNORE into allusers values("5Issac","sid055555","spw055555","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00005","sid051111","Remote Heart Rate Monitoring");
insert IGNORE into supervisorpairstudent values("tid00005","sid052222","A mobile app based attendance recording system");
insert IGNORE into supervisorpairstudent values("tid00005","sid053333","A mobile app based attendance recording system");
insert IGNORE into supervisorpairstudent values("tid00005","sid054444","A mobile app based attendance recording system");
insert IGNORE into supervisorpairstudent values("tid00005","sid055555","Developing an Approach to Course/Presentation Scheduling Problem");


insert IGNORE into allusers values("7Jack","sid071111","spw071111","ACTIVE","0","stu");
insert IGNORE into allusers values("7Kelvin","sid072222","spw072222","ACTIVE","0","stu");
insert IGNORE into allusers values("7Lemon","sid073333","spw073333","ACTIVE","0","stu");
insert IGNORE into allusers values("7Iris","sid074444","spw074444","ACTIVE","0","stu");
insert IGNORE into allusers values("7Zac","sid075555","spw075555","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00007","sid071111","Design and Implementation of a Web-Based Data Visualization System");
insert IGNORE into supervisorpairstudent values("tid00007","sid072222","NFT Marketplace Development");
insert IGNORE into supervisorpairstudent values("tid00007","sid073333","NFT Marketplace Development");
insert IGNORE into supervisorpairstudent values("tid00007","sid074444","NFT Marketplace Development");
insert IGNORE into supervisorpairstudent values("tid00007","sid075555","Development of Potential Application using ChatGPT Open APIs");


insert IGNORE into allusers values("8Lowrance","sid081111","spw081111","ACTIVE","0","stu");
insert IGNORE into allusers values("8Brenda","sid082222","spw082222","ACTIVE","0","stu");
insert IGNORE into allusers values("8Cathy","sid083333","spw083333","ACTIVE","0","stu");
insert IGNORE into allusers values("8Kelly","sid084444","spw084444","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00008","sid081111","Blockchain-based Health Wallet for Secure Sharing of Electronic Health Records");
insert IGNORE into supervisorpairstudent values("tid00008","sid082222","Boosting Out-of-distribution Detection with Self-supervised Learning and Related studies");
insert IGNORE into supervisorpairstudent values("tid00008","sid083333","A mobile app based attendance recording system");
insert IGNORE into supervisorpairstudent values("tid00008","sid084444","Develop a mobile game for children that they can combine learning and gaming, converting 'game time' into 'learning time' which is more beneficial than detrimental to students' academic development. It will make students want to spend some time after school and strike a balance between learning and playing.");


insert IGNORE into allusers values("10Cathy","sid101111","spw101111","ACTIVE","0","stu");
insert IGNORE into allusers values("10Dorthy","sid102222","spw102222","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00010","sid101111","Fish Recognition for Marine Ecology");
insert IGNORE into supervisorpairstudent values("tid00010","sid102222","Development of a Virtual Gymnastic Trainer Application using Computer Vision and AR technology");


insert IGNORE into allusers values("11Dorthy","sid111111","spw111111","ACTIVE","0","stu");
insert IGNORE into allusers values("11Emily","sid112222","spw112222","ACTIVE","0","stu");
insert IGNORE into allusers values("11Fiona","sid113333","spw113333","ACTIVE","0","stu");
insert IGNORE into allusers values("11Cathy","sid114444","spw114444","ACTIVE","0","stu");
insert IGNORE into allusers values("11Issac","sid115555","spw115555","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00005","sid111111","Mobile App for Cloth Washing Service");
insert IGNORE into supervisorpairstudent values("tid00005","sid112222","Mobile App for Supporting the Elderly");
insert IGNORE into supervisorpairstudent values("tid00005","sid113333","Mobile App for Cloth Washing Service");
insert IGNORE into supervisorpairstudent values("tid00005","sid114444","Hello HK Tourist Guide");
insert IGNORE into supervisorpairstudent values("tid00005","sid115555","Mobile App for Supporting the Elderly");

insert IGNORE into allusers values("12Cathy","sid121111","spw121111","ACTIVE","0","stu");
insert IGNORE into allusers values("12Dorthy","sid122222","spw122222","ACTIVE","0","stu");
insert IGNORE into allusers values("12Emily","sid123333","spw123333","ACTIVE","0","stu");
insert IGNORE into allusers values("12Fiona","sid124444","spw124444","ACTIVE","0","stu");
insert IGNORE into allusers values("12Gloria","sid125555","spw125555","ACTIVE","0","stu");
insert IGNORE into allusers values("12Helena","sid126666","spw126666","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00012","sid121111","Mobile App Development");
insert IGNORE into supervisorpairstudent values("tid00012","sid122222","Mobile App Development");
insert IGNORE into supervisorpairstudent values("tid00012","sid123333","Mobile App Development");
insert IGNORE into supervisorpairstudent values("tid00012","sid124444","Moving Object Tracking with Deep Learning");
insert IGNORE into supervisorpairstudent values("tid00012","sid125555","Development for Natural User Interface");
insert IGNORE into supervisorpairstudent values("tid00012","sid126666","Mobile App Development");

insert IGNORE into allusers values("13Dorthy","sid131111","spw131111","ACTIVE","0","stu");
update student set credit = 6 where sid = "sid131111";
insert IGNORE into supervisorpairstudent values("tid00013","sid131111","Nil");

insert IGNORE into allusers values("14Cathy","sid141111","spw141111","ACTIVE","0","stu");
insert IGNORE into allusers values("14Dorthy","sid142222","spw142222","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00014","sid141111","Social Network Community Detection and Visualization System");
insert IGNORE into supervisorpairstudent values("tid00014","sid142222","Social Network Community Detection and Visualization System");



#requestdata
#supevisor wholeday
#insert into allrequestfromsupervisor values("tid00001FsId5","tid00001","2024-01-19","00:00", "23:59");
#supevisorday
insert into allrequestfromsupervisor values("tid00001nKCo9","tid00001","2024-01-20","08:30", "10:30");
insert into allrequestfromsupervisor values("tid00002nKCo9","tid00002","2024-01-22","08:30", "12:30");
insert into allrequestfromsupervisor values("tid00003nKCo9","tid00003","2024-01-23","08:30", "09:30");
insert into allrequestfromsupervisor values("tid00004nKCo9","tid00004","2024-01-24","11:30", "12:30");
insert into allrequestfromsupervisor values("tid00005nKCo1","tid00005","2024-01-19","15:30", "16:30");
insert into allrequestfromsupervisor values("tid00005nKCo2","tid00005","2024-01-23","13:30", "16:30");
insert into allrequestfromsupervisor values("tid00009nKCo1","tid00009","2024-01-19","10:30", "16:30");
insert into allrequestfromsupervisor values("tid00009nKCo2","tid00009","2024-01-22","10:30", "16:30");
insert into allrequestfromsupervisor values("tid00009nKCo3","tid00009","2024-01-23","10:30", "16:30");
insert into allrequestfromsupervisor values("tid00009nKCo4","tid00009","2024-01-24","10:30", "16:30");


insert into allrequestfromstudent values("sid011111dSlOu","sid011111","2024-01-23","08:30", "10:00","sadfgasdf",null,"Enforce Approved","Approve for Demo",now());
insert into allrequestfromstudent values("sid021111dSlOu","sid021111","2024-01-19","13:30", "14:30","sadfgasdf",null,"Enforce Approved","Approve for Demo",now());
insert into allrequestfromstudent values("sid072222dSlOu","sid072222","2024-01-20","14:30", "16:30","sadfgasdf",null,"Enforce Approved","Approve for Demo",now());


insert into allpreffromsup values("tid00001",true,false,now());
insert into allpreffromsup values("tid00002",true,true,now());
insert into allpreffromsup values("tid00003",true,true,now());
insert into allpreffromsup values("tid00004",true,true,now());
insert into allpreffromsup values("tid00005",true,true,now());
insert into allpreffromsup values("tid00006",true,false,now());
insert into allpreffromsup values("tid00007",true,true,now());
insert into allpreffromsup values("tid00008",true,true,now());
insert into allpreffromsup values("tid00009",false,true,now());
insert into allpreffromsup values("tid00010",true,true,now());
insert into allpreffromsup values("tid00011",false,false,now());












