var merge = require('../tools/merge')
var gitlist = require('../config').gitlist;

var gitlab = require('gitlab')(require('../config').auth);
var args = {}
var members = {};
var projects_rslt = [];
var countDown = 0;

module.exports = function(cb){
    var projects_lst = [];
    gitlab.projects.all(function(projects) {
        // console.log(projects)
        for (var i = 0,countDown=l=projects.length; i < l; i++) {
            console.log("Found project ",projects[i].name,' ',projects[i].description)
            // console.log("#" + projects[i].id + ": " + projects[i].name + ", path: " + projects[i].path + ", default_branch: " + projects[i].default_branch + ", private: " + projects[i]["private"] + ", date: " + projects[i].created_at);
            projects_lst.push({
                'id':projects[i].id,
                'name':projects[i].name,
                'description':projects[i].description,
                'web_url':projects[i].web_url,
                'name_with_namespace':projects[i].name_with_namespace,
                'created_at':projects[i].created_at,
                'creator_id':projects[i].creator_id,
                'tag_list':projects[i].tag_list,
                "productLine":projects[i].tag_list[0]||"m99_php"
            });
            
            var projectId = projects[i].id;
        }
        cb(projects_lst);

    });
}

