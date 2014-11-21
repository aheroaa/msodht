var async=require("async");
var http=require("http");

var moment = require('moment');

function inc(n, callback, timeout) {
  //将参数n自增1之后的结果返回给async
    timeout = timeout || 200;
    setTimeout(function() {
        callback(null, n+1);
    }, timeout);
};

function fire(obj, callback, timeout) {
  //直接将obj的内容返回给async
    timeout = timeout || 200;
    setTimeout(function() {
        callback(null, obj);
    }, timeout);
};

function err(errMsg, callback, timeout) {
  //模拟一个错误的产生，让async各个函数末尾的callback接收到。
    timeout = timeout || 200;
    setTimeout(function() {
        callback(errMsg);
    }, timeout);
};

// utils
function log(msg, obj) {
  //对console.log进行了封装。主要是增加了秒钟的输出，通过秒数的差值方便大家对async的理解。
    process.stdout.write(moment().format('ss.SSS')+'> ');
    if(obj!==undefined) {
        process.stdout.write(msg);
        console.log(obj);
    } else {
        console.log(msg);
    }
};

function wait(mils) {
  //刻意等待mils的时间，mils的单位是毫秒。
    var now = new Date;
    while(new Date - now <= mils);
}

// async.series([
// 		function(cb){inc(3,cb);},
// 		function(cb){inc(8,cb);},
// 		function(cb){inc(2,cb);},
// 	],function(err,result){
// 	log("err:",err);
// 	log("result:",result);
// })

// var count1 = 0;
// async.whilst(
//     function() { return true },
//     function(cb) {
//         log('1.1 count: ', count1);
//         count1++;
//         setTimeout(cb, 1000);
//     },
//     function(err) {
//         // 3s have passed
//         log('1.1 err: ', err);
//     }
// );

var i=1;
async.whilst(
	function(){return true;},
	function(cb){
		log(2);
		
		log(i);
		if(i++==5){
			cb("!!")
		}
		//setTimeout(cb,1000);


		// reader.nextLine(function(line,position){
		// 	utility.log("nextLine:" + line + " position:" + position);
		// });
	},
	function(err){
		log("async whilst err:"+ err);
		//reader.close();
	}
)

