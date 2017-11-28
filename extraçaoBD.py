# -*- coding: utf-8 -*-
"""
Created on Tue Nov 21 09:06:27 2017

@author: tiago
"""

import cx_Oracle

conn_str = u'system/oracle@127.0.0.1:1521/orcl'
conn = cx_Oracle.connect(conn_str)
c = conn.cursor()
c.execute(u'select FILE_NAME,df.tablespace_name "Tablespace",totalusedspace "Used MB",(df.totalspace - tu.totalusedspace) "Free MB",'
          'df.totalspace "Total MB",round(100 * ( (df.totalspace - tu.totalusedspace)/ df.totalspace))"Pct. Free", to_char(SYSDATE,\'dd-mm-yyyy hh24:mi:ss\') '
          'from(select tablespace_name,round(sum(bytes) / 1048576) TotalSpace,FILE_NAME from dba_data_files group by tablespace_name,FILE_NAME) df,'
          '(select round(sum(bytes)/(1024*1024)) totalusedspace, tablespace_name from dba_segments group by tablespace_name) tu where df.tablespace_name = tu.tablespace_name ')
for row in c:
    print (row[0], '-',row[1],'-',row[2],'-',row[3],'-',row[4],'-',row[5])

c.execute(u'SELECT USERNAME, ACCOUNT_STATUS ,DEFAULT_TABLESPACE,TEMPORARY_TABLESPACE,CREATED,LAST_LOGIN,to_char(SYSDATE,\'dd-mm-yyyy hh24:mi:ss\') FROM DBA_USERS')
for row in c:
    print (row[0], '-',row[1],'-',row[2],'-',row[3],'-',row[4],'-',row[5],'-',row[6])
    
    
c.execute(u'SELECT SID, OWNERID, PROCESS, LOGON_TIME, EVENT, STATE,WAIT_TIME_MICRO, TIME_REMAINING_MICRO, SERVICE_NAME, to_char(SYSDATE,\'dd-mm-yyyy hh24:mi:ss\') FROM v$session')
for row in c:
    print (row[0], '-',row[1],'-',row[2],'-',row[3],'-',row[4],'-',row[5],'-',row[6],'-',row[7],'-',row[8])
    
c.execute(u'SELECT s.username, t.sid, s.serial#,  SUM(VALUE/100) as "cpu usage (seconds)",to_char(SYSDATE,\'dd-mm-yyyy hh24:mi:ss\') FROM v$session s, v$sesstat t, v$statname n WHERE t.STATISTIC# = n.STATISTIC#  AND NAME like \'%CPU used by this session%\' AND t.SID = s.SID AND s.status=\'ACTIVE\' AND s.username is not null GROUP BY username,t.sid,s.serial#')

for row in c:
    print (row[0], '-',row[1],'-',row[2],'-',row[3],'-',row[4])

c.execute(u'select 	NAME,	PHYRDS "Physical Reads",	round((PHYRDS / PD.PHYS_READS)*100,2) "Read %",PHYWRTS "Physical Writes",	'
          'round(PHYWRTS * 100 / PD.PHYS_WRTS,2) "Write %", 	fs.PHYBLKRD+FS.PHYBLKWRT "Total Block I/O\'s" , to_char(SYSDATE,\'dd-mm-yyyy hh24:mi:ss\') from ( '
          '	select 	sum(PHYRDS) PHYS_READS,		sum(PHYWRTS) PHYS_WRTS 	from  	v$filestat 	) pd, 	v$datafile df, '
          '	v$filestat fs where 	df.FILE# = fs.FILE# order 	by fs.PHYBLKRD+fs.PHYBLKWRT desc')

for row in c:
    print (row[0], '-',row[1],'-',row[2],'-',row[3],'-',row[4],'-',row[5],'-',row[6])
    
c.execute(u'select 	STATISTIC#,	NAME,	CLASS,	VALUE,to_char(SYSDATE,\'dd-mm-yyyy hh24:mi:ss\') from 	v$sysstat where VALUE>0')
for row in c:
    print (row[0], '-',row[1],'-',row[2],'-',row[3],'-',row[4])

c.execute(u'select 	CLASS,	COUNT,	TIME , to_char(SYSDATE,\'dd-mm-yyyy hh24:mi:ss\') from  	v$waitstat order	by CLASS')

for row in c:
    print (row[0], '-',row[1],'-',row[2],'-',row[3])






    
