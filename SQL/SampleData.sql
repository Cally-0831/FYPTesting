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




insert IGNORE into allusers values("Cathy","sid33333","spw33333","ACTIVE","0","stu");
insert IGNORE into allusers values("Dorthy","sid44444","spw44444","ACTIVE","0","stu");
insert IGNORE into allusers values("Emily","sid55555","spw55555","ACTIVE","0","stu");
insert IGNORE into allusers values("Fiona","sid66666","spw66666","ACTIVE","0","stu");
insert IGNORE into allusers values("Gloria","sid77777","spw77777","ACTIVE","0","stu");
insert IGNORE into allusers values("Helena","sid88888","spw88888","ACTIVE","0","stu");
insert IGNORE into allusers values("Iris","sid99999","spw99999","ACTIVE","0","stu");
insert IGNORE into allusers values("Jack","sid10111","spw10111","ACTIVE","0","stu");
insert IGNORE into allusers values("Kelvin","sid10112","spw10112","ACTIVE","0","stu");
insert IGNORE into allusers values("Lemon","sid10113","spw10113","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00001","sid33333","how to get abc");
insert IGNORE into supervisorpairstudent values("tid00001","sid44444","where is abc");
insert IGNORE into supervisorpairstudent values("tid00001","sid55555","how to get abc");
insert IGNORE into supervisorpairstudent values("tid00001","sid66666","where is abc");
insert IGNORE into supervisorpairstudent values("tid00001","sid77777","how to get abc");
insert IGNORE into supervisorpairstudent values("tid00001","sid88888","where is abc");
insert IGNORE into supervisorpairstudent values("tid00001","sid99999","how to get abc");
insert IGNORE into supervisorpairstudent values("tid00001","sid10111","where is abc");
insert IGNORE into supervisorpairstudent values("tid00001","sid10112","how to get abc");
insert IGNORE into supervisorpairstudent values("tid00001","sid10113","where is abc");

insert IGNORE into allusers values("Emily","sid21111","spw21111","ACTIVE","0","stu");
insert IGNORE into allusers values("Fanny","sid22222","spw22222","ACTIVE","0","stu");
insert IGNORE into supervisorpairstudent values("tid00002","sid21111","how to get efg");
insert IGNORE into supervisorpairstudent values("tid00002","sid22222","where is efg");