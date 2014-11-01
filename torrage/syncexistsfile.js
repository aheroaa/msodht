var down = require("./todown"),
    env = require("jsdom").env,
    jquery = require("jquery"),
    moment = require("moment"),
    torragefile = require("./torragefile");

module.exports.syncFile = function(callback) {
    var curLines = torragefile.curLines;
    torragefile.initFile();
    console.log("已有的文件：" + torragefile.curLines.length);

    var torrconfig=torragefile.getConfig();
    if(torrconfig.today==moment().format("YYYY-MM-DD") && torrconfig.synced==1){
        callback(curLines);
    }

    down.getHtml('http://torrage.com/sync/', function(data) {
        if (data == null) {
            console.log("down error!");
            return;
        }
        env(data, function(error, window) {
            if (error) {
                console.log(error);
                return;
            }
            var $ = jquery(window);
            var $trs = $("#dirlist table tbody tr");

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
            console.log("当前获取到的文件数：" + txts.length);
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


            callback(curLines);
        })
    })
}

module.exports.delExcept=function(d){
    torragefile.delExcept(d);
}

module.exports.curLines=function(){
	return torragefile.curLines;
}()
