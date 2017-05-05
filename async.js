var child_process = require('child_process');
var async = require('async');
var fs = require('fs');
var config = require('./config')
var arguments = process.argv.splice(2);
var date = require('./tools/calDate')(arguments[0] || config.duration);//,{year:2016,month:3,day:31}
var count4user = require('./count4user');
var getSvnLogs = require('./tools/getSvnLogs');
var parseLogs = require('./tools/parseLogs');
var getDiff = require('./tools/getDiff');
var count = require('./tools/count');
var filterPl = require('./tools/filterPl');
var countPl = require('./tools/countPl');
var merge = require('./tools/merge');
var git = require("./git/find");
var mail = require('./mail');
var createEmailHtml = require('./tools/createEmailHtml');

var startTime = new Date();
var pushArr = [];
var doneArr = [];
var timerObj = {};

var svnCountUp = 1;
var nowCount = 0;
var concurrency = 50; 
// var diffCountDown=0;
var log = (Math.abs(arguments[0]) == 1)?true:false;
// if(log){//修正date，因为esapi是要在当天23：00开始计算 //修正，不用给esapi当天的
    //对于svn和git来说，截止日期的那天是不计算的，比如18-20，取得的内容是18、19号
    // date = require('./tools/calDate')(1,{year:2016,month:10,day:31});
// }
var resultFileName = 'logs/js_r' + date.now.year + date.target.month + date.target.day + '-' + date.now.month + date.now.day + '.log';
var result = [];



       
git({date:date},function(msg){
    result = result.concat(msg.projects);
    result = result.sort(function(a,b){
        return (a.name >= b.name)?1:-1
    });
    //console.log('before',userCount,msg.members,count4user.result());
    if(userCount){
        userCount = null;
    }else{
        var userCount = count4user.result(date);
    }
    for(user in msg.members){
        var data = msg['members'][user];
        if(userCount[user]){
            userCount[user]['add'] += data.add;
            userCount[user]['remove'] += data.remove;
        }else{
            userCount[user] = data;
        }
    }
    //console.log('after',userCount);
    console.log('outputttttttttttttt,u r wasting time ', new Date() - startTime);
    console.log(JSON.stringify(result),'filename:',resultFileName);
    var id = 'r'+date.target.year +'/'+ date.target.month +'/'+ date.target.day + '-' + date.now.year+'/'+date.now.month+'/' + date.now.day;
    var data = {};
    data['id'] = id;
    data['data'] = result;
    data['user'] = userCount;
    data['timestamp'] = new Date();
    
    var productLineResult = {};
    var codeCountAll = 0;
    var productLineCount = 0;
    var submitCount = 0;
    result.forEach(function(item){
        if(item.productLine == undefined)
            console.log(item.productLine,item)
        if(!productLineResult[item.productLine]){
            productLineResult[item.productLine] = {add:item.add*1,submitCount:item.submitCount*1};
            productLineCount+=1;
        }else{
            productLineResult[item.productLine]['add'] += item.add*1;
            productLineResult[item.productLine]['submitCount'] += item.submitCount*1;
        }
        codeCountAll+=item.add*1;
        submitCount+=1;
    })
    data['productLineResult'] = productLineResult;
    data['summary']={
        "average":codeCountAll/productLineCount,
        "averageSubmit":submitCount/productLineCount
    }
    // if(!log){
    //     db.find({
    //         "id": id
    //     }, function(r) {
    //         if (r.numberReturned != 0) {
                
    //             db.update({
    //                 id: id
    //             }, data);
    //         }else{
    //             db.save(data);
    //         }
    //     });
    // }else{
    //     // es log
    //     // var _date = date.target.year+'-'+date.target.month+'-'+date.target.day;
    //     // var _db = $("code.daily");
    //     // data['id'] = _date;
    //     // _db.find({
    //     //     "id": _date
    //     // }, function(r) {

    //     //     if (r.numberReturned != 0) {
                
    //     //         _db.update({
    //     //             "id": _date
    //     //         }, data);
    //     //     }else{
    //     //         _db.save(data);
    //     //     }
    //     // });
    //     // // console.log(date,data)
    //     // esApi(data,{date:date});//放进es
    // }
    // // createEmailHtml({date:date,userCount:userCount,result:result,api:true})
    mail({date:date,userCount:userCount,result:result,productLineResult:productLineResult,api:false},function(){
        process.exit();
    });

});
