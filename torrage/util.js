var path = require("path");
var pathary = __dirname.split(path.sep),
    basePath = pathary.slice(0, pathary.length - 2).join(path.sep);
var moment = require("moment");
var badhash = [];

//console.log(pathary);

module.exports.getHashFileURL = function(d) {
    if (!/^20\d{6}$/.test(d)) {
        return null;
    }
    return "https://torrage.com/sync/" + d + ".txt";
}


module.exports.getHashFilePath = function(d) {
    if (!/^20\d{6}$/.test(d)) {
        return null;
    }    
    return __dirname + "/files/" + d + ".txt";
}


String.prototype.format = function() {
    var args = arguments;
    return this.replace(/\{\{|\{(\d+)\}/g, function(m, i, o, n) {
        if (m == "{{") return "{";
        return args[i];
    });
}


module.exports.random = function(min, max) {
    var range = max - min;
    var rnd = Math.random();
    return min + Math.round(range * rnd);
}

module.exports.getDownTorrUrls = function(hashKey) {
    var ary = [];
    if (hashKey.length == 40) {
        //ary.push("http://zoink.it/torrent/{0}.torrent".format(hashKey));
        //ary.push("https://bt.box.n0808.com/{0}/{1}/{2}.torrent".format(hashKey.substr(0,2),hashKey.substr(hashKey.length-2,2), hashKey));
        ary.push("https://torrage.com/torrent/{0}.torrent".format(hashKey));
        //ary.push("http://torcache.net/torrent/{0}.torrent".format(hashKey));
    }
    return ary;

}

module.exports.log = function(msg, obj) {
    //对console.log进行了封装。主要是增加了秒钟的输出，通过秒数的差值方便大家对async的理解。
    process.stdout.write(moment().format('ss.SSS') + '> ');
    if (obj !== undefined) {
        process.stdout.write(msg);
        console.log(obj);
    } else {
        console.log(msg);
    }
};


module.exports.badHash = [];

var _contains = function(a, c) {
    for (var i = 0; i < a.length; ++i) {
        if (a[i] == c) return true;
    }
    return false;
}

var _arypush = function(a, c) {
    if (_contains(a, c)) return;
    a.push(c);
}


module.exports.isBad = function(hkey) {
    return _contains(this.badHash, hkey);
}

module.exports.badPush = function(hkey) {
    _arypush(this.badhash, hkey);
}