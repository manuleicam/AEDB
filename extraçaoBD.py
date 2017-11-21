# -*- coding: utf-8 -*-
"""
Created on Tue Nov 21 09:06:27 2017

@author: tiago
"""

import cx_Oracle

conn_str = u'system/oracle@127.0.0.1:1521/orcl'
conn = cx_Oracle.connect(conn_str)
c = conn.cursor()
c.execute(u'select df.tablespace_name "Tablespace",totalusedspace "Used MB",(df.totalspace - tu.totalusedspace) "Free MB",'
          'df.totalspace "Total MB",round(100 * ( (df.totalspace - tu.totalusedspace)/ df.totalspace))"Pct. Free", sysdate '
          'from(select tablespace_name,round(sum(bytes) / 1048576) TotalSpace from dba_data_files group by tablespace_name) df,'
          '(select round(sum(bytes)/(1024*1024)) totalusedspace, tablespace_name from dba_segments group by tablespace_name) tu where df.tablespace_name = tu.tablespace_name ')
for row in c:
    print (row[0], '-',row[1],'-',row[2],'-',row[3],'-',row[4],'-',row[5])

c.execute(u'SELECT USERNAME, ACCOUNT_STATUS ,DEFAULT_TABLESPACE,TEMPORARY_TABLESPACE,CREATED,LAST_LOGIN,sysdate FROM DBA_USERS')
for row in c:
    print (row[0], '-',row[1],'-',row[2],'-',row[3],'-',row[4],'-',row[5],'-',row[6])
    
    
c.execute(u'SELECT SID, OWNERID, PROCESS, LOGON_TIME, EVENT, STATE,WAIT_TIME_MICRO, TIME_REMAINING_MICRO, SERVICE_NAME, SYSDATE FROM v$session')
for row in c:
    print (row[0], '-',row[1],'-',row[2],'-',row[3],'-',row[4],'-',row[5],'-',row[6],'-',row[7],'-',row[8])
    
#c.execute(u'SELECT s.username, t.sid, s.serial#,  SUM(VALUE/100) as "cpu usage (seconds)" FROM v$session s, v$sesstat t, v$statname n WHERE t.STATISTIC# = n.STATISTIC#  AND NAME like \'%CPU used by this session%\' AND t.SID = s.SID AND s.status=\'ACTIVE\' AND s.username is not null GROUP BY username,t.sid,s.serial#')

