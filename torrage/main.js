var syncef      = require("./syncexistsfile"),
	moment      = require("moment"),
	lineReader  = require('line-reader'),
	utility     = require("utility"),
	path        = require("path"),
	down        = require("./todown"),
	torragefile = require("./torragefile"),
	async		= require("async"),
	mongoose	= require("mongoose"),
	Torr 		= require("./models/Torr");

var CurrentFile = {};	//记录当前读取的文件及文件的位置 { d: '20141020',  c: 3312,  dindex: 667,  url: 'http://torrage.com/sync/20141020.txt',  file: 'E:\\git\\msodht/torrage/files/20141020.txt' }
var CurrentLines={};	//记录当前所有的hash文本以便即时更新
var Capcity=200;		//多少条记录之后保存一次hash文本
var TorrentTimeOut=5000;//处理一个Hash文件最长耗时

process.on("uncaughtException",function(e){
	console.log(e.stack);
})
mongoose.connect("mongodb://localhost/dht");

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
		if(moment().diff(moment(d,"YYYYMMDD"),"days")>=30){
			veryday=curLines[i];			
			veryday.dindex=i;
			CurrentFile=veryday;
			torragefile.delExcept(d);
			break;
		}
	}
	//得到下载地址
	veryday.url=utility.getHashFileURL(veryday.d);
	veryday.file=utility.getHashFilePath(veryday.d);
	var r={curLines:curLines,veryday:veryday};
	cb(null,r);
}

/**
 * 下载某一个Hash文件
 * @param  {下载对象}   r  [description]
 * @param  {Function} cb [description]
 */
function downHashTxt(r,cb){
	var veryday=r.veryday;
	//下载到文件
	down.getFile(veryday,function(isok){
		if(!isok)return;
		//读取单个txt文件
		readOneHashTxt(veryday.file);
	})
}

/**
 * 获得一批hash文件来下载
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
			cb(null,{o:hashesToDwon,fp:fp});
			return false;
		}
	},{filePosition:CurrentFile.c})
}




function readOneHashTxt(fpath,callback){
	console.log("读取文件：" + path.basename(fpath));
	async.waterfall([
		function(cb){getHashesBatch(fpath,cb);},
		function(obj,cb){
			if(obj.last) cb("文件：%s 读取完成！",fpath);			
			var curHashes=obj.o;	
			//同步遍历得到的hash列表		
			async.eachSeries(curHashes,function(item,cb){
				dealOneHash(item,cb);	
			},function(err){
				//每读取一次都存档
				CurrentLines[CurrentFile.dindex].c=CurrentFile.c=obj.fp;
				torragefile.saveTofile(CurrentLines);
			});
		}
	],
	function(err,results){
		if(err){callback("err:" + err);}			
	});
	
}

function dealOneHash(hkey,cb){
	async.waterfall([
			function(cb){down.downTorrFile(hkey,cb);},
			function(tfile,cb){torrToDB(tfile,cb);}
		],function(err,result){
			if(err){utility.log(err);}
			cb(null);
		});
}

function torrToDB(tfile,cb){
	utility.log("将文件存到数据库！");
	var torrModel=new Torr(tfile);

	torrModel.save(function(err){
		if(err){
			cb(err);
		}else{
			cb(null);
		}
	});
}


async.waterfall([
		function(cb){syncef.syncFile(cb)},
		function(curLines,cb){PopOneHashTxt(curLines,cb)},
		function(r,cb){downHashTxt(r,cb)},
	],function(err,result){
		utility.log(err);
		utility.log(result);
	});


