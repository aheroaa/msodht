(function(){
	var bencode=require("bencode");
	var torrSchema={
		"_id":"String",
		//"announce":"String",				//bencode字符串，tracker服务器url，根据官方解释，如果存在announce-list关键字则应该忽略这个关键字 
		//"announce_list":"Array",			//bencode列表的列表，非必要关键字，tracker服务器列表，announce-list列表内仍是多个列表，每个列表包含一个或多个url字符串 
		//"comment":"String",				//bencode字符串，非必要关键字，种子的备注 
		//"comment_utf_8":"String",			//bencode字符串,这个关键字我从官方查不到，可能是BitComet扩展的关键字，如果存在这个关键字就忽略上面那个，因为这个一定是UTF-8编码的 
		"creation__date":"String",			//bencode整数，非必要关键字，种子的创建时间,是自1970-1-1 00:00:00 UTC 所经过的秒数 
		"encoding":"String",				/*bencode字符串，非必要关键字，官方解释是种子文件info字典内pieces段的字符串所使用的编码方式，
						  				 	 *但实际发现该处定义的编码方式同样会影响info字典内的所有字符串，不知是什么情况 */ 
		"info":{							//bencode字典，包含种子内的所有文件，具体看说明http://wiki.theory.org/BitTorrentSpecification
			"files":[{						//文件列表
				"path":"String",			//一个列表，最后一项是文件名，前面的是目录名
				"path_utf_8":"String",		//同KEYWORD_COMMENT_UTF8
				"length":"Number"			//文件长度
			}],
			"name":"String",				//单文件模式是文件名，多文件模式是建议性的文件根目录
			"name_utf_8":"String",			//同KEYWORD_COMMENT_UTF8
			"length":"Number",
			//"piece__length":"Number",		/* bencode整数，每一块的长度，单位字节，官方建议是524288即512k字节，但可能有不同。*/
			//"pieces":"String",			// * bencode字符串，每个块的杂凑值（SHA1，固定20字节长）的组合，所以这个串可能很长,
											// * 官方说明“byte string, i.e. not urlencoded”，显然这个串的长度必须是20的倍数，也可通过
						  					// * 这个串的长度除以20计算一共有多少块。
						  					// * 注意，这个字符串并不是标准的c字符串，它的任何位置都可能是null字符，字符串函数不能适用于该字符串 */ 
			"publisher":"String",			//bencode字符串，种子的发布者，这个关键字我从官方也查不到，还有publisher-url关键字 
			"publisher_utf_8":"String",		//同KEYWORD_COMMENT_UTF8 
			"publisher_url":"String",		//bencode字符串，种子的发布者，这个关键字我从官方也查不到，还有publisher-url关键字 
			"publisher_url_utf_8":"String",	//同KEYWORD_COMMENT_UTF8 
			"ed2k":"String",
			"filehash":"String",
			"created__by":"String",			//bencode字符串，非必要关键字，创建该种子文件的软件和其版本，形式是这样 uTorrent/183B，表示uTorrent 183B版创建 
			"private":"String"				/* bencode整数，非必要关键字，实际这个可以看成是一个BOOL，当为1时，表示只通过种子内的服务器得到peers，
											 * 当为0或未设置时，可以从外部获得peers，例如DHT网络 */
		}
	}

	

	var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    var _isObject =function (obj) {
        return _toString.call(obj) === '[object Object]';
    };

    var apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var getArrays=function(arr){
    	var l=[];
    	for(var index in arr){
    		var item=arr[index];
    		if(_isArray(item)){
    			l.push(getArrays(item));
    			continue;
    		}
    		if(_isObject(item)){
				l.push(getObject(item));
				continue;
    		}
    		l.push(item.toString());
    	}
    	return l;
    }

    var getObject=function(obj){
    	for(var item in obj){
    		if(_isArray(item)){
    			obj[item]=getArrays(obj[item]);
    			continue;
    		}
    		if(_isObject(item)){
				obj[item]=getObject(obj[item]);
				continue;
    		}
    		obj[item]=obj[item].toString();
    	}
    	return obj;
    }

    var getGoodKey=function(subkey){
    	return subkey=="_id" ? "_id":subkey.replace("utf_8","utf-8").replace("_url","-url").replace("_list","-list").replace("__"," ").replace("_",".");
    }

    var getSchemaValue=function(key,value,field){
    	if(value=="String" || value=="Number" || value=="Array") return field;
    	if(_isObject(value)){
    		var o={};
    		for(var subkey in value){
    			var _subkey=getGoodKey(subkey);
    			if(!field[_subkey]) continue;
    			o[subkey]=getSchemaValue(subkey,value[subkey],field[_subkey]);
    		}
    		return o;
    	}
    	if(_isArray(value)){
    		var l=[];
    		var innerSchema=value[0];
    		for(var o_index in field){
    			var item={};
    			for(var subkey in innerSchema){
    				var _subkey=getGoodKey(subkey);
    				if(!field[o_index][_subkey]) continue;
    				item[subkey]=getSchemaValue(subkey,innerSchema[subkey],field[o_index][_subkey]);
    			}    			
    			l.push(item);
    		}
    		return l;
    	}
    }

    var getLegalResult=function(o){
    	var r={};
    	for(var subkey in torrSchema){
    		var _subkey=getGoodKey(subkey);
    		if(!o[_subkey]) continue;
    		r[_subkey]=getSchemaValue(subkey,torrSchema[subkey],o[_subkey]);
    	}
    	return r;
    }

	var getTorrentFile=function(hkey,bytes){
		var result=bencode.decode(bytes,"utf-8");
		var obj=getLegalResult(result) ;
		obj._id=hkey;

		//var fs=require("fs");
		//fs.writeFileSync("c:/result.txt",JSON.stringify(obj));

		return obj;
	}


	module.exports.getTorrentFile=getTorrentFile;

}())