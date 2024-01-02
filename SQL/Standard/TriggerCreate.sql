DELIMITER |
CREATE TRIGGER testref BEFORE INSERT ON allclass FOR EACH ROW BEGIN 
    declare stringstring  varchar(8000);
    declare countcount integer;
    declare findcampusroom integer;
    set new.CID = concat(new.CDept, new.CCode, '_', new.CSecCode); set countcount =0;
    select count(*) into countcount from allclass where (rid = new.rid and campus = new.campus) and weekdays = new.weekdays and (starttime <= new.starttime and ENDtime >= new.starttime);  select count(*) into  findcampusroom from classroom where campus = new.campus and rid = new.rid;
    IF findcampusroom = 0 THEN
        insert into classroom values (new.campus,new.rid,"Open");
    END IF;
    if countcount >0 THEN
        set new.rid ="N";
    END IF;
    if new.lesson >0 THEN
        set new.cid = concat(new.CDept, new.CCode, '_', new.CSecCode,"_",new.lesson);
    END IF;
END; |
DELIMITER ;

DELIMITER |
CREATE TRIGGER addalluserstoroletable BEFORE INSERT ON allusers FOR EACH ROW BEGIN
	declare countcount integer;
    set countcount =0;
    select count(*) into countcount from allusers where pid = new.pid;
    if countcount =0 THEN
        if new.role = "stu" THEN
            insert into student(stdname,sid,password) values(new.allusersname,new.pid,new.password);
	    elseif new.role = "sup" THEN
            insert into supervisor values(new.allusersname,new.pid,new.password,new.states,new.errortime,"","N","N",0);
    END IF;
    END if;
  END;
  | DELIMITER ;

DELIMITER |
CREATE TRIGGER insertcreatorname BEFORE INSERT ON allnotice FOR EACH ROW BEGIN
  declare stringstring  varchar(10);
  declare timetime timestamp;
  declare idid varchar(15);
  declare deaddate date;
  declare deadtime time;
  set idid = SUBSTRING_INDEX(new.nid, "nid", -1);
    select deadlinedate,deadlinetime into deaddate,deadtime from allsupersetting where stid = idid;
	set timetime = date_format(Timestamp(concat(date_format(deaddate, "%Y-%c-%d")," ",date_format(deadtime,"%T"))),"%Y-%c-%d %T" );
	update allsupersetting set Announcetime = now() where stid = idid;
    select allusersname into stringstring from allusers 
    where new.creator = pid;
        set new.creatorname = stringstring;
    END;
  | DELIMITER ;

DELIMITER |
CREATE TRIGGER addlessontimeforoneCode BEFORE INSERT ON allclass FOR EACH ROW BEGIN
    declare countcount integer;
    declare stringstring  varchar(20);
    set countcount =0;
    set stringstring = concat(new.CDept,new.CCode,"_",new.CSecCode,"%");
    select count(*) into  countcount from allclass
    where CID like stringstring;
        set new.lesson = countcount;
        if countcount >0 THEN
            set new.CID = concat(new.CDept,new.CCode,"_",new.CSecCode,"_",countcount);
        END IF;
   END;
  | DELIMITER ;

DELIMITER |
CREATE TRIGGER takeallcourseofonecode after INSERT ON alltakecourse FOR EACH ROW BEGIN
   declare coursetitle varchar(20);
   declare countlesson integer;
   declare i integer;
    declare thisisrole varchar(10);
   set i = 0;
   set thisisrole = "";
   set countlesson = 0;
   set coursetitle = new.CID;
   select count(*) into  countlesson from allclass where allclass.cid like concat(coursetitle,"%");
   select role into thisisrole from allusers where new.pid = pid;
   if thisisrole = "sup" then
	while(i<countlesson) do
		if(i = 0) then
			insert into allsupertakecourse(cid,pid) values (coursetitle,new.pid);
		else
			insert into allsupertakecourse(cid,pid) values (concat(coursetitle,"_",i),new.pid);
        end if;
        set i = i+1;
    END while;
   else 
	   while(i<countlesson) do
			if(i = 0) then
				insert into allstudenttakecourse(cid,pid) values (coursetitle,new.pid);
			else
				insert into allstudenttakecourse(cid,pid) values (concat(coursetitle,"_",i),new.pid);
			end if;
			set i = i+1;
		END while;
   end if;
    
   END;
| DELIMITER ;









DELIMITER |
CREATE TRIGGER delallsupertakecourse After DELETE ON allsupertakecourse FOR EACH ROW BEGIN
    declare countcount integer;
    declare stringstring  varchar(20);
    set countcount = 0;
    select count(*) into countcount from alltakecourse where pid = old.pid and cid = old.cid;
    if(countcount >0) THEN
        DELETE from alltakecourse where pid = old.pid and cid = old.cid;
    END if;
END;
  | DELIMITER ;

DELIMITER |
CREATE TRIGGER delrolecourse After DELETE ON alltakecourse FOR EACH ROW BEGIN
    declare countcount integer;
    declare stringstring  varchar(20);        
    declare checkrole varchar(10);
    set countcount =0;
    select role into checkrole from allusers where pid = old.pid;
    if(checkrole = "stu") THEN
        select count(*) into countcount from allstudenttakecourse where pid = old.pid and cid = old.cid;
        if(countcount >0) THEN
            DELETE from allstudenttakecourse where pid = old.pid and cid = old.cid;
        END if;
    elseif(checkrole = "sup") THEN
        select count(*) into countcount from allsupertakecourse where pid = old.pid and cid = old.cid;
        if(countcount >0) THEN
            DELETE from allsupertakecourse where pid = old.pid and cid = old.cid;
        END if;
    END if;
   END;
  | DELIMITER ;

DELIMITER |
CREATE TRIGGER delallstudenttakecourse After DELETE ON allstudenttakecourse FOR EACH ROW BEGIN
    declare countcount integer;
    declare stringstring  varchar(20);
    select count(*) into countcount from alltakecourse where pid = old.pid and cid = old.cid;
    if(countcount >0) THEN
	    DELETE from alltakecourse where pid = old.pid and cid = old.cid;
    END if;
   END;
  | DELIMITER ;

DELIMITER |
CREATE TRIGGER addintosetting before insert ON allsupersetting FOR EACH ROW BEGIN
    set new.createdate = now();
    set new.LastUpdate = now();
    END;
  | DELIMITER ;


DELIMITER |
CREATE TRIGGER clearnoticeforthesetting before Update ON allsupersetting FOR EACH ROW BEGIN
    declare thenotice integer;
    set thenotice =0;
    select count(nid) into thenotice from allnotice where nid = concat("nid",new.stid);
    if(thenotice >0)THEN
        delete from allnotice where nid = concat("nid",new.stid);
    END if;
   END;
  | DELIMITER ;


DELIMITER |
CREATE TRIGGER updatestudentdeadline After Update ON allsupersetting FOR EACH ROW BEGIN
    if (new.typeofsetting = "1") THEN
        update student set ttbdeadline = timestamp(concat(new.deadlinedate," ",new.deadlinetime));
    elseif (new.typeofsetting = "2") THEN
        update student set requestdeadline = timestamp(concat(new.deadlinedate," ",new.deadlinetime));
    END if;
END;
  | DELIMITER ;


DELIMITER |
CREATE TRIGGER addtopicinsupervisor before insert ON supervisorpairstudent FOR EACH ROW BEGIN
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
    if countcountcount =0 THEN
        select count(*) into  countcount from supervisorpairstudent where Topic like new.Topic and tid = new.tid;
        if countcount = 0 THEN
            select topics into alltopic from supervisor  where tid = new.tid;
            update supervisor set topics = concat(alltopic,'/',new.topic) where tid = new.tid;
        END if;
    END if;
    if requestdeadlineannounced is not null THEN
        select TIMESTAMP(requestdeadlinedate,requestdeadlinetime) into requesttimetstamp ;
        update student set requestdeadline = requesttimetstamp where sid = new.sid;
    END if;
    if ttbdeadlineannounced is not null THEN
        select TIMESTAMP(ttbdeadlinedate,ttbdeadlinetime) into ttbtimestamp;
        update student set ttbdeadline =  ttbtimestamp where sid = new.sid;
    END if;

   END;
  | DELIMITER ;

DELIMITER |
CREATE TRIGGER addsubinstudent after update ON allstudenttakecourse FOR EACH ROW BEGIN
    declare oldcomments varchar(200);
    declare newcomments varchar(200);
    set newcomments = new.ttbcomments;
    select distinct(ttbcomments) into oldcomments from allstudenttakecourse where pid = new.pid Limit 1;
	IF new.confirmation = "0" THEN
		update student set ttbsubmission ="N"  where sid = new.pid;
	elseif new.confirmation = "1" THEN
		update student set ttbsubmission ="Pending" where sid = new.pid;
	elseif new.confirmation = "2" THEN
		update student set ttbsubmission ="Approved" ,ttbcomments = oldcomments  where sid = new.pid;
	elseif new.confirmation = "3" THEN
		update student set ttbsubmission ="Rejected",ttbcomments =  oldcomments  where sid = new.pid;
    elseif new.confirmation = "4" THEN
		update student set ttbsubmission ="Enforced",ttbcomments =  oldcomments  where sid = new.pid;
	else
		update student set ttbsubmission = null where sid = new.pid;
	END if;
   END;
  | DELIMITER ;

DELIMITER |
CREATE TRIGGER addsubinsuper before update ON allsupertakecourse FOR EACH ROW BEGIN
	if new.confirmation = "1" THEN
		update supervisor set submission ="Y" where tid = new.pid;
	END if;
   END;
  |
DELIMITER ;

DELIMITER |
CREATE TRIGGER copypicdata_and_commentstonewentry_student before insert ON allstudenttakecourse FOR EACH ROW BEGIN
    declare picpic LONGBLOB;
    declare comments varchar(200);
    select distinct(picdata) into picpic from allstudenttakecourse where pid = new.pid;
    select distinct(ttbcomments) into comments from allstudenttakecourse where pid = new.pid;
    set new.picdata = picpic;  
    set new.ttbcomments = comments;
   END;
| DELIMITER ;

DELIMITER |
CREATE TRIGGER cancellessonwhendeletelesson after delete ON allclass FOR EACH ROW BEGIN
    If(Substring(SUBSTRING_INDEX(old.CID,'_',2),10,1) =0 ) THEN
        delete from alltakecourse where CID like concat(SUBSTRING_INDEX(old.CID,'_',1),"%"); 
    elseif (Substring(SUBSTRING_INDEX(old.CID,'_',2),10,1) =1 ) THEN
        delete from alltakecourse where CID like old.CID; 
    END if;
END;
| DELIMITER ;

DELIMITER |
CREATE TRIGGER checkschboxtocorrdraft after delete ON allschedulebox FOR EACH ROW BEGIN
  declare countcount integer;
  select count(*) into countcount from allschedulebox where tid = old.tid;
  if(countcount = 0) THEN
    update supervisor set draft = "N" where tid = old.tid;
  END if;
END;
| DELIMITER ;

DELIMITER |
CREATE TRIGGER delsupervisor after delete ON supervisor FOR EACH ROW BEGIN
    
	delete from alltakecourse where pid = old.tid;
    delete from supervisorpairstudent where tid = old.tid;
    delete from observerpairstudent where oid = old.tid;
    delete from allnotice where Creator = old.tid;
    delete from allpreffromsup where tid= old.tid;
    delete from allrequestfromsupervisor where tid = old.tid;
	delete from allusers where pid = old.tid;
END;
| DELIMITER ;

DELIMITER |
CREATE TRIGGER delstudent after delete ON student FOR EACH ROW BEGIN
    
	delete from alltakecourse where pid = old.sid;
    delete from supervisorpairstudent where sid = old.sid;
    delete from observerpairstudent where sid = old.sid;
    delete from allrequestfromstudent where sid = old.sid;
	delete from manualhandlecase where sid = old.sid ;
	delete from studentavailable where sid = old.sid;
	delete from allusers where pid = old.sid;
END;
| DELIMITER ;

DELIMITER |
CREATE TRIGGER delnoticefromdelsetting after delete ON allsupersetting FOR EACH ROW BEGIN
	delete from allnotice where nid = concat("nid",old.stid);
    
END;
| DELIMITER ;
