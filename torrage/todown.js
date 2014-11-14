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
	async=require("async");
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


function downTorrAsByte(url,cb){
	var resultByte=[],resultStr="", body=[],msg="";
	var option=uri.parse(url);
	option.headers={"host":option.hostname,"content-type":"application/x-bittorrent"};
	http.get(option, function(resp){
		if(resp.statusCode==404){
			msg="没有找到！";
		}

		resp.on("data",function(chunk){
			body.push(chunk);
		})
		resp.on("end",function(){
			if(body.length==0){
				msg="没有找到！";
			}
			resultByte=body;
			body=Buffer.concat(body);
			resultStr=body.toString();
			if(resultStr==""){
				msg="数据有误！";
			}
			msg="下载成功";
			cb(body,resultStr,msg);
		})
	});
}


function downTorrFile(hashKey){
	var torrFileList=utility.getDownTorrUrls(hashKey);
	if(torrFileList==null) return null;
	var count    =torrFileList.length;
	var n        =utility.random(1,count);
	var acc      =0;
	var dok      =false;
	var torr_str ="";
	var torr_byte=[];
	var downtip  ="";
	async.whilst(
		function(){return !dok && acc<count},
		function(cb){
			url=torrFileList[(n+acc++)%count];
			downTorrAsByte(url,function(bytes,result,msg){
				torr_str=result;
				torr_byte=bytes;
				downtip=msg;
				dok=result!="";
				console.log("%s：%s",url,downtip);
			})
		},
		function(err){}
		)
	if(dok){
		if(torr_str.indexOf("d8:")!===0){
			console.log("%s，种子内容不对！",hashKey);
			return;
		}

	}else{
		console.log("%s,下载失败",hashKey);
	}
}


function analyzeTorrfile(hKey){


}

exports.getHtml=getHtml;
exports.getFile=getFile;
exports.downTorrFile=downTorrFile;
