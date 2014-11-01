(function(){
  var path=__dirname + "/files/test.txt";
  var fs=require("fs");
  fs.appendFileSync(path,"hello world","utf-8");
})();
