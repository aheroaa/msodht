var fs=require("fs");

var baseFilePath=__dirname  + "/files/";
var existsPath=__dirname  + "/files/exsisted.json";
var configPath=__dirname  + "/files/config.json";

module.exports.initFile=function(){
	console.log("初始化文件");
	if(!fs.existsSync(existsPath)){
		console.log("文件不存在，生成文件");
		fs.appendFile(existsPath, "[]",function(error){
			if(error){
				console.log(error);
				return;
			}
			console.log("文件生成完成！");
		});
	}	
}

module.exports.delExcept=function(d){
	fs.readdirSync(baseFilePath).forEach(function(file,index){
		if(d+".txt" !=file && /^20\d{6}.txt$/.test(file)){
			fs.unlinkSync(baseFilePath+file);
		}
	});
}

module.exports.curLines=function(){
	var content=fs.readFileSync(existsPath);
	if(!content || content=="") return [];
	var obj=JSON.parse(content);
	return obj;
}()


//TODO
module.exports.saveTofile=function(data){
	fs.writeFileSync(existsPath,JSON.stringify(data));
}




module.exports.getConfig=function(){
	var cstr=fs.readFileSync(configPath, "utf-8");
	if(cstr==""){
		return {};
	}else{
		try{
			return JSON.parse(cstr);
		}catch(e){
			return {};
		}
	}
}

module.exports.saveConfig=function(data){
	fs.writeFileSync(configPath,JSON.stringify(data), "utf-8");
}