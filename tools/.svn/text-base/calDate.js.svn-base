function calDate(n,timeNow) {
    timeNow.setDate(timeNow.getDate() + n);
    return timeNow;
}
module.exports = function(n,specialDate) {
    var n = n*1;
    var timeNow = new Date();
    if(specialDate){
        timeNow.setFullYear(specialDate.year*1,specialDate.month*1-1,specialDate.day*1)
    }
    var year = timeNow.getFullYear();
    var month = timeNow.getMonth() + 1;
    var day = timeNow.getDate(); 


    var targetDate = calDate(n,timeNow);
    var targetMonth = targetDate.getMonth() + 1;
    var targetDay = targetDate.getDate();
    var targetYear = targetDate.getFullYear();
    var result = {
        now: {
            year: year,
            month: month,
            day: day
        },
        target: {
            year: targetYear,
            month: targetMonth,
            day: targetDay
        }
    }
    return result;
}