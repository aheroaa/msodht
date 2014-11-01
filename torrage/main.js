var syncef      = require("./syncexistsfile"),
	moment      = require("moment"),
	lineReader  = require('line-reader'),
	utility     = require("utility"),
	path        = require("path"),
	down        = require("./todown"),
	torragefile = require("./torragefile");
//处理同步文件
syncef.syncFile(function(curLines) {
	if(curLines==null) return ;
	//得到日期，30天前的一天
	var veryday={};
	for (var i = curLines.length - 1; i >= 0; i--) {
		var d=curLines[i].d;
		if(moment().diff(moment(d,"YYYYMMDD"),"days")>=30){
			veryday=curLines[i];
			veryday.dindex=i;
			torragefile.delExcept(d);
			break;
		}
	}
	//得到下载地址
	veryday.url=utility.getHashFileURL(veryday.d);
	veryday.file=utility.getHashFilePath(veryday.d);
	setInterval(function(){
		torragefile.saveTofile(curLines);	
	}, 60000);

	//下载到文件
	down.getFile(veryday.url,veryday.file,function(isok){
		if(!isok)return;
		console.log("读取文件：" + path.basename(veryday.file));
		// lineReader.eachLine(veryday.file,function(o,e,fp){
		// 	curLines[veryday.dindex].c=fp;
		// 	console.log(fp);
		// 	setTimeout(function(){return;}, 5000);
		// },{filePosition:veryday.c})

		lineReader.open(veryday.file,function(reader,fp){
			while(reader.hasNextLine()){
				reader.nextLine(function(line,fp1){
					console.log("fp:"+fp +",fp1:"+fp1);
				});
			}

		},{filePosition:veryday.c});

	})
});

