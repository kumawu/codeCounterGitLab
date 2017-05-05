var exec = require('child_process').exec;
var svnLs = 'svn list -R ';
module.exports = function(link, cb) {
    var link = link+'/pl';    
    var _filterCmd = " | grep .js | wc -l";
    var _cmd = svnLs + link + _filterCmd;
    var child2 = exec(_cmd,{maxBuffer:2000*1024}, function(error, stdout, stderr) {
        // console.log('getDiff cmd', _cmd, stdout);
        // console.log('eeeeeee',cb);
        cb(null, stdout*1, stderr);
        // if(error)console.log(error);
    });
}
