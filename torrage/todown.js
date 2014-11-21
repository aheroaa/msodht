/**
 * 自动从http://torrage.com/sync同步已有的hash文件列表
 * @return {[type]} [description]
 */
var http=require("http"),
	util=require("util"),
	urlparse=require("url").parse,
	path=require("path"),
	fs=require("fs"),
	utility=require("utility"),
	uri=require("url"),
	async=require("async"),
	zlib=require("zlib"),
	TorrentFile=require("./TorrentFile.js").TorrentFile,
	TorrentFileInfo=require("./TorrentFile.js").TorrentFileInfo,
	TFile=require("./TFile.js");

var request;
var _isok=false;
function getHtml(url,callback){
	console.log("从" + url + "下载数据。");
	var body="";
	http.get(url, function(req){
		req.on("data",function(chunk){
			process.stdout.write(".");
			body+=chunk;
		}).on("end",function(){
			callback(body);
		}).on("error",function(){
			callback(null);
		})
	});
}



function getFile(r,callback){
	var url=r.url;
	var sfile=r.file;
	if(fs.existsSync(sfile)){
		callback(true);
		return;
	}

	var urlinfo=urlparse(url);
	var options={
		method:"GET",
		host:urlinfo.host,
		path:urlinfo.pathname
	}
	if(urlinfo.port){
		options.port=urlinfo.port;
	}
	if(urlinfo.search){
		options.path+=urlinfo.search;
	}

	var req=http.request(options, function(res){
		var writeStream=fs.createWriteStream(sfile);
		writeStream.on("close",function(){
			callback(true);
		});
		res.pipe(writeStream);
	});
	
	req.end();
}


function analizeDownTorrStr(str,body,cb){
	if(str.substr(0,10).indexOf("d8:")>=0){
		cb(null,{bytes:body,str:str});	
		gok=true;
	}else{
		utility.log("\t\t种子头部不正确："+str.substr(0,20),null);				
		gok=false;
	}
	if(!gok && acc<count){
		request.end();
		downTorrAsByte(urlList,++acc,cb);
	}else{
		if(!gok){
			cb("\t\t经过尝试，下载失败！")
		}
	}
}


function downTorrAsByte(urlList,randn,acc,cb){	
	var resultByte=[],resultStr="", body=[],msg="";
	var count    =urlList.length;
	var url=urlList[(randn+acc)%count];
	utility.log(url);
	var option=uri.parse(url);	
	option.headers={
		"Referer": option.protocol + "//" +option.hostname,
		"Content-Type":"application/x-bittorrent;charset=utf-8",
		"Accept":"text/html, application/xhtml+xml, */*",
		"Accept-Encoding":"gzip,deflate,sdch",
		"Accept-Language":"zh-CN,zh;q=0.8",
		"User-Agent":"Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)"
	};

	request=http.request(option, function(resp){
		var gok=true;
		if(resp.statusCode==404){
			utility.log("\t\t没有找到");
			gok=false;
		}
		if(!gok && acc<count){
			downTorrAsByte(urlList,++acc,cb);
			return;
		}

		resp.on("data",function(chunk){
			body.push(chunk);
		})
		resp.on("end",function(){
			if(body.length==0){
				utility.log("\t\t没有获取到数据");
				gok=false;
			}
			body=Buffer.concat(body);

			if(resp.headers['content-encoding'].indexOf('gzip') != -1) {
				//解压gzip
			  	zlib.unzip(body,function(err,buffer){			  		
			  		if(err){
			  			cb(err);
			  		}else{
			  			analizeDownTorrStr(buffer.toString(),buffer,cb);			  			
			  		}	  		
			  	})
			}else{
				analizeDownTorrStr(body.toString(),body,cb);
			}
		})
	});
	request.end();
}


function downTorrFile(hashKey,cb){
	var torrFileList=utility.getDownTorrUrls(hashKey);
	if(torrFileList==null) return null;
	var n 		 =utility.random(1,torrFileList.length);
	var torr_str ="";
	var torr_byte=[];
	console.log('\n\n\n');
	utility.log("hashKey-" + hashKey+":");
	async.waterfall([
			function(cb){downTorrAsByte(torrFileList,n,0,cb);},
			function(result,cb){
				var torrFile=TFile.getTorrentFile;
				if(!torrFile) {
					cb("种子解析失败！",null);
				}else{
					utility.log("解析成功！");
					return;
					cb(null,torrFile);	
				}

			}
		],function(err,results){
			if(err){
				utility.log(err);
				return;
			}
		});
}


function analyzeTorrfile(torrFile,cb){
	cb("解析到种子文件",null);
}

exports.getHtml=getHtml;
exports.getFile=getFile;
exports.downTorrFile=downTorrFile;
exports.analyzeTorrfile=analyzeTorrfile;
