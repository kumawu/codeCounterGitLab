function count(data, type) {
    // console.log('counttt,data',data);
    // console.log('ttttttttttttttttttttttttt')
     var _count;
    if (type == 'add') {
        _count = !!data.match(/^\+.*$/gm)?data.match(/^\+.*$/gm).length:0;
    } else {
        _count = !!data.match(/^-.*$/gm)?data.match(/^-.*$/gm).length:0;

    }
    // console.log('------------------------------------------------------')
    // console.log(type,_count);
    // console.log('------------------------------------------------------')
    return _count;
}
// function count(data, type) {//用正则过滤diff的版本
//      var _count;
//     if (type == 'add') {
//         _count = data.replace(/^-.*\s\n/gm, '').split('\n');
//     } else {
//         _count = data.replace(/^\+.*\s\n/gm, '').split('\n');

//     }
//     console.log(type,_count.length-1);
//     return _count.length-1;
// }
module.exports = count;