SELECT obsname , observer.oid
FROM supervisorpairobserver
 INNER JOIN observer ON observer.oid = supervisorpairobserver.oid
 where supervisorpairobserver.tid = "tid00001"