DELIMITER //
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
END; //
DELIMITER ;

delimiter |
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
  |
delimiter ;

delimiter |
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
  |
delimiter ;

delimiter |
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
  |
delimiter ;

delimiter |
CREATE TRIGGER takeallcourseofonecode after INSERT ON alltakecourse FOR EACH ROW BEGIN
    declare countcount integer;
    declare stringstring  varchar(20);
    declare thisisrole varchar(10);
    declare x integer;
    declare issup boolean;
    set issup = false;
    set thisisrole ="";
    set countcount =0;
    select Max(lesson) into  countcount from alltakecourse inner join allclass on allclass.cid like concat(alltakecourse.cid,"%")where alltakecourse.cid  like concat(new.cid,"%");
        select role into thisisrole from allusers where new.pid = pid;
        if thisisrole="sup" THEN
            if countcount >0 THEN
                while countcount >=0 do
                    if countcount =0 THEN
                        set stringstring = concat(new.cid);
                    else
                        set stringstring = concat(new.cid,"_",countcount,"");
                    END IF;
                    insert into allsupertakecourse values(stringstring,new.pid,false,now());
                    set countcount= countcount -1;
                END while;
	        else if countcount =0 THEN
		        insert ignore into allsupertakecourse values(new.cid,new.pid,false,now());
	        else 
		        insert ignore into allsupertakecourse values( concat(new.cid,"_"),new.pid,false,now());
	        END if;
	    END IF;
END IF;

        if thisisrole="stu" THEN
            if countcount >0 THEN
                while countcount >0 do
                    set stringstring = concat(new.cid,"_",countcount,"");
                    insert ignore into allstudenttakecourse(cid,pid) values(stringstring,new.pid);
                    set countcount= countcount -1;
                END while;
                insert ignore into  allstudenttakecourse(cid,pid) values(new.cid,new.pid);
            else if countcount = 0 THEN
                insert ignore into  allstudenttakecourse(cid,pid)values(new.cid,new.pid);
            else
                insert ignore into  allstudenttakecourse(cid,pid) values(concat(new.cid,"_"),new.pid);
            END if;
        END if;
        END if;
   END;
  |
delimiter ;

delimiter |
CREATE TRIGGER delallsupertakecourse After DELETE ON allsupertakecourse FOR EACH ROW BEGIN
    declare countcount integer;
    declare stringstring  varchar(20);
    set countcount =0;
    select count(*) into countcount from alltakecourse where pid = old.pid and cid = old.cid;
    if(countcount >0) THEN
        DELETE from alltakecourse where pid = old.pid and cid = old.cid;
    END if;
END;
  |
delimiter ;

delimiter |
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
  |
delimiter ;

delimiter |
CREATE TRIGGER delallstudenttakecourse After DELETE ON allstudenttakecourse FOR EACH ROW BEGIN
    declare countcount integer;
    declare stringstring  varchar(20);
    select count(*) into countcount from alltakecourse where pid = old.pid and cid = old.cid;
    if(countcount >0) THEN
	    DELETE from alltakecourse where pid = old.pid and cid = old.cid;
    END if;
   END;
  |
delimiter ;

delimiter |
CREATE TRIGGER addintosetting before insert ON allsupersetting FOR EACH ROW BEGIN
    set new.createdate = now();
    set new.LastUpdate = now();
    END;
  |
delimiter ;


delimiter |
CREATE TRIGGER clearnoticeforthesetting before Update ON allsupersetting FOR EACH ROW BEGIN
    declare thenotice integer;
    set thenotice =0;
    select count(nid) into thenotice from allnotice where nid = concat("nid",new.stid);
    if(thenotice >0)THEN
        delete from allnotice where nid = concat("nid",new.stid);
    END if;
   END;
  |
delimiter ;


delimiter |
CREATE TRIGGER updatestudentdeadline After Update ON allsupersetting FOR EACH ROW BEGIN
    if (new.typeofsetting = "1") THEN
        update student set ttbdeadline = timestamp(concat(new.deadlinedate," ",new.deadlinetime));
    elseif (new.typeofsetting = "2") THEN
        update student set requestdeadline = timestamp(concat(new.deadlinedate," ",new.deadlinetime));
    END if;
END;
  |
delimiter ;


delimiter |
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
  |
delimiter ;

delimiter |
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
  |
delimiter ;

delimiter |
CREATE TRIGGER addsubinsuper before update ON allsupertakecourse FOR EACH ROW BEGIN
	if new.confirmation = "1" THEN
		update supervisor set submission ="Y" where tid = new.pid;
	END if;
   END;
  |
delimiter ;

delimiter |
CREATE TRIGGER copypicdata_and_commentstonewentry_student before insert ON allstudenttakecourse FOR EACH ROW BEGIN
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
CREATE TRIGGER cancellessonwhendeletelesson after delete ON allclass FOR EACH ROW BEGIN
    If(Substring(SUBSTRING_INDEX(old.CID,'_',2),10,1) =0 ) THEN
        delete from alltakecourse where CID like concat(SUBSTRING_INDEX(old.CID,'_',1),"%"); 
    elseif (Substring(SUBSTRING_INDEX(old.CID,'_',2),10,1) =1 ) THEN
        delete from alltakecourse where CID like old.CID; 
    END if;
END;
  |
delimiter ;

delimiter |
CREATE TRIGGER checkschboxtocorrdraft after delete ON allschedulebox FOR EACH ROW BEGIN
  declare countcount integer;
  select count(*) into countcount from allschedulebox where tid = old.tid;
  if(countcount = 0) THEN
    update supervisor set draft = "N" where tid = old.tid;
  END if;
END;
  |
delimiter ;

delimiter |
CREATE TRIGGER delsupervisor after delete ON supervisor FOR EACH ROW BEGIN
    delete from alluser where pid = tid;
END;
  |
delimiter ;
