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
		callback();
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
			callback();
		});
		res.pipe(writeStream);
	});
	
	req.end();
}


function downTorrAsByte(urlList,cb){	
	async.eachSeries(urlList,function(url,callback){
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
		http.get(option, function(resp){
			var body=[];
			if(!resp.statusCode){
				utility.log(resp);
				callback(null);
				return;
			}
			if(resp.statusCode!=200){
				utility.log("链接无效");
				callback(null);
				return;
			}
			resp.on("data",function(chunk){
				process.stdout.write(".");
				body.push(chunk);
			})
			resp.on("end",function(){
				console.log("");
				body=Buffer.concat(body);
				if(resp.headers['content-encoding']  && resp.headers['content-encoding'].indexOf('gzip') != -1) {
					//解压gzip
				  	zlib.unzip(body,function(err,buffer){			  		
				  		if(err){
				  			callback(err);
				  		}else{
				  			if(buffer.length<=0){
				  				utility.log("未能下载到数据!");
				  				callback(null);
				  				return ;
				  			}
				  			if(buffer.toString().substr(0,10).indexOf("d8:")<0){
				  				utility.log("下载失败，不是一个正确的种子文件！");
				  				callback(null);
				  				return;
				  			}
				  			callback({bytes:buffer});
				  		}	  		
				  	})
				}else{
					if(body.length<=0){
		  				utility.log("未能下载到数据!");
		  				callback(null);
		  				return ;
		  			}
		  			if(body.toString().substr(0,10).indexOf("d8:")<0){
		  				utility.log("下载失败，不是一个正确的种子文件！");
		  				callback(null);
		  				return;
		  			}
		  			callback({bytes:body});
				}
			})
		});
	},function(err){
		if(err && err.bytes){
			utility.log("下载成功！");
			cb(null,err);
		}else{
			cb(err ? err : "经过尝试，下载失败！");
		}

	});
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
	var templist=torrFileList.slice(n-1,torrFileList.length).concat(torrFileList.slice(0,n-1));
	async.waterfall([
			function(cb){
				downTorrAsByte(templist,cb);
			},
			function(result,cb){
				var torrFile=TFile.getTorrentFile(hashKey,result.bytes);
				if(!torrFile) {
					cb("种子解析失败！",null);
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
