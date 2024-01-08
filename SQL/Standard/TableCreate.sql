

create table  allusers(allusersname	varchar(100) Not null,pid			varchar(20) not null,password	varchar(20) not null,states		varchar(20),errortime	int,role	varchar(20),PRIMARY key (pid));

create table   student(stdname		varchar(100) Not null,sid			varchar(20) not null,password	varchar(20) not null,states		varchar(20) default "ACTIVE",errortime	int default 0,ttbsubmission  varchar(20) default "N",ttbcomments varchar(200) default "",ttbdeadline timestamp default null,requestdeadline timestamp default null,PRIMARY key (sid));

create table supervisor(supname		varchar(100) Not null,tid			varchar(20) not null,password	varchar(20) not null,states		varchar(20),errortime	int,topics		varchar(100) Not null,submission  varchar(10) default "N", draft 		varchar(10) default "N", priority	int default 0,PRIMARY key (tid));

create table allclass(CDept		varchar(10) Not null,CCode		varchar(10)  Not null,CSecCode	varchar(10)  not null,CID			varchar(20) not null,Campus		Varchar(10) not null,RID			varchar(10) not null,weekdays 	integer,startTime	time,endTime		time,lesson		integer default 0,Check (endTime>startTime),PRIMARY key (CID));

create table classroom(Campus varchar(10) not null,RID		varchar(10),status varchar(10) not null,PRIMARY key (Campus,RID));

create table logs(logstring varchar(8000));

create table alltakecourse(CID		varchar(20) not null,PID		varchar(10) not null,CONSTRAINT csid primary key (CID,PID));

create table allsupertakecourse(CID		varchar(20) not null,PID		varchar(10) not null,confirmation integer default 0 ,Submissiontime timestamp,CONSTRAINT csid primary key (CID,PID));

create table allstudenttakecourse(CID		varchar(20) not null,PID		varchar(10) not null,confirmation integer default 0 ,Submissiontime timestamp default now(),picdata LONGBLOB default null,review timestamp default null,ttbcomments varchar(200) default "",CONSTRAINT csid primary key (CID,PID));

create table allrequestfromsupervisor(ReqID	varchar(20) not null,TID		varchar(10) not null,RequestDate DATE not null,RequestStartTime time not null,RequestEndTime time not null,primary key (ReqID));



create table allrequestfromstudent( ReqID	varchar(20) not null, SID		varchar(10) not null, RequestDate DATE not null, RequestStartTime time not null, RequestEndTime time not null, reason	varchar(1000) not null,picdata LONGBLOB,status varchar(20) not null,reply varchar(100),submission timestamp,primary key (ReqID) );

create table supervisorpairstudent( TID		varchar(20) not null, SID		varchar(10) not null unique, Topic 	varchar(100) not null, primary key (TID,SID) );

create table observerpairstudent( OID		varchar(20) not null, SID		varchar(10) not null unique, obsname varchar(100) not null, primary key (OID,SID) ); 

create table allclassroomtimeslot( ReqID	varchar(30) not null, Campus varchar(10) not null, RID		varchar(10) Not null, StartDate DATE not null, EndDate DATE not null, StartTime time not null, EndTime time not null, Remarks varchar(100), primary key (ReqID) );

create table allnotice( NID	varchar(20) not null, Creator		varchar(10) Not null, Creatorname		varchar(10), CreateDate  timestamp not null, type int default 1, title varchar(50) not null, content varchar(1000), primary key (NID) );

create table allsupersetting( STID	varchar(20) not null, Creator		varchar(10) Not null, CreateDate  timestamp , typeofsetting integer, deadlinedate date, deadlinetime time, startdate date, starttime time, enddate date, endtime time, LastUpdate timestamp, Announcetime timestamp default null, primary key (STID) );

create table allpreffromsup(TID varchar(10) not null, daypref boolean default true, movementpref boolean default true, LastUpdate timestamp not null, primary key (TID) );

create table allschedulebox( boxID varchar(30)not null, boxdate Timestamp not null, TYPE varchar(10) not null, TID varchar(10) not null, SID varchar(10)not null, OID varchar(50)not null, Campus varchar(10) not null, RID		varchar(10) Not null, LastUpdate timestamp not null, primary key (boxID) );

create table supervisoravailable( TID varchar(10) not null, availabledate DATE, availablestartTime timestamp, availableendTime timestamp, primary key(tid,availabledate,availablestarttime) );

create table studentavailable( SID varchar(10) not null, availabledate DATE, availablestartTime timestamp, availableendTime timestamp, primary key(sid,availabledate,availablestarttime) );

create table manualhandlecase( SID varchar(10) not null, TID varchar(10) not null, OID varchar(10) not null, primary key(sid) );

