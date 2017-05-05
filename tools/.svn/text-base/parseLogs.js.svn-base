module.exports = function(stdout) {
    // console.log('parseStdout',stdout);
    var verArray = stdout.split('\n');
    // console.log('verArray',verArray,verArray.length)
    var _result = [];
    for (var i = 0, l = verArray.length; i < l; i++) {
        // console.log('dddddddd ',i,' "'+verArray[i]+'" ',verArray[i].trim())
        if(verArray[i].trim().length != 0){ 
            var _tmp = verArray[i].split('|');
            // console.log('verArray',_tmp)
            if(!_tmp[2]){
                console.log('something wrong in parseLogs',_tmp);
            }else{
                _result.push({
                    ver: _tmp[0].trim(),
                    author: _tmp[1],
                    time:_tmp[2]?_tmp[2].trim():'',
                    comment:_tmp[3]?_tmp[3]:''
                });
            }
        }
    }
    // console.log('parseLogs', _result);
    return _result;
}