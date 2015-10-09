
var env = require("jsdom").env,
    jquery = require("jquery"),
    moment = require("moment"),
    down = require("./todown"),
    torragefile = require("./torragefile");

module.exports.syncFile = function(callback) {
    torragefile.initFile();
    var curLines = torragefile.curLines;    
    console.log("已有的文件：" + torragefile.curLines.length);

    var torrconfig=torragefile.getConfig();
    if(torrconfig.today==moment().format("YYYY-MM-DD") && torrconfig.synced==1){
        callback(null,curLines);
        return;
    }

    down.getHtml('https://torrage.com/sync/', function(data) {
        if (data == null) {
            callback("down error!");
            return;
        }
        env(data, function(error, window) {
            if (error) {
                callback("analize html error:" + error);
                return;
            }
            var $ = jquery(window);
            var $trs = $("#dirlist table tbody tr");
            console.log($trs.length);
            var txts = [];
            $trs.each(function(k, o) {
                var $tr = $(o),
                    $firsttd = $tr.find("td:first").text();
                if (/^20\d{6}.txt$/.test($firsttd)) {
                    txts.push($firsttd.substr(0, 8));
                }
                txts.sort(function(a, b) {
                    return a > b ? 1 : -1;
                });
            })
            console.log("\r\n当前获取到的文件数：" + txts.length);
            for (var i = curLines.length; i < txts.length; i++) {
                curLines.push({
                    'd': txts[i],
                    'c': 0
                });
            }
            if (curLines.length >= txts.length){
            	torragefile.saveTofile(curLines);	
            }            
            console.log("文件比对并同步完成！");

            torrconfig.today=moment().format("YYYY-MM-DD") 
            torrconfig.synced=1
            torragefile.saveConfig(torrconfig);


            callback(null,curLines);
        })
    },true)
}

module.exports.delExcept=function(d){
    torragefile.delExcept(d);
}

module.exports.curLines=function(){
	return torragefile.curLines;
}();
