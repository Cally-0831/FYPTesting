

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
states		varchar(20) default "ACTIVE",
errortime	int default 0,
ttbsubmission  varchar(20) default null,
ttbcomments varchar(200) default "",
ttbdeadline timestamp default null,
requestdeadline timestamp default null,
PRIMARY key (sid));

create table supervisor(
supname		varchar(100) Not null,
tid			varchar(20) not null,
password	varchar(20) not null,
states		varchar(20),
errortime	int,
topics		varchar(100) Not null,
submission  varchar(10) default "N", 
draft 		varchar(10) default "N", 
priority	int default 0,
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
Submissiontime timestamp default now(),
picdata LONGBLOB default null,
review timestamp default null,
ttbcomments varchar(200) default "",
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
picdata LONGBLOB,
status varchar(20) not null,
reply varchar(100),
submission timestamp,
primary key (ReqID)
);

create table supervisorpairstudent(
TID		varchar(20) not null,
SID		varchar(10) not null,
Topic 	varchar(100) not null,
primary key (TID,SID)
);


create table observerpairstudent(
obsname varchar(100) not null,
OID		varchar(20) not null,
SID		varchar(10) not null,
primary key (SID)
);



create table allclassroomtimeslot(
ReqID	varchar(30) not null,
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
type int default 1,
title varchar(50) not null,
content varchar(1000),
primary key (NID)
);

create table allsupersetting(
STID	varchar(20) not null,
Creator		varchar(10) Not null,
CreateDate  timestamp ,
typeofsetting integer,
deadlinedate date,
deadlinetime time,
startdate date,
starttime time,
enddate date,
endtime time,
LastUpdate timestamp,
Announcetime timestamp default null,
primary key (STID)
);

create table allschedulebox(
boxID varchar(30)not null,
boxdate date,
boxtime time,
TID varchar(10) not null,
SID varchar(10)not null,
OID varchar(50)not null,
Campus varchar(10) not null,
RID		varchar(10) Not null,
LastUpdate timestamp not null,
primary key (boxID)
);

create table allpreffromsup(

TID varchar(10) not null,
Prefno varchar(50),
LastUpdate timestamp not null,
primary key (TID)
);



delimiter |

CREATE TRIGGER testref BEFORE INSERT ON allclass
  FOR EACH ROW
  BEGIN
  declare stringstring  varchar(8000);
  declare countcount integer;

  declare findcampusroom integer;
  
  set new.CID = concat(new.CDept, new.CCode, '_', new.CSecCode);
  set countcount =0;
  
  
  select count(*) into countcount from allclass 
  where (rid = new.rid and campus = new.campus) and weekdays = new.weekdays and (starttime <= new.starttime and endtime >= new.starttime);
  

   select count(*) into  findcampusroom from classroom where campus = new.campus and rid = new.rid;
    
    if findcampusroom = 0 then
		insert into classroom values (new.campus,new.rid,"Open");
    End if;
    
  if countcount >0 then
    set new.rid ="N";
    END IF;
    
    if new.lesson >0 then
    set new.cid = concat(new.CDept, new.CCode, '_', new.CSecCode,"_",new.lesson);
    END IF;
  END;
  |
delimiter ;


delimiter |
CREATE TRIGGER addalluserstoroletable BEFORE INSERT ON allusers
  FOR EACH ROW
  BEGIN
	declare countcount integer;
    set countcount =0;
    select count(*) into countcount from allusers where pid = new.pid;
    if countcount =0 then
  if new.role = "stu" then
    insert into student(stdname,sid,password) values(new.allusersname,new.pid,new.password);
	elseif new.role = "sup" then
    insert into supervisor values(new.allusersname,new.pid,new.password,new.states,new.errortime,"","N","N",0);

    END IF;
    end if;
  END;
  |
delimiter ;

delimiter |
CREATE TRIGGER insertcreatorname BEFORE INSERT ON allnotice
  FOR EACH ROW
  BEGIN
  declare stringstring  varchar(10);
  declare timetime timestamp;
  declare idid varchar(15);
  declare thesetting integer;
  declare deaddate date;
  declare deadtime time;
  declare findnewsetting integer;
  
  set idid = SUBSTRING_INDEX(new.nid, "nid", -1);
  
	select typeofsetting,deadlinedate,deadlinetime into thesetting,deaddate,deadtime from allsupersetting where stid = idid;
   set timetime = STR_TO_DATE(CONCAT(deaddate, ' ', deadtime), '%Y-%m-%d %H:%i:%s');
  update allsupersetting set Announcetime = now() where stid = idid;
  
  
  if(thesetting =1)then
  update student set student.ttbdeadline = timetime where student.sid in (select distinct(supervisorpairstudent.sid) from allsupersetting join supervisorpairstudent on allsupersetting.Creator = supervisorpairstudent.TID);
  end if;
  
  if(thesetting =2)then
  update student set student.requestdeadline = timetime where student.sid in (select distinct(supervisorpairstudent.sid) from allsupersetting join supervisorpairstudent on allsupersetting.Creator = supervisorpairstudent.TID);
  end if;
  
  
  
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
	else if countcount =0 then
		insert ignore into allsupertakecourse values(new.cid,new.pid,false,now());
	else 
		insert ignore into allsupertakecourse values( concat(new.cid,"_"),new.pid,false,now());
	end if;
	END IF;
END IF;

if thisisrole="stu" then

	if countcount >0 then
		while countcount >0 do
			set stringstring = concat(new.cid,"_",countcount,"");
			insert ignore into allstudenttakecourse(cid,pid) values(stringstring,new.pid);
			set countcount= countcount -1;
		end while;
		insert ignore into  allstudenttakecourse(cid,pid) values(new.cid,new.pid);
		
	else if countcount = 0 then
		insert ignore into  allstudenttakecourse(cid,pid)values(new.cid,new.pid);
	else
		insert ignore into  allstudenttakecourse(cid,pid) values(concat(new.cid,"_"),new.pid);
	end if;
End if;
end if;
   END;
  |
delimiter ;

delimiter |
CREATE TRIGGER delallsupertakecourse After DELETE ON allsupertakecourse
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
CREATE TRIGGER clearnoticeforthesetting before Update ON allsupersetting
  FOR EACH ROW
  BEGIN
  
  declare thenotice integer;
  set thenotice =0;
  select count(nid) into thenotice from allnotice where nid = concat("nid",new.stid);
  
  if(thenotice >0)then
  delete from allnotice where nid = concat("nid",new.stid);
  end if;
  
   END;
  |
delimiter ;


delimiter |
CREATE TRIGGER addtopicinsupervisor before insert ON supervisorpairstudent
  FOR EACH ROW
  BEGIN
declare alltopic varchar(100);
declare countcount integer;
declare countcountcount integer;
declare ttbdeadlinedate date;
declare ttbdeadlinetime time;
declare ttbtimestamp timestamp;
declare ttbdeadlineannounced timestamp;
declare requestdeadlinedate date;

declare requestdeadlinetime time;
declare requestdeadlineannounced timestamp;
declare requesttimetstamp timestamp;

set countcountcount =0;
set countcount = 0;

select deadlinedate, deadlinetime,Announcetime into ttbdeadlinedate, ttbdeadlinetime,ttbdeadlineannounced from allsupersetting where Creator = new.tid and typeofsetting = 1 and Announcetime is not null;
select deadlinedate, deadlinetime,Announcetime into requestdeadlinedate, requestdeadlinetime,requestdeadlineannounced from allsupersetting where Creator = new.tid and typeofsetting = 2 and Announcetime is not null;

select count(*) into countcountcount from supervisorpairstudent where tid=new.tid and sid=new.sid;


if countcountcount =0 then

select count(*) into  countcount from supervisorpairstudent where Topic like new.Topic and tid = new.tid;

if countcount = 0 then
select topics into alltopic from supervisor  where tid = new.tid;
update supervisor set topics = concat(alltopic,'/',new.topic) where tid = new.tid;
end if;

end if;

if requestdeadlineannounced is not null then
select TIMESTAMP(requestdeadlinedate,requestdeadlinetime) into requesttimetstamp ;
update student set requestdeadline = requesttimetstamp where sid = new.sid;
end if;


if ttbdeadlineannounced is not null then
select TIMESTAMP(ttbdeadlinedate,ttbdeadlinetime) into ttbtimestamp;

update student set ttbdeadline =  ttbtimestamp where sid = new.sid;
end if;

   END;
  |
delimiter ;

delimiter |
CREATE TRIGGER addsubinstudent after update ON allstudenttakecourse
  FOR EACH ROW 
  BEGIN
  declare oldcomments varchar(200);
  declare newcomments varchar(200);
  set newcomments = new.ttbcomments;
   select distinct(ttbcomments) into oldcomments from allstudenttakecourse where pid = new.pid Limit 1;
   
    
  

	IF new.confirmation = "0" then
		update student set ttbsubmission ="N"  where sid = new.pid;
	elseif new.confirmation = "1" then
		update student set ttbsubmission ="Pending" where sid = new.pid;
	elseif new.confirmation = "2" then
		update student set ttbsubmission ="Approved" ,ttbcomments = oldcomments  where sid = new.pid;
	elseif new.confirmation = "3" then
		update student set ttbsubmission ="Rejected",ttbcomments =  oldcomments  where sid = new.pid;
	else
		update student set ttbsubmission = null where sid = new.pid;
	end if;
    
    
   END;
  |
delimiter ;

delimiter |
CREATE TRIGGER addsubinsuper before update ON allsupertakecourse
  FOR EACH ROW
  BEGIN
	if new.confirmation = "1" then
		update supervisor set submission ="Y" where tid = new.pid;
	end if;

   END;
  |
delimiter ;



delimiter |
CREATE TRIGGER copypicdata_and_commentstonewentry_student before insert ON allstudenttakecourse
  FOR EACH ROW
  BEGIN
  declare picpic LONGBLOB;
  declare comments varchar(200);
  
  select distinct(picdata) into picpic from allstudenttakecourse where pid = new.pid;
  select distinct(ttbcomments) into comments from allstudenttakecourse where pid = new.pid;
  
	set new.picdata = picpic;  
	set new.ttbcomments = comments;
   END;
  |
delimiter ;

delimiter |
CREATE TRIGGER concatcomments_student before update ON allstudenttakecourse
  FOR EACH ROW
  BEGIN
  
  declare oldcomments varchar(200);
  declare newcomments varchar(200);
  
  set newcomments = new.ttbcomments;
   select distinct(ttbcomments) into oldcomments from allstudenttakecourse where pid = new.pid Limit 1;
    if(oldcomments is not null) then
		if SUBSTRING_INDEX(oldcomments,'_',-1) not like newcomments then
			set new.ttbcomments = concat(oldcomments,"_",newcomments);
        end if;
    elseif (oldcomments is null) then
    set new.ttbcomments = newcomments;
    end if;

    
   END;
  |
delimiter ;


delimiter |
CREATE TRIGGER cancellessonwhendeletelesson after delete ON allclass
  FOR EACH ROW
  BEGIN
 
  If(Substring(SUBSTRING_INDEX(old.CID,'_',2),10,1) =0 ) then
	delete from alltakecourse where CID like concat(SUBSTRING_INDEX(old.CID,'_',1),"%"); 
    
    elseif (Substring(SUBSTRING_INDEX(old.CID,'_',2),10,1) =1 ) then
		delete from alltakecourse where CID like old.CID; 
   
  end if;
   END;
  |
delimiter ;

delimiter |
CREATE TRIGGER checkschboxtocorrdraft after delete ON allschedulebox
  FOR EACH ROW
  BEGIN
  declare countcount integer;
  select count(*) into countcount from allschedulebox where tid = old.tid;
  
  if(countcount =0) then
  update supervisor set draft = "N" where tid = old.tid;
  end if;
  
   END;
  |
delimiter ;

delimiter |
CREATE TRIGGER delsupervisor after delete ON supervisor
  FOR EACH ROW
  BEGIN
  
  delete from alluser where pid = tid;
  
   END;
  |
delimiter ;

