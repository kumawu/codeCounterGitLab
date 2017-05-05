var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var config = require('../config');
var calDate = require('./calDate');
var parseLogs = require('./parseLogs');
var count = 0;
var warningLimit = 100;
// var p = require('procstreams');
module.exports = function(svn, date,i,cb) {
//day+1 因为 这个设置 统计的是这天之前，不包括这天 svn 已经具有-1功能 如下
/*~/code/weibo/research/codeCounderQ  svn log -r {2016-4-12}:{2016-4-6} https://svn1.intra.sina.com.cn/weibo2/ria/t4/apps/enp_activity_m/dev/branches
------------------------------------------------------------------------
 ~/code/weibo/research/codeCounderQ  svn log -r {2016-4-13}:{2016-4-6} https://svn1.intra.sina.com.cn/weibo2/ria/t4/apps/enp_activity_m/dev/branches
------------------------------------------------------------------------
r1227069 | ganshuai | 2016-04-12 10:48:53 +0800 (Tue, 12 Apr 2016) | 1 line

活动举报
------------------------------------------------------------------------
 ~/code/weibo/research/codeCounderQ  svn log -r {2016-4-13}:{2015-6-29} https://svn1.intra.sina.com.cn/weibo2/ria/t4/apps/enp_activity_m/dev/branches
------------------------------------------------------------------------
r1227069 | ganshuai | 2016-04-12 10:48:53 +0800 (Tue, 12 Apr 2016) | 1 line

活动举报
------------------------------------------------------------------------
r1099329 | wudi3 | 2015-06-29 14:38:15 +0800 (Mon, 29 Jun 2015) | 1 line


------------------------------------------------------------------------
 ~/code/weibo/research/codeCounderQ  svn log -r {2016-4-12}:{2015-6-29} https://svn1.intra.sina.com.cn/weibo2/ria/t4/apps/enp_activity_m/dev/branches
------------------------------------------------------------------------
r1099329 | wudi3 | 2015-06-29 14:38:15 +0800 (Mon, 29 Jun 2015) | 1 line


------------------------------------------------------------------------*/

    // var date = date;
    // var nextDay = calDate(0,date.now).target;
    var nextDay = date.now;
    // console.log('getsvnlogs',svn,svn['name'],date,nextDay,date.now);
    // nextDay={year: 2015, month: 12, day: 31}
    var userPhrase = " --username "+config.auth.user+" --password "+config.auth.pass;
    var svnlog = 'svn log' + ' -r {' + nextDay.year + '-' + nextDay.month + '-' + nextDay.day + 'T00:00:00+0800}:{' + date.target.year + '-' + date.target.month + '-' + date.target.day + 'T00:00:00+0800}'+' ' + svn['link'] + " -q" + userPhrase;
    var littleFormat = function(s){
      if (s < 10) {
        var s="0" + s;
      }
      return s

    }
    var lowerTs = Date.parse(new Date(date.target.year + '-' + littleFormat(date.target.month) + '-' + littleFormat(date.target.day)+"T00:00:00+0800"));
    var higherTs = Date.parse(new Date(nextDay.year + '-' + littleFormat(nextDay.month) + '-' + littleFormat(nextDay.day)+"T00:00:00+0800"))
    var cmdParam = "|sed -n 'n;p' | awk '{gsub(\"-\",\" \",$5);a=mktime($5\" 0 0 0\")*1000}{if(a>="+lowerTs+"&&a<="+higherTs+")print}'| cut -d ' ' -f 1,3,5,6,7,8 | cut -d r -f 2";
    
    // p(svnlog).pipe("sed -n 'n;p'").data(function(error, stdout, stderr) {
        // var stdout=stdout.toString('utf-8');
        // console.log(stdout,stderr,error);
        // console.log(svnlog + cmdParam);
        if(count++ >warningLimit)console.log('log child',count);
    var child = exec(svnlog + cmdParam, {maxBuffer:500000*1024},function(error, stdout, stderr) {
        if (stdout.indexOf('path not found') > -1) {
            console.log('Sth. wrong', stdout);
            console.log('stderr', stderr, ' error', error);
        }

        // console.log('getSvnLogs',svnlog+cmdParam,stdout);
        if(error || stderr){
          // console.log('getSvnLogs error',error,stderr,svn.name,svnlog + cmdParam);
          count--;
          child = null;
          cb('getSvnLogs stderr: '+stderr,null)
        }else{
          var ciCount = stdout.split('\n').length - 1; //会有最后的空行
          // console.log('getSvnLogs',svnlog+cmdParam);
          //retrieve one more ci log to diff 
          if (ciCount != 0) {
              console.log(i+' '+svn['name'] + ': ' + ciCount + ' changes');
              // process.send({init:svn['name']});
              var newSvnlog = 'svn log' + ' -r {' + nextDay.year + '-' + nextDay.month + '-' + nextDay.day + 'T00:00:00+0800}:{' + (date.target.year - 1) + '-' + date.target.month + '-' + date.target.day + 'T00:00:00+0800}' + userPhrase;
              var newCmdParam = ' ' + svn['link'] + ' -v | sed -n "/[^\s|\-]/p" | awk \'/^r[0-9]/{print ""}{printf "%s",$0}\' | sed "/^$/d"| head -n ' + (ciCount + 1);//这里是2的原因是因为貌似之前有个空行，但是这个结论不确定，然后我改成1
              // console.log('new log',newSvnlog+newCmdParam);
              if(count++ >warningLimit)console.log('log child',count);
              var child3 = exec(newSvnlog + newCmdParam, {maxBuffer:100000*1024},function(error, stdout, stderr) {
                                // console.log('getnewSvnLogs==>',newSvnlog + newCmdParam,'ciCount:',ciCount,"stdout:",stdout,"ssstderr:",stderr,"error:",error);

                  
                  var logs = parseLogs(stdout);
                  if(logs.length<=1){
                      cb(error, '');
                  }else{
                      cb(error, stdout,{ciCount:ciCount});
                  }
                  if(error){
                    console.log('getnewSvnLogs==>',newSvnlog + newCmdParam,"stdout:",stdout,"ssstderr:",stderr,"error:",error);
                  }
                  count--;
                  // child3.kill();
                  child3 = null;
              });
          } else {
              // console.log(i+' '+svn['name'] + ': no change');
              cb(error, '');
          }
            count--;
            child = null;
        }
    });
}