Drop table if exists supervisoravailable;
Drop table if exists studentavailable;
Drop table if exists allschedulebox;
Drop table if exists manualhandlecase;
create table allschedulebox( boxID varchar(30)not null, boxdate Timestamp not null, TYPE varchar(10) not null, TID varchar(10) not null, SID varchar(10)not null, OID varchar(50)not null, Campus varchar(10) not null, RID		varchar(10) Not null, LastUpdate timestamp not null, primary key (boxID) );
create table supervisoravailable( TID varchar(10) not null, availabledate DATE, availablestartTime timestamp, availableendTime timestamp, primary key(tid,availabledate,availablestarttime) );
create table studentavailable( SID varchar(10) not null, availabledate DATE, availablestartTime timestamp, availableendTime timestamp, primary key(sid,availabledate,availablestarttime) );
create table manualhandlecase( SID varchar(10) not null, TID varchar(10) not null, OID varchar(10) not null, primary key(sid) );,
        