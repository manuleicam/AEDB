SELECT * FROM DBA_USERS;
Select * from dba_tablespaces;
select * from dba_data_files;
select * from v$session;
select * from v$osstat;

SELECT
   s.username,
   t.sid,
   s.serial#,
   SUM(VALUE/100) as "cpu usage (seconds)"
FROM
   v$session s,
   v$sesstat t,
   v$statname n
WHERE
   t.STATISTIC# = n.STATISTIC#
AND
   NAME like '%CPU used by this session%'
AND
   t.SID = s.SID
AND
   s.status='ACTIVE'
AND
   s.username is not null
GROUP BY username,t.sid,s.serial#;

select FILE_NAME,df.tablespace_name "Tablespace",
totalusedspace "Used MB",
(df.totalspace - tu.totalusedspace) "Free MB",
df.totalspace "Total MB",
round(100 * ( (df.totalspace - tu.totalusedspace)/ df.totalspace))
"Pct. Free"
from
(select tablespace_name,round(sum(bytes) / 1048576) TotalSpace,FILE_NAME
from dba_data_files 
group by tablespace_name,FILE_NAME) df,
(select round(sum(bytes)/(1024*1024)) totalusedspace, tablespace_name
from dba_segments 
group by tablespace_name) tu
where df.tablespace_name = tu.tablespace_name ;

Select * from dba_data_files;




select 	NAME,
	PHYRDS "Physical Reads",
	round((PHYRDS / PD.PHYS_READS)*100,2) "Read %",
	PHYWRTS "Physical Writes",
	round(PHYWRTS * 100 / PD.PHYS_WRTS,2) "Write %",
	fs.PHYBLKRD+FS.PHYBLKWRT "Total Block I/O's"
from (
	select 	sum(PHYRDS) PHYS_READS,
		sum(PHYWRTS) PHYS_WRTS
	from  	v$filestat
	) pd,
	v$datafile df,
	v$filestat fs
where 	df.FILE# = fs.FILE#
order 	by fs.PHYBLKRD+fs.PHYBLKWRT desc;

select 	*
from 	v$sgastat
order	by NAME;

select 	STATISTIC#,
	NAME,
	CLASS,
	VALUE
from 	v$sysstat
where VALUE>0;

select * from V$SYS_TIME_MODEL;

SELECT * FROM v$session;

select 	CLASS,
	COUNT,
	TIME
from  	v$waitstat
order	by CLASS;