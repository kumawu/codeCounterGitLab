// var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
// var spawnSync = require('child_process').spawnSync;
var config = require('../config')
var count = 0;
const warningLimit = 300;
const lengthLimit = 460000;
module.exports = function(opt, cb) {
    // console.log('getDiff ======> ',opt)
    var ver1 = opt.ver1;
    var ver2 = opt.ver2;
    var link = opt.link;
    var data = opt.data;
    // var _filterCmd = " | grep '^+\\|^-' | grep -v '^+++' | grep -v '^---' | grep -v ^$ | grep -v '^+\s*$'";
    // var _cmd = svndiff + ver1 + ':' + ver2 + ' ' + link;
    // var _cmd = svndiff + ver1 + ':' + ver2 + ' ' + link + _filterCmd;
    // var child2 = exec(_cmd,{maxBuffer:2000*1024}, function(error, stdout, stderr) {
    // console.log('getDiff cmd', _cmd, stdout);       
    // console.log('eeeeeee',cb);
    // cb(error, {author:data['author'],data:stdout}, stderr);
    // });
    var userPhrase = ["--username",config.auth.user,"--password",config.auth.pass];
    var cmd = ['diff', '-r', ver1.ver + ':' + ver2.ver, link];
    // console.log('diffff',cmd)
    if(count++ >warningLimit)console.log('diff count',count);
    var child2 = spawn('svn', cmd.concat(userPhrase));
    var dataaaa='';
    
    if(typeof(child2.stdout)==='undefined'){
        console.log('child2',ver1.ver,ver2.ver,link,typeof(child2.stdout));
        return;
    }
        
    child2.stdout.on('data', function(_data) {
               // console.log('typeof',typeof(_data),_data);
         
        dataaaa += _data.toString('utf-8');
        // console.log('typeof',dataaaa);
        if(dataaaa.length > lengthLimit){
            console.log('aaaaaaa@@@@Maybe branches:',link,'ver1:'+ver1.ver,' ver2:'+ver2.ver,ver2.comment,dataaaa.length);
            child2.kill();  
        }
    });
    child2.stderr.on('data', function(_data) {
        console.log('diff stderr:', _data.toString('utf-8'),cmd);
    });
    child2.on('exit',function(code){
        var test = dataaaa.match(/.*Index:.*/gm, '');
        // console.log('aaaaa'+opt.svnIndex+' : '+opt.i+'/'+opt.l+' finish diff '+ver1+':'+ver2+' '+link+' stdout '+dataaaa.match(/.*Index:.*/gm, '')+'bbbbb'+dataaaa);

        // cb(null, {
        //     author: data['author'],
        //     data: dataaaa.replace(/^(?!([\+-])(?!\1)).*$\n?/gm, ''),
        //     ori: dataaaa
        // });
        console.log('commit length',link,ver2.comment,dataaaa.length);
        if(dataaaa.length > lengthLimit){
            // console.log('@@@@Maybe branches:',link,'ver1:'+ver1.ver,' ver2:'+ver2.ver,ver2.comment,dataaaa.length);
            cb(null,{count:false,childNum:count});
        }else{
        
            var a = dataaaa.replace(/^(?!([\+-])(?!\1)).*$\n?/gm, '');
            cb(null, {count:true,author:data['author'],data:a,ori:dataaaa,childNum:count,opt:opt}); 
        }
        // console.log('exittttttttttttttttttttttttttttt');

        
    });
    child2.on('close',function(){
       // console.log('closeeeeeeeeeeeeeeeeeeeeeeeeeeee');
       if(count-- >warningLimit)console.log('diff count',count);
       
    });
    child2.on('error', function(code, signal){
        console.log('child2 diff error',code,link);
        // child.kill(signal);
    });
}
