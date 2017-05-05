module.exports = function(a, b) {
    var buf = {};
    for (var k in a) {
        buf[k] = a[k];
    }
    for (var k in b) {
        buf[k] = b[k];
    }
    return buf;
};
