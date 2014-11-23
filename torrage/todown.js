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


function analizeDownTorrStr(str,body,urlList,randn,acc,cb){
	if(str.substr(0,10).indexOf("d8:")>=0){
		utility.log("下载成功！");
		cb(null,{bytes:body,str:str});	
		return;
	}

	if(request.end){
		request.end();
	}

	if(acc>=urlList.length){		
		cb("\t\t经过尝试，下载失败！")
		return;
	}		
	downTorrAsByte(urlList,randn,++acc,cb);

}


function downTorrAsByte(urlList,randn,acc,cb){	
	var resultByte=[],resultStr="", body=[],msg="";
	var count    =urlList.length;
	var index=(randn+acc)%count;
	var url=urlList[index];
	if(!url){
		cb("url无效！count:" + count + ",randn:" + randn + ",acc:" + acc);
	}
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

	// var requestTimer=setTimeout(function(){
	// 	request.end();
	// 	request.abort();
	// 	utility.log("\t\t请求超时！");
	// 	if(acc>=count){
	// 		cb("\t\t经过尝试，下载失败！");
	// 		return;
	// 	}
	// 	downTorrAsByte(urlList,randn,++acc,cb);
	// },5000)

	request=http.request(option, function(resp){
		if(!resp.statusCode){
			utility.log(resp);
			if(acc>=count){
				cb("\t\t经过尝试，下载失败！");
			}
			downTorrAsByte(urlList,randn,++acc,cb);
		}
		//clearTimeout(requestTimer);
		if(resp.statusCode!=200){
			utility.log("\t\t链接无效");
			if(acc>=count){
				cb("\t\t经过尝试，下载失败！");
			}
			downTorrAsByte(urlList,randn,++acc,cb);
		}

		// var responseTimer=setTimeout(function(){
		// 	resp.destroy();
		// 	utility.log("\t\t响应超时");
		// 	request.end();
		// 	if(acc>=count){
		// 		cb("\t\t经过尝试，下载失败！");
		// 		return;
		// 	}
		// 	downTorrAsByte(urlList,randn,++acc,cb);
		// },60000);

		resp.on("data",function(chunk){
			process.stdout.write("#");
			body.push(chunk);
		})
		resp.on("end",function(){
			//clearTimeout(responseTimer);
			body=Buffer.concat(body);
			if(resp.headers['content-encoding'].indexOf('gzip') != -1) {
				//解压gzip
			  	zlib.unzip(body,function(err,buffer){			  		
			  		if(err){
			  			cb(err);
			  		}else{
			  			analizeDownTorrStr(buffer.toString(),buffer,urlList,randn,acc,cb);			  			
			  		}	  		
			  	})
			}else{
				analizeDownTorrStr(body.toString(),body,urlList,randn,acc,cb);
			}
		})
	});
	request.end();
}


function downTorrFile(hashKey,callback){
	//每一个hash文件都有一个下载列表，每次随机取一个站点下载
	var torrFileList=utility.getDownTorrUrls(hashKey);
	if(torrFileList==null) return null;
	var n 		 =utility.random(1,torrFileList.length);
	var torr_str ="";
	var torr_byte=[];
	console.log('\n\n');
	utility.log("hashKey :: " + hashKey);


	async.waterfall([
			function(cb){
				downTorrAsByte(torrFileList,n,0,cb);
			},
			function(result,cb){
				var torrFile=TFile.getTorrentFile(hashKey,result.bytes);
				if(!torrFile) {
					callback("种子解析失败！",null);
				}else{
					utility.log("种子解析成功！");
					callback(null,torrFile);	
				}
			}
		],function(err,results){
			if(err){
				callback(err,null);
			}
		});
}



exports.getHtml=getHtml;
exports.getFile=getFile;
exports.downTorrFile=downTorrFile;
