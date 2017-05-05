/**
 * 有限制的ForEach
 * 
asyncForEach([1,2,3,4,5,6,7, 8, 9, 10, 222], 3, function(next, item, key) {
  console.log(item);
  setTimeout(next, 1000);
});
 */

module.exports = function(source, limit, loopFun) {

  if (!source || !limit || !loopFun) {
    return;
  }
  var isArray = source instanceof Array;
  var list = source;
  if (!isArray) {
    list = [];
    for (var key in source) {
      list[list.length] = key;
    }
  }
  var loop_limit = limit;
  var loop_index = 0;
  var loop_count = 0;

  loop();

  function loop() {
    // console.log('loop ==>', loop_count,loop_limit,loop_index,list.length)
    if (loop_index >= list.length) {
      return;
    }
    
    var key;
    var item;
    if (isArray) {
      key = loop_index;
    } else {
      key = list[loop_index];
    }
    item = source[key];
    loop_index++;
    loop_count++;
    // console.log('limit ',key,item)
    loopFun(function() {
      // console.log('loop_count',loop_count,loop_index);
      loop_count--;
      next();
    }, item, key);
    next();
  }

  function next() {
    // console.log('next',loop_count,loop_limit)
    if (loop_count >= loop_limit) {
      return;
    }
    loop();
  }

};

