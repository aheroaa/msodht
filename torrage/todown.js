/**
 * 自动从http://torrage.com/sync同步已有的hash文件列表
 * @return {[type]} [description]
 */
var http=require("http"),
	util=require("util"),
	urlparse=require("url").parse,
	path=require("path"),
	fs=require("fs");
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



function getFile(url,sfile,callback){
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

exports.getHtml=getHtml;
exports.getFile=getFile;
