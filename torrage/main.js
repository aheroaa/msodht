var syncef      = require("./syncexistsfile"),
	moment      = require("moment"),
	lineReader  = require('line-reader'),
	utility     = require("utility"),
	path        = require("path"),
	down        = require("./todown"),
	torragefile = require("./torragefile"),
	async		= require("async");

var CurrentFile = {};	//记录当前读取的文件及文件的位置 { d: '20141020',  c: 3312,  dindex: 667,  url: 'http://torrage.com/sync/20141020.txt',  file: 'E:\\git\\msodht/torrage/files/20141020.txt' }
var CurrentLines={};	//记录当前所有的hash文本以便即时更新
var Capcity=500;		//多少条记录之后保存一次hash文本
var TorrentTimeOut=5000;//处理一个Hash文件最长耗时


process.on("uncaughtException",function(e){
	console.log(e.stack);
})


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


var logLines=0;
function readOneHashTxt(fpath,cb){
	console.log("读取文件：" + path.basename(fpath));
	async.waterfall([
			function(cb){lineReader.open(fpath,cb,{filePosition:CurrentFile.c})},
			function(reader,cb){
				async.whilst(
						function(){return reader.hasNextLine()},
						function(cb){
							reader.nextLine(function(line,position){
								if(++logLines==Capcity) {
									CurrentLines[CurrentFile.dindex].c=CurrentFile.c=position;
									logLines=0;
									torragefile.saveTofile(CurrentLines);
								}
								dealOneHash(line,cb);								
							});
							setTimeout(cb,TorrentTimeOut);
						},
						function(err,result){
							utility.log("async whilst err:"+ err);
							utility.log("async whilst result:"+ result);
							reader.close();
						}
					)
			}
		],
		function(err,results){
			if(err){
				utility.log("err:" + err);
			}			
			//utility.log("results:"+results);
		}
	);
}

function dealOneHash(hkey,cb){
	async.waterfall([
			function(cb){down.downTorrFile(hkey,cb);},
			function(torrFile,cb){down.analyzeTorrfile(torrFile,cb);}
		],function(err,result){
			if(err){
				utility.log(err);
			}
		});

	// down.downTorrFile(l);
	// console.log("hashKey:",l);
	// return false;
}


async.waterfall([
		function(cb){syncef.syncFile(cb)},
		function(curLines,cb){PopOneHashTxt(curLines,cb)},
		function(r,cb){downHashTxt(r,cb)},
	],function(err,result){
		utility.log(err);
		utility.log(result);
	});


