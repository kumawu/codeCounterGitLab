var fs = require('fs');
var exec = require('child_process').exec;
var tmpFileName = 'js.tmp';
module.exports = function(addCb, removeCb, data) {
    fs.writeFile(tmpFileName, data, 'utf8', function(err) {
        var child3 = exec('cat ' + tmpFileName + ' | grep "^+" | wc -l', function(error, stdout, stderr) {
            //test
            addCb(stdout);
            var child4 = exec('cat ' + tmpFileName + ' | grep "^-" | wc -l', function(error, stdout, stderr) {
                //remove
                removeCb(stdout);
            });
        });
    });
}