

DROP TABLE IF EXISTS allusers;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS supervisor;
DROP TABLE IF EXISTS allclass;
DROP TABLE IF EXISTS classroom;
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS student_take_course;
DROP TABLE IF EXISTS allrequestfromstudent;
DROP TABLE IF EXISTS supervisorpairstudent;
Drop table if exists allrequestfromsupervisor;
Drop table if exists allclassroomtimeslot;
Drop table if exists allnotice;

DROP trigger IF exists testref;
Drop trigger if exists checkstudenttakecourse;
Drop trigger if exists insertcretorname;

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
PRIMARY key (sid));

create table supervisor(
supname		varchar(100) Not null,
tid			varchar(20) not null,
password	varchar(20) not null,
states		varchar(20),
errortime	int,
PRIMARY key (tid));

create table allclass(
CDept		varchar(10) Not null,
CCode		varchar(10)  Not null,
CSecCode	varchar(10)  not null,
CID			varchar(20) not null,
Campus		Varchar(10) not null,
RID			varchar(10) not null,
weekdays 	varchar(10) not null,
startTime	time,
endTime		time,
Check (endTime>startTime),
PRIMARY key (CID));

create table classroom(
Campus varchar(10) not null,
RID		varchar(10) Not null,
status varchar(10) not null,
PRIMARY key (Campus,RID));

create table logs(logstring varchar(8000));

create table Student_take_Course(
CID		varchar(20) not null,
SID		varchar(10) not null,
CONSTRAINT csid
primary key (CID,SID)
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
Topic 	varchar(50) not null,
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
    set new.rid ="empty";
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
    insert into student values(new.allusersname,new.pid,new.password,new.states,new.errortime);
	elseif new.role = "sup" then
    insert into supervisor values(new.allusersname,new.pid,new.password,new.states,new.errortime);
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

