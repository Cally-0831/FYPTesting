

create table  allusers(
allusersname	varchar(100) Not null,
pid			varchar(20) not null,
password	varchar(20) not null,
states		varchar(20),
errortime	int,
role	varchar(20),

PRIMARY key (pid));

create table   student(
stdname		varchar(100) Not null,
sid			varchar(20) not null,
password	varchar(20) not null,
states		varchar(20),
errortime	int,
submission  varchar(10) default "N",
PRIMARY key (sid));

create table supervisor(
supname		varchar(100) Not null,
tid			varchar(20) not null,
password	varchar(20) not null,
states		varchar(20),
errortime	int,
topics		varchar(100) Not null,
PRIMARY key (tid));

create table allclass(
CDept		varchar(10) Not null,
CCode		varchar(10)  Not null,
CSecCode	varchar(10)  not null,
CID			varchar(20) not null,
Campus		Varchar(10) not null,
RID			varchar(10) not null,
weekdays 	integer,
startTime	time,
endTime		time,
lesson		integer default 0,
Check (endTime>startTime),
PRIMARY key (CID));

create table classroom(
Campus varchar(10) not null,
RID		varchar(10) Not null,
status varchar(10) not null,
PRIMARY key (Campus,RID));

create table logs(logstring varchar(8000));

create table alltakecourse(
CID		varchar(20) not null,
PID		varchar(10) not null,
CONSTRAINT csid
primary key (CID,PID)
);

create table allsupertakecourse(
CID		varchar(20) not null,
PID		varchar(10) not null,
confirmation integer default 0 ,
Submissiontime timestamp,
CONSTRAINT csid
primary key (CID,PID)
);

create table allstudenttakecourse(
CID		varchar(20) not null,
PID		varchar(10) not null,
confirmation integer default 0 ,
Submissiontime timestamp,
picdata varbinary(60000),
CONSTRAINT csid
primary key (CID,PID)
);

create table allrequestfromsupervisor(
ReqID	varchar(20) not null,
TID		varchar(10) not null,
RequestDate DATE not null,
RequestStartTime time not null,
RequestEndTime time not null,
primary key (ReqID)
);
create table allrequestfromstudent(
ReqID	varchar(20) not null,
SID		varchar(10) not null,
RequestDate DATE not null,
RequestStartTime time not null,
RequestEndTime time not null,
reason	varchar(1000) not null,
proofpath varchar(100) not null,
status varchar(10) not null,
reply varchar(100),
primary key (ReqID)
);
create table supervisorpairstudent(
TID		varchar(20) not null,
SID		varchar(10) not null,
Topic 	varchar(100) not null,
primary key (TID,SID)
);

create table allclassroomtimeslot(
ReqID	varchar(20) not null,
Campus varchar(10) not null,
RID		varchar(10) Not null,
StartDate DATE not null,
EndDate DATE not null,
StartTime time not null,
EndTime time not null,
Remarks varchar(100),
primary key (ReqID)
);

create table allnotice(
NID	varchar(20) not null,
Creator		varchar(10) Not null,
Creatorname		varchar(10),
CreateDate  timestamp not null,
title varchar(50) not null,
content varchar(1000),
primary key (NID)
);

create table allsupersetting(
SID	varchar(20) not null,
Creator		varchar(10) Not null,
CreateDate  timestamp ,
typeofsetting integer,
deadlinedate date,
deadlinetime time,
LastUpdate timestamp,
primary key (SID)
);


delimiter |

CREATE TRIGGER testref BEFORE INSERT ON allclass
  FOR EACH ROW
  BEGIN
  declare stringstring  varchar(8000);
  declare countcount integer;

  
  set new.CID = concat(new.CDept, new.CCode, '_', new.CSecCode);
  set countcount =0;
  
  select count(*) into countcount from allclass 
  where (rid = new.rid and campus = new.campus) and weekdays = new.weekdays and (starttime <= new.starttime and endtime >= new.starttime);
  
  
    
  if countcount >0 then
    set new.rid ="N";
    END IF;
    
    if new.lesson >0 then
    set new.cid = concat(new.CDept, new.CCode, '_', new.CSecCode,"_",new.lesson);
    END IF;
  END;
  |
delimiter ;

##delimiter |
##CREATE TRIGGER checkstudenttakecourse BEFORE INSERT ON student_take_course
##  FOR EACH ROW
##  BEGIN
##  declare stringstring  varchar(8000);
##  declare countcount integer;
##  set stringstring = new.cid;allusersallusers
##  set countcount =0;
##  select count(*) into countcount from student_take_course 
##  where cid = new.cid and sid = new.sid;
##  if countcount >0 then
##    insert into logs values("duplicated");
##    END IF;
##  END;
##  |
##delimiter ;

delimiter |
CREATE TRIGGER addalluserstoroletable BEFORE INSERT ON allusers
  FOR EACH ROW
  BEGIN
##  declare stringstring  varchar(8000);
##  declare countcount integer;
##  set stringstring = new.cid;allusersallusers

##  set countcount =0;
##  select count(*) into countcount from student_take_course 
##  where cid = new.cid and sid = new.sid;
  if new.role = "stu" then
    insert into student values(new.allusersname,new.pid,new.password,new.states,new.errortime,"N");
	elseif new.role = "sup" then
    insert into supervisor values(new.allusersname,new.pid,new.password,new.states,new.errortime,"");
    END IF;
  END;
  |
delimiter ;

delimiter |
CREATE TRIGGER insertcreatorname BEFORE INSERT ON allnotice
  FOR EACH ROW
  BEGIN
  declare stringstring  varchar(10);

 select allusersname into stringstring from allusers 
 where new.creator = pid;
 set new.creatorname = stringstring;
   END;
  |
delimiter ;

delimiter |
CREATE TRIGGER addlessontimeforoneCode BEFORE INSERT ON allclass
  FOR EACH ROW
  BEGIN
  declare countcount integer;
  declare stringstring  varchar(20);
  set countcount =0;
  set stringstring = concat(new.CDept,new.CCode,"_",new.CSecCode,"%");
   select count(*) into  countcount from allclass
  where CID like stringstring;
set new.lesson = countcount;
if countcount >0 then
set new.CID = concat(new.CDept,new.CCode,"_",new.CSecCode,"_",countcount);
 END IF;
   END;
  |
delimiter ;

delimiter |
CREATE TRIGGER takeallcourseofonecode after INSERT ON alltakecourse
  FOR EACH ROW
  BEGIN
   declare countcount integer;
  declare stringstring  varchar(20);
    declare thisisrole varchar(10);
  declare x integer;
  declare issup boolean;
  set issup = false;
  set thisisrole ="";
  set countcount =0;
  
select Max(lesson) into  countcount from alltakecourse inner join allclass on allclass.cid like concat(alltakecourse.cid,"%") 
where alltakecourse.cid  like concat(new.cid,"%");
select role into thisisrole from allusers where new.pid = pid;
 if thisisrole="sup" then 
	set issup = true;
    END IF;
    
 if issup then
 
 if countcount >0 then
 while countcount >=0 do
 
 if countcount =0 then
 set stringstring = concat(new.cid);
 else
 set stringstring = concat(new.cid,"_",countcount,"");
 END IF;

insert into allsupertakecourse values(stringstring,new.pid,false,now());
   set countcount= countcount -1;
   end while;
else
insert into allsupertakecourse values(new.cid,new.pid,false,now());
END IF;
else if not issup then

if countcount >0 then
	while countcount >0 do
		set stringstring = concat(new.cid,"_",countcount,"");
		insert into allstudenttakecourse values(stringstring,new.pid,false,now(),"");
		set countcount= countcount -1;
	end while;
	insert into allstudenttakecourse values(new.cid,new.pid,false,now(),"");
else
	insert into allstudenttakecourse values(new.cid,new.pid,false,now(),"");
END IF;
   END IF;
   END IF;
   END;
  |
delimiter ;

delimiter |
CREATE TRIGGER delalltakecourse After DELETE ON allsupertakecourse
  FOR EACH ROW
  BEGIN
  declare countcount integer;
  declare stringstring  varchar(20);
  set countcount =0;
  DELETE from alltakecourse where pid = old.pid and cid = old.cid;
  
   END;
  |
delimiter ;

delimiter |
CREATE TRIGGER delallstudenttakecourse After DELETE ON allstudenttakecourse
  FOR EACH ROW
  BEGIN
  declare countcount integer;
  declare stringstring  varchar(20);
  set countcount =0;
  DELETE from alltakecourse where pid = old.pid and cid = old.cid;
  
   END;
  |
delimiter ;

delimiter |
CREATE TRIGGER addintosetting before insert ON allsupersetting
  FOR EACH ROW
  BEGIN
  
  set new.createdate = now();
  set new.LastUpdate = now();
  
   END;
  |
delimiter ;

delimiter |
CREATE TRIGGER addtopicinsupervisor before insert ON supervisorpairstudent
  FOR EACH ROW
  BEGIN
declare alltopic varchar(100);
declare countcount integer;
set countcount = 0;

select count(*) into  countcount from supervisorpairstudent where Topic like new.Topic and tid = new.tid;

if countcount = 0 then
select topics into alltopic from supervisor  where tid = new.tid;
update supervisor set topics = concat(alltopic,'/',new.topic) where tid = new.tid;
end if;


   END;
  |
delimiter ;

delimiter |
CREATE TRIGGER addsubinstudent before update ON allstudenttakecourse
  FOR EACH ROW
  BEGIN
	if new.confirmation = "1" then
		update student set submission ="Y" where sid = new.pid;
	end if;

   END;
  |
delimiter ;