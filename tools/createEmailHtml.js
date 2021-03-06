var fs = require('fs');
var jade = require('jade');
var merge = require('./merge');
var config = require('../config')
module.exports = function(opt) {
    console.log('opttttttt',opt)
    date = opt.date;
    year = date.now.year;
    month = date.now.month;
    day = date.now.day;
    var api = opt.api||false;
    // console.log('createEmailHtml',api)
    var beforeYear = date.target.year;
    var beforeMonth = date.target.month;
    var beforeDay = date.target.day;

        var log = opt.result;
        var userlog = opt.userCount;
        var productLineResult = opt.productLineResult;
    // }else{//去掉文件log方式

    //     // var resultFileName1 = 'logs/js_month_' + year + month + day + '-' + beforeMonth + beforeDay + '.log';
    //     var userLogFile = 'logs/js_usercount_' + date.now.year + date.target.month + date.target.day + '-' + date.now.month + date.now.day + '.log';
    //     var resultFileName2 = 'logs/js_r' + date.now.year + date.target.month + date.target.day + '-' + date.now.month + date.now.day + '.log';
    //     var log = fs.readFileSync(resultFileName2, 'utf8');
    //     var userLog = fs.readFileSync(userLogFile, 'utf8');
    //     // console.log('log=', log, resultFileName2, userLogFile);
       
    //     // console.log('userlog', userLog, log);
    //     var log = eval(log);
    //     var userlog = JSON.parse(userLog);
    // }
    var _tpl = (api==true)?'/views/showResult.jade':'/mail.jade';
    var tplfile = config.basedir+_tpl;
    var tpl = fs.readFileSync(tplfile);
    var template = jade.compile(tpl, 'utf-8');
    var _date = {
        "date": {
            "y":year,
            "m": month,
            "d": day-1
        },
        "beforeDate": {
            "y":beforeYear,
            "m": beforeMonth,
            "d": beforeDay
        }
    };

    // console.log('logggggggggggggggggggggggggg',log);
    var data = merge({
        data: log,
        user: userlog,
        productLineResult:productLineResult
    }, _date);
    //console.log('rrrrrrrrrr:::::::', r, data);
    //data = merge(opt, data);
    // console.log('final data:::::::', data, template);
    // console.log('data',data)
    return template(data);
};