select Max(lesson) from alltakecourse inner join allclass on allclass.cid like concat(alltakecourse.cid,"%") 
where alltakecourse.cid  like concat("EMPTY_","%") 