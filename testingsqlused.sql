#select * from allclassroomtimeslot where Campus = "Campus A" and RID = "RM103" and startdate="2023-08-03" and EndDate = "2023-08-03" and( "09:45:00" between starttime and EndTime)
#select * from allclassroomtimeslot where Campus = "Campus A" and RID = "RM103" and ((("start" between startdate and endate) or (( startdate  = "start" and "starttime" >= starttime)))or(("start" between startdate and endate) and ("end" between startdate and endate))or(("end" between startdate and endate) or (( enddate  = "end" and "endtime" >= endtime))))
select * from allclassroomtimeslot where Campus = "Campus A" and RID = "RM103"
and 
#start in middle of the existing timeslot
(
(("2023-08-08" between startdate and enddate) or (( startdate  = "2023-08-08" and "09:05" >= starttime)))
or
#whole in middle of the existing timeslot
(("2023-08-08" between startdate and enddate) and ("2023-08-11" between startdate and enddate))
or
#end in middle of the existing timeslot
(("2023-08-11" between startdate and enddate) or (( enddate  = "2023-08-11" and "09:09" >= endtime)))
)