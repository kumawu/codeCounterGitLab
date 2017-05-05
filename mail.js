var nodemailer = require("nodemailer");
var config = require('./config')
var createEmailHtml = require('./tools/createEmailHtml')
// var date = require('./tools/calDate')(config.duration);
var fs = require("fs");
var jade = require('jade');

function merge(a, b) {
    var buf = {};
    for (var k in a) {
        buf[k] = a[k];
    }
    for (var k in b) {
        buf[k] = b[k];
    }
    return buf;
};

var date, year, day, month;


var send = function(html, opt) {
    var transport = nodemailer.createTransport({
        host: "mail.staff.sina.com.cn",
        //secure: true, // use SSL
        port: 587, // port for secure SMTP
        auth: config.auth
    });
    var date = opt.date;
    var year = date.now.year;
    var month = date.now.month;
    var day = date.now.day;
    var beforeYear = date.target.year;
    var beforeMonth = date.target.month;
    var beforeDay = date.target.day;

    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }


    var _date = {
        "date": {
            "y": year,
            "m": month,
            "d": day-1
        },
        "beforeDate": {
            "y":beforeYear,
            "m": beforeMonth,
            "d": beforeDay
        }
    };
    transport.sendMail({
        from: "XXX@XXX.com",
        to: opt.sendName + "@xxx.com",
        cc: "",
        subject: "代码统计" +_date.beforeDate.m + _date.beforeDate.d + _date.beforeDate.y+'-'+_date.date.m + _date.date.d + _date.date.y,
        html: html
    }, function(error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response,error);
        }
    });


}
module.exports = function(opt,cb) {
    var date = opt.date;
    console.log('Sending mail...', date);
    send(createEmailHtml(opt), {
        sendName: 'xxx',
        date:date
    })
    setTimeout(cb,5000)
}
