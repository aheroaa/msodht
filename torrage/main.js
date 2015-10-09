var syncef      = require("./syncexistsfile"),
	moment      = require("moment"),
	async		= require("async"),
	lineReader  = require('line-reader'),
	path        = require("path"),
	down        = require("./todown");
	torragefile = require("./torragefile"),	
	Torr 		= require("./models/Torr"),
	util     	= require("./util"),
	mongoose	= require("mongoose");


var CurrentFile = {};	//记录当前读取的文件及文件的位置 { d: '20141020',  c: 3312,  dindex: 667,  url: 'http://torrage.com/sync/20141020.txt',  file: 'E:\\git\\msodht/torrage/files/20141020.txt' }
var CurrentLines={};	//记录当前所有的hash文本以便即时更新
var Capcity=10;		//多少条记录之后保存一次hash文本
var TorrentTimeOut=5000;//处理一个Hash文件最长耗时
var daysBefore=30;		//取出多少天前的数据

process.on("uncaughtException",function(e){
	console.log(e.stack);
})

	
try{
	mongoose.connect("mongodb://180.163.187.2/dht");
}catch(e){
	console.log(e);
}


/**
 * 得到一个Hash txt文件
 * @param {Array}   curLines 所有的Hash文件
 * @param {Function} cb      回调函数
 */
function PopOneHashTxt(curLines,cb) {
	if(curLines==null) cb("no lines") ;
	CurrentLines=curLines;
	//得到日期，30天前的一天
	var veryday={};
	for (var i = curLines.length - 1; i >= 0; i--) {
		var d=curLines[i].d;
		if(moment().diff(moment(d,"YYYYMMDD"),"days")>=daysBefore){
			veryday=curLines[i];			
			veryday.dindex=i;
			CurrentFile=veryday;
			torragefile.delExcept(d);
			daysBefore--;
			break;
		}
	}
	//得到下载地址
	veryday.url=util.getHashFileURL(veryday.d);
	veryday.file=util.getHashFilePath(veryday.d);

	//下载到文件
	down.getFile(veryday,function(){
		//读取单个txt文件
		console.log("读取文件：" + path.basename(veryday.file));
		readOneHashTxt(veryday.file);
	})
}



/**
 * 获得一批hash文件来下载
 *
 * @method getHashesBatch
 * @param  {String}   文件路径
 * @param  {Function} cb
 */
function getHashesBatch(fpath,cb){
	var temp=0;
	var hashesToDwon=[];
	lineReader.eachLine(fpath,function(line,last,fp){
		if(last){
			cb(null,{o:hashesToDwon,fp:fp,last:true});
		}
		hashesToDwon.push(line);
		if(temp++==Capcity){
			cb(null,{o:hashesToDwon,fp:fp,last:false});
			return false;
		}
	},{position:CurrentFile.c})
}




function readOneHashTxt(fpath,callback){
	async.waterfall([
		function(cb){getHashesBatch(fpath,cb);},
		function(obj,cb){
			if(obj.last) {
				util.log("文件："+fpath +" 读取完成！");
				PopOneHashTxt(CurrentLines,cb);
				return;
			}			
			var curHashes=obj.o;	
			//同步遍历得到的hash列表		
			async.eachSeries(curHashes,function(item,cb){
				dealOneHash(item,cb);	
			},function(err){
				//每读取一次都存档
				CurrentLines[CurrentFile.dindex].c=CurrentFile.c=obj.fp;
				torragefile.saveTofile(CurrentLines);
				util.log("处理了一批了");
				readOneHashTxt(fpath,callback);
			});
		}
	],
	function(err,results){
		if(err){callback("err:" + err);}			
	});
	
}

function dealOneHash(hkey,cb){
	async.waterfall([
		function(callback){
			Torr.update({_id:hkey},{$inc:{recvTimes:1}},function(err,obj){
				if(obj){
					callback("更新成功：" + hkey);
					return;
				}
				callback(null,false);
			})
		},
		function(ok,callback){down.downTorrFile(hkey,callback);},
		function(tfile,callback){torrToDB(tfile,callback);}
		],
		function(err){
			if(err){util.log(err);};
			cb(null);
		});	
}

function torrToDB(tfile,cb){
	util.log("将文件存到数据库！");
	var torrModel=new Torr(tfile);
	torrModel.save(function(err){
		cb(err);
	});
}


async.waterfall([
	function(cb){
		syncef.syncFile(cb)
	},
	function(curLines,cb){
		PopOneHashTxt(curLines,cb)
	}
],function(err,result){
	util.log(err);
	util.log(result);
});


