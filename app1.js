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

// var i=1;
// async.whilst(
// 	function(){return true;},
// 	function(cb){
// 		log(2);
		
// 		log(i);
// 		if(i++==5){
// 			cb("!!")
// 		}
// 		//setTimeout(cb,1000);


// 		// reader.nextLine(function(line,position){
// 		// 	utility.log("nextLine:" + line + " position:" + position);
// 		// });
// 	},
// 	function(err){
// 		log("async whilst err:"+ err);
// 		//reader.close();
// 	}
// )


// var arry=[1,4,5,6];
// async.eachSeries(arry,function(item,callback){
//     log(item);
//     callback(null);
//     return;
//     //if(item!=9) return;
// },function(err){
//     log(err);
// })


var mongoose=require("mongoose");

var Schema=mongoose.Schema;

mongoose.connect("mongodb://localhost/dht");

var TorrSchema=new Schema({
    //announce:String,
    //announce_list:[String],
    //comment:String,
    //comment_utf_8:String,
    creation__date:String,
    _id:String,
    encoding:String,
    createAt:{type:Date,default:Date.now},
    updateAt:{type:Date,default:Date.now},
    recvTimes:{type:Number,default:0},
    hits:{type:Number,default:0},
    info:{
        files:[{path:String,path_utf_8:String,length:Number}],
        name:String,
        name_utf_8:String,
        length:Number,
        //piece__length:Number,
        //pieces:String,
        publisher:String,
        publisher_utf_8:String,
        publisher_url:String,
        publisher_url_utf_8:String,
        ed2k:String,
        filehash:String,
        created__by:String,
        private:String
    }
}); 

var torrModel=mongoose.model("torr",TorrSchema);
var one;
torrModel.findOne({_id:"376D6C5AB5DD03996C7009D0F5C5B842EE3FAA3F"},function(err,i){
    log(i);
});
setTimeout(null,10);
//log(one);
return;

// torrModel.find({_id:"376D6C5AB5DD03996C7009D0F5C5B842EE3FAA3F"},function(err,obj){
//     log(err);
//     log(obj);
// });

 // torrModel.update({_id:"376D6C5AB5DD03996C7009D0F5C5B842EE3FAA3F"},{$inc:{recvTimes:1}},function(err,obj){
 //     log(err);
 //     log(obj);
 // })


// torrModel.findOneAndUpdate({_id:"376D6C5AB5DD03996C7009D0F5C5B842EE3FAAZF"},{$inc:{recvTimes:1}},function(err,obj){
//     log(err);
//     log(obj);
// })


async.waterfall([
    function(cb){
        log(1);
        test(2,function(n){
            log(n);
            cb(null,5);
        })
    },
    function(n,cb){
        log(n);
        cb(null);
    }
], function (err, result) {
    log('1.2 err: ', err);
    log('1.2 result: ', result);
});


function test(n,cb){
    log(n);
    setTimeout(function(){log(3),cb(4)},1000);
}