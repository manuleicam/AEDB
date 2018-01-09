# -*- coding: utf-8 -*-
"""
Created on Sun Jan  7 15:09:08 2018

@author: DreadClown
"""
from pymongo import MongoClient
import cx_Oracle
import time

def refresh():
    client = MongoClient('localhost', 27017)
    db=client.admin_database
    
    conn_str = u'system/oracle@127.0.0.1:1521/orcl'
    conn = cx_Oracle.connect(conn_str)
    c = conn.cursor()
    
    
    # Space
    collection=db.space_collection
    
    c.execute(u'select FILE_NAME,df.tablespace_name "Tablespace",totalusedspace "Used MB",(df.totalspace - tu.totalusedspace) "Free MB",'
          'df.totalspace "Total MB",round(100 * ( (df.totalspace - tu.totalusedspace)/ df.totalspace))"Pct. Free", to_char(SYSDATE,\'dd-mm-yyyy hh24:mi:ss\') '
          'from(select tablespace_name,round(sum(bytes) / 1048576) TotalSpace,FILE_NAME from dba_data_files group by tablespace_name,FILE_NAME) df,'
          '(select round(sum(bytes)/(1024*1024)) totalusedspace, tablespace_name from dba_segments group by tablespace_name) tu where df.tablespace_name = tu.tablespace_name ')
   
    for row in c:
        post= {"FILE_NAME": row[0],
               "Tablespace":row[1],
               "Used MB":row[2],
               "Free MB":row[3],
               "Total MB":row[4],
               "% free":row[5],
               "Date":row[6]}
        collection.insert_one(post)
    
    #Users
    collection=db.users_collection
    
    c.execute(u'SELECT USERNAME, ACCOUNT_STATUS ,DEFAULT_TABLESPACE,TEMPORARY_TABLESPACE,CREATED,LAST_LOGIN,to_char(SYSDATE,\'dd-mm-yyyy hh24:mi:ss\') FROM DBA_USERS')
    
    post={}
    for row in c:
        post= {"Username": row[0],
               "Account_Status":row[1],
               "Default_Tablespace":row[2],
               "Temporary_Tablespace":row[3],
               "Created":row[4],
               "Last_login":row[5],
               "Date":row[6]}
        collection.insert_one(post)
    
    #Session
    collection=db.session_collection
    
    c.execute(u'SELECT s.username, t.sid, s.serial#,  SUM(VALUE/100) as "cpu usage (seconds)",to_char(SYSDATE,\'dd-mm-yyyy hh24:mi:ss\') FROM v$session s, v$sesstat t, v$statname n WHERE t.STATISTIC# = n.STATISTIC#  AND NAME like \'%CPU used by this session%\' AND t.SID = s.SID AND s.status=\'ACTIVE\' AND s.username is not null GROUP BY username,t.sid,s.serial#')
    
    post={}
    for row in c:
        post= {"Username": row[0],
               "SID":row[1],
               "Serial":row[2],
               "cpu usage (seconds)":row[3],
               "Date":row[4]}
        collection.insert_one(post)
    
    #IO
    collection=db.IO_collection
    
    c.execute(u'select 	NAME,	PHYRDS "Physical Reads",	round((PHYRDS / PD.PHYS_READS)*100,2) "Read %",PHYWRTS "Physical Writes",	'
          'round(PHYWRTS * 100 / PD.PHYS_WRTS,2) "Write %", 	fs.PHYBLKRD+FS.PHYBLKWRT "Total Block I/O\'s" , to_char(SYSDATE,\'dd-mm-yyyy hh24:mi:ss\') from ( '
          '	select 	sum(PHYRDS) PHYS_READS,		sum(PHYWRTS) PHYS_WRTS 	from  	v$filestat 	) pd, 	v$datafile df, '
          '	v$filestat fs where 	df.FILE# = fs.FILE# order 	by fs.PHYBLKRD+fs.PHYBLKWRT desc')

    post={}
    for row in c:
        post= {"Name": row[0],
               "Physical Reads":row[1],
               "Read %":row[2],
               "Physical Writes":row[3],
               "Write %":row[4],
               "Total Block I/O\'s":row[5],
               "Date":row[6]}
        collection.insert_one(post)
    
    #Stat
    collection=db.stat_collection
    
    c.execute(u'select 	STATISTIC#,	NAME,	CLASS,	VALUE,to_char(SYSDATE,\'dd-mm-yyyy hh24:mi:ss\') from 	v$sysstat where VALUE>0')
              
    post={}
    for row in c:
        post= {"Statistic": row[0],
               "Name":row[1],
               "Class":row[2],
               "Value":row[3],
               "Date":row[4]}
        collection.insert_one(post)
        
    #Waits
    collection=db.wait_collection
    
    c.execute(u'select 	CLASS,	COUNT,	TIME , to_char(SYSDATE,\'dd-mm-yyyy hh24:mi:ss\') from  	v$waitstat order	by CLASS')

    post={}
    for row in c:
        post= {"Class": row[0],
               "Count":row[1],
               "Time":row[2],
               "Date":row[3]}
        collection.insert_one(post)

#2 em 2 minutos
starttime=time.time()
while True:
  print('Start refresh')
  refresh()
  print('Refresh terminated')
  time.sleep(120.0 - ((time.time() - starttime) % 120.0))