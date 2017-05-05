var merge = require('../tools/merge')
var gitlist = require('../config').gitlist;
var async = require('async');
var findProject = require('./findProject');
var gitlab = require('gitlab')(require('../config').auth);
var args = {}
var members = {};
var projects_rslt = [];
var concurrency = 30;
const lengthLimit = 5000;


var start = function(cb){

    var gitHandle = function(project,qcb){
        var _result = {};
        // console.log(project)
        var projectId = project.id;
        async.waterfall([
            //1. get Branch list
            function(cb) {
                gitlab.projects.repository.listBranches(projectId, function(list){
                    cb(null,list);
                });
            },
            //2. read branch
            function(list,cb) {
                
                // console.log('gitHandle waterfall list ',list,projectId)
                if(!!list && list.length != 0){
                    async.eachLimit(list,concurrency,function(branch,bqcb){
                        branchHandle(project,branch,function(info){
                            // console.log('info',info)
                            if(info){
                                _result[branch.name] = info;
                                // bqcb();
                            }else{
                                // bqcb('info is empty');     
                            }
                            // console.log('_result....',_result,branch.name)
                            bqcb();
                        });
                    },function(err) {
                        // console.log('_result',_result)
                        if(err){
                            // console.log('gitHandle error',err);
                            cb('gitHandle error'+err)
                        }else{
                            // console.log('gitHandle eachLimit',_result,projectId)
                            cb(null,_result);
                        }
                    });
                }else{
                    cb('gitHandle list is empty '+projectId)
                }
                
            }
        ], function(err, results) {
            if(err){
                console.log('gitHandle waterfall err:',err);
            }else{
                // console.log('results',Object.getOwnPropertyNames(results))
                if(Object.getOwnPropertyNames(results)!=0){
                var _tmp = {id:projectId, name:project.description||project.name,productLine:project.productLine||'m99_php',tags:project.tag_list ,add:0,remove:0,submitCount:0}
                for(key in results){
                    _tmp['add'] += results[key].add;
                    _tmp['remove'] = results[key].remove;
                    _tmp['submitCount'] = results[key].submitCount;
                }
                projects_rslt.push(_tmp)
                // console.log('finish gitHandle waterfall',projectId,_tmp);
                }
            }
            // console.log('projects_rslt',projects_rslt)
            qcb();
        });
    }
        
    var branchHandle = function(project,branch,callback){
        var branch = merge(project,{ref_name:branch.name});
        var month = (args.date.target.month.toString().length == 1)?'0'+args.date.target.month:args.date.target.month;
        var day = (args.date.target.day.toString().length == 1)?'0'+args.date.target.day:args.date.target.day;
        var now_month = (args.date.now.month.toString().length == 1)?'0'+args.date.now.month:args.date.now.month;
        var now_day = (args.date.now.day.toString().length == 1)?'0'+args.date.now.day:args.date.now.day;

        var branch = merge(branch,{since:args.date.target.year+'-'+month+'-'+day+"T00:00:01Z",until:args.date.now.year+'-'+now_month+'-'+now_day+"T00:00:01Z"});
        // var branch = merge(branch,{since:'2016-08-11T00:00:01Z',until:'2016-10-15T00:00:01Z'});
        // console.log('branch handle,',branch)
        var branchName = branch.ref_name;
        async.waterfall([
            //1. get commit list
            function(cb) {
                gitlab.projects.listCommits(branch,function(list){
                    // console.log('listCommits',branch.ref_name,list);
                    
                    if(!list || list.length == 0){
                        cb('length == 0')
                    }else{
                        cb(null,list);
                    }
                });
            },
            //2. read commit
            function(list,cb) {
                // console.log('read commit',list);
                if(!!list && list.length != 0){
                    // console.log(day,args.date.now,project.id,branch.short_id,list.length)
                    var results = [];
                    var add = del = 0;
                    async.eachLimit(list,concurrency,function(commit,cqcb){
                        // console.log('commit',project.id,branch.ref_name,commit.id,commit.short_id)
                        commitHandle(project.id,commit.id,function(info){
                            // console.log("======",info)
                            if(!!info){//去掉合并分支
                                var infoAdd=info.stats.additions;
                                var infoDel=info.stats.deletions;
                                if(info.message.indexOf('Merge') == -1 && infoAdd < lengthLimit && infoDel < lengthLimit){
                                    
                                    var user = info.author_email.replace(/\@.*$/,'');
                                    add+=info.stats.additions;
                                    del+=info.stats.deletions;
                                    if(!members[user]){
                                        members[user] = {add:0,remove:0}
                                    }
                                    members[user]['add'] += info.stats.additions;
                                    members[user]['remove'] += info.stats.deletions;
                                }else{
                                    console.log('mmmmmmmmmmmmerge branch',info.message,branch.ref_name,commit.short_id)
                                }
                            }
                            
                            cqcb();
                        })
                    },function(err) {
                        if(err){
                            cb('branchHandle error '+err);                            
                        }else{
                            
                            // console.log('finish branchHandle eachLimit',branchName,{'id':project.id,name:project.name,tags:project.tag_list,add:add,'remove':del,'submitCount':list.length});
                            cb(null,{add:add,'remove':del,'submitCount':list.length});
                        }
                        
                    });
                }else{
                    // console.log(day,args.date.now,project.id,'list=',0)
                    cb('branchHandle waterfall error list is empty')
                }
                
            }
        ], function(err, results) {
            if(err){
                // console.log('branchHandle waterfall error',branchName,err,project.id);
                callback(false);
            }else{
                // console.log('finish branchHandle waterfall',branchName,results);
                // projects_rslt.push(results)
                callback(results);
            }
            
        });
    }
    
    var commitHandle = function(projectId,commitId,callback){
        // console.log('commitHandle======',projectId,commitId);
        gitlab.projects.repository.showCommit(projectId, commitId, function(commit) {
            // console.log('commitHandle showCommit',commit,projectId,commitId)
            
            if(!commit){callback();return;}
            var user = commit.author_email.replace(/\@.*$/,'');
            callback(commit);
        });
    }


    async.eachLimit(gitlist,concurrency,gitHandle,function(err) {
        if(err)console.log("err: ",err);
        // console.log({members:members,projects:projects_rslt})
        cb({members:members,projects:projects_rslt})
    });
}
module.exports = function(opt,cb){
    args = opt;
    findProject(function(list) {
        gitlist = list;
        start(cb);
    })
}
