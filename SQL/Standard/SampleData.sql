INSERT INTO  allusers VALUES ("Admin","admin","P@ssw0rd","Active",0,"adm");
insert into allclass values("EMPTY","","","","","","0","08:30","09:30","0");

insert IGNORE into allusers values("Dr. LIU, Yang","tid00001","tpw00001","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00001";

insert IGNORE into allusers values("Dr. ZHANG, Eric Lu","tid00002","tpw00002","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00002";

insert IGNORE into allusers values("Dr. CHOY, Martin Man Ting","tid00003","tpw00003","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00003";

insert IGNORE into allusers values("Dr. HUANG, Xin","tid00004","tpw00004","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00004";

insert IGNORE into allusers values("Prof. CHEUNG, Yiu Ming","tid00005","tpw00005","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00005";

insert IGNORE into allusers values("Dr. MA, Jing","tid00006","tpw00006","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00006";

insert IGNORE into allusers values("Prof. Xu, Jianliang","tid00007","tpw00007","ACTIVE","0","sup");
update supervisor set priority = "1" where tid = "tid00007";

insert IGNORE into allusers values("Dr. HAN, Bo","tid00008","tpw00008","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00008";

insert IGNORE into allusers values("Dr. DAI, Henry Hong Ning","tid00009","tpw00009","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00009";

insert IGNORE into allusers values("Prof. YUEN, Pong Chi","tid00010","tpw00010","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00010";

insert IGNORE into allusers values("Dr. CHEN, Jie","tid00011","tpw00011","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00011";

insert IGNORE into allusers values("Dr. FENG, Jian","tid00012","tpw00012","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00012";

insert IGNORE into allusers values("Prof. NG, Joseph Kee Yin","tid00013","tpw00013","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00013";

insert IGNORE into allusers values("Dr. WANG, Kevin King Hang","tid00014","tpw00014","ACTIVE","0","sup");
update supervisor set priority = "3" where tid = "tid00014";

insert IGNORE into allusers values("Dr. WAN, Renjie","tid00015","tpw00015","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00015";

insert IGNORE into allusers values("Dr. XUE, Wei","tid00016","tpw00016","ACTIVE","0","sup");
update supervisor set priority = "2" where tid = "tid00016";


insert IGNORE into allusers values("1Winston","sid011111","spw011111","ACTIVE","0","stu");
insert IGNORE into allusers values("1Beth","sid012222","spw012222","ACTIVE","0","stu");
insert IGNORE into allusers values("1Emily","sid013333","spw013333","ACTIVE","0","stu");
insert IGNORE into allusers values("1Flora","sid014444","spw014444","ACTIVE","0","stu");
insert IGNORE into allusers values("1Gordon","sid015555","spw015555","ACTIVE","0","stu");
insert IGNORE into allusers values("1Helena","sid016666","spw016666","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00001","sid011111","Computational Modeling of Public Health Decision Making for Effective Disease Control");
insert IGNORE into supervisorpairstudent values("tid00001","sid012222","Time scheduling of the FYP presentation");
insert IGNORE into supervisorpairstudent values("tid00001","sid013333","Time scheduling of the FYP presentation");
insert IGNORE into supervisorpairstudent values("tid00001","sid014444","Nil");
insert IGNORE into supervisorpairstudent values("tid00001","sid015555","Time scheduling of the FYP presentation");
insert IGNORE into supervisorpairstudent values("tid00001","sid016666","Computational Modeling of Public Health Decision Making for Effective Disease Control");

insert IGNORE into allusers values("2Emily","sid021111","spw021111","ACTIVE","0","stu");
insert IGNORE into allusers values("2Fanny","sid022222","spw022222","ACTIVE","0","stu");
insert IGNORE into allusers values("2Christy","sid023333","spw023333","ACTIVE","0","stu");
insert IGNORE into allusers values("2Alice","sid024444","spw024444","ACTIVE","0","stu");
insert IGNORE into allusers values("2Bryon","sid025555","spw025555","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00002","sid021111","A Mobile App to search for the food addictives by computer vision");
insert IGNORE into supervisorpairstudent values("tid00002","sid022222","Python Online Practice System");
insert IGNORE into supervisorpairstudent values("tid00002","sid023333","A Mobile App to search for the food addictives by computer vision");
insert IGNORE into supervisorpairstudent values("tid00002","sid024444","Python Online Practice System");
insert IGNORE into supervisorpairstudent values("tid00002","sid025555","A Mobile App to search for the food addictives by computer vision");

insert IGNORE into allusers values("3Jaden","sid031111","spw031111","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00003","sid031111","Smart Building Analytics #1 - Information Management and Visualization");
insert IGNORE into allusers values("3Kathy","sid032222","spw032222","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00003","sid032222","Smart Building Analytics #1 - Information Management and Visualization");

insert IGNORE into allusers values("4Emily","sid041111","spw041111","ACTIVE","0","stu");
insert IGNORE into allusers values("4Fanny","sid042222","spw042222","ACTIVE","0","stu");
insert IGNORE into allusers values("4Christy","sid043333","spw043333","ACTIVE","0","stu");
insert IGNORE into allusers values("4Alice","sid044444","spw044444","ACTIVE","0","stu");
insert IGNORE into allusers values("4Bryon","sid045555","spw045555","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00004","sid041111","A Mobile App to search for the food addictives by computer vision");
insert IGNORE into supervisorpairstudent values("tid00004","sid042222","Python Online Practice System");
insert IGNORE into supervisorpairstudent values("tid00004","sid043333","A Mobile App to search for the food addictives by computer vision");
insert IGNORE into supervisorpairstudent values("tid00004","sid044444","Python Online Practice System");
insert IGNORE into supervisorpairstudent values("tid00004","sid045555","A Mobile App to search for the food addictives by computer vision");


insert IGNORE into allusers values("5Gordon","sid051111","spw051111","ACTIVE","0","stu");
insert IGNORE into allusers values("5Selena","sid052222","spw052222","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00005","sid051111","Remote Heart Rate Monitoring");
insert IGNORE into supervisorpairstudent values("tid00005","sid052222","A mobile app based attendance recording system");

insert IGNORE into allusers values("6Dorthy","sid061111","spw061111","ACTIVE","0","stu");
update student set credit = 6 where sid = "sid061111";
insert IGNORE into supervisorpairstudent values("tid00006","sid061111","Nil");

insert IGNORE into allusers values("7Jack","sid071111","spw071111","ACTIVE","0","stu");
insert IGNORE into allusers values("7Kelvin","sid072222","spw072222","ACTIVE","0","stu");
insert IGNORE into allusers values("7Lemon","sid073333","spw073333","ACTIVE","0","stu");
insert IGNORE into allusers values("7Iris","sid074444","spw074444","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00007","sid071111","Design and Implementation of a Web-Based Data Visualization System");
insert IGNORE into supervisorpairstudent values("tid00007","sid072222","NFT Marketplace Development");
insert IGNORE into supervisorpairstudent values("tid00007","sid073333","NFT Marketplace Development");
insert IGNORE into supervisorpairstudent values("tid00007","sid074444","NFT Marketplace Development");

insert IGNORE into allusers values("8Lowrance","sid081111","spw081111","ACTIVE","0","stu");
insert IGNORE into allusers values("8Brenda","sid082222","spw082222","ACTIVE","0","stu");
insert IGNORE into allusers values("8Yvonne","sid083333","spw083333","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00008","sid081111","Blockchain-based Health Wallet for Secure Sharing of Electronic Health Records");
insert IGNORE into supervisorpairstudent values("tid00008","sid082222","Boosting Out-of-distribution Detection with Self-supervised Learning and Related studies");
insert IGNORE into supervisorpairstudent values("tid00008","sid083333","A mobile app based attendance recording system");

insert IGNORE into allusers values("9Zac","sid091111","spw091111","ACTIVE","0","stu");
insert IGNORE into allusers values("9Ivy","sid092222","spw092222","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00009","sid091111","Develop a system for a bright new world");
insert IGNORE into supervisorpairstudent values("tid00009","sid092222","A mobile app based attendance recording system");


insert IGNORE into allusers values("10Cathy","sid101111","spw101111","ACTIVE","0","stu");
insert IGNORE into allusers values("10Dorthy","sid102222","spw102222","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00010","sid101111","Fish Recognition for Marine Ecology");
insert IGNORE into supervisorpairstudent values("tid00010","sid102222","Development of a Virtual Gymnastic Trainer Application using Computer Vision and AR technology");


insert IGNORE into allusers values("11Olivia","sid111111","spw111111","ACTIVE","0","stu");
insert IGNORE into allusers values("11Rita","sid112222","spw112222","ACTIVE","0","stu");
insert IGNORE into allusers values("11Fiona","sid113333","spw113333","ACTIVE","0","stu");
insert IGNORE into allusers values("11Kate","sid114444","spw114444","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00011","sid111111","Mobile App for Cloth Washing Service");
insert IGNORE into supervisorpairstudent values("tid00011","sid112222","Mobile App for Supporting the Elderly");
insert IGNORE into supervisorpairstudent values("tid00011","sid113333","Mobile App for Cloth Washing Service");
insert IGNORE into supervisorpairstudent values("tid00011","sid114444","Hello HK Tourist Guide");

insert IGNORE into allusers values("12Victor","sid121111","spw121111","ACTIVE","0","stu");
insert IGNORE into allusers values("12Mike","sid122222","spw122222","ACTIVE","0","stu");
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

insert IGNORE into allusers values("13Nancy","sid131111","spw131111","ACTIVE","0","stu");
insert IGNORE into allusers values("13Tracy","sid132222","spw132222","ACTIVE","0","stu");
insert IGNORE into allusers values("13Haley","sid133333","spw133333","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00013","sid131111","Mobile App Development");
insert IGNORE into supervisorpairstudent values("tid00013","sid132222","Mobile App Development");
insert IGNORE into supervisorpairstudent values("tid00013","sid133333","Mobile App Development");

insert IGNORE into allusers values("14Lilith","sid141111","spw141111","ACTIVE","0","stu");
insert IGNORE into allusers values("14Dora","sid142222","spw142222","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00014","sid141111","Social Network Community Detection and Visualization System");
insert IGNORE into supervisorpairstudent values("tid00014","sid142222","Social Network Community Detection and Visualization System");

insert IGNORE into allusers values("15Cathrine","sid151111","spw151111","ACTIVE","0","stu");
insert IGNORE into allusers values("15Pony","sid152222","spw152222","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00015","sid151111","Social Network Community Detection and Visualization System");
insert IGNORE into supervisorpairstudent values("tid00015","sid152222","Social Network Community Detection and Visualization System");

insert IGNORE into allusers values("16Eric","sid161111","spw161111","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00016","sid161111","Nil");

#requestdata
#supevisor wholeday
#insert into allrequestfromsupervisor values("tid00001FsId5","tid00001","2024-01-19","00:00", "23:59");
#supevisorday
insert into allrequestfromsupervisor values("tid00001FsId5","tid00001","2024-04-13","16:00", "18:00");
insert into allrequestfromsupervisor values("tid00001nKCo9","tid00001","2024-04-17","14:00", "16:00");
insert into allrequestfromsupervisor values("tid00010dKCo1","tid00010","2024-04-12","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00010dKCo2","tid00010","2024-04-12","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00010nKCo3","tid00010","2024-04-13","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00010dKCo4","tid00010","2024-04-13","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00010nKCo5","tid00010","2024-04-16","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00010dKCo6","tid00010","2024-04-16","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00007nKCo9","tid00007","2024-04-11","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00007dKC10","tid00007","2024-04-11","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00007nKC11","tid00007","2024-04-12","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00007dKC12","tid00007","2024-04-12","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00007nKCo1","tid00007","2024-04-15","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00007dKCo2","tid00007","2024-04-15","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00007nKCo3","tid00007","2024-04-16","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00007dKCo4","tid00007","2024-04-16","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00007nKCo5","tid00007","2024-04-17","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00007dKCo6","tid00007","2024-04-17","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00007nKCo7","tid00007","2024-04-18","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00007dKCo8","tid00007","2024-04-18","14:00", "18:00");



insert into allrequestfromsupervisor values("tid00006nKCo1","tid00006","2024-04-11","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00006nKCo2","tid00006","2024-04-11","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00006nKCo3","tid00006","2024-04-12","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00006nKCo4","tid00006","2024-04-12","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00006nKCo5","tid00006","2024-04-13","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00006nKCo6","tid00006","2024-04-13","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00006nKCo7","tid00006","2024-04-15","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00006nKCo8","tid00006","2024-04-15","14:00", "16:00");
insert into allrequestfromsupervisor values("tid00006nKCo9","tid00006","2024-04-16","09:00", "11:00");
insert into allrequestfromsupervisor values("tid00006nKC10","tid00006","2024-04-17","09:00", "11:00");
insert into allrequestfromsupervisor values("tid00006nKC11","tid00006","2024-04-18","09:00", "11:00");


insert into allrequestfromsupervisor values("tid00014nKCo1","tid00014","2024-04-11","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00014nKCo2","tid00014","2024-04-12","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00014nKCo3","tid00014","2024-04-13","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00014nKCo4","tid00014","2024-04-13","14:00", "16:00");
insert into allrequestfromsupervisor values("tid00014nKCo5","tid00014","2024-04-15","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00014nKCo6","tid00014","2024-04-18","14:00", "18:00");


insert into allrequestfromsupervisor values("tid00012nKCo1","tid00012","2024-04-11","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00012nKCo2","tid00012","2024-04-11","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00012nKCo5","tid00012","2024-04-12","09:00", "11:00");
insert into allrequestfromsupervisor values("tid00012nKCo6","tid00012","2024-04-12","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00012nKCo7","tid00012","2024-04-13","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00012nKCo8","tid00012","2024-04-15","09:00", "11:00");
insert into allrequestfromsupervisor values("tid00012nKCo3","tid00012","2024-04-16","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00012nKC10","tid00012","2024-04-17","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00012nKC11","tid00012","2024-04-17","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00012nKC13","tid00012","2024-04-18","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00012nKC14","tid00012","2024-04-18","14:00", "18:00");

insert into allrequestfromsupervisor values("tid00003nKCo1","tid00003","2024-04-11","16:00", "18:00");
insert into allrequestfromsupervisor values("tid00003nKCo2","tid00003","2024-04-15","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00003nKCo3","tid00003","2024-04-16","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00003nKCo4","tid00003","2024-04-17","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00003nKCo5","tid00003","2024-04-18","14:00", "18:00");

insert into allrequestfromsupervisor values("tid00005nKCo1","tid00005","2024-04-11","09:00", "11:00");
insert into allrequestfromsupervisor values("tid00005nKCo2","tid00005","2024-04-12","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00005nKCo3","tid00005","2024-04-12","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00005nKCo4","tid00005","2024-04-13","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00005nKCo5","tid00005","2024-04-13","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00005nKCo6","tid00005","2024-04-15","09:00", "11:00");
insert into allrequestfromsupervisor values("tid00005nKCo7","tid00005","2024-04-15","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00005nKCo8","tid00005","2024-04-16","09:00", "11:00");
insert into allrequestfromsupervisor values("tid00005nKCo9","tid00005","2024-04-17","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00005nKC10","tid00005","2024-04-18","14:00", "18:00");


insert into allrequestfromsupervisor values("tid00004nKC01","tid00004","2024-04-11","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00004nKC02","tid00004","2024-04-12","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00004nKC03","tid00004","2024-04-17","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00004nKC04","tid00004","2024-04-18","14:00", "16:00");

insert into allrequestfromsupervisor values("tid00009nKCo1","tid00009","2024-04-11","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00009nKCo2","tid00009","2024-04-16","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00009nKC03","tid00009","2024-04-16","14:00", "16:00");

insert into allrequestfromsupervisor values("tid00008nKCo1","tid00008","2024-04-15","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00008nKCo2","tid00008","2024-04-15","14:00", "18:00");

insert into allrequestfromsupervisor values("tid00015nKCo1","tid00015","2024-04-15","14:00", "18:00");

insert into allrequestfromsupervisor values("tid00011nKCo1","tid00011","2024-04-11","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00011nKCo2","tid00011","2024-04-11","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00011nKCo3","tid00011","2024-04-12","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00011nKCo4","tid00011","2024-04-12","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00011nKCo5","tid00011","2024-04-13","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00011nKCo6","tid00011","2024-04-13","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00011nKCo7","tid00011","2024-04-15","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00011nKCo8","tid00011","2024-04-16","09:00", "13:00");

insert into allrequestfromsupervisor values("tid00013nKCo2","tid00013","2024-04-12","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00013nKCo3","tid00013","2024-04-12","14:00", "18:00");
insert into allrequestfromsupervisor values("tid00013nKCo1","tid00013","2024-04-15","09:00", "13:00");
insert into allrequestfromsupervisor values("tid00013nKCo4","tid00013","2024-04-17","16:00", "18:00");

insert into allrequestfromsupervisor values("tid00016nKCo1","tid00016","2024-04-15","14:00", "16:00");
insert into allrequestfromsupervisor values("tid00016nKCo2","tid00016","2024-04-11","11:00", "13:00");







insert into allrequestfromstudent values("sid011111dSlOu","sid011111","2024-04-11","08:30", "10:00","sadfgasdf",null,"Enforce Approved","Approve for Demo",now());
insert into allrequestfromstudent values("sid021111dSlOu","sid021111","2024-04-19","13:30", "14:30","sadfgasdf",null,"Enforce Approved","Approve for Demo",now());
insert into allrequestfromstudent values("sid072222dSlOu","sid072222","2024-04-20","14:30", "16:30","sadfgasdf",null,"Enforce Approved","Approve for Demo",now());


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
insert into allpreffromsup values("tid00012",false,true,now());











