DELETE FROM alltakecourse WHERE pid in (select sid from student);
Drop table if exists supervisoravailable;
Drop table if exists studentavailable;
Drop table if exists allschedulebox;
Drop table if exists manualhandlecase;
Drop table if exists threeparty;
DROP TABLE IF EXISTS supervisorpairstudent;
DROP TABLE IF EXISTS observerpairstudent;
DROP TABLE IF EXISTS allstudenttakecourse;
DROP TABLE IF EXISTS allrequestfromstudent;
DROP TABLE IF EXISTS student;


create table allschedulebox( boxID varchar(30)not null, boxdate Timestamp not null, TYPE varchar(10) not null, TID varchar(10) not null, SID varchar(10)not null, OID varchar(50)not null, Campus varchar(10) not null, RID		varchar(10) Not null, LastUpdate timestamp not null, primary key (boxID) );
create table supervisoravailable( TID varchar(10) not null, availabledate DATE, availablestartTime timestamp, availableendTime timestamp, primary key(tid,availabledate,availablestarttime) );
create table studentavailable( SID varchar(10) not null, availabledate DATE, availablestartTime timestamp, availableendTime timestamp, primary key(sid,availabledate,availablestarttime) );
create table manualhandlecase( SID varchar(10) not null, TID varchar(10) not null, OID varchar(10) not null, primary key(sid) );
create table threeparty (TID varchar(10) not null, SID varchar(10) not null, OID varchar(10) not null, TIDPrior int , OIDPrior int, availabledate DATE, availablestarttime timestamp, availableendtime timestamp, primary key(TID,SID,OID,availablestarttime));
create table supervisorpairstudent( TID		varchar(20) not null, SID		varchar(10) not null unique, Topic 	varchar(100) not null, primary key (TID,SID) );
create table observerpairstudent( OID		varchar(20) not null, SID		varchar(10) not null unique, obsname varchar(100) not null, primary key (OID,SID) ); 
create table allrequestfromstudent( ReqID	varchar(20) not null, SID		varchar(10) not null, RequestDate DATE not null, RequestStartTime time not null, RequestEndTime time not null, reason	varchar(1000) not null,picdata LONGBLOB,status varchar(20) not null,reply varchar(100),submission timestamp,primary key (ReqID) );
create table allstudenttakecourse(CID		varchar(20) not null,PID		varchar(10) not null,confirmation integer default 0 ,Submissiontime timestamp default now(),picdata LONGBLOB default null,review timestamp default null,ttbcomments varchar(200) default "",CONSTRAINT csid primary key (CID,PID));
create table   student(stdname		varchar(100) Not null,sid			varchar(20) not null,password	varchar(20) not null,states		varchar(20) default "ACTIVE",errortime	int default 0,ttbsubmission  varchar(20) default "N",ttbcomments varchar(200) default "",ttbdeadline timestamp default null,requestdeadline timestamp default null,PRIMARY key (sid));
DELETE FROM allusers WHERE role = "stu";

