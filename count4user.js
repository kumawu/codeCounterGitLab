var fs = require('fs');
var config = require('./config')
// var date = require('./tools/calDate')(config.duration);
var result = {};
var count = function(user, type, value) {
    //console.log('user.log',user,type,value*1);
    // if (user == 'output') {
    //     fs.writeFile(logName, JSON.stringify(result), 'utf8');
    //     return;
    // }
    if (!result.hasOwnProperty(user)) {
        result[user] = {};
        result[user][type] = value * 1;
    } else {
        if (!result[user].hasOwnProperty(type)) {
            result[user][type] = value * 1;
        } else {
            result[user][type] += value * 1;
        }
    }
    //console.log(result);

}
module.exports = {
    log: count,
    clean:function(){
        if(result)result = {};
    },
    result: function(date) {
        // var logName = 'logs/js_usercount_' + date.now.year + date.target.month + date.target.day + '-' + date.now.month + date.now.day + '.log';
        // //console.log('result',result);
        // fs.writeFile(logName, JSON.stringify(result), 'utf8');
        return result;
    }
};